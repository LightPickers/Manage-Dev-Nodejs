const express = require("express");
const router = express.Router();
const { getProducts } = require("../controllers/getAllProducts");

router.get("/", getProducts);

module.exports = router;
