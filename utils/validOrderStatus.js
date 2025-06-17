const orderStatus = {
  PAID: "paid",
  PENDING: "pending",
  CANCELED: "canceled",
};

// 驗證函式
function isValidOrderStatus(status) {
  return Object.values(orderStatus).includes(status);
}

module.exports = { isValidOrderStatus };
