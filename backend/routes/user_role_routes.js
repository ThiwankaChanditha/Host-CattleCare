const express = require('express');
const {
    getuserRole,
    createUserRole,
    updateUserRole,
    deleteUserRole
} = require('../controllers/user_role.controller');

const router = express.Router();

router.get("/", getuserRole);
router.post("/", createUserRole);
router.put("/:id", updateUserRole);
router.delete("/:id", deleteUserRole);

module.exports = router;
