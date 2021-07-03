const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const DUMMY_USERS = [
	{
		id: 'u1',
		name: 'Steven Abaco',
		email: 'test@test.com',
		password: '123456'
	},
];

const getUsers = ((req, res, next) => {
	res.json({ users: DUMMY_USERS });
});

const signup = ((req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		throw new HttpError(
			'Invalid inputs, please check the information you entered.',
			422
		);
	}
  const {name, email, password} = req.body

	// Check to see email already exists
	const hasUser = DUMMY_USERS.find(u => u.email === email);
	if (hasUser) {
		throw new HttpError('Could not create New User, email already exists!', 422); // Status 422 usually used for invalid user input.
	}

	const createdUser = {
		id: uuidv4(),
		name, // name: name
		email,
		password,
	};

	DUMMY_USERS.push(createdUser);

	res.status(201).json({user: createdUser})
});

const login = ((req, res, next) => {
	const { email, password } = req.body;

	const identifiedUser = DUMMY_USERS.find(u => u.email === email);

	if (!identifiedUser || identifiedUser.password !== password) {
		throw new HttpError('Could not authenticate user', 401) // Status cod 401 for failed Authentication
	}

	res.json({message: 'Logged in successfully!'})
})

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;