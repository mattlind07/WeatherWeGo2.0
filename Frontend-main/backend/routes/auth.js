const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// make a new baby boy user
router.post('/register', authController.register);

// get his bib on
router.post('/login', authController.login);

// spank his booty
router.get('/verify', authController.verifyToken);

// he goes googoogaagaa
router.get('/test', (req, res) => {
  res.json({ message: 'Auth API is working' });
});

module.exports = router;