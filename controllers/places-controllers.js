const { v4: uuidv4 } = require('uuid');

const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');

let DUMMY_PLACES = [
	{
		id: 'p1',
		title: 'Empire State Building',
		description: 'One of the most famous sky scrapers in the world!',
		location: {
			lat: 40.7484474,
			lng: -73.9871516,
		},
		address: '20 W 34th St, New York, NY 10001',
		creator: 'u1',
	},
];

const getPlaceById = async (req, res, next) => {
	const placeId = req.params.pid; // { pid: 'p1' }
	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError(
			'Sonmething went wrong, could not find a place.',
			500
		);
		return next(error);
	}

	if (!place) {
		const error = new HttpError(
			'Could not find a place for the provided id.',
			404
		);
		return next(error);
	}

	res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }
};

// Could be ...function getPlaceById() {...}
// Or ... const getPlaceById = function() {...}

const getPlacesByUserId = async (req, res, next) => {
	const userId = req.params.uid;

	// let places;
	let userWithPlaces;
	try {
		userWithPlaces = await User.findById(userId).populate('places');
	} catch (err) {
		const error = new HttpError(
			'Fetching places failed, please try again later',
			500
		);
		return next(error);
	}

	if (!userWithPlaces || userWithPlaces.places.length === 0) {
		return next(
			new HttpError('Could not find any places for the provided user id.', 404)
		);
	}
	res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError(
				'Invalid inputs, please check the information you entered.',
				422
			)
		);
	}
	// const title = req.body.title ... for each property
	const { title, description, address, creator } = req.body; // Destructure the content in the POST request body

	let coordinates; // Get converted coordinates from API for entered address

	try {
		coordinates = await getCoordsForAddress(address);
	} catch (error) {
		return next(error);
	}

	const createdPlace = new Place({
		title,
		description,
		address,
		location: coordinates,
		image:
			'https://images.unsplash.com/photo-1554313553-41415c102e98?ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8ZW1waXJlJTIwc3RhdGUlMjBidWlsZGluZ3xlbnwwfHwwfHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
		creator,
	});

	let user;

	try {
		user = await User.findById(creator);
	} catch (err) {
		const error = new HttpError(
			'Creating place failed, could not find user',
			500
		);
		return next(error);
	}

	if (!user) {
		const error = new HttpError('Could not find user for provided id', 404);
		return next(error);
	}

	console.log(user);

	try {
		const session = await mongoose.startSession();
		session.startTransaction();
		await createdPlace.save({ session: session });
		user.places.push(createdPlace);
		await user.save({ session: session });
		await session.commitTransaction();
	} catch (err) {
		const error = new HttpError(
			'Creating place failed, please try again.',
			500
		);
		return next(error);
	}

	res.status(201).json({ place: createdPlace }); // update status to successfully created (201 status)
};

const updatePlace = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(
			new HttpError(
				'Invalid inputs, please check the information you entered.',
				422
			)
		);
	}
	const { title, description } = req.body;
	const placeId = req.params.pid;

	let place;
	try {
		place = await Place.findById(placeId);
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not update place.',
			500
		);
		return next(error);
	}
	place.title = title;
	place.description = description;

	try {
		await place.save();
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not update place.',
			500
		);
		return next(error);
	}

	res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
	const placeId = req.params.pid;

	let place;

	try {
		place = await Place.findById(placeId).populate('creator');
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not delete place',
			500
		);
		return next(error);
	}

	if (!place) {
		const error = new HttpError('Could not find place for this id.', 404);
		return next(error);
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await place.remove({ session: sess });
		place.creator.places.pull(place); // Remove place from the User
		await place.creator.save({ session: sess }); // Save the session
		await sess.commitTransaction(); // Commit all changes in Transaction
	} catch (err) {
		const error = new HttpError(
			'Something went wrong, could not delete place',
			500
		);
		return next(error);
	}
	res.status(200).json({ message: 'Deleted Place successfully!' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
