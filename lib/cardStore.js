const 	fs = require('fs');

const CardStore = {};

CardStore.cards = {};

function loadCards() {
	const file = fs.readFileSync('./lib/cards.json');
	return JSON.parse(file.toString());
}

CardStore.initialize = () => {
	CardStore.cards = loadCards();
};

module.exports = CardStore;
