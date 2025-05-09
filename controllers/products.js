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

  if (images.length > 5) {
    logger.warn(ERROR_MESSAGES.PRODUCT_IMAGES_NOT_MORE_THAN_FIVE);
    return next(
      new AppError(400, ERROR_MESSAGES.PRODUCT_IMAGES_NOT_MORE_THAN_FIVE)
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

  if (images) {
    const productImagesRepo = dataSource.getRepository("Product_images");
    const newProductImages = images.map((imageUrl) =>
      productImagesRepo.create({
        product_id: savedProducts.id,
        image: imageUrl,
      })
    );
    await productImagesRepo.save(newProductImages);
  }

  res.status(201).json({
    status: true,
    message: "新增商品成功",
  });
}
async function putProducts(req, res, next) {
  const { product_id } = req.params;
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

  if (images.length > 5) {
    logger.warn(ERROR_MESSAGES.PRODUCT_IMAGES_NOT_MORE_THAN_FIVE);
    return next(
      new AppError(400, ERROR_MESSAGES.PRODUCT_IMAGES_NOT_MORE_THAN_FIVE)
    );
  }

  const productsRepo = dataSource.getRepository("Products");
  const product = await productsRepo.findOneBy({ id: product_id });
  if (!product) {
    logger.warn(`商品 ${ERROR_MESSAGES.DATA_NOT_FOUND}`);
    return next(new AppError(404, `商品${ERROR_MESSAGES.DATA_NOT_FOUND}`));
  }

  const productImages = await dataSource.getRepository("Product_images").find({
    select: ["image"],
    where: { product_id },
  });

  const hashtagsEqual =
    product.hashtags.length === hashtags.length &&
    product.hashtags.every((tag, i) => tag === hashtags[i]);

  const imagesEqual =
    productImages?.length === images.length &&
    productImages.every((obj, i) => obj.image === images[i]);

  if (
    product.primary_image === primaryImage &&
    imagesEqual &&
    product.name === name &&
    product.category_id === categoryId &&
    product.condition_id === conditionId &&
    product.summary === summary &&
    product.title === title &&
    product.subtitle === subtitle &&
    product.description === description &&
    product.is_available === isAvailable &&
    product.is_featured === isFeatured &&
    product.original_price === originalPrice &&
    product.brand_id === brandId &&
    product.selling_price === sellingPrice &&
    hashtagsEqual
  ) {
    logger.warn(`商品${ERROR_MESSAGES.DATA_NOT_CHANGE}`);
    return next(new AppError(400, `商品${ERROR_MESSAGES.DATA_NOT_CHANGE}`));
  }

  const updateResult = await productsRepo.update(
    { id: product_id },
    {
      primary_image: primaryImage,
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
    }
  );

  if (updateResult.affected === 0) {
    logger.warn(`商品${ERROR_MESSAGES.DATA_UPDATE_FAILED}`);
    return next(new AppError(400, `商品${ERROR_MESSAGES.DATA_UPDATE_FAILED}`));
  }

  if (images) {
    const productsImagesRepo = dataSource.getRepository("Product_images");
    const newProductImages = images.map((imageUrl) =>
      productsImagesRepo.create({
        product_id,
        image: imageUrl,
      })
    );
    await productsImagesRepo.save(newProductImages);
  }

  res.status(200).json({
    status: true,
    message: "商品修改成功",
  });
}

module.exports = {
  postProducts,
  putProducts,
};
