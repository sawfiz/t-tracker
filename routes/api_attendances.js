const express = require('express');
const router = express.Router();

const attendance_api_controller = require('../controllers/attendanceApiController');

/* Athlete requests */
// GET request for list of all athletes
// !Make sure /all route is place before /:id
router.get('/', attendance_api_controller.attendances_list);

// GET request for one athlete.
// router.get('/:id', athlete_api_controller.athlete_detail);

// POST request for creating athlete.
router.post('/', attendance_api_controller.attendance_create_post);

// PUT request to update athlete.
// router.put('/:id', athlete_api_controller.athlete_update);

// DELETE request to delete athlete.
// router.delete('/:id', athlete_api_controller.athlete_delete);

/* Parents requests */

module.exports = router;
