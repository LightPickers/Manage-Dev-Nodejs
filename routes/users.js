const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const { isAuth, isAdmin } = require("../middlewares/auth");
const handleErrorAsync = require("../utils/handleErrorAsync");
const permissionsController = require("../controllers/permissions");

router.get("/", isAuth, isAdmin, handleErrorAsync(usersController.getUsers));
router.patch(
  "/permissions",
  isAuth,
  isAdmin,
  permissionsController.handleErrorAsync(changeUserPermission)
);

module.exports = router;
