const { validateFields } = require("./validateFields");
const {
  isUndefined,
  isValidUrl,
  isValidArrayOfString,
  isValidArrayOfURL,
} = require("./validUtils");
const { isValidQuillDelta } = require("./validateQuillDelta");
const { PRODUCTS_RULE } = require("./validateRules");
const ERROR_MESSAGES = require("../utils/errorMessages");

function validateProductPayload(payload) {
  const {
    primary_image: primaryImage,
    images,
    name,
    category_id: categoryId,
    condition_id: conditionId,
    summary,
    title,
    subtitle,
    description,
    is_available: isAvailable,
    is_featured: isFeatured,
    brand_id: brandId,
    original_price: originalPrice,
    selling_price: sellingPrice,
    hashtags,
  } = payload;

  const errorFields = validateFields(
    {
      primaryImage,
      name,
      categoryId,
      conditionId,
      title,
      subtitle,
      isAvailable,
      isFeatured,
      brandId,
      originalPrice,
      sellingPrice,
    },
    PRODUCTS_RULE
  );
  if (errorFields) {
    return errorFields.join(", ");
  }

  // 驗證 summary 欄位
  if (isUndefined(summary) || !isValidArrayOfString(summary)) {
    return `Summary ${ERROR_MESSAGES.FIELDS_INCORRECT}`;
  }

  // 驗證 description 欄位
  if (isUndefined(description) || !isValidQuillDelta(description)) {
    return `description ${ERROR_MESSAGES.INVALID_QUILL_DELTA}`;
  }

  if (!isValidUrl(primaryImage)) {
    return `商品主圖${ERROR_MESSAGES.URL_INCORRECT}`;
  }
  if (images && !isValidArrayOfURL(images)) {
    return `商品附圖${ERROR_MESSAGES.URL_INCORRECT}`;
  }
  if (hashtags && !isValidArrayOfString(hashtags)) {
    return `Hashtags${ERROR_MESSAGES.FIELDS_INCORRECT}`;
  }

  // 檢查 name, title, subtitle, images 字串長度
  if (name.length > 100) {
    return `name ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 100`;
  }
  if (title.length > 50) {
    return `title ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 50`;
  }
  if (subtitle.length > 50) {
    return `subtitle ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 50`;
  }

  if (images?.length > 5) {
    return ERROR_MESSAGES.PRODUCT_IMAGES_NOT_MORE_THAN_FIVE;
  }
  return null;
}

module.exports = { validateProductPayload };
