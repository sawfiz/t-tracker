// Libraries
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const validateObjectId = require('../middleware/validateObjectId');

// Seurity
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Model
const User = require('../models/user');

// Handle POST to create an user
exports.user_create_post = [
  (req, res, next) => {
    console.log('POST received');
    next();
  },
  body('username')
    .trim()
    .isLength({ min: 4, max: 10 })
    .escape()
    .withMessage('Username must be between 4 to 8 characters.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric charecters.'),

  body('password')
    .trim()
    .isLength({ min: 3 })
    .escape()
    .withMessage('Password must be specified'),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('🚀 ~ file: userApiController.js:37 ~ errors:', errors);
      res.status(400).json({ errors });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          console.log('Error hashing password');
          res.status(500).json({ error: 'Error hasing password.' });
        } else {
          try {
            const user = new User({
              username: req.body.username,
              password: hashedPassword,
            });
            const result = await user.save();
            console.log(
              '🚀 ~ file: userApiController.js:51 ~ bcrypt.hash ~ result:',
              result
            );

            res.status(201).json({ message: 'Success' });
          } catch (err) {
            return next(err);
          }
        }
      });
    }
  },
];
