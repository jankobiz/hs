

const Hapi = require('hapi');

const Inert = require('inert');

const Vision = require('vision');

const uuid = require('uuid');

const Hanlebars = require('handlebars');

const fs = require('fs');

const Joi = require('joi');

const Boom = require('boom');

const Good = require('good');

function loadCards() {
	const file = fs.readFileSync('./cards.json');
	return JSON.parse(file.toString());
}

const cards = loadCards();

const goodOptions = {
	ops: {
		interval: 60000,
	},
	reporters: {
		myConsoleReporter: [{
			module: 'good-squeeze',
			name: 'Squeeze',
			args: [{
				log: '*', response: '*', error: '*',
			}],
		}, {
			module: 'good-console',
		}, 'stdout'],
		myFileReporter: [{
			module: 'good-squeeze',
			name: 'Squeeze',
			args: [{ ops: '*', error: '*' }],
		}, {
			module: 'good-squeeze',
			name: 'SafeJson',
		}, {
			module: 'good-file',
			args: ['./logs/dev.log'],
		}],
		myHTTPReporter: [{
			module: 'good-squeeze',
			name: 'Squeeze',
			args: [{ error: '*' }],
		}, {
			module: 'good-http',
			args: ['http://localhost:3000', {
				wreck: {
					headers: { 'x-api-key': 12345 },
				},
			}],
		}],
	},
};

// cards = {};

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
	host: 'localhost',
	port: 8000,
});


const provision = async () => {
	await server.register({
		register: Good,
		options: goodOptions,
	}, (err) => {
		if (err) {
			return console.error(err);
		}
	});
	await server.register(Vision);

	server.views({
		engines: { html: Hanlebars },
		relativeTo: __dirname,
		path: './templates',
	});

	await server.start();
	console.log('Server running at:', server.info.uri);
};

provision();

// server.register(Vision, () => {
// 	server.views({
// 		engines: { html: Hanlebars },
// 		relativeTo: __dirname,
// 		path: './templates',
// 	});
// });

// server.views({
// 	engines: {
// 		html: jade,
// 		hanlebars: hanlebars,
// 	},
// 	path: './templates',
// });

// Add route 2
server.route({
	method: 'GET',
	path: '/hello/{name}',
	handler: function (request, reply) {
		const response = reply(`Hello ${encodeURIComponent(request.params.name)} from ${encodeURIComponent(request.info.remoteAddress)}:${encodeURIComponent(request.info.remotePort)} !`);
		response.statusCode = 403;
	},
});

server.route({
	method: 'GET',
	path: '/test',
	handler: function (request, reply) {
		reply.redirect('/hello/redir');
	},
});

// server.ext('onRequest', (request, reply) => {
// 	console.log(`Request received: ${request.path}`);
// 	reply.continue();
// });

server.ext('onPreResponse', (request, reply) => {
	if (request.response.isBoom) {
		return reply.view('error', request.response);
	}
	return reply.continue();
});

// Add route 1
server.register(Inert, () => {
	server.route({
		method: 'GET',
		path: '/',
		handler: {
			file: 'templates/index.html',
		},
	});
});

function cardHandler(request, reply) {
	reply.view('cards', { cards: cards });
}

function saveCard(card) {
	const id = uuid.v1();
	card.id = id;
	cards[id] = card;
}

function mapImages() {
	return fs.readdirSync('./public/images/cards');
}

const cardSchema = Joi.object().keys({
	name: Joi.string().min(3).max(50).required(),
	recipient_email: Joi.string().email(),
	sender_name: Joi.string().min(3).max(50).required(),
	sender_email: Joi.string().email(),
	card_image: Joi.string().regex(/.+\.(jpg|bpm|png|gif)\b/).required(),
});

function newCardHandler(request, reply) {
	// business logic
	if (request.method === 'get') {
		reply.view('new', { card_images: mapImages() });
	} else {
		Joi.validate(request.payload, cardSchema, (err, val) => {
			if (err) {
				return reply(Boom.badRequest(err.details[0].message));
			}
			const card = {
				name: val.name,
				recipient_email: val.recipient_email,
				sender_name: val.sender_name,
				sender_email: val.sender_email,
				card_image: val.card_image,
			};
			saveCard(card);
			console.log(cards);
			return reply.redirect('/cards');
		});
	}
}

function deleteCardHandler(request, reply) {
	delete cards[request.params.id];
	reply();
}

server.route({
	method: 'GET',
	path: '/cards',
	handler: cardHandler,
});

server.route({
	method: ['GET', 'POST'],
	path: '/cards/new',
	handler: newCardHandler,
});

server.route({
	method: 'DELETE',
	path: '/cards/{id}',
	handler: deleteCardHandler,
});

// Add route 3 - directory exposure
server.register(Inert, () => {
	server.route({
		method: 'GET',
		path: '/assets/{path*}',
		handler: {
			directory: {
				path: './public',
				listing: false,
			},
		},
	});
});

// server.route({
// 	method: 'GET',
// 	path: '/{name}',
// 	handler: function (request, reply) {
// 		reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
// 	}
// });

// // Add route 2 - file handler
// server.route({
// 	method: 'GET',
// 	path: '/',
// 	handler: {
// 		file: 'templates/index.html',
// 	},
// });

// Start the server
server.start((err) => {
	if (err) {
		throw err;
	}
	console.log('Server running at:', server.info.uri);
});
