const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders");
const { isAuth, isAdmin } = require("../middlewares/auth");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.get("/", isAuth, isAdmin, handleErrorAsync(ordersController.getOrders));
router.get(
  "/:order_id",
  isAuth,
  isAdmin,
  handleErrorAsync(ordersController.getOrdersDetail)
);
router.patch(
  "/:order_id",
  isAuth,
  isAdmin,
  handleErrorAsync(ordersController.patchOrders)
);

module.exports = router;
