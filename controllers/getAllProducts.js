const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("ProductsController");

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

module.exports = {
  getProducts,
};
