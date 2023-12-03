// Libraries
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const multer = require('multer');

const validateObjectId = require('../middleware/validateObjectId');
const { verifyJWT } = require('../middleware/verifyJWT');
const CustomError = require('../utils/CustomError');

// Model
const Athlete = require('../models/athlete');

// Define the storage for the uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/avatars'); // Specify the directory to save the uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
});

// Initialize Multer with the defined storage
const upload = multer({ storage: storage });

const validateInputs = () => {
  return [
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
  ];
};

// Handle GET all athletes.
exports.athletes_list = [
  verifyJWT,
  asyncHandler(async (req, res, next) => {
    const athletes_list = await Athlete.find(
      {},
      'first_name last_name gender active'
    )
      .sort({ first_name: 1 })
      .maxTimeMS(5000) // Set the maximum time for query execution
      .exec();
    // Send Success status and data

    res.status(200).json({ athletes_list });
  }),
];

// Handle GET details of a specific athlete.
exports.athlete_detail = [
  validateObjectId,
  verifyJWT,
  asyncHandler(async (req, res, next) => {
    // console.log(req);
    const [athlete] = await Promise.all([
      Athlete.findById(req.params.id).exec(),
    ]);

    if (athlete === null) {
      throw new CustomError(404, 'Athlete not found');
    }

    res.status(200).json({ athlete });
  }),
];

// Handle POST to create an athlete
exports.athlete_create_post = [
  upload.single('avatar'),
  (req, res, next) => {
    console.log('POST received');
    console.log(req.file);
    console.log(req.body);
    next();
  },
  verifyJWT,
  validateInputs(),

  asyncHandler(async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      try {
        throw new CustomError(400, JSON.stringify(validationErrors));
      } catch (err) {
        console.log(
          '🚀 ~ file: athleteApiController.js:115 ~ asyncHandler ~ err:',
          err
        );
      }
    }
    // Make sure username is not already used
    const userExists = await Athlete.findOne({
      first_name: req.body.first_name,
    });

    // if (userExists) res.status(409).json({ error: 'Username in use' });
    if (userExists) throw new CustomError(409, 'Athlete already exists');

    const athlete = new Athlete({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      gender: req.body.gender,
      birthdate: req.body.birthdate,
      mobile: req.body.mobile,
      email: req.body.email,
      school: req.body.school,
      active: req.body.active,
      photoUrl: req.file.path,
    });
    await athlete.save();
    res.status(201).json({ message: 'Success' });
  }),
];

// Handle UPDATE/PUT an athlete
exports.athlete_update = [
  validateObjectId,
  verifyJWT,
  validateInputs(),

  asyncHandler(async (req, res, next) => {
    console.log('Validated');
    const validationErrors = validationResult(req);
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

    if (!validationErrors.isEmpty()) {
      throw new CustomError(400, JSON.stringify(validationErrors));
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
  verifyJWT,
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
        throw new CustomError(500, 'Record does not exist.');
      }
    } catch (error) {
      console.log('Deletion failed');
      throw new CustomError(500, error);
    }
  }),
];
