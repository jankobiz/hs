const Handlers = require('./handlers');

let Routes = [
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
