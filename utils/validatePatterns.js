const PATTERN_RULE = {
  NAME_PATTERN: /^[a-zA-Z\u4e00-\u9fa5]{2,10}$/,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/,
  URL_PATTERN: /^(https:\/\/)([a-zA-Z0-9.-]+)(\.[a-zA-Z]{2,})(\/.*)?$/,
  IMAGE_URL_PATTERN: /^https:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i,
  PHONE_PATTERN: /^(09\d{8})$/,
  ZIPCODE_PATTERN: /^\d{3}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ID_PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

module.exports = PATTERN_RULE;
