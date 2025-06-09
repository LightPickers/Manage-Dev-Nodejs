const _ = require("lodash");

function isProductDataUnchanged(product, payload, productImages) {
  const fieldsToCompare = [
    "primary_image",
    "name",
    "category_id",
    "condition_id",
    "title",
    "subtitle",
    "is_available",
    "is_featured",
    "brand_id",
    "original_price",
    "selling_price",
  ];

  for (const field of fieldsToCompare) {
    if (product[field] !== payload[field]) {
      return false;
    }
  }

  // 比對 description（如果是 object）
  if (!_.isEqual(product.description, payload.description)) {
    return false;
  }

  // summery 比對
  const dbSummary = [...(product.summary || [])].sort();
  const requestSummary = [...(payload.summary || [])].sort();
  if (!_.isEqual(dbSummary, requestSummary)) {
    return false;
  }

  // hashtags 比對（順序不影響）
  const dbTags = [...(product.hashtags || [])].sort();
  const requestTags = [...(payload.hashtags || [])].sort();
  if (!_.isEqual(dbTags, requestTags)) {
    return false;
  }

  // 圖片比對（順序不影響）
  const dbImages = productImages.map((obj) => obj.image.trim()).sort();
  const requestImages = (payload.images || []).map((img) => img.trim()).sort();
  if (!_.isEqual(dbImages, requestImages)) {
    return false;
  }
  return true;
}

module.exports = { isProductDataUnchanged };
