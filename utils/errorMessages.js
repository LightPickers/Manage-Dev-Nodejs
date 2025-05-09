const ERROR_MESSAGES = {
  FIELDS_INCORRECT: "欄位未填寫正確",
  URL_INCORRECT: "網址未填寫正確",
  PROFILE_PHOTO_URL_INCORRECT: "大頭貼網址未填寫正確",
  URL_INCORRECT: "網址未填寫正確",
  DATA_NOT_CHANGE: "資料未改變",
  DATA_NOT_DELETE: "資料未刪除",
  DATA_NOT_FOUND: "資料不存在",
  DATA_UPDATE_FAILED: "資料更新失敗",
  EMAIL_NOT_RULE: "Email 不符合規則",
  EMAIL_ALREADY_USED: "Email 已被使用",
  PASSWORD_NOT_RULE:
    "密碼不符合規則，包含英文大小寫和數字，長度最少 8 字、最多 16 個字",
  USER_NOT_FOUND_OR_PASSWORD_FALSE: "使用者不存在或密碼輸入錯誤",
  PASSWORD_FALSE: "密碼輸入錯誤",
  INVALID_OR_EXPIRED_TOKEN: "Token無效或過期",
  NAME_NOT_RULE: "姓名須為 2-10 個字，不可包含特殊符號與空白",
  PHONE_NOT_RULE: "電話號碼格式錯誤，須為 09 開頭加 8 碼數字",
  ADDRESS_NOT_RULE: "地址資料填寫不完整",
  ZIPCODE_NOT_RULE: "郵遞區號必須為 3 碼數字",
  COUPON_NOT_ZERO: "優惠券數量不能為 0",
  COUPON_END_BEFORE_START: "優惠券結束日比起始日早",
  COUPON_QUANTITY_MORETHAN_DISTRUBUTED: "優惠券庫存須大於已使用數量",
  PRODUCT_IMAGES_NOT_MORE_THAN_FIVE: "商品附圖不能超過五張",
};

module.exports = ERROR_MESSAGES;
