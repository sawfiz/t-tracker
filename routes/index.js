var express = require('express');
var router = express.Router();

const passport = require('passport');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'T-Tracker' });
});

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }

      return res.status(200).json({ message: 'Logged in successfully', user });
    });
  })(req, res, next);
});

module.exports = router;
