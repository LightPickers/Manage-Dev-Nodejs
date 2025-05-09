const { IsNull, In } = require("typeorm");
const logger = require("../utils/logger")("coupons");
const { dataSource } = require("../db/data-source");
const {
  isUndefined,
  isValidString,
  isValidInteger,
  isValidBoolean,
  isValidUrl,
  isValidArrayOfString,
  isValidArrayOfURL,
} = require("../utils/validUtils");
const AppError = require("../utils/AppError");
const ERROR_MESSAGES = require("../utils/errorMessages");

async function postProducts(req, res, next) {
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
  } = req.body;
  if (
    isUndefined(primaryImage) ||
    isUndefined(name) ||
    !isValidString(name) ||
    isUndefined(categoryId) ||
    !isValidString(categoryId) ||
    isUndefined(conditionId) ||
    !isValidString(conditionId) ||
    isUndefined(summary) ||
    !isValidString(summary) ||
    isUndefined(title) ||
    !isValidString(title) ||
    isUndefined(subtitle) ||
    !isValidString(subtitle) ||
    isUndefined(description) ||
    !isValidString(description) ||
    isUndefined(isAvailable) ||
    !isValidBoolean(isAvailable) ||
    isUndefined(isFeatured) ||
    !isValidBoolean(isFeatured) ||
    isUndefined(brandId) ||
    !isValidString(brandId) ||
    isUndefined(originalPrice) ||
    !isValidInteger(originalPrice) ||
    isUndefined(sellingPrice) ||
    !isValidInteger(sellingPrice)
  ) {
    logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
    return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
  }
  if (!isValidUrl(primaryImage)) {
    logger.warn(`商品主圖${ERROR_MESSAGES.URL_INCORRECT}`);
    return next(new AppError(400, `商品主圖${ERROR_MESSAGES.URL_INCORRECT}`));
  }
  if (images && !isValidArrayOfURL(images)) {
    logger.warn(`商品附圖${ERROR_MESSAGES.URL_INCORRECT}`);
    return next(new AppError(400, `商品附圖${ERROR_MESSAGES.URL_INCORRECT}`));
  }
  if (hashtags && !isValidArrayOfString(hashtags)) {
    logger.warn(`Hashtags${ERROR_MESSAGES.FIELDS_INCORRECT}`);
    return next(
      new AppError(400, `Hashtags${ERROR_MESSAGES.FIELDS_INCORRECT}`)
    );
  }

  const productsRepo = dataSource.getRepository("Products");
  const newProducts = await productsRepo.create({
    category_id: categoryId,
    brand_id: brandId,
    condition_id: conditionId,
    name,
    title,
    subtitle,
    hashtags,
    description,
    summary,
    primary_image: primaryImage,
    original_price: originalPrice,
    selling_price: sellingPrice,
    is_available: isAvailable,
    is_featured: isFeatured,
  });
  const savedProducts = await productsRepo.save(newProducts);
  await productsRepo.findOneBy({ id: savedProducts.id });

  if (images) {
    const productsImagesRepo = dataSource.getRepository("Product_images");
    const newProductImages = images.map((imageUrl) =>
      productsImagesRepo.create({
        product_id: savedProducts.id,
        image: imageUrl,
      })
    );
    await productsImagesRepo.save(newProductImages);
  }

  res.status(201).json({
    status: true,
    message: "新增商品成功",
  });
}

module.exports = {
  postProducts,
};
