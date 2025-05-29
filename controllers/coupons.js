const logger = require("../utils/logger")("Coupons");
const { dataSource } = require("../db/data-source");
const { isUndefined, isValidString } = require("../utils/validUtils");
const { validateFields } = require("../utils/validateFields");
const {
  COUPONS_RULE,
  PAGE_PER_RULE,
  PAGENUMBER_PERNUMBER_RULE,
  QUARY_NAME_RULE,
  QUARY_KEYWORD_RULE,
} = require("../utils/validateRules");
const AppError = require("../utils/appError");
const ERROR_MESSAGES = require("../utils/errorMessages");

async function getCoupons(req, res, next) {
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

  const queryBuilder = dataSource
    .getRepository("Coupons")
    .createQueryBuilder("coupon")
    .select([
      "coupon.id",
      "coupon.name",
      "coupon.code",
      "coupon.discount",
      "coupon.quantity",
      "coupon.distributed_quantity",
      "coupon.start_at",
      "coupon.end_at",
      "coupon.is_available",
    ])
    .orderBy("coupon.start_at", "ASC")
    .skip(skip)
    .take(perNumber);

  // 判斷網址中的 name 是否有值，並驗證欄位
  if (name) {
    const errorFields = validateFields({ name }, QUARY_NAME_RULE);
    if (errorFields) {
      const errorMessage = errorFields;
      logger.warn(errorMessage);
      return next(new AppError(400, errorMessage));
    } else {
      queryBuilder.andWhere("coupon.name = :name", { name });
    }
  }

  // 判斷網址中的 keyword 是否有值，並驗證欄位
  if (keyword) {
    const errorFields = validateFields({ keyword }, QUARY_KEYWORD_RULE);
    if (errorFields) {
      const errorMessage = errorFields;
      logger.warn(errorMessage);
      return next(new AppError(400, errorMessage));
    } else {
      queryBuilder.andWhere(
        "(coupon.name LIKE :keyword OR coupon.code LIKE :keyword)", // 以 優惠券名稱 或 優惠券code 進行搜尋
        { keyword: `%${keyword}%` }
      );
    }
  }

  const coupons = await queryBuilder.getMany();

  res.status(200).json({
    status: true,
    data: coupons,
  });
}

async function getCouponsDetail(req, res, next) {
  const { coupons_id } = req.params;
  if (isUndefined(coupons_id) || !isValidString(coupons_id)) {
    logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
    return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
  }

  const couponRepo = dataSource.getRepository("Coupons");
  const coupon = await couponRepo.findOneBy({ id: coupons_id });
  if (!coupon) {
    logger.warn(`優惠券${ERROR_MESSAGES.DATA_NOT_FOUND}`);
    return next(new AppError(404, `優惠券${ERROR_MESSAGES.DATA_NOT_FOUND}`));
  }

  res.status(200).json({
    status: true,
    data: coupon,
  });
}

async function postCoupons(req, res, next) {
  const {
    code,
    name,
    discount,
    quantity,
    distributed_quantity: distributedQuantity,
    start_at: startAt,
    end_at: endAt,
    is_available: isAvailable,
  } = req.body;

  const errorFields = validateFields(
    {
      code,
      name,
      discount,
      quantity,
      distributedQuantity,
      startAt,
      endAt,
      isAvailable,
    },
    COUPONS_RULE
  );
  if (errorFields) {
    const errorMessages = errorFields.join(", ");
    logger.warn(errorMessages);
    return next(new AppError(400, errorMessages));
  }

  const couponCode = await dataSource
    .getRepository("Coupons")
    .findOneBy({ code });
  if (couponCode) {
    logger.warn(`優惠券代碼 ${ERROR_MESSAGES.DATA_ALREADY_USED}`);
    return next(
      new AppError(400, `優惠券代碼 ${ERROR_MESSAGES.DATA_ALREADY_USED}`)
    );
  }

  if (quantity <= 0) {
    logger.warn(ERROR_MESSAGES.COUPON_NOT_ZERO);
    return next(new AppError(400, ERROR_MESSAGES.COUPON_NOT_ZERO));
  }

  if (distributedQuantity >= quantity) {
    logger.warn(ERROR_MESSAGES.COUPON_QUANTITY_MORETHAN_DISTRUBUTED);
    return next(
      new AppError(400, ERROR_MESSAGES.COUPON_QUANTITY_MORETHAN_DISTRUBUTED)
    );
  }

  if (endAt <= startAt) {
    logger.warn(ERROR_MESSAGES.COUPON_END_BEFORE_START);
    return next(new AppError(400, ERROR_MESSAGES.COUPON_END_BEFORE_START));
  }

  const couponRepo = dataSource.getRepository("Coupons");
  const newCoupon = couponRepo.create({
    code,
    name,
    discount,
    quantity,
    distributed_quantity: distributedQuantity,
    start_at: startAt,
    end_at: endAt,
    is_available: isAvailable,
  });

  const savedCoupon = await couponRepo.save(newCoupon);
  const coupon = await couponRepo.findOneBy({ id: savedCoupon.id });

  res.status(201).json({
    status: true,
    data: {
      coupon,
    },
  });
}

