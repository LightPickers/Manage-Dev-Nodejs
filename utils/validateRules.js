const COUPONS_RULE = {
  code: "string",
  name: "string",
  discount: "number",
  quantity: "number",
  distributedQuantity: "number",
  startAt: "string",
  endAt: "string",
  isAvailable: "boolean",
};

const PRODUCTS_RULE = {
  primaryImage: "string",
  name: "string",
  categoryId: "string",
  conditionId: "string",
  title: "string",
  subtitle: "string",
  isAvailable: "boolean",
  isFeatured: "boolean",
  brandId: "string",
  originalPrice: "number",
  sellingPrice: "number",
};

const PAGE_PER_RULE = {
  page: "string",
  per: "string",
};

const PAGENUMBER_PERNUMBER_RULE = {
  pageNumber: "number",
  perNumber: "number",
};

const QUARY_NAME_RULE = {
  name: "string",
};

const QUARY_KEYWORD_RULE = {
  keyword: "string",
};

const QUARY_ORDER_MERCHANT_ORDER_NO_RULE = {
  order_merchant_order_no: "string",
};

const PATCH_ORDERS_RULE = {
  status: "string",
};

module.exports = {
  COUPONS_RULE,
  PRODUCTS_RULE,
  PAGE_PER_RULE,
  PAGENUMBER_PERNUMBER_RULE,
  QUARY_NAME_RULE,
  QUARY_KEYWORD_RULE,
  QUARY_ORDER_MERCHANT_ORDER_NO_RULE,
  PATCH_ORDERS_RULE,
};
