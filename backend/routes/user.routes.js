const express = require('express');
const User = require('../models/users');
const { createUser, getUser, getSingleUser, updatedUser, deleteUser, loginUser } = require('../controllers/user.controller');

const router = express.Router();

router.get("/users", getUser);
router.get("/users/:id", getSingleUser);
router.post("/", createUser);
router.put("/users/:id", updatedUser);
router.delete("/:id", deleteUser);
router.post("/login", loginUser);

module.exports = router;