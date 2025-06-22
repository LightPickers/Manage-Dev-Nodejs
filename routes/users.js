const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users");
const { isAuth, isAdmin } = require("../middlewares/auth");
const handleErrorAsync = require("../utils/handleErrorAsync");

router.get("/", isAuth, isAdmin, handleErrorAsync(usersController.getUsers));
router.patch(
  "/permissions",
  isAuth,
  isAdmin,
  handleErrorAsync(usersController.changeUserPermission)
);
router.post("/auth/verify", handleErrorAsync(usersController.verifyAdmin));

module.exports = router;
