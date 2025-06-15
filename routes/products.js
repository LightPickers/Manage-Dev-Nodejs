const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products");
const { isAuth, isAdmin } = require("../middlewares/auth");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.post(
  "/",
  isAuth,
  isAdmin,
  handleErrorAsync(productsController.postProducts)
);
router.put(
  "/:product_id",
  isAuth,
  isAdmin,
  handleErrorAsync(productsController.putProducts)
);
router.get(
  "/",
  isAuth,
  isAdmin,
  handleErrorAsync(productsController.getProducts)
);
router.delete(
  "/:product_id",
  isAuth,
  isAdmin,
  handleErrorAsync(productsController.deleteProducts)
);
router.patch(
  "/pulled",
  isAuth,
  isAdmin,
  handleErrorAsync(productsController.pullProducts)
);
router.get(
  "/:product_id",
  isAuth,
  isAdmin,
  handleErrorAsync(productsController.getPreFilledInfo)
);
router.patch(
  "/shelved",
  isAuth,
  isAdmin,
  handleErrorAsync(productsController.shelvedProducts)
);

module.exports = router;
