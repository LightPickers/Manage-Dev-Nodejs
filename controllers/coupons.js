const { IsNull, In } = require("typeorm");
const config = require("../config/index");
const { dataSource } = require("../db/data-source");
const { isUndefined, isValidString, isValidInteger, isValidBoolean } = require("../utils/validUtils");
const appError = require("../utils/appError");
const ERROR_MESSAGES = require("../utils/errorMessages");

async function getCoupons(req, res, next) {
  const coupons = await dataSource.getRepository("Coupons").find({
    select: ["name", "code", "discount", "quantity", "distributed_quantity", "start_at", "end_at", "is_available"],
  });

  res.status(200).json({
    status: true,
    data: coupons,
  });
}
async function getCouponsDetail(req, res, next) {
  const { couponId } = req.params;
  if (isUndefined(couponId) || !isValidString(couponId)) {
    return next(appError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
  }

  const couponRepo = await dataSource.getRepository("Coupons");
  const coupon = await couponRepo.findOneBy({ id: couponId });
  if (!coupon) {
    logger.warn(ERROR_MESSAGES.COUPON_NOT_FOUND);
    return next(appError(400, ERROR_MESSAGES.COUPON_NOT_FOUND));
  }

  res.status(200).json({
    status: true,
    data: coupon,
  });
}
async function postCoupons(req, res, next) {}

async function putCoupons(req, res, next) {}

async function deleteCoupons(req, res, next) {}

module.exports = {
  getCoupons,
  getCouponsDetail,
  postCoupons,
  putCoupons,
  deleteCoupons,
};
