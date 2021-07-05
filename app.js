// Import third party packages
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// Import dependencies
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
// Instantiate express
const app = express();
// Configure middleware

app.use(express.json());

app.use('/api/places', placesRoutes); // => /api/places...
app.use('/api/users', usersRoutes); // => /api/users...

app.use((req, res, next) => {
	const error = new HttpError('Could not find this route.', 404);
	throw error;
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || 'An unknown error occured!' });
});

mongoose
	.connect(
		`mongodb+srv://Wizard:${process.env.DB_PASS}@cluster0.m9rfm.mongodb.net/places?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
		}
	)
	.then(() => {
		app.listen(5000);
	})
	.catch(err => {
		console.log(err);
	});
