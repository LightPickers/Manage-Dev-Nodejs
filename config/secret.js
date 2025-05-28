module.exports = {
  // 保留原有結構以向後兼容
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresDay: process.env.JWT_EXPIRES_DAY,

  // 新增一層嵌套結構以匹配當前代碼中使用的路徑
  secret: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresDay: process.env.JWT_EXPIRES_DAY,
  },

  firebase: {
    serviceAccount: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  },
};
