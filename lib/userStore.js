const bcrypt = require('bcrypt');
const	Boom = require('boom');

const UserStore = {};

UserStore.users = {};

UserStore.initialize = () => {
	UserStore.createUser('ivica', 'ivica@gmail.com', 'password');
};

UserStore.createUser = (name, email, password, callback) => {
	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(password, salt, (err, hash) => {
			const user = {
				name: name,
				email: email,
				passwordHash: hash,
			};

			if (UserStore.users[email]) {
				callback(Boom.conflict('Email already exists. Please login.'));
			} else {
				UserStore.users[email] = user;
				if (callback) callback();
			}
		});
	});
};

UserStore.validateUser = (email, password, callback) => {
	const user = UserStore.users[email];
	if (!user) {
		callback(Boom.notFound('User does not exist.'));
		return;
	}
	bcrypt.compare(password, user.passwordHash, (err, isValid) => {
		if (!isValid) {
			callback(Boom.unauthorized('Password does not match.'));
		} else {
			callback(null, user);
		}
	});
};
