const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const UsersController = require('../controllers/usersController');

router.post('/login', UsersController.postUsersLogin);
router.get('/', auth, UsersController.getUsers);
router.get('/:id', auth, UsersController.getUsersId);
router.post('/', UsersController.postUsers);
router.patch('/', auth, UsersController.patchUsers);
router.delete('/', auth, UsersController.deleteUsers);

module.exports = router;
