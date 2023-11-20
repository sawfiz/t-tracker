const Athlete = require('../models/athlete');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const validateObjectId = require('../middleware/validateObjectId');
const getJWT = require('../middleware/getJWT');
const { body, validationResult } = require('express-validator');

// Handle GET all athletes.
exports.athlete_list = [
  getJWT,
  (req, res, next) => {
    jwt.verify(
      req.token,
      'secretkey',
      asyncHandler(async (err, authData) => {
        if (err) {
          res.status(403).json(err);
        } else {
          try {
            const athlete_list = await Athlete.find(
              {},
              'first_name last_name gender active'
            )
              .sort({ first_name: 1 })
              .maxTimeMS(5000) // Set the maximum time for query execution
              .exec();
            // Send Success status and data
            res.status(200).json({ athlete_list });
          } catch (error) {
            if (error.name === 'MongooseError') {
              // Handle database connection timeout
              console.error('Database connection timed out:', error);
              res.status(500).json({ error: 'Database error' });
            } else {
              // Handle other errors and send an appropriate response
              console.error('Error fetching data:', error);
              res.status(500).json({ error: 'Internal server error' });
            }
          }
        }
      })
    );
  },
];

// Handle GET details of a specific athlete.
exports.athlete_detail = [
  validateObjectId,
  asyncHandler(async (req, res, next) => {
    const [athlete] = await Promise.all([
      Athlete.findById(req.params.id).exec(),
    ]);

    if (athlete === null) {
      const err = new Error('athlete not found');
      err.status = 404;
      next(err);
    }

    res.status(200).json({ athlete });
  }),
];

// Handle POST to create an athlete
exports.athlete_create_post = [
  (req, res, next) => {
    console.log('POST received');
    next();
  },
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    // .isAlphanumeric()
    // .withMessage('First name has non-alphanumeric charecters'),
    .matches(/^[a-zA-Z0-9 .-]*$/) // Allow space / . / - in firstname
    .withMessage('First name has non-alphanumeric characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Last name must be specified')
    .matches(/^[a-zA-Z0-9-]*$/) // Allow - in lastname
    .withMessage('First name has non-alphanumeric characters'),
  // .isAlphanumeric()
  // .withMessage('First name has non-alphanumeric charecters'),
  body('birthdate', 'Invalid date of birth').isISO8601().toDate(),

  // Validate and sanitize the 'mobile' field
  body('mobile')
    .optional({ nullable: true, checkFalsy: true })
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

  // Validate and sanitize the 'school' field
  body('school')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 2 })
    .withMessage('School name must be at least 2 characters')
    .trim()
    .escape(),
  (req, res, next) => {
    console.log('Went through validations');
    next();
  },

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const athlete = new Athlete({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      birthdate: req.body.birthdate,
      mobile: req.body.mobile,
      email: req.body.email,
      school: req.body.school,
      active: req.body.active,
    });

    if (!errors.isEmpty()) {
      console.log(
        '🚀 ~ file: athleteApiController.js:86 ~ asyncHandler ~ errors:',
        errors
      );
      res.status(400).json({ errors });
    } else {
      await athlete.save();
      res.status(201).json({ message: 'Success' });
    }
  }),
];

// Handle UPDATE/PUT an athlete
exports.athlete_update = [
  validateObjectId,

  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified')
    // .isAlphanumeric()
    // .withMessage('First name has non-alphanumeric charecters'),
    .matches(/^[a-zA-Z0-9 .-]*$/) // Allow space / . / - in firstname
    .withMessage('First name has non-alphanumeric characters'),
  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Last name must be specified')
    .matches(/^[a-zA-Z0-9-]*$/) // Allow - in lastname
    .withMessage('First name has non-alphanumeric characters'),
  // .isAlphanumeric()
  // .withMessage('First name has non-alphanumeric charecters'),
  body('birthdate', 'Invalid date of birth').isISO8601().toDate(),

  // Validate and sanitize the 'mobile' field
  body('mobile')
    .optional({ nullable: true, checkFalsy: true })
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

  // Validate and sanitize the 'school' field
  body('school')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 2 })
    .withMessage('School name must be at least 2 characters')
    .trim()
    .escape(),

  asyncHandler(async (req, res, next) => {
    console.log('Validated');
    const errors = validationResult(req);
    const athlete = new Athlete({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      birthdate: req.body.birthdate,
      mobile: req.body.mobile,
      email: req.body.email,
      school: req.body.school,
      active: req.body.active,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.status(400).json({ errors });
    } else {
      console.log('updated athlete');
      // Data from form is valid. Update the record.
      const updatedAthlete = await Athlete.findByIdAndUpdate(
        req.params.id,
        { $set: athlete },
        { new: true } // Returns the modified document
      );
      res.status(201).json({ message: 'Success!' });
    }
  }),
];

// Handle DELETE an athlete
exports.athlete_delete = [
  (req, res, next) => {
    console.log('DELETE received');
    next();
  },
  validateObjectId,
  asyncHandler(async (req, res, next) => {
    try {
      const athlete = await Athlete.findById(req.params.id);

      if (athlete) {
        await Athlete.findByIdAndDelete(req.params.id);
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
