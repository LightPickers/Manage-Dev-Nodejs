const logger = require("../utils/logger")("User");
const { dataSource } = require("../db/data-source");
const { validateFields } = require("../utils/validateFields");
const {
  PAGE_PER_RULE,
  PAGENUMBER_PERNUMBER_RULE,
  QUARY_NAME_RULE,
  QUARY_KEYWORD_RULE,
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
    .findOneBy({ name: "使用者" });
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
    const nameErrorFields = validateFields({ name }, QUARY_NAME_RULE);
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
    const keywordErrorFields = validateFields({ keyword }, QUARY_KEYWORD_RULE);
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

module.exports = {
  getUsers,
  changeUserPermission,
};
