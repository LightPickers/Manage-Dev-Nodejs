const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const logger = require("../utils/logger")("authMiddleware");
const ERROR_MESSAGES = require("../utils/errorMessages");
const config = require("../config/index");
const { dataSource } = require("../db/data-source");

/**
 * 驗證使用者是否已登入的中間件
 * 檢查請求 headers 中的 Authorization 是否包含有效的 JWT token
 */
const isAuth = async (req, res, next) => {
  let token;

  // 檢查 Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 如果沒有 token，返回未登入錯誤
  if (!token) {
    logger.warn("未提供 JWT Token");
    return next(new AppError(401, ERROR_MESSAGES.USER_NOT_SIGNUP));
  }

  try {
    // 驗證 token
    const decoded = jwt.verify(token, config.get("secret.jwtSecret"));

    // 從資料庫查詢使用者
    const userRepository = dataSource.getRepository("Users");
    const currentUser = await userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      logger.warn("Token 包含不存在的使用者 ID");
      return next(new AppError(401, ERROR_MESSAGES.USER_NOT_FOUND));
    }

    if (currentUser.is_banned) {
      logger.warn("使用者已被停權");
      return next(new AppError(403, "您的帳號已被停權，請聯繫客服"));
    }

    // 將使用者資訊存到 req.user 讓後續路由可以使用
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.warn("Token 已過期");
      return next(new AppError(401, ERROR_MESSAGES.EXPIRED_TOKEN));
    }

    logger.warn("無效的 Token");
    return next(new AppError(401, ERROR_MESSAGES.INVALID_TOKEN));
  }
};

/**
 * 驗證使用者是否為管理員的中間件
 * 必須在 isAuth 中間件之後使用
 */
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role_id === "a9e9fc8a-567b-45fc-8d10-26a55d0e48c9") {
    next();
  } else {
    logger.warn("非管理員嘗試訪問管理員權限路由");
    return next(new AppError(403, "您無權限訪問此資源"));
  }
};

module.exports = {
  isAuth,
  isAdmin,
};
