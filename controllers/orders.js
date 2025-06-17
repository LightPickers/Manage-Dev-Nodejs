const logger = require("../utils/logger")("Coupons");
const { dataSource } = require("../db/data-source");
const { isUUID } = require("validator");
const { isUndefined, isValidString } = require("../utils/validUtils");
const { validateFields } = require("../utils/validateFields");
const {
  PAGE_PER_RULE,
  PAGENUMBER_PERNUMBER_RULE,
  QUARY_ORDER_MERCHANT_ORDER_NO_RULE,
  QUARY_KEYWORD_RULE,
  PATCH_ORDERS_RULE,
} = require("../utils/validateRules");
const { isValidOrderStatus } = require("../utils/validOrderStatus");
const AppError = require("../utils/appError");
const ERROR_MESSAGES = require("../utils/errorMessages");

async function getOrders(req, res, next) {
  const { page, per, order_merchant_order_no, keyword } = req.query;
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
    .getRepository("Orders")
    .createQueryBuilder("order")
    .leftJoinAndSelect("order.Users", "user")
    .select([
      "order.id",
      "order.merchant_order_no",
      "order.amount",
      "order.status",
      "order.created_at",
      "user.id",
      "user.email",
    ])
    .orderBy("order.created_at", "DESC")
    .skip(skip)
    .take(perNumber);

  // 判斷網址中的 order_merchant_order_no 是否有值，並驗證欄位
  if (order_merchant_order_no) {
    const errorFields = validateFields(
      { order_merchant_order_no },
      QUARY_ORDER_MERCHANT_ORDER_NO_RULE
    );
    if (errorFields) {
      const errorMessage = errorFields;
      logger.warn(errorMessage);
      return next(new AppError(400, errorMessage));
    } else {
      queryBuilder.andWhere(
        "order.merchant_order_no = :order.merchant_order_no",
        {
          order_merchant_order_no,
        }
      ); //使用 訂單藍新編號 來做查詢
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
        "(order.status LIKE :keyword OR user.email LIKE :keyword)", // 以 訂單狀態 或 使用者email 進行搜尋
        { keyword: `%${keyword}%` }
      );
    }
  }

  // 取出 搜尋的 Orders 和 搜尋筆數
  const [orders, totalOrders] = await Promise.all([
    queryBuilder.getMany(),
    queryBuilder.getCount(),
  ]);

  // 計算 總頁數
  const totalPages = Math.ceil(totalOrders / perNumber);

  res.status(200).json({
    status: true,
    data: {
      totalOrders,
      totalPages,
      orders,
    },
  });
}

async function getOrdersDetail(req, res, next) {
  const { order_id } = req.params;
  if (
    isUndefined(order_id) ||
    !isValidString(order_id) ||
    !isUUID(order_id, 4)
  ) {
    logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
    return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
  }

  const orderRepo = dataSource.getRepository("Orders");
  const orderItemsRepo = dataSource.getRepository("Order_items");

  // 判斷 該訂單 在資料庫是否有資料
  const existOrder = await orderRepo.findOneBy({ id: order_id });
  if (!existOrder) {
    logger.warn(`訂單 ${ERROR_MESSAGES.DATA_NOT_FOUND}`);
    return next(new AppError(404, `訂單 ${ERROR_MESSAGES.DATA_NOT_FOUND}`));
  }

  // 查詢 Orders, Users, Coupons 關聯資料
  const shippingFee = 60;
  const orderInfo = await orderRepo
    .createQueryBuilder("order")
    .leftJoinAndSelect("order.Users", "user")
    .leftJoinAndSelect("order.Coupons", "coupon")
    .select([
      "order.id AS id",
      "order.merchant_order_no AS merchant_order_no",
      "order.created_at AS created_at",
      "order.status AS status",
      "order.amount AS amount",
      "user.id",
      "user.name",
      "user.email",
      "user.address_zipcode",
      "user.address_city",
      "user.address_district",
      "user.address_detail",
      "user.phone",
      "coupon.id",
      "coupon.code",
      "coupon.discount",
      "order.shipping_method AS shipping_method",
      "order.payment_method AS payment_method",
      "order.desired_date AS desired_date",
      "(order.amount - :shippingFee) / COALESCE(coupon.discount, 10) * 10 AS items_total_amount", // 計算品項總金額
      "(order.amount - :shippingFee) / COALESCE(coupon.discount, 10) * (10 - COALESCE(coupon.discount, 0)) AS discount_amount", // 計算折扣金額
    ])
    .where("order.id = :order_id", { order_id })
    .setParameters({ shippingFee })
    .getRawOne();

  const orderItems = await orderItemsRepo
    .createQueryBuilder("orderItems")
    .leftJoinAndSelect("orderItems.Products", "product")
    .select([
      "orderItems.product_id AS id",
      "product.name AS name",
      "product.primary_image AS primary_image",
      "orderItems.price AS price",
      "orderItems.quantity AS quantity",
    ])
    .where("orderItems.order_id = :order_id", { order_id })
    .getRawMany();

  res.status(200).json({
    message: "成功",
    status: "true",
    order: orderInfo,
    order_items: orderItems,
  });
}

async function patchOrders(req, res, next) {
  const { order_id } = req.params;
  const { status } = req.body;

  // 驗證參數
  if (
    isUndefined(order_id) ||
    !isValidString(order_id) ||
    !isUUID(order_id, 4)
  ) {
    logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
    return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
  }

  // 驗證 status 參數
  const errorFields = validateFields(
    {
      status,
    },
    PATCH_ORDERS_RULE
  );
  if (errorFields) {
    const errorMessages = errorFields.join(", ");
    logger.warn(errorMessages);
    return next(new AppError(400, errorMessages));
  }

  // 驗證訂單狀態
  if (!isValidOrderStatus(status)) {
    logger.warn(ERROR_MESSAGES.ORDER_STATUS_NOT_RULE);
    return next(new AppError(400, ERROR_MESSAGES.ORDER_STATUS_NOT_RULE));
  }

  const orderRepo = dataSource.getRepository("Orders");

  // 判斷 該訂單 在資料庫是否有資料
  const existOrder = await orderRepo.findOneBy({ id: order_id });
  if (!existOrder) {
    logger.warn(`訂單 ${ERROR_MESSAGES.DATA_NOT_FOUND}`);
    return next(new AppError(404, `訂單 ${ERROR_MESSAGES.DATA_NOT_FOUND}`));
  }

  // 檢查 訂單狀態 是否有變更
  if (existOrder.status === status) {
    logger.warn(`訂單 ${ERROR_MESSAGES.DATA_NOT_CHANGE}`);
    return next(new AppError(400, `訂單 ${ERROR_MESSAGES.DATA_NOT_CHANGE}`));
  }

  // 更新訂單狀態
  const updateResult = await orderRepo.update({ id: order_id }, { status });

  if (updateResult.affected === 0) {
    logger.warn(`訂單 ${ERROR_MESSAGES.DATA_UPDATE_FAILED}`);
    return next(new AppError(400, `訂單 ${ERROR_MESSAGES.DATA_UPDATE_FAILED}`));
  }

  // 取得更新後的訂單資料
  const updatedOrder = await orderRepo.findOneBy({ id: order_id });

  logger.info(`訂單 ${order_id} 狀態已更新為: ${status}`);

  res.status(200).json({
    status: true,
    message: `訂單 狀態已更新為 ${status}`,
    data: {
      order: updatedOrder,
    },
  });
}

module.exports = {
  getOrders,
  getOrdersDetail,
  patchOrders,
};
