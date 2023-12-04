const express = require('express');
const router = express.Router();
const multer = require('multer');

const athlete_api_controller = require('../controllers/athleteApiController');

// Define the storage for the uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/avatars/'); // Specify the directory to save the uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// Initialize Multer with the defined storage
const upload = multer({ storage: storage });

/* Athlete requests */
// GET request for list of all athletes
// !Make sure /all route is place before /:id
router.get('/', athlete_api_controller.athletes_list);

// GET request for one athlete.
router.get('/:id', athlete_api_controller.athlete_detail);

// POST request for creating athlete.
router.post(
  '/',
  upload.single('avatar'),
  athlete_api_controller.athlete_create_post
);

// PUT request to update athlete.
router.put(
  '/:id',
  upload.single('avatar'),
  athlete_api_controller.athlete_update
);

// DELETE request to delete athlete.
router.delete('/:id', athlete_api_controller.athlete_delete);

/* Parents requests */

module.exports = router;
