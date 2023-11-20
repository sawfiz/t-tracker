const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const passport = require('passport');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'T-Tracker' });
});

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Send the JWT token
      jwt.sign({ user }, 'secretkey', { expiresIn: '1hr' }, (err, token) => {
        return res
          .status(200)
          .json({ message: 'Logged in successfully', user, token, info });
      });
    });
  })(req, res, next);
});

// GET /logout route to log the user out
router.get('/logout', (req, res, next) => {
  // Passport provides a logout() function to terminate a login session
  req.logout((err) => {
    if (err) {
      res.status(403).json({ message: 'Log out failed' });
    }

    res.status(200).json({ message: 'success' });
  });

  // Optionally, perform any additional actions such as clearing session data or tokens

  // Redirect the user to a specific route or respond with a success message
});

module.exports = router;
