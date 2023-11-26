// Libraries
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

const validateObjectId = require('../middleware/validateObjectId');
const { verifyJWT } = require('../middleware/verifyJWT');
const CustomError = require('../utils/CustomError');

// Model
const Attendance = require('../models/attendance');

const validateInputs = () => {
  return [
    (req, res, next) => {
      console.log('Went through validations');
      next();
    },
  ];
};

// Handle GET all attendances.
exports.attendances_list = [
  verifyJWT,
  asyncHandler(async (req, res, next) => {
    const attendances_list = await Attendance.find(
      {},
      'date venue'
    )
      .sort({ date: 1 })
      .maxTimeMS(5000) // Set the maximum time for query execution
      .exec();
    // Send Success status and data

    res.status(200).json({ attendances_list });
  }),
];



// Handle GET details of a specific attendance.
exports.attendance_detail = [
  validateObjectId,
  verifyJWT,
  asyncHandler(async (req, res, next) => {
    // console.log(req);
    const [attendance] = await Promise.all([
      Attendance.findById(req.params.id)
      .populate('coaches')
      .populate('athletes')
      .exec(),
    ]);

    if (attendance === null) {
      throw new CustomError(404, 'attendance not found');
    }

    res.status(200).json({ attendance });
  }),
];

// Handle POST to create an attendance
exports.attendance_create_post = [
  (req, res, next) => {
    console.log('POST received');
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
          '🚀 ~ file: attendanceApiController.js:115 ~ asyncHandler ~ err:',
          err
        );
      }
    }
    // // Make sure username is not already used
    // const userExists = await attendance.findOne({
    //   first_name: req.body.first_name,
    // });

    // // if (userExists) res.status(409).json({ error: 'Username in use' });
    // if (userExists) throw new CustomError(409, 'attendance already exists');

    const attendance = new Attendance({
      date: req.body.date,
      venue: req.body.venue,
      coaches: req.body.coachList,
      athletes: req.body.attendeeList,
    });
    await attendance.save();
    res.status(201).json({ message: 'Success' });
  }),
];
