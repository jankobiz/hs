const Handlers = require('./handlers');

let Routes = [
	{
		method: 'GET',
		path: '/',
		handler: {
			file: 'templates/index.html',
		},
		config: {
			auth: false,
		},
	},
	{
		method: 'GET',
		path: '/assets/{path*}',
		handler: {
			directory: {
				path: './public',
				listing: false,
			},
		},
		config: {
			auth: false,
		},
	},
	{
		method: 'GET',
		path: '/cards',
		handler: Handlers.cardsHandler,
	},
	{
		method: ['GET', 'POST'],
		path: '/cards/new',
		handler: Handlers.newCardHandler,
	},
	{
		method: 'DELETE',
		path: '/cards/{id}',
		handler: Handlers.deleteCardHandler,
	},
	{
		method: 'GET',
		path: '/login',
		handler: {
			file: 'templates/login.html',
		},
		config: {
			auth: false,
		},
	},
	{
		method: 'POST',
		path: '/login',
		handler: Handlers.loginHandler,
		config: {
			auth: false,
		},
	},
	{
		method: 'GET',
		path: '/logout',
		handler: Handlers.logoutHandler,
	},
	{
		method: 'GET',
		path: '/register',
		handler: {
			file: 'templates/register.html',
		},
		config: {
			auth: false,
		},
	},
	{
		method: 'POST',
		path: '/register',
		handler: Handlers.registerHandler,
		config: {
			auth: false,
		},
	},
	// Routes created for testing capabilities and practicing
	{
		method: 'GET',
		path: '/hello/{name}',
		handler: function (request, reply) {
			const response = reply(`Hello ${encodeURIComponent(request.params.name)} from ${encodeURIComponent(request.info.remoteAddress)}:${encodeURIComponent(request.info.remotePort)} !`);
			response.statusCode = 403;
		},
	},
	{
		method: 'GET',
		path: '/test',
		handler: function (request, reply) {
			reply.redirect('/hello/redir');
		},
	},
];

module.exports = Routes;
