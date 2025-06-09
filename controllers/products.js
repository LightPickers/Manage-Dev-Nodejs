const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("ProductsController");
const {
  isUndefined,
  isValidString,
  checkProduct,
} = require("../utils/validUtils");
const { validateProductPayload } = require("../utils/productsValidator");
const { isProductDataUnchanged } = require("../utils/productDataUnchange");
const { isUUID } = require("validator");
const _ = require("lodash");
const AppError = require("../utils/appError");
const ERROR_MESSAGES = require("../utils/errorMessages");

// API 37: 新增商品
async function postProducts(req, res, next) {
  const payload = req.body;

  const errorMessage = validateProductPayload(payload);
  if (errorMessage) {
    logger.warn(errorMessage);
    return next(new AppError(400, errorMessage));
  }

  // 檢查類別、商品狀態、品牌 (合併執行以平行化)
  const [category, condition, brand] = await Promise.all([
    dataSource
      .getRepository("Categories")
      .findOneBy({ id: payload.category_id }),
    dataSource
      .getRepository("Conditions")
      .findOneBy({ id: payload.condition_id }),
    dataSource.getRepository("Brands").findOneBy({ id: payload.brand_id }),
  ]);
  if (!category || !condition || !brand) {
    return next(
      new AppError(404, `類別、商品狀態、品牌 ${ERROR_MESSAGES.DATA_NOT_FOUND}`)
    );
  }

  const productsRepo = dataSource.getRepository("Products");
  const newProducts = productsRepo.create({
    category_id: payload.category_id,
    brand_id: payload.brand_id,
    condition_id: payload.condition_id,
    name: payload.name,
    title: payload.title,
    subtitle: payload.subtitle,
    hashtags: payload.hashtags,
    description: payload.description,
    summary: payload.summary,
    primary_image: payload.primary_image,
    original_price: payload.original_price,
    selling_price: payload.selling_price,
    is_available: payload.is_available,
    is_featured: payload.is_featured,
  });
  const savedProducts = await productsRepo.save(newProducts);

  if (payload.images) {
    const productImagesRepo = dataSource.getRepository("Product_images");
    const newProductImages = payload.images.map((imageUrl) =>
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
  const payload = req.body;

  const errorMessage = validateProductPayload(payload);
  if (errorMessage) {
    logger.warn(errorMessage);
    return next(new AppError(400, errorMessage));
  }

  // 檢查類別、商品狀態、品牌
  const [category, condition, brand] = await Promise.all([
    dataSource
      .getRepository("Categories")
      .findOneBy({ id: payload.category_id }),
    dataSource
      .getRepository("Conditions")
      .findOneBy({ id: payload.condition_id }),
    dataSource.getRepository("Brands").findOneBy({ id: payload.brand_id }),
  ]);
  if (!category || !condition || !brand) {
    return next(new AppError(404, `基本資料 ${ERROR_MESSAGES.DATA_NOT_FOUND}`));
  }

  // 資料是否存在
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

  const isUnchanged = isProductDataUnchanged(product, payload, productImages);
  if (isUnchanged) {
    logger.warn(`商品${ERROR_MESSAGES.DATA_NOT_CHANGE}`);
    return next(new AppError(400, `商品${ERROR_MESSAGES.DATA_NOT_CHANGE}`));
  }

  const updateResult = await productsRepo.update(
    { id: product_id },
    {
      primary_image: payload.primary_image,
      name: payload.name,
      category_id: payload.category_id,
      condition_id: payload.condition_id,
      summary: payload.summary,
      title: payload.title,
      subtitle: payload.subtitle,
      description: payload.description,
      is_available: payload.is_available,
      is_featured: payload.is_featured,
      brand_id: payload.brand_id,
      original_price: payload.original_price,
      selling_price: payload.selling_price,
      hashtags: payload.hashtags,
    }
  );

  if (updateResult.affected === 0) {
    logger.warn(`商品${ERROR_MESSAGES.DATA_UPDATE_FAILED}`);
    return next(new AppError(400, `商品${ERROR_MESSAGES.DATA_UPDATE_FAILED}`));
  }

  // 如果圖片不同，先刪除舊圖片後，再加上新圖片
  const dbImages = productImages.map((obj) => obj.image.trim()).sort();
  const requestImages = payload.images.map((img) => img.trim()).sort();

  if (!_.isEqual(dbImages, requestImages)) {
    const productsImagesRepo = dataSource.getRepository("Product_images");
    await productsImagesRepo.delete({ product_id });

    if (requestImages.length > 0) {
      const newProductImages = requestImages.map((imageUrl) =>
        productsImagesRepo.create({ product_id, image: imageUrl })
      );
      await productsImagesRepo.save(newProductImages);
    }
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

// API 40: 下架商品
async function pullProducts(req, res, next) {
  const product_info = {
    ...req.body,
    product_id: req.body.id,
    is_available: req.body.available,
  };

  if (
    isUndefined(product_info.product_id) ||
    !isValidString(product_info.product_id) ||
    !isUUID(product_info.product_id, 4)
  ) {
    logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
    return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
  }

  const productsRepo = dataSource.getRepository("Products");
  const existProduct = await productsRepo.findOne({
    where: { id: product_info.product_id },
  });

  if (!existProduct) {
    logger.warn(ERROR_MESSAGES.DATA_NOT_FOUND);
    return next(new AppError(409, ERROR_MESSAGES.DATA_NOT_FOUND));
  }

  if (!product_info.is_available) {
    logger.warn(ERROR_MESSAGES.PRODUCT_PULLED);
    return next(new AppError(400, ERROR_MESSAGES.PRODUCT_PULLED));
  }
  await productsRepo.update(
    { id: product_info.product_id },
    { is_available: false }
  );

  res.status(200).json({
    status: "true",
    message: "商品已成功下架",
  });
}

// API 36: 帶入商品詳細資訊
async function getPreFilledInfo(req, res, next) {
  const { product_id } = req.params;

  //400
  if (
    isUndefined(product_id) ||
    !isValidString(product_id) ||
    !isUUID(product_id, 4)
  ) {
    logger.warn(ERROR_MESSAGES.FIELDS_INCORRECT);
    return next(new AppError(400, ERROR_MESSAGES.FIELDS_INCORRECT));
  }

  const productsRepo = dataSource.getRepository("Products");
  const imagesRepo = dataSource.getRepository("Product_images");

  // 404
  const existProduct = await checkProduct(productsRepo, product_id);
  if (!existProduct) {
    logger.warn(ERROR_MESSAGES.DATA_NOT_FOUND);
    return next(new AppError(404, ERROR_MESSAGES.DATA_NOT_FOUND));
  }

  // 200
  const productsInfo = await productsRepo.findOne({
    select: {
      id: true,
      Categories: { id: true, name: true },
      Brands: { id: true, name: true },
      Conditions: { id: true, name: true },
      name: true,
      title: true,
      subtitle: true,
      hashtags: true,
      description: true,
      summary: true,
      primary_image: true,
      selling_price: true,
      original_price: true,
      is_available: true,
      is_featured: true,
    },
    relations: {
      Categories: true,
      Brands: true,
      Conditions: true,
    },
    where: { id: product_id },
  });

  const imagesInfo = await imagesRepo.find({
    select: { image: true },
    where: { product_id: product_id },
  });

  const image_num = imagesInfo.length;

  res.status(200).json({
    status: "true",
    data: productsInfo,
    imageList: imagesInfo,
    imageCount: image_num,
  });
}

module.exports = {
  postProducts,
  putProducts,
  getProducts,
  deleteProducts,
  pullProducts,
  getPreFilledInfo,
};
