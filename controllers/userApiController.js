// Libraries
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const validateObjectId = require('../middleware/validateObjectId');

// Seurity
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Model
const User = require('../models/user');

// Handle GET all users.
exports.user_list = asyncHandler(async (req, res, next) => {
  const user_list = await User.find({}, 'username gender active')
    .sort({ username: 1 })
    .exec();
  res.status(200).json({ user_list });
});

// Handle GET details of a specific user.
exports.user_detail = [
  validateObjectId,
  asyncHandler(async (req, res, next) => {
    const [user] = await Promise.all([User.findById(req.params.id).exec()]);

    if (user === null) {
      const err = new Error('user not found');
      err.status = 404;
      next(err);
    }

    res.status(200).json({ user });
  }),
];

// Handle POST to create an user
exports.user_create_post = [
  (req, res, next) => {
    console.log('POST received');
    next();
  },

  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    .matches(/^[a-zA-Z0-9 .-]*$/) // Allow space / . / - in firstname
    .withMessage('First name has non-alphanumeric characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Last name must be specified')
    .matches(/^[a-zA-Z0-9-]*$/) // Allow - in lastname
    .withMessage('First name has non-alphanumeric characters'),
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
    .withMessage('Password must be at least 3 characters.'),
  // Validate and sanitize the 'mobile' field
  body('mobile')
    .matches(/^\d{8}$/)
    .withMessage('Mobile number must be exactly 8 digits')
    .trim()
    .escape(),

  // Validate and sanitize the 'email' field
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          res.status(400).json({ error: 'Error hasing password' });
        } else {
          try {
            // Make sure username is not already used
            const userExists = await User.findOne({
              username: req.body.username,
            });

            if (userExists) {
              res.status(409).json({ error: 'Username in use' });
            } else {
              const user = new User({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                gender: req.body.gender,
                username: req.body.username,
                password: hashedPassword,
                mobile: req.body.mobile,
                email: req.body.email,
              });
              const result = await user.save();
              res.status(201).json({ message: 'Success' });
            }
          } catch (err) {
            res.status(500).json({ error: 'Error saving user' });
          }
        }
      });
    }
  },
];

// Handle DELETE an user
exports.user_delete = [
  (req, res, next) => {
    console.log('DELETE received');
    next();
  },
  validateObjectId,
  asyncHandler(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (user) {
        await User.findByIdAndDelete(req.params.id);
        // res.status(200).json({ message: 'DELETE is success!' });
        // res.status(204).send();
        res.status(204).end();
      } else {
        console.log('Record does not exist!');
        res.status(500).json({ message: 'Record does not exist!' });
      }
    } catch (error) {
      console.log('Deletion failed');
      res.status(500).json(error);
    }
  }),
];
