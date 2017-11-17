'use strict';

const Hapi = require('hapi');

const Inert = require('inert');

const Vision = require('vision');

const uuid = require('uuid');

const Hanlebars = require('handlebars');

const fs = require('fs');

function loadCards() {
	const file = fs.readFileSync('./cards.json');
	return JSON.parse(file.toString());
}

let cards = loadCards();

cards = {};

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
	host: 'localhost',
	port: 8000,
});

const provision = async () => {
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

function newCardHandler(request, reply) {
	// business logic
	if (request.method === 'get') {
		reply.view('new', { card_images: mapImages() });
	} else {
		const card = {
			name: request.payload.name,
			recipient_email: request.payload.recipient_email,
			sender_name: request.payload.sender_name,
			sender_email: request.payload.sender_email,
			card_image: request.payload.card_image,
		};
		saveCard(card);
		console.log(cards);
		reply.redirect('/cards');
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
