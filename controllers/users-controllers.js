const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12); // Returns a promise, first arguement is what needs to be hashed. Second Arguement is how many rounds
	} catch (err) {
		const error = new HttpError('Could not create user, please try again', 500);
		return next(error);
	}

	const createdUser = new User({
		name, // name: name
		email,
		image: req.file.path,
		password: hashedPassword,
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

	// Generate token with userId and email

	let token;
	try {
		token = jwt.sign(
			{
				userId: createdUser.id,
				email: createdUser.email
			},
			'supersecret_dont_share',
			{ expiresIn: '1h' }
		);
	} catch (err) {
		const error = new HttpError(
			'Signing up new user failed, please try again.',
			500
		);
		return next(error);
	}
	// Respond using JSON with what should be returned..
	res.status(201).json({
		userId: createdUser.id,
		email: createdUser.email,
		token: token,
	});
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
	if (!existingUser) {
		const error = new HttpError(
			'Invalid credentials, could not log you in.',
			401
		);
		return next(error);
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, existingUser.password); // Returns a BOOLEAN. Compares the entered password to the existing user password.
	} catch (err) {
		const error = new HttpError(
			'Could not log you in, Please check your credentials and try again.',
			500
		);
		return next(error);
	}

	if (!isValidPassword) {
		const error = new HttpError(
			'Invalid credentials, could not log you in.',
			401
		);
	}

	let token;
	try {
		token = jwt.sign(
			{
				userId: existingUser.id,
				email: existingUser.email,
			},
			'supersecret_dont_share',
			{ expiresIn: '1h' }
		);
	} catch (err) {
		const error = new HttpError(
			'Logging in failed, please try again.',
			500
		);
		return next(error);
	}
	res.json({
		userId: existingUser.id,
		email: existingUser.email,
		token: token,
	});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
