const { v4: uuidv4 } = require('uuid')

const HttpError = require('../models/http-error');

const DUMMY_PLACES = [
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

const getPlaceById = (req, res, next) => {
	const placeId = req.params.pid; // { pid: 'p1' }
	const place = DUMMY_PLACES.find(p => {
		return p.id === placeId;
	});

	if (!place) {
		throw new HttpError('Could not find a place for the provided id.', 404);
	}

	res.json({ place }); // => { place } => { place: place }
};

// Could be ...function getPlaceById() {...}
// Or ... const getPlaceById = function() {...}

const getPlaceByUserId = (req, res, next) => {
	const userId = req.params.uid;
	const place = DUMMY_PLACES.find(p => {
		return p.creator === userId;
	});

	if (!place) {
		return next(
			new HttpError('Could not find a place for the provided user id.', 404)
		);
	}

	res.json({ place }); //
};

const createPlace = (req, res, next) => {
	// const title = req.body.title ... for each property
	const { title, description, coordinates, address, creator } = req.body; // Destructure the content in the POST request body
	const createdPlace = {
		id: uuidv4(),
		title,
		description,
		location: coordinates,
		address,
		creator
	};

	DUMMY_PLACES.push(createdPlace); // or can use ... unshift(createdPlace)
	res.status(201).json({place: createdPlace}) // update status to successfully created (201 status)

};

const updatePlace = (req, res, next) => {

	const { title, description } = req.body;
	const placeId = req.params.pid

	const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId)} // Curly braces creates new object with found place
	const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId) // Find and return the index of the place in the array
	updatedPlace.title = title;
	updatedPlace.description = description;

	DUMMY_PLACES[placeIndex] = updatedPlace;
	res.status(200).json({ place: updatedPlace });
	if (!place) {
		return next(
			new HttpError('Could not find a place for the provided user id.', 404)
		);

	 
	}

};

const deletePlace = ((req, res, next) => {
	
});

	
	
	
exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;