const 	fs = require('fs');
const	Joi = require('joi');
const	Boom = require('boom');
const	uuid = require('uuid');
const CardStore = require('./cardStore');
const UserStore = require('./userStore');
const _ = require('lodash');

const Handlers = {};

function saveCard(card) {
	const id = uuid.v1();
	card.id = id;
	console.log(JSON.stringify(card));
	CardStore.cards[id] = card;
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

const loginSchema = Joi.object().keys({
	email: Joi.string().email().required(),
	password: Joi.string().max(32).required(),
});

const registerSchema = Joi.object().keys({
	name: Joi.string().min(3).max(50).required(),
	email: Joi.string().email().required(),
	password: Joi.string().max(32).required(),
});

Handlers.cardsHandler = (request, reply) => reply.view('cards', { cards: Handlers.getCards(request.auth.credentials.email, request) });

Handlers.getCards = (email, request) => {
	const cards = [];
	_.forEach(CardStore.cards, (card, key) => {
		if (CardStore.cards[key].sender_email === email) {
			cards.push(CardStore.cards[key]);
		}
	});
	let cred = JSON.stringify(request.auth.credentials);
	console.log(`Credentials - ${cred}`);
	return cards;
};

Handlers.newCardHandler = (request, reply) => {
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
			console.log(CardStore.cards);
			return reply.redirect('/cards');
		});
	}
};

Handlers.deleteCardHandler = (request, reply) => {
	delete CardStore.cards[request.params.id];
	reply();
};

Handlers.loginHandler = (request, reply) => {
	Joi.validate(request.payload, loginSchema, (err, val) => {
		if (err) {
			return reply(Boom.unauthorized('Credentials did not validate.'));
		}
		UserStore.validateUser(val.email, val.password, (error, user) => {
			if (error) {
				return reply(err);
			}
			const us = JSON.stringify(user);
			console.log(`User: ${us}`);
			const sid = uuid.v1();
			request.cookieAuth.set(user);
			reply.redirect('/cards');
		});
	});
};

Handlers.logoutHandler = (request, reply) => {
	request.cookieAuth.clear();
	return reply.redirect('/');
};

Handlers.registerHandler = (request, reply) => {
	Joi.validate(request.payload, registerSchema, (err, val) => {
		if (err) {
			return reply(Boom.unauthorized('Credentials did not validate.'));
		}
		UserStore.createUser(val.name, val.email, val.password, (error) => {
			if (error) {
				return reply(err);
			}
			reply.redirect('/cards');
		});
	});
};

module.exports = Handlers;