async function putCoupons(req, res, next) {
  const { coupons_id } = req.params;
  const {
    code,
    name,
    discount,
    quantity,
    distributed_quantity: distributedQuantity,
    start_at: startAt,
    end_at: endAt,
    is_available: isAvailable,
  } = req.body;

  const errorFields = validateFields(
    {
      code,
      name,
      discount,
      quantity,
      distributedQuantity,
      startAt,
      endAt,
      isAvailable,
    },
    COUPONS_RULE
  );
  if (errorFields) {
    const errorMessages = errorFields.join(", ");
    logger.warn(errorMessages);
    return next(new AppError(400, errorMessages));
  }

  const couponRepo = dataSource.getRepository("Coupons");
  const coupon = await couponRepo.findOne({
    select: [
      "code",
      "name",
      "discount",
      "quantity",
      "distributed_quantity",
      "start_at",
      "end_at",
      "is_available",
    ],
    where: { id: coupons_id },
  });

  if (!coupon) {
    logger.warn(`優惠券${ERROR_MESSAGES.DATA_NOT_FOUND}`);
    return next(new AppError(404, `優惠券${ERROR_MESSAGES.DATA_NOT_FOUND}`));
  }

  if (endAt <= startAt) {
    logger.warn(ERROR_MESSAGES.COUPON_END_BEFORE_START);
    return next(new AppError(400, ERROR_MESSAGES.COUPON_END_BEFORE_START));
  }

  if (distributedQuantity > quantity) {
    logger.warn(ERROR_MESSAGES.COUPON_DISTRUBUTED_MORETHAN_QUANTITY);
    return next(
      new AppError(400, ERROR_MESSAGES.COUPON_DISTRUBUTED_MORETHAN_QUANTITY)
    );
  }

  if (
    coupon.code === code &&
    coupon.name === name &&
    coupon.discount === discount &&
    coupon.quantity === quantity &&
    coupon.distributed_quantity === distributedQuantity &&
    coupon.start_at === startAt &&
    coupon.end_at === endAt &&
    coupon.is_available === isAvailable
  ) {
    logger.warn(`優惠券${ERROR_MESSAGES.DATA_NOT_CHANGE}`);
    return next(new AppError(400, `優惠券${ERROR_MESSAGES.DATA_NOT_CHANGE}`));
  }

  const updateResult = await couponRepo.update(
    {
      id: coupons_id,
    },
    {
      code,
      name,
      discount,
      quantity,
      distributed_quantity: distributedQuantity,
      start_at: startAt,
      end_at: endAt,
      is_available: isAvailable,
    }
  );

  if (updateResult.affected === 0) {
    logger.warn(`優惠券${ERROR_MESSAGES.DATA_UPDATE_FAILED}`);
    return next(
      new AppError(400, `優惠券${ERROR_MESSAGES.DATA_UPDATE_FAILED}`)
    );
  }

  const result = await couponRepo.findOneBy({ id: coupons_id });

  res.status(200).json({
    status: true,
    data: {
      coupon: result,
    },
  });
}

async function deleteCoupons(req, res, next) {
  const { coupons_id } = req.params;
  if (isUndefined(coupons_id) || !isValidString(coupons_id)) {
    logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
    return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
  }

  const result = await dataSource
    .getRepository("Coupons")
    .delete({ id: coupons_id });
  if (result.affected === 0) {
    logger.warn(`優惠券${ERROR_MESSAGES.DATA_NOT_DELETE}`);
    return next(new AppError(400, `優惠券${ERROR_MESSAGES.DATA_NOT_DELETE}`));
  }

  res.status(200).json({
    status: true,
    message: "刪除成功",
  });
}

module.exports = {
  getCoupons,
  getCouponsDetail,
  postCoupons,
  putCoupons,
  deleteCoupons,
};
