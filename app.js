// Import third party packages
const express = require('express');
const bodyParser = require('body-parser');
// Import dependencies
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
// Instantiate express
const app = express();
// Configure middleware 
app.use('/api/places', placesRoutes); // => /api/places...
app.use('/api/users', usersRoutes); // => /api/users...

app.listen(5000);