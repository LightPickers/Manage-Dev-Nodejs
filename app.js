const express = require("express");
const path = require("path");
const loginRouter = require("./routes/login");
const couponsRouter = require("./routes/coupons");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/admin", loginRouter);
app.use("/api/v1/admin/coupons", couponsRouter);

//404
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "無此路由",
  });
  return;
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: err.status || "error",
    message: err.message,
    //error: process.env.NODE_ENV === "development" ? err : {},
  });
});

module.exports = app;
