const multer = require("multer");
const path = require("path");
const appError = require("../utils/appError");

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".png"];

const upload = multer({
  limits: {
    fileSize: MAX_FILE_SIZE,
  },

  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase(); // path.extname() 取得副檔名

    if (!ALLOWED_FILE_TYPES.includes(ext)) {
      // return cb(new Error(`檔案格式錯誤，僅限上傳 ${ALLOWED_FILE_TYPES.join(", ")} 格式。`));
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"));
    }
    cb(null, true);
  },
}).any();

module.exports = (req, res, next) => {
  // multer 本身是 middleware, 將錯誤統一給 next() 處理
  upload(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
};
