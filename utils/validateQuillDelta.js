const ERROR_MESSAGES = require("./errorMessages");
const {
  isUndefined,
  isValidBoolean,
  isValidObject,
  isValidQuillText,
  isValidQuillImage,
} = require("./validUtils");

const validAttrs = {
  bold: "boolean",
  italic: "boolean",
  underline: "boolean",
  strike: "boolean",
  color: "string",
  background: "string",
  font: "string",
  size: "string",
  link: "string",
  code: "boolean",
  script: ["sub", "super"],
  header: ["1", "2", "3", "4", "5", "6", true],
  blockquote: "boolean",
  list: ["ordered", "bullet", "checked", "unchecked"],
  align: ["right", "center", "justify"],
  indent: "number",
  direction: ["rtl"],
};

function isValidAttributeValue(key, value) {
  const expected = validAttrs[key];
  if (expected === "boolean") return typeof value === "boolean";
  if (expected === "string") return typeof value === "string";
  if (expected === "number") return typeof value === "number";
  if (Array.isArray(expected)) return expected.includes(value);
  return false;
}

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

      for (const [key, value] of Object.entries(attrs)) {
        if (!(key in validAttrs) || !isValidAttributeValue(key, value)) {
          return false;
        }
      }
    }
  }

  return true;
}

module.exports = { isValidQuillDelta };
