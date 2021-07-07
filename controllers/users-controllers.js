const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
// const { v4: uuidv4 } = require('uuid'); // Removed after adding mongoose
const User = require('../models/user');

const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, '-password');
	} catch (err) {
		const error = new HttpError(
			'Fetching users failed, please try again later.',
			500
		);
		return next(error);
	}
	res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError(
				'Invalid inputs, please check the information you entered.',
				422
			)
		);
	}
	const { name, email, password } = req.body;

	// Check to see email already exists
	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			'Signing up failed, please try again later',
			500
		);
		return next(error);
	}

	if (existingUser) {
		const error = new HttpError(
			'User exists already, please login instead.',
			422
		);
		return next(error);
	}

	const createdUser = new User({
		name, // name: name
		email,
		image: 'https://avatars.githubusercontent.com/u/52642808?v=4',
		password,
		places: [],
	});

	try {
		await createdUser.save();
	} catch (err) {
		const error = new HttpError(
			'Signing up new user failed, please try again.',
			500
		);
		return next(error);
	}

	res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	let existingUser;

	try {
		//Check if email address is valid
		existingUser = await User.findOne({ email: email });
	} catch (err) {
		const error = new HttpError(
			'Logging in failed, please try again later',
			500
		);
		return next(error);
	}

	// Temp validation just to check if email and password match... will be updated
	if (!existingUser || existingUser.password !== password) {
		const error = new HttpError(
			'Invalid credentials, could not log you in.',
			401
		);
		return next(error);
	}
	res.json({
		message: 'Logged in successfully!',
		user: existingUser.toObject({ getters: true }),
	});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
