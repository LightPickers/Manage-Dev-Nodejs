const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const { isAuth, isAdmin } = require("../middlewares/auth");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.get("/", isAuth, isAdmin, handleErrorAsync(usersController.getUsers));

module.exports = router;
