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

// getUsers
const QUERY_NAME_RULE = {
  name: "string",
};
// getUsers, getOrders
const QUERY_KEYWORD_RULE = {
  keyword: "string",
};

// getOrders
const QUERY_STATUS_RULE = {
  status: "string",
};

// patchOrders
const PATCH_ORDERS_RULE = {
  status: "string",
};

module.exports = {
  COUPONS_RULE,
  PRODUCTS_RULE,
  PAGE_PER_RULE,
  PAGENUMBER_PERNUMBER_RULE,
  QUERY_NAME_RULE,
  QUERY_KEYWORD_RULE,
  QUERY_STATUS_RULE,
  PATCH_ORDERS_RULE,
};
