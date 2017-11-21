const 	fs = require('fs');
const	Joi = require('joi');
const	Boom = require('boom');
const	uuid = require('uuid');
const CardStore = require('./cardStore');

const Handlers = {};

function saveCard(card) {
	const id = uuid.v1();
	card.id = id;
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

Handlers.cardsHandler = (request, reply) => reply.view('cards', { cards: CardStore.cards });

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

module.exports = Handlers;
