const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.post("/", handleErrorAsync(productsController.postProducts));
router.put("/:product_id", handleErrorAsync(productsController.putProducts));

module.exports = router;
