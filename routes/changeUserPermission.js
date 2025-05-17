const express = require("express");
const router = express.Router();
const { isAuth, isAdmin } = require("../middlewares/auth");

const changeUserPermissionController = require("../controllers/changeUserPermission");

router.patch(
  "/",
  isAuth,
  isAdmin,
  changeUserPermissionController.changeUserPermission
);

module.exports = router;
