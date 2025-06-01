const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.post("/", handleErrorAsync(productsController.postProducts));
router.put("/:product_id", handleErrorAsync(productsController.putProducts));
router.get("/", handleErrorAsync(productsController.getProducts));
router.delete(
  "/:product_id",
  handleErrorAsync(productsController.deleteProducts)
);
router.patch("/pulled", handleErrorAsync(productsController.pullProducts));
router.get(
  "/:product_id",
  handleErrorAsync(productsController.getPreFilledInfo)
);

module.exports = router;
