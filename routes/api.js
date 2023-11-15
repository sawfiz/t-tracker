var express = require('express');
var router = express.Router();

const athlete_controller = require('../controllers/athleteApiController')

/* GET data home page. */
router.get('/', function (req, res, next) {
  res.json( { title: 'T-Tracker data' });
});

/* Athlete requests */
// GET request for creating an athlete
// router.get('/athlete/create', athlete_controller.athlete_create_get)

// POST request for creating athlete.
// router.post("/athlete/create", athlete_controller.athlete_create_post);

// // GET request to delete athlete.
// router.get("/athlete/:id/delete", athlete_controller.athlete_delete_get);

// // POST request to delete athlete.
// router.post("/athlete/:id/delete", athlete_controller.athlete_delete_post);

// GET request to update athlete.
// router.get("/athlete/:id/update", athlete_controller.athlete_update_get);

// POST request to update athlete.
// router.post("/athlete/:id/update", athlete_controller.athlete_update_post);

// GET request for one athlete.
router.get("/athlete/:id", athlete_controller.athlete_detail);

// GET request for list of all athletes
router.get("/athletes", athlete_controller.athlete_list);

/* Parents requests */

module.exports = router;