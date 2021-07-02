const express = require('express');

const placesControllers = require('../controllers/places-controllers');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById); // Get a specific place by place id (pid)

router.get('/user/:uid', placesControllers.getPlaceByUserId); // Retrieve list of all places for a given user id (uid)

router.post('/', placesControllers.createPlace); // Create a new place

router.patch('/:pid', placesControllers.updatePlace); // Update a place by id (pid)

router.delete('/:pid', placesControllers.deletePlace); // Delete a place by id (pid)



module.exports = router;
