const { dataSource } = require("../db/data-source");
const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const logger = require("../utils/logger")("AuthController");
const validateLogin = require("../utils/validateLogin");
const ERROR_MESSAGES = require("../utils/errorMessages");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // 驗證登入資料
    const { isValid, errors } = validateLogin({ email, password });
    if (!isValid) {
      logger.warn("Login validation failed", errors);
      return res.status(400).json({
        status: "false",
        message: errors,
      });
    }

    const userRepository = dataSource.getRepository("Users");
    const existingUser = await userRepository.findOne({
      select: {
        id: true,
        name: true,
        password: true,
        role_id: true,
      },
      where: { email },
    });

    if (!existingUser) {
      logger.warn(ERROR_MESSAGES.USER_NOT_FOUND_OR_PASSWORD_FALSE);
      return res.status(401).json({
        status: "false",
        message: ERROR_MESSAGES.USER_NOT_FOUND_OR_PASSWORD_FALSE,
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      logger.warn(ERROR_MESSAGES.PASSWORD_FALSE); // 密碼錯誤訊息
      return res.status(401).json({
        status: "false",
        message: ERROR_MESSAGES.PASSWORD_FALSE,
      });
    }

    if (existingUser.role_id !== "a9e9fc8a-567b-45fc-8d10-26a55d0e48c9") {
      logger.warn("Unauthorized access attempt by non-admin user");
      return res.status(403).json({
        status: "false",
        message: "您無權限登入此系統",
      });
    }

    res.status(200).json({
      status: "true",
      message: "登入成功",
      data: {
        user: {
          id: existingUser.id,
          name: existingUser.name,
          role: existingUser.role_id,
        },
      },
    });
  } catch (error) {
    logger.error("伺服器錯誤", { error });
    res.status(500).json({
      status: "false",
      message: "發生伺服器錯誤",
    });
  }
}

module.exports = {
  login,
};
