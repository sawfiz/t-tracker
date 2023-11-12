var express = require('express');
var router = express.Router();

const athlete_controller = require('../controllers/athleteController')

/* GET data home page. */
router.get('/', function (req, res, next) {
  res.render('data', { title: 'T-Tracker data' });
});

// GET request for creating an athlete
router.get('/athlete/create', athlete_controller.athlete_create_get)

// POST request for creating Book.
router.post("/athlete/create", athlete_controller.athlete_create_post);

// GET request for one athlete.
router.get("/athlete/:id", athlete_controller.athlete_detail);

module.exports = router;