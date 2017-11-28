const Iron = require('iron');

const sealed = 'Fe26.2**76720e3c3438a07e705d6c1bd266e0698aac4885fb3deed0067509e8d67a8dea*zFUr7qTx0jDOyQ9cRvKVFQ*2_A5PpdIngvr9f0n98yr-5wFsHrneLHBZYzBgK3k9ALeXieIyx2kscr4rXCibnDe72cSbscyZt8mbg6KcRWkCNYc-qh7uMux4gh9KE5QlPmxtWONuzmqG6qpmiZcvvE3PzNyeZSLNwWhAjohMIZIwLli9iaLyg807IkNK0Svk1E**d6eba6cfc49675f140a601f0d0ec7fdc5e9f49ff959e882fa32a638a9fc83aa7*ru2YM9I8H0bUrVXvmy52lqqOzyUw1vpWdUsjOxu0l7w';
const password = 'this-password-has-to-be-at-least-32-chars-long';

const Irons = {};
Irons.uns = Iron.unseal(sealed, password, Iron.defaults, (err, unsealed) => {
	if (err) {
		return console.log('Error occured!');
	}
	return unsealed;
	// unsealed has the same content as obj
});

module.exports = Irons;
