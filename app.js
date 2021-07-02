// Import third party packages
const express = require('express');
const bodyParser = require('body-parser');
// Import dependencies
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
// Instantiate express
const app = express();
// Configure middleware

app.use(express.json());

app.use('/api/places', placesRoutes); // => /api/places...

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || 'An unknown error occured!' });
});

app.listen(5000);
