const Athlete = require('../models/athlete');
const asyncHandler = require('express-async-handler');
const validateObjectId = require('../middleware/validateObjectId');
const { body, validationResult } = require('express-validator');

// Handle GET all athletes.
exports.athlete_list = asyncHandler(async (req, res, next) => {
  const athlete_list = await Athlete.find({}, "first_name last_name gender active").sort({ last_name: 1 }).exec();
  res.json({ athlete_list });
});

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

    res.json({ athlete });
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
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric charecters'),
  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Last name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric charecters'),
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
    console.log(
      '🚀 ~ file: athleteApiController.js:86 ~ asyncHandler ~ errors:',
      errors
    );

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
      res.json({ errors });
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
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric charecters'),
  body('last_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Last name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric charecters'),
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
      res.json(JSON.stringify(errors));
    } else {
      console.log('updated athlete');
      // Data from form is valid. Update the record.
      const updatedAthlete = await Athlete.findByIdAndUpdate(
        req.params.id,
        { $set: athlete },
        { new: true } // Returns the modified document
      );
      res.status(203).json({ message: 'Success!' });
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
    await Athlete.findByIdAndDelete(req.params.id);
    res.status(203).json({ message: 'Success!' });
  }),
];
