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
  summary: "string",
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

module.exports = {
  COUPONS_RULE,
  PRODUCTS_RULE,
  PAGE_PER_RULE,
  PAGENUMBER_PERNUMBER_RULE,
  QUARY_NAME_RULE,
  QUARY_KEYWORD_RULE,
};
