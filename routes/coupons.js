const express = require("express");
const router = express.Router();
const couponsController = require("../controllers/coupons");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.get("/", handleErrorAsync(couponsController.getCoupons));
router.get("/:coupons_id", handleErrorAsync(couponsController.getCouponsDetail));
router.post("/", handleErrorAsync(couponsController.getCoupons));
router.put("/:coupons_id", handleErrorAsync(couponsController.getCouponsDetail));
router.delete("/:coupons_id", handleErrorAsync(couponsController.getCouponsDetail));

module.exports = router;
