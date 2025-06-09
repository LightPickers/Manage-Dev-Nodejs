const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("ProductsController");
const {
  isUndefined,
  isValidString,
  isValidInteger,
  checkProductStatus,
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

  // 驗證資料是否未改變
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
/*
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
*/

async function getProducts(req, res, next) {
  const {
    category_id,
    brand_id,
    condition_id,
    keyword, // 篩選產品名或產品ID
    price_range,
    is_available, // 商品狀態(上架)
    is_sold, // 商品狀態(售出)
    is_featured, // 商品狀態(矚目產品)
    page = 1,
    page_size = 10,
  } = req.query;

  const errors = {};

  // 轉換為integer(text, 10進位制)
  const pageInt = parseInt(page, 10); // 當前頁碼
  const pageSizeInt = parseInt(page_size, 10); // 每頁筆數
  const offset = (pageInt - 1) * pageSizeInt; // 忽略(前面頁碼)的資料筆數

  if (!isValidInteger(pageInt) || pageInt <= 0) {
    errors.page = ERROR_MESSAGES.DATA_NOT_POSITIVE;
  }

  if (!isValidInteger(pageSizeInt) || pageSizeInt <= 0) {
    errors.pageSize = ERROR_MESSAGES.DATA_NOT_POSITIVE;
  }
  if (offset < 0) {
    errors.offset = ERROR_MESSAGES.DATA_NEGATIVE;
  }

  const query = dataSource
    .getRepository("Products")
    .createQueryBuilder("product")
    .leftJoinAndSelect("product.Brands", "brand")
    .leftJoinAndSelect("product.Conditions", "condition")
    .leftJoinAndSelect("product.Categories", "categories")
    .where("1=1");

  if (category_id) {
    if (!isValidId(category_id)) {
      logger.warn(`category_id錯誤: ${ERROR_MESSAGES.ID_NOT_RULE}`);
      errors.category_id = ERROR_MESSAGES.ID_NOT_RULE;
    } else {
      const categoryRepo = dataSource.getRepository("Categories");
      const existId = await categoryRepo.findOneBy({ id: category_id });

      if (!existId) {
        logger.warn(`category_id錯誤: ${ERROR_MESSAGES.DATA_NOT_FOUND}`);
        errors.category_id = ERROR_MESSAGES.ID_NOT_FOUND;
      } else {
        query.andWhere("product.category_id = :category_id", { category_id });
      }
    }
  }

  if (brand_id) {
    if (!isValidId(brand_id)) {
      logger.warn(`brand_id錯誤: ${ERROR_MESSAGES.ID_NOT_RULE}`);
      errors.brand_id = ERROR_MESSAGES.ID_NOT_RULE;
    } else {
      const brandRepo = dataSource.getRepository("Brands");
      const existId = await brandRepo.findOneBy({ id: brand_id });

      if (!existId) {
        logger.warn(`brand_id錯誤: ${ERROR_MESSAGES.DATA_NOT_FOUND}`);
        errors.brand_id = ERROR_MESSAGES.ID_NOT_FOUND;
      } else {
        query.andWhere("product.brand_id = :brand_id", { brand_id });
      }
    }
  }

  if (condition_id) {
    if (!isValidId(condition_id)) {
      logger.warn(`condition_id錯誤: ${ERROR_MESSAGES.ID_NOT_RULE}`);
      errors.condition_id = ERROR_MESSAGES.ID_NOT_RULE;
    } else {
      const conditionRepo = dataSource.getRepository("Conditions");
      const existId = await conditionRepo.findOneBy({ id: condition_id });

      if (!existId) {
        logger.warn(`condition_id錯誤: ${ERROR_MESSAGES.DATA_NOT_FOUND}`);
        errors.condition_id = ERROR_MESSAGES.ID_NOT_FOUND;
      } else {
        query.andWhere("product.condition_id = :condition_id", {
          condition_id,
        });
      }
    }
  }

  //商品狀態(is_sold、is_available、is_featured)篩選
  const booleanFilters = { is_sold, is_available, is_featured };
  Object.entries(booleanFilters).forEach(([key, value]) => {
    if (value !== undefined) {
      const parsedValue =
        value === "true" ? true : value === "false" ? false : null;
      // console.log(value);
      // console.log(parsedValue);
      if (parsedValue === null) {
        logger.warn(`${key}錯誤: ${ERROR_MESSAGES.SEARCH_FORMAT_FAILED}`);
        errors[key] = ERROR_MESSAGES.SEARCH_FORMAT_FAILED;
      } else {
        query.andWhere(`product.${key} = :${key}`, { [key]: parsedValue });
      }
    }
  });

  //keyword篩選商品名稱或商品ID
  if (keyword) {
    query.andWhere(
      "(product.name ILIKE :keyword OR product.id::TEXT ILIKE :keyword)",
      { keyword: `%${keyword}%` }
    );
  }

  //價錢篩選
  if (price_range) {
    try {
      const price_parsed = JSON.parse(price_range);
      if (
        !Array.isArray(price_parsed) ||
        price_parsed.length !== 2 ||
        price_parsed.some(
          (price) => typeof price !== "number" && typeof price !== "string"
        )
      ) {
        errors.price_range = ERROR_MESSAGES.PRICE_RANGE_NOT_RULE;
      } else {
        const min_price = parseInt(price_parsed[0], 10);
        const max_price = parseInt(price_parsed[1], 10);

        if (!isValidInteger(min_price) || !isValidInteger(max_price)) {
          errors.price_range = ERROR_MESSAGES.PRICE_NOT_RULE;
        } else if (min_price > max_price) {
          errors.price_range = ERROR_MESSAGES.PRICE_NOT_RULE;
        } else {
          // 根據價格區間來篩選資料
          query.andWhere("product.selling_price BETWEEN :min AND :max", {
            min: min_price,
            max: max_price,
          });
        }
      }
    } catch (err) {
      errors.price_range = ERROR_MESSAGES.PRICE_RANGE_NOT_RULE;
    }
  }

  //剔除"已刪除"的商品
  query.andWhere("product.is_deleted = :is_deleted", { is_deleted: false });

  //若上述搜尋條件有error，進到400
  if (Object.keys(errors).length > 0) {
    logger.warn("欄位驗證失敗", { errors });
    return res.status(400).json({
      status: false,
      message: errors,
    });
  }

  //挑選需回傳的欄位
  const [selectedProducts, total] = await query
    .select([
      "product.id",
      "product.name",
      "categories.name",
      "brand.name",
      "product.original_price",
      "product.selling_price",
      "condition.name",
      "product.primary_image",
      "product.created_at",
      "product.is_featured",
      "product.is_sold",
      "product.is_available",
    ])
    .orderBy("product.created_at", "DESC")
    .skip(offset)
    .take(pageSizeInt)
    .getManyAndCount();

  const total_pages = Math.ceil(total / pageSizeInt);
  // console.log(total);

  if (pageInt > total_pages && total_pages > 0) {
    logger.warn(ERROR_MESSAGES.PAGE_OUT_OF_RANGE);
    return next(new AppError(400, ERROR_MESSAGES.PAGE_OUT_OF_RANGE));
  }

  const result = selectedProducts.map((products) => ({
    id: products.id,
    name: products.name,
    brand: products.Brands.name,
    condition: products.Conditions.name,
    category: products.Categories.name,
    original_price: products.original_price,
    selling_price: products.selling_price,
    primary_image: products.primary_image,
    featured: products.is_featured,
    sold: products.is_sold,
    available: products.is_available,
  }));

  res.json({
    status: true,
    message: selectedProducts.length === 0 ? "找不到搜尋商品" : undefined,
    total_pages,
    data: result,
  });
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

  if (existProduct.is_deleted) {
    logger.warn(ERROR_MESSAGES.PRODUCT_DELETED);
    return next(new AppError(400, ERROR_MESSAGES.PRODUCT_DELETED));
  }
  await productsRepo.update({ id: product_id }, { is_deleted: true });

  /* 硬刪除
  const deleting = await productsRepo.remove(existProduct);
  if (!deleting) {
    logger.warn(ERROR_MESSAGES.DATA_NOT_DELETE);
    return next(new AppError(400, ERROR_MESSAGES.DATA_NOT_DELETE));
  }
  */

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
  const productStatus = await checkProductStatus(
    productsRepo,
    product_id,
    false
  );
  if (!productStatus.success) {
    switch (productStatus.error) {
      case ERROR_MESSAGES.PRODUCT_DELISTED:
        return; // 商品下架，後台仍可看到該商品詳細資訊
      default:
        return next(new AppError(404, productStatus.error));
    }
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
      is_sold: true,
      is_deleted: true,
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
