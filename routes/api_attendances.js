const express = require('express');
const router = express.Router();

const attendance_api_controller = require('../controllers/attendanceApiController');

/* attendance requests */
// GET request for list of all attendances
// !Make sure /all route is place before /:id
router.get('/', attendance_api_controller.attendances_list);

// GET request for one attendance.
router.get('/:id', attendance_api_controller.attendance_detail);

// POST request for creating attendance.
router.post('/', attendance_api_controller.attendance_create_post);

// PUT request to update attendance.
// router.put('/:id', attendance_api_controller.attendance_update);

// DELETE request to delete attendance.
router.delete('/:id', attendance_api_controller.attendance_delete);

/* Parents requests */

module.exports = router;
