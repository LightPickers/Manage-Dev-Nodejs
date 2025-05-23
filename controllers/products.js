const { IsNull, In } = require("typeorm");
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("ProductsController");
const {
  isUndefined,
  isValidString,
  isValidInteger,
  isValidBoolean,
  isValidUrl,
  isValidArrayOfString,
  isValidArrayOfURL,
} = require("../utils/validUtils");
const { isUUID } = require("validator");
const AppError = require("../utils/appError");
const ERROR_MESSAGES = require("../utils/errorMessages");

// API 37: 新增商品
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
  if (name.length > 100) {
    logger.warn(`name ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 100`);
    return next(
      new AppError(400, `name ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 100`)
    );
  }
  if (title.length > 50) {
    logger.warn(`title ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 50`);
    return next(
      new AppError(400, `title ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 50`)
    );
  }
  if (subtitle.length > 50) {
    logger.warn(`subtitle ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 50`);
    return next(
      new AppError(400, `subtitle ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 50`)
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

// API 38: 修改商品
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

  if (name.length > 100) {
    logger.warn(`name ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 100`);
    return next(
      new AppError(400, `name ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 100`)
    );
  }
  if (title.length > 50) {
    logger.warn(`title ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 50`);
    return next(
      new AppError(400, `title ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 50`)
    );
  }
  if (subtitle.length > 50) {
    logger.warn(`subtitle ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 50`);
    return next(
      new AppError(400, `subtitle ${ERROR_MESSAGES.LIMIT_STRING_LENGTH} 50`)
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

// API 34: 取得商品列表
async function getProducts(req, res, next) {
  try {
    const productRepository = dataSource.getRepository("Products");

    // 查詢所有商品資料
    const products = await productRepository.find({
      relations: ["Categories", "Brands", "Conditions"], // 加載關聯資料
    });

    res.status(200).json({
      status: "true",
      message: "成功取得商品列表",
      data: products,
    });
  } catch (error) {
    logger.error("取得商品列表失敗", { error });
    res.status(500).json({
      status: "false",
      message: "伺服器錯誤，無法取得商品列表",
    });
  }
}

// API 39: 刪除商品
async function deleteProducts(req, res, next) {
  const { product_id } = req.params;
  // console.log(product_id);
  if (
    isUndefined(product_id) ||
    !isValidString(product_id) ||
    !isUUID(product_id, 4)
  ) {
    logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
    return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
  }

  const productsRepo = dataSource.getRepository("Products");
  const existProduct = await productsRepo.findOne({
    where: { id: product_id },
  });

  console.log(existProduct);
  if (!existProduct) {
    logger.warn(ERROR_MESSAGES.DATA_NOT_FOUND);
    return next(new AppError(409, ERROR_MESSAGES.DATA_NOT_FOUND));
  }

  const deleting = await productsRepo.remove(existProduct);
  if (!deleting) {
    logger.warn(ERROR_MESSAGES.DATA_NOT_DELETE);
    return next(new AppError(400, ERROR_MESSAGES.DATA_NOT_DELETE));
  }

  res.status(200).json({
    status: "true",
    message: "商品已成功刪除",
  });
}

module.exports = {
  postProducts,
  putProducts,
  getProducts,
  deleteProducts,
};
