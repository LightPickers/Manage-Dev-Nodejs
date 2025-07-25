const ERROR_MESSAGES = {
  FIELDS_INCORRECT: "欄位未填寫正確",
  URL_INCORRECT: "網址未填寫正確",
  PROFILE_PHOTO_URL_INCORRECT: "大頭貼網址未填寫正確",
  URL_INCORRECT: "網址未填寫正確",
  DATA_NOT_CHANGE: "資料未改變",
  DATA_NOT_DELETE: "資料未刪除",
  DATA_NOT_FOUND: "資料不存在",
  DATA_UPDATE_FAILED: "資料更新失敗",
  DATA_ALREADY_USED: "資料已被使用",
  USER_NOT_SIGNUP: "使用者尚未登入",
  NOT_ADMIN_ENTER_ADMIN_ROUTE: "非管理員嘗試訪問管理員權限路由",
  PERMISSION_DENIED: "您無權限訪問此資源",
  USER_NOT_FOUND: "使用者不存在",
  UPDATE_USER_FAILED: "更新使用者失敗",
  USER_NOT_CHANGE: "使用者名稱未改變",
  EMAIL_NOT_RULE: "Email 不符合規則",
  EMAIL_ALREADY_USED: "Email 已被使用",
  PASSWORD_NOT_RULE:
    "密碼不符合規則，包含英文大小寫和數字，長度最少 8 字、最多 16 個字",
  USER_NOT_FOUND_OR_PASSWORD_FALSE: "使用者不存在或密碼輸入錯誤",
  PASSWORD_FALSE: "密碼輸入錯誤",
  USER_NOT_SIGNUP: "使用者尚未登入",
  EXPIRED_TOKEN: "Token 已過期",
  INVALID_TOKEN: "無效的 Token",
  NAME_NOT_RULE: "姓名須為 2-10 個字，不可包含數字、特殊符號與空白",
  PHONE_NOT_RULE: "電話號碼格式錯誤，須為 09 開頭加 8 碼數字",
  ADDRESS_NOT_RULE: "地址資料填寫不完整",
  ZIPCODE_NOT_RULE: "郵遞區號必須為 3 碼數字",
  COUPON_NOT_ZERO: "優惠券數量不能為 0",
  COUPON_START_BEFORE_NOW: "優惠券起始日不能早於現在時間",
  COUPON_END_BEFORE_START: "優惠券結束日不能早於起始日",
  COUPON_QUANTITY_MORETHAN_DISTRUBUTED: "優惠券庫存須大於已使用數量",
  PRODUCT_IMAGES_NOT_MORE_THAN_FIVE: "商品附圖不能超過五張",
  BIRTH_DATE_NOT_RULE: "生日格式不正確或超出合理範圍（yyyy-mm-dd）",
  DUPLICATE_FAVORITES: "商品已加入收藏資料",
  FAVORITE_NOT_FOUND: "商品未加入收藏資料",
  REDIS_WRITE_FAILED: "Redis 寫入失敗",
  REDIS_FAILED_TO_PROCESS_CHECKOUT: "Redis暫時無法處理結帳資訊",
  ID_NOT_RULE: "ID 格式錯誤",
  ID_NOT_FOUND: "ID 不存在",
  DATA_NOT_POSITIVE: "需為正整數",
  DATA_NEGATIVE: "不能小於 0",
  PAGE_OUT_OF_RANGE: "頁數超出範圍",
  PRICE_NOT_RULE: "價格必須是 0 或正整數，且最低價格不可高於最高價格",
  PRICE_RANGE_NOT_RULE:
    "價格區間格式錯誤，必須是合法的 JSON 陣列字串，請勿使用 00，且需由兩個數字組成，例如 [1000, 5000]",
  FINISH_CHECKOUT_FIRST: "請先完成結帳確認流程",
  LIMIT_STRING_LENGTH: "上限字元數為",
  PRODUCT_PULLED: "商品尚未上架",
  FILE_SIZE: "檔案大小超過 2MB 限制",
  FILE_UPLOAD: "上傳檔案時發生錯誤",
  INVALID_QUILL_DELTA: "不符合 Quill Delta 格式",
  PRODUCT_SOLDOUT: "商品已無庫存",
  PRODUCT_DELISTED: "商品已下架",
  PRODUCT_DELETED: "商品已刪除",
  SEARCH_FORMAT_FAILED: "篩選格式錯誤",
  PRODUCT_SHELVED: "商品已上架",
  ORDER_STATUS_NOT_RULE: "訂單狀態不符規則，必須為 paid, pending, canceled",
};

module.exports = ERROR_MESSAGES;
