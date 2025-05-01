const { IsNull, In } = require("typeorm");
const config = require("../config/index");
const logger = require("../utils/logger")("coupons");
const { dataSource } = require("../db/data-source");
const {
  isUndefined,
  isValidString,
  isValidInteger,
  isValidBoolean,
  isValidDate,
} = require("../utils/validUtils");
const AppError = require("../utils/AppError");
const ERROR_MESSAGES = require("../utils/errorMessages");

async function getCoupons(req, res, next) {
  const coupons = await dataSource.getRepository("Coupons").find({
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
  });

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
    return next(new AppError(400, `優惠券${ERROR_MESSAGES.DATA_NOT_FOUND}`));
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
  if (
    isUndefined(code) ||
    !isValidString(code) ||
    isUndefined(name) ||
    !isValidString(name) ||
    isUndefined(discount) ||
    !isValidInteger(discount) ||
    isUndefined(quantity) ||
    !isValidInteger(quantity) ||
    isUndefined(distributedQuantity) ||
    !isValidInteger(distributedQuantity) ||
    isUndefined(startAt) ||
    !isValidDate(startAt) ||
    isUndefined(endAt) ||
    !isValidDate(endAt) ||
    isUndefined(isAvailable) ||
    !isValidBoolean(isAvailable)
  ) {
    logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
    return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
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
  const newCoupon = await couponRepo.create({
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
  if (
    isUndefined(code) ||
    !isValidString(code) ||
    isUndefined(name) ||
    !isValidString(name) ||
    isUndefined(discount) ||
    !isValidInteger(discount) ||
    isUndefined(quantity) ||
    !isValidInteger(quantity) ||
    isUndefined(distributedQuantity) ||
    !isValidInteger(distributedQuantity) ||
    isUndefined(startAt) ||
    !isValidString(startAt) ||
    isUndefined(endAt) ||
    !isValidString(endAt) ||
    isUndefined(isAvailable) ||
    !isValidBoolean(isAvailable)
  ) {
    logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
    return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
  }

  const couponRepo = await dataSource.getRepository("Coupons");
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
    return next(new AppError(400, `優惠券${ERROR_MESSAGES.DATA_NOT_FOUND}`));
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
