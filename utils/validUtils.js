const validator = require("validator");
const PATTERN_RULE = require("./validatePatterns");
const ERROR_MESSAGES = require("../utils/errorMessages");
const logger = require("../utils/logger")("UsersController");

function isUndefined(value) {
  return value === undefined;
}
function isValidString(value) {
  return typeof value === "string" && !validator.isEmpty(value.trim());
}
function isValidInteger(value) {
  return (
    typeof value === "number" && validator.isInt(String(value), { min: 0 })
  );
}
function isValidBoolean(value) {
  return typeof value === "boolean";
}
function isValidDate(value) {
  return validator.isDate(value, { format: "YYYY-MM-DD", strictMode: true });
}
function isValidEmail(value) {
  return validator.isEmail(value);
}
function isValidPassword(value) {
  return PATTERN_RULE.PASSWORD_PATTERN.test(value);
}
function isValidUrl(value) {
  return PATTERN_RULE.URL_PATTERN.test(value);
}
function isValidPhone(value) {
  return PATTERN_RULE.PHONE_PATTERN.test(value);
}
function isValidName(value) {
  return PATTERN_RULE.NAME_PATTERN.test(value);
}
function isValidArrayOfString(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.trim() !== "")
  );
}
function isValidArrayOfURL(value) {
  return (
    Array.isArray(value) &&
    value.every((item) => PATTERN_RULE.URL_PATTERN.test(item))
  );
}
function isValidObject(value) {
  return typeof value === "object";
}
function isValidQuillText(value) {
  return typeof value === "string";
}
function isValidQuillImage(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.image === "string" &&
    PATTERN_RULE.IMAGE_URL_PATTERN.test(value.image)
  );
}

// 檢查商品是否存在
async function checkExisted(productsRepo, product_id) {
  return await productsRepo.findOne({
    where: { id: product_id },
  });
}

// 檢查商品是否有上架
async function checkListed(productsRepo, product_id) {
  const result = await productsRepo
    .createQueryBuilder("product")
    .select("product.is_available")
    .where("product.id = :product_id", { product_id })
    .getRawOne();
  return result ? result.is_available : null;
}

// 檢查商品是否有庫存
async function checkSold(productsRepo, product_id) {
  const result = await productsRepo
    .createQueryBuilder("product")
    .select("product.is_sold")
    .where("product.id = :product_id", { product_id })
    .getRawOne();
  return result ? result.is_sold : null;
}

// 檢查商品是否被刪除
async function checkDeleted(productsRepo, product_id) {
  const result = await productsRepo
    .createQueryBuilder("product")
    .select("product.is_deleted")
    .where("product.id = :product_id", { product_id })
    .getRawOne();
  return result ? result.is_deleted : null;
}

// 綜合檢查商品是否: 存在、刪除、上架、庫存(若inventory為true)
async function checkProductStatus(productsRepo, product_id, inventory) {
  const product = await productsRepo
    .createQueryBuilder("product")
    .select(["id", "is_deleted", "is_available", "is_sold"])
    .where("product.id = :product_id", { product_id })
    .getRawOne();

  console.log(product);

  if (!product) {
    logger.warn(ERROR_MESSAGES.DATA_NOT_FOUND);
    return { success: false, error: ERROR_MESSAGES.DATA_NOT_FOUND };
  }

  if (product.is_deleted) {
    logger.warn(ERROR_MESSAGES.PRODUCT_DELETED);
    return { success: false, error: ERROR_MESSAGES.PRODUCT_DELETED };
  }

  if (!product.is_available) {
    console.log(product.is_available);
    logger.warn(ERROR_MESSAGES.PRODUCT_DELISTED);
    return { success: false, error: ERROR_MESSAGES.PRODUCT_DELISTED };
  }

  if (inventory) {
    if (product.is_sold) {
      logger.warn(ERROR_MESSAGES.PRODUCT_SOLDOUT);
      return { success: false, error: ERROR_MESSAGES.PRODUCT_SOLDOUT };
    }
  }

  return { success: true };
}

module.exports = {
  isUndefined,
  isValidString,
  isValidInteger,
  isValidBoolean,
  isValidDate,
  isValidEmail,
  isValidPassword,
  isValidUrl,
  isValidPhone,
  isValidName,
  isValidArrayOfString,
  isValidArrayOfURL,
  isValidObject,
  isValidQuillText,
  isValidQuillImage,
  checkExisted,
  checkListed,
  checkSold,
  checkDeleted,
  checkProductStatus,
};
