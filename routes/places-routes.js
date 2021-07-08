const express = require('express');

const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById); // Get a specific place by place id (pid)

router.get('/user/:uid', placesControllers.getPlacesByUserId); // Retrieve list of all places for a given user id (uid)

// Restrict access to Authorized users only using middleware
router.use(checkAuth);

router.post(
	'/',
	fileUpload.single('image'),
	[
		check('title').not().isEmpty(),
		check('description').isLength({ min: 5 }),
		check('address').not().isEmpty(),
	],
	placesControllers.createPlace
); // Create a new place

router.patch(
	'/:pid',
	[check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
	placesControllers.updatePlace
); // Update a place by id (pid)

router.delete('/:pid', placesControllers.deletePlace); // Delete a place by id (pid)

module.exports = router;
