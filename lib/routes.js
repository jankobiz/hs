const Handlers = require('./handlers');
const Irons = require('./iron');

const Routes = [
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
			// console.log(Irons.uns);
			Promise.resolve(Irons.uns)
				.then((object) => { console.log(object); })
				.catch(error => console.log(error));
			console.log('Before promise because it takes time for the promise to get resolved');
			// const response = reply(`Hello ${encodeURIComponent(request.params.name)} from ${encodeURIComponent(request.info.remoteAddress)}:${encodeURIComponent(request.info.remotePort)} !`);
			const response = reply(Promise.resolve(Irons.uns).then(object => JSON.stringify(object)));
			response.statusCode = 403;
		},
		config: {
			auth: false,
		},
	},
	{
		method: 'GET',
		path: '/test',
		handler: function (request, reply) {
			reply.redirect('/hello/redir');
		},
		config: {
			auth: false,
		},
	},
];

module.exports = Routes;
