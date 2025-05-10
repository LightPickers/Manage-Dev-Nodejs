const express = require("express");
const path = require("path");
const loginRouter = require("./routes/login");
const couponsRouter = require("./routes/coupons");
const productsRouter = require("./routes/products");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/admin", loginRouter);
app.use("/api/v1/admin/coupons", couponsRouter);
app.use("/api/v1/admin/products", productsRouter);

//404
app.use((req, res, next) => {
  res.status(404).json({
    status: "false",
    message: "無此路由",
  });
  return;
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: err.status || "false",
    message: err.message,
    //error: process.env.NODE_ENV === "development" ? err : {},
  });
});

module.exports = app;
