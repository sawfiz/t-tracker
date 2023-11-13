const Athlete = require('../models/athlete');
const asyncHandler = require('express-async-handler');
const validateObjectId = require('../middleware/validateObjectId');
const { body, validationResult } = require('express-validator');

// Display list of all athletes.
exports.athlete_list = asyncHandler(async (req, res, next) => {
  const athlete_list = await Athlete.find().sort({ family_name: 1 }).exec();
  res.render('athlete_list', { title: 'athlete List', athlete_list });
});

// Display detail page for a specific athlete.
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

    res.render('athlete_detail', { athlete });
  }),
];

// Display athlete create form on GET.
exports.athlete_create_get = (req, res, next) => {
  res.render('athlete_form', { title: 'Create Athlete' });
};

// Handle athlete create on POST.
exports.athlete_create_post = [
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
    const errors = validationResult(req);
    const athlete = new Athlete({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      birthdate: req.body.birthdate,
      mobile: req.body.mobile,
      email: req.body.email,
      school: req.body.school,
    });

    if (!errors.isEmpty()) {
      res.render('athlete_form', {
        title: 'Create Athlete',
        athlete,
        errors: errors.array(),
      });
    } else {
      await athlete.save();
      res.redirect(athlete.url);
    }
  }),
];
