const dotenv = require("dotenv");
const path = require("path");

// 載入環境變數
try {
  const result = dotenv.config({ path: path.resolve(process.cwd(), ".env") });

  if (result.error) {
    throw result.error;
  }

  console.log("已成功載入 .env 檔案");
} catch (error) {
  console.warn("無法載入 .env 檔案，將使用環境變數:", error.message);
}

// 導入配置模組
const db = require("./db");
const web = require("./web");
const secret = require("./secret");

// 合併配置
const config = {
  db,
  web,
  secret,
};

/**
 * 配置管理器
 * 通過點分隔的路徑獲取配置值
 */
class ConfigManager {
  /**
   * 根據提供的點分隔路徑檢索配置值
   * 如果指定的配置路徑未找到，則拋出錯誤
   *
   * @param {string} path - 點分隔字符串，表示配置路徑
   * @returns {*} - 與給定路徑對應的配置值
   * @throws 如果配置路徑未找到，則拋出錯誤
   */
  static get(path) {
    // 驗證路徑
    if (!path || typeof path !== "string") {
      console.error(`無效的配置路徑: ${path}`);
      return undefined;
    }

    // 分割路徑
    const keys = path.split(".");
    let configValue = config;

    // 遍歷路徑
    try {
      for (const key of keys) {
        if (
          configValue === undefined ||
          configValue === null ||
          !Object.prototype.hasOwnProperty.call(configValue, key)
        ) {
          console.error(`配置路徑不存在: ${path} (在 ${key} 處失敗)`);
          return undefined;
        }
        configValue = configValue[key];
      }

      return configValue;
    } catch (error) {
      console.error(`獲取配置時發生錯誤: ${path}`, error);
      return undefined;
    }
  }

  /**
   * 獲取所有配置
   * @returns {Object} 完整配置對象
   */
  static getAll() {
    return { ...config };
  }

  /**
   * 檢查配置路徑是否存在
   * @param {string} path - 配置路徑
   * @returns {boolean} 路徑是否存在
   */
  static has(path) {
    if (!path || typeof path !== "string") {
      return false;
    }

    const keys = path.split(".");
    let configValue = config;

    for (const key of keys) {
      if (
        configValue === undefined ||
        configValue === null ||
        !Object.prototype.hasOwnProperty.call(configValue, key)
      ) {
        return false;
      }
      configValue = configValue[key];
    }

    return true;
  }
}

// 為了方便調試，打印關鍵配置是否存在
console.log("關鍵配置項檢查:");
console.log(`- JWT Secret: ${!!ConfigManager.get("secret.jwtSecret")}`);
console.log(`- JWT Expires: ${ConfigManager.get("secret.jwtExpiresDay")}`);
console.log(`- 資料庫連線: ${!!ConfigManager.get("db.host")}`);

module.exports = ConfigManager;
