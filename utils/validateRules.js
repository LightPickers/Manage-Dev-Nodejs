const COUPONS_RULES = {
  code: "string",
  name: "string",
  discount: "number",
  quantity: "number",
  distributedQuantity: "number",
  startAt: "string",
  endAt: "string",
  isAvailable: "boolean",
};

const PRODUCTS_RULES = {
  primaryImage: "string",
  name: "string",
  categoryId: "string",
  conditionId: "string",
  summary: "string",
  title: "string",
  subtitle: "string",
  description: "string",
  isAvailable: "boolean",
  isFeatured: "boolean",
  brandId: "string",
  originalPrice: "number",
  sellingPrice: "number",
};

module.exports = { COUPONS_RULES, PRODUCTS_RULES };
