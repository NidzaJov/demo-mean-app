const express = require('express');

const UserController = require("../controllers/user");
const authorize = require('../middleware/authorize');
const extractFile = require("../middleware/file");

const router = express.Router();

router.post('/signup', UserController.createUser);

router.post('/login', UserController.userLogin);

router.get('/', authorize('Admin'), UserController.getUsers);

router.get('/:id', authorize(), UserController.getUser);

router.post('/', authorize('Admin'), extractFile, UserController.createUser);

router.put('/:id', authorize(), extractFile, UserController.updateUser);

router.delete('/:id', authorize('Admin'), UserController.deleteUser)

module.exports = router;
