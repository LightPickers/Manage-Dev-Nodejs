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
  try {
    const couponRepo = dataSource.getRepository("Coupons");
    const coupons = await couponRepo.find({
      select: [
        "id",
        "name",
        "code",
        "discount",
        "quantity",
        "distributed_quantity",
        "start_at",
        "end_at",
        "is_available",
      ],
      order: {
        start_at: "ASC",
      },
    });

    res.status(200).json({
      status: true,
      data: coupons,
    });
  } catch (error) {
    logger.error("取得優惠券資料失敗:", error);
    return next(new AppError(500, "取得優惠券資料失敗"));
  }
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

  const secondsToAdd = 23 * 60 * 60 + 59 * 60 + 59; // 23小時59分59秒
  startAtTime = new Date(startAt).toISOString();
  endAtTime = new Date(
    new Date(endAt).getTime() + secondsToAdd * 1000
  ).toISOString();
  const now = new Date().toISOString();

  if (startAtTime <= now) {
    logger.warn(ERROR_MESSAGES.COUPON_START_BEFORE_NOW);
    return next(new AppError(400, ERROR_MESSAGES.COUPON_START_BEFORE_NOW));
  }

  if (endAtTime <= startAtTime) {
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
    start_at: startAtTime,
    end_at: endAtTime,
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

  const secondsToAdd = 23 * 60 * 60 + 59 * 60 + 59; // 23小時59分59秒
  startAtTime = new Date(startAt).toISOString();
  endAtTime = new Date(
    new Date(endAt).getTime() + secondsToAdd * 1000
  ).toISOString();
  const now = new Date().toISOString();

  if (startAtTime <= now) {
    logger.warn(ERROR_MESSAGES.COUPON_START_BEFORE_NOW);
    return next(new AppError(400, ERROR_MESSAGES.COUPON_START_BEFORE_NOW));
  }

  if (endAtTime <= startAtTime) {
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

async function patchCoupons(req, res, next) {
  try {
    const { coupons_id } = req.params;
    const { is_available } = req.body;

    // 驗證參數
    if (isUndefined(coupons_id) || !isValidString(coupons_id)) {
      logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
      return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
    }

    // 驗證 is_available 參數
    if (isUndefined(is_available) || typeof is_available !== "boolean") {
      logger.warn("is_available 欄位必須是布林值");
      return next(new AppError(400, "is_available 欄位必須是布林值"));
    }

    const couponRepo = dataSource.getRepository("Coupons");

    // 檢查優惠券是否存在
    const existingCoupon = await couponRepo.findOneBy({ id: coupons_id });
    if (!existingCoupon) {
      logger.warn(`優惠券${ERROR_MESSAGES.DATA_NOT_FOUND}`);
      return next(new AppError(404, `優惠券${ERROR_MESSAGES.DATA_NOT_FOUND}`));
    }

    // 檢查狀態是否有變更
    if (existingCoupon.is_available === is_available) {
      logger.warn(`優惠券狀態未改變`);
      return next(new AppError(400, `優惠券狀態未改變`));
    }

    // 更新優惠券狀態
    const updateResult = await couponRepo.update(
      { id: coupons_id },
      { is_available }
    );

    if (updateResult.affected === 0) {
      logger.warn(`優惠券${ERROR_MESSAGES.DATA_UPDATE_FAILED}`);
      return next(
        new AppError(400, `優惠券${ERROR_MESSAGES.DATA_UPDATE_FAILED}`)
      );
    }

    // 取得更新後的資料
    const updatedCoupon = await couponRepo.findOneBy({ id: coupons_id });

    logger.info(
      `優惠券 ${coupons_id} 狀態已更新為: ${is_available ? "啟用" : "停用"}`
    );

    res.status(200).json({
      status: true,
      message: `優惠券已${is_available ? "啟用" : "停用"}`,
      data: {
        coupon: updatedCoupon,
      },
    });
  } catch (error) {
    logger.error("更新優惠券狀態失敗:", error);
    return next(new AppError(500, "更新優惠券狀態失敗"));
  }
}

module.exports = {
  getCoupons,
  getCouponsDetail,
  postCoupons,
  putCoupons,
  patchCoupons,
  deleteCoupons,
};
