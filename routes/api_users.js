const express = require('express');
const router = express.Router();

const user_api_controller = require('../controllers/userApiController');

/* user requests */
// GET request for list of all users
// !Make sure /all route is place before /:id
router.get('/', user_api_controller.user_list);

// GET request for one user.
router.get('/:id', user_api_controller.user_detail);

// POST request for creating user.
router.post('/', user_api_controller.user_create_post);

// PUT request to update user.
// router.put('/:id', user_api_controller.user_update);

// DELETE request to delete user.
// router.delete('/:id', user_api_controller.user_delete);

/* Parents requests */

module.exports = router;
