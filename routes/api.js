var express = require('express');
var router = express.Router();

const athlete_api_controller = require('../controllers/athleteApiController');

/* GET data home page. */
router.get('/', function (req, res, next) {
  res.json({ title: 'T-Tracker data' });
});

/* Athlete requests */
// GET request for one athlete.
router.get('/athlete/:id', athlete_api_controller.athlete_detail);

// GET request for list of all athletes
router.get('/athletes', athlete_api_controller.athlete_list);

// POST request for creating athlete.
router.post('/athlete/create', athlete_api_controller.athlete_create_post);

// UPDATE request to update athlete.
router.put('/athlete/:id', athlete_api_controller.athlete_update);

// // POST request to delete athlete.
router.delete('/athlete/:id', athlete_api_controller.athlete_delete);

/* Parents requests */

module.exports = router;
