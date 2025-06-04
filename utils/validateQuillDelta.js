const ERROR_MESSAGES = require("./errorMessages");
const {
  isUndefined,
  isValidBoolean,
  isValidObject,
  isValidQuillText,
  isValidQuillImage,
} = require("./validUtils");

function isValidQuillDelta(delta) {
  // 確認是物件，且有 ops 陣列
  if (
    isUndefined(delta) ||
    !isValidObject(delta) ||
    !Array.isArray(delta.ops)
  ) {
    return false;
  }
  // delta 陣列不得為空內容
  if (delta.ops.length === 0) {
    return false;
  }

  for (const op of delta.ops) {
    // 每個 op 都必須有 insert 欄位
    if (!op.hasOwnProperty("insert")) {
      return false;
    }

    const insert = op.insert;

    // insert 可以是 string 或 { image: string }
    if (!isValidQuillText(insert) && !isValidQuillImage(insert)) {
      return false;
    }

    // 如果有 attributes 必須是物件，且值為布林
    if (op.hasOwnProperty("attributes")) {
      const attrs = op.attributes;
      if (isUndefined(attrs) || !isValidObject(attrs)) {
        return false;
      }

      const validAttrs = ["bold", "italic", "underline", "strike"];
      for (const [key, value] of Object.entries(attrs)) {
        if (!validAttrs.includes(key) || !isValidBoolean(value)) {
          return false;
        }
      }
    }
  }

  return true;
}

module.exports = { isValidQuillDelta };
