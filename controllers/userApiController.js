// Libraries
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const validateObjectId = require('../middleware/validateObjectId');
const { verifyJWT } = require('../middleware/verifyJWT');
const CustomError = require('../utils/CustomError');

// Seurity
const passport = require('passport');
const bcrypt = require('bcryptjs');

// Model
const User = require('../models/user');

const validateInputs = () => {
  return [
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
    (req, res, next) => {
      console.log('Went through validations');
      next();
    },
  ];
};

// Handle GET all users.
exports.users_list = [
  verifyJWT,
  asyncHandler(async (req, res, next) => {
    const role = req.query.role;
    let query = {}; // Define an empty query object

    // If the 'role' query parameter exists, add it to the query object
    if (role) {
      query = { role }; // This assumes 'role' field exists in your User schema
    }

    const users_list = await User.find(
      query,
      'first_name last_name username gender active'
    )
      .sort({ username: 1 })
      .exec();
    res.status(200).json({ users_list });
  }),
];

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
  validateInputs(),
  asyncHandler(async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      throw new CustomError(400, JSON.stringify(validationErrors));
    }

    // Make sure username is not already used
    const userExists = await User.findOne({
      username: req.body.username,
    });
    if (userExists) throw new CustomError(409, 'Athlete already exists');

    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) throw new CustomError(400, 'Error hasing password');

      try {
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
      } catch (err) {
        throw new CustomError(500, 'Erro saving user');
      }
    });
  }),
];

// Handle UPDATE/PUT an user
exports.user_update = [
  validateObjectId,
  verifyJWT,
  validateInputs(),

  asyncHandler(async (req, res, next) => {
    console.log('Validated');
    const validationErrors = validationResult(req);
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      username: req.params.username,
      password: req.params.hashedPassword,
      mobile: req.body.mobile,
      email: req.body.email,
      role: req.body.role,
      _id: req.params.id,
    });

    if (!validationErrors.isEmpty()) {
      throw new CustomError(400, JSON.stringify(validationErrors));
    } else {
      console.log('updated user');
      // Data from form is valid. Update the record.
      const updatedAthlete = await User.findByIdAndUpdate(
        req.params.id,
        { $set: user },
        { new: true } // Returns the modified document
      );
      res.status(201).json({ message: 'Success!' });
    }
  }),
];

// Handle DELETE an user
exports.user_delete = [
  verifyJWT,
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
        throw new CustomError(500, 'Record does not exist.');
      }
    } catch (error) {
      console.log('Deletion failed');
      throw new CustomError(500, error);
    }
  }),
];
