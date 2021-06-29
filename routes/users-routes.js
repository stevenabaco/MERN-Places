const express = require('express');
const router = express.Router();

const DUMMY_USERS = [
	{
		id: 'u1',
		name: 'Steven Abaco',
		image: 'https://www.stevenabaco.dev/static/media/me.4043ab91.jpg',
		places: 3,
	}
];

router.get('/:uid', (req, res, next) => {
  const userId = req.params.uid;
  const user = DUMMY_USERS.find(u => {
    return u.id === userId;
  })
  res.json({user}) // 
})

module.exports = router;