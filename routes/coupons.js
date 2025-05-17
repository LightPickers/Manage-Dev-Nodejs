const express = require("express");
const router = express.Router();
const couponsController = require("../controllers/coupons");
const { isAuth, isAdmin } = require("../middlewares/auth");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.get("/", isAuth, handleErrorAsync(couponsController.getCoupons));
router.get(
  "/:coupons_id",
  isAuth,
  handleErrorAsync(couponsController.getCouponsDetail)
);
router.post(
  "/",
  isAuth,
  isAdmin,
  handleErrorAsync(couponsController.postCoupons)
);
router.put(
  "/:coupons_id",
  isAuth,
  isAdmin,
  handleErrorAsync(couponsController.putCoupons)
);
router.delete(
  "/:coupons_id",
  isAuth,
  isAdmin,
  handleErrorAsync(couponsController.deleteCoupons)
);

module.exports = router;
