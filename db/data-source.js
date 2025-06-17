const { DataSource } = require("typeorm");
const config = require("../config/index");

const Coupons = require("../entities/Coupons");
const Brands = require("../entities/Brands");
const Categories = require("../entities/Categories");
const Conditions = require("../entities/Conditions");
const Favorites = require("../entities/Favorites");
const Products = require("../entities/Products");
const Product_images = require("../entities/Product_images");
const Users = require("../entities/Users");
const Roles = require("../entities/Roles");
const Orders = require("../entities/Orders");
const Order_items = require("../entities/Order_items");

const dataSource = new DataSource({
  type: "postgres",
  host: config.get("db.host"),
  port: config.get("db.port"),
  username: config.get("db.username"),
  password: config.get("db.password"),
  database: config.get("db.database"),
  synchronize: config.get("db.synchronize"),
  poolSize: 10,
  entities: [
    Coupons,
    Brands,
    Categories,
    Conditions,
    Favorites,
    Products,
    Product_images,
    Users,
    Roles,
    Orders,
    Order_items,
  ],
  ssl: config.get("db.ssl"),
});

module.exports = { dataSource };
