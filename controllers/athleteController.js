const Athlete = require('../models/athlete');
const asyncHandler = require('express-async-handler');
const validateObjectId = require('../middleware/validateObjectId');
const { body, validationResult } = require('express-validator');

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
  body('date_of_birth', 'Invalid date of birth').isISO8601().toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const athlete = new Athlete({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      date_of_birth: req.body.date_of_birth,
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
