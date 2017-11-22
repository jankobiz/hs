const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const Hanlebars = require('handlebars');
const Good = require('good');
const Routes = require('./lib/routes');
const CardStore = require('./lib/cardStore');
const UserStore = require('./lib/userStore');
const HapiAuthCookies = require('hapi-auth-cookie');

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

CardStore.initialize();
UserStore.initialize();

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
	host: 'localhost',
	port: 8000,
});


const provision = async () => {
	await server.register([
		{
			register: Inert,
		},
		{
			register: Vision,
		},
		{
			register: Good,
			options: goodOptions,
		},
		{
			register: HapiAuthCookies,
		},
	], (err) => {
		if (err) console.error(err);
		server.auth.strategy('session', 'cookie', {
			password: 'this-password-has-to-be-at-least-32-chars-long',
			cookie: 'sid-example',
			redirectTo: '/login',
			isSecure: false,
			domain: 'localhost',
		});
		server.auth.default('session');
	});

	server.views({
		engines: { html: Hanlebars },
		relativeTo: __dirname,
		path: './templates',
	});

	server.route(Routes);

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
