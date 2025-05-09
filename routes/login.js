const express = require("express");
const router = express.Router();
const { login } = require("../controllers/login");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.post("/login", handleErrorAsync(login));

module.exports = router;
