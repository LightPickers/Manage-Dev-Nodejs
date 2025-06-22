const jwt = require("jsonwebtoken");
const config = require("../config/index");
const logger = require("../utils/logger")("User");
const { dataSource } = require("../db/data-source");
const { validateFields } = require("../utils/validateFields");
const {
  PAGE_PER_RULE,
  PAGENUMBER_PERNUMBER_RULE,
  QUERY_NAME_RULE,
  QUERY_KEYWORD_RULE,
} = require("../utils/validateRules");
const AppError = require("../utils/appError");
const ERROR_MESSAGES = require("../utils/errorMessages");

// API 63.取得用戶列表
async function getUsers(req, res, next) {
  const { page, per, name, keyword } = req.query;
  const errorFields = validateFields(
    {
      page,
      per,
    },
    PAGE_PER_RULE
  );
  if (errorFields) {
    const errorMessage = errorFields.join(", ");
    logger.warn(errorMessage);
    return next(new AppError(400, errorMessage));
  }

  // 將 Page、Per 轉換為數字型別，並驗證是否為正整數
  const pageNumber = parseInt(page, 10) || 1;
  const perNumber = parseInt(per, 10) || 10;
  const skip = perNumber * (pageNumber - 1);
  const errorPagePer = validateFields(
    {
      pageNumber,
      perNumber,
    },
    PAGENUMBER_PERNUMBER_RULE
  );
  if (errorPagePer) {
    const errorMessage = errorPagePer.join(", ");
    logger.warn(errorMessage);
    return next(new AppError(400, errorMessage));
  }

  // 跳過的資料筆數，不能為負數
  if (skip < 0) {
    logger.warn(`skip ${ERROR_MESSAGES.DATA_NEGATIVE}`);
    return next(new AppError(400, `skip ${ERROR_MESSAGES.DATA_NEGATIVE}`));
  }

  // 取得 使用者 role_id
  const roleUser = await dataSource
    .getRepository("Roles")
    .findOneBy({ name: "user" });
  const roleUserId = roleUser.id;
  if (!roleUserId) {
    logger.warn(`使用者 role_id ${ERROR_MESSAGES.DATA_NOT_FOUND}`);
    return next(
      new AppError(`使用者 role_id ${ERROR_MESSAGES.DATA_NOT_FOUND}`)
    );
  }

  const queryBuilder = dataSource
    .getRepository("Users")
    .createQueryBuilder("user")
    .where("user.role_id = :roleUserId", { roleUserId })
    .select([
      "user.id",
      "user.name",
      "user.email",
      "user.photo",
      "user.is_banned",
    ])
    .orderBy("user.email", "ASC")
    .skip(skip)
    .take(perNumber);

  // 判斷網址中的 name 是否有值，並驗證欄位
  if (name) {
    const nameErrorFields = validateFields({ name }, QUERY_NAME_RULE);
    if (nameErrorFields) {
      const errorMessage = nameErrorFields;
      logger.warn(errorMessage);
      return next(new AppError(400, errorMessage));
    } else {
      queryBuilder.andWhere("user.name = :name", { name });
    }
  }

  // 判斷網址中的 keyword 是否有值，並驗證欄位
  if (keyword) {
    const keywordErrorFields = validateFields({ keyword }, QUERY_KEYWORD_RULE);
    if (keywordErrorFields) {
      const errorMessage = keywordErrorFields;
      logger.warn(errorMessage);
      return next(new AppError(400, errorMessage));
    } else {
      queryBuilder.andWhere(
        "(user.name LIKE :keyword OR user.email LIKE :keyword)", // 以 使用者名稱 或 使用者email 進行搜尋
        { keyword: `%${keyword}%` }
      );
    }
  }

  // 取出 搜尋的 Users 和 搜尋筆數
  const [users, totalUsers] = await Promise.all([
    queryBuilder.getMany(),
    queryBuilder.getCount(),
  ]);

  // 計算 總頁數
  const totalPages = Math.ceil(totalUsers / perNumber);

  res.status(200).json({
    status: true,
    data: {
      totalUsers,
      totalPages,
      users,
    },
  });
}

//API編號46 更改USER權限
async function changeUserPermission(req, res, next) {
  const { id, is_banned } = req.body;

  if (typeof is_banned !== "boolean") {
    return next(new AppError(400, "格式錯誤，is_banned須為布林值"));
  }

  const userRepo = dataSource.getRepository("Users");
  const user = await userRepo.findOne({ where: { id } });

  if (!user) {
    return next(new AppError(400, ERROR_MESSAGES.USER_NOT_FOUND));
  }

  if (user.is_banned === is_banned) {
    return res.status(200).json({
      status: true,
      message: `使用者已經是${is_banned ? "停權" : "啟用"}狀態`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_banned: is_banned,
      },
    });
  }

  user.is_banned = is_banned;
  await userRepo.save(user);

  return res.status(200).json({
    status: true,
    message: `使用者狀態已更新，使用者已${is_banned ? "停權" : "啟用"}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      is_banned: is_banned,
    },
  });
}

//
async function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    next(new AppError(401, ERROR_MESSAGES.USER_NOT_SIGNUP));
  }
  const token = authHeader.split(" ")[1];

  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, config.get("secret.jwtSecret"), (err, decoded) => {
      if (err) {
        // reject(err)
        // return
        switch (err.name) {
          case "TokenExpiredError":
            reject(new AppError(401, ERROR_MESSAGES.EXPIRED_TOKEN));
            break;
          default:
            reject(new AppError(401, ERROR_MESSAGES.INVALID_TOKEN));
            break;
        }
      } else {
        resolve(decoded);
      }
    });
  });

  // 取得現在的使用者 id, name, role_id
  const currentUser = await dataSource.getRepository("Users").findOne({
    select: ["id", "name", "role_id"],
    where: { id: decoded.id },
  });

  // 取得 Roles 管理者資料
  const admin = await dataSource
    .getRepository("Roles")
    .findOneBy({ name: "admin" });

  // 判斷是否有此使用者資料
  if (!currentUser) {
    logger.warn(ERROR_MESSAGES.USER_NOT_FOUND);
    return next(new AppError(404, ERROR_MESSAGES.USER_NOT_FOUND));
  }

  // 判斷此使用者是否為 管理者
  if (currentUser.role_id !== admin.id) {
    logger.warn(ERROR_MESSAGES.NOT_ADMIN_ENTER_ADMIN_ROUTE);
    return next(new AppError(403, ERROR_MESSAGES.PERMISSION_DENIED));
  }

  res.status(200).json({
    message: "驗證成功",
    status: true,
    user: currentUser,
  });
}

module.exports = {
  getUsers,
  changeUserPermission,
  verifyAdmin,
};
