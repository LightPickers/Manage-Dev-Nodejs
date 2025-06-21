# 拾光堂後台後端
## 專案開發環境與目錄結構介紹
#### 主題
《拾光堂》二手攝影器材電商平台

#### 創作緣由
二手攝影器材仍然具有極高的使用價值。許多保存良好的器材，因缺乏合適的流通平台被閒置或低價處理。且購買全新器材的價格高昂，在摸索攝影的過程金錢成本過高，許多人難以負擔。
所以我們希望打造一個專門的二手攝影器材交易平台，讓器材能夠在攝影愛好者之間流轉，延續其價值。讓舊有的器材有最有效的利用。

前台網址：[https://lightpickers.github.io/Frontend-Dev-React/#/](https://lightpickers.github.io/Frontend-Dev-React/#/)

後台網址：[https://lightpickers.github.io/Manage-Dev-React/#/login](https://lightpickers.github.io/Manage-Dev-React/#/login)

---

## 功能

測試帳號密碼
```bash
帳號：admin@gmail.com
密碼：Admin1234
```
- [x] 註冊 / 登入
- [x] 管理使用者權限
- [x] 管理商品
- [x] 管理優惠券
- [x] 管理訂單
 
---

## 專案技術

- **後端語言**：Node.js
- **後端框架**：Express
- **資料庫**：PostgreSQL
- **部署平台**：Render（Web, PostgreSQL）
- **身分驗證**：JWT、Bcrypt
- **Log 工具**：Pino（搭配 pino-pretty，方便開發時格式化 log）

---

## 安裝
以下將會引導你如何安裝此專案到你的電腦上。
##### 取得專案
```bash
git clone https://github.com/LightPickers/Manage-Dev-Nodejs.git
```
##### 移動到專案內
```bash
cd Manage-Dev-Nodejs
```
##### 安裝套件
```bash
npm install
```
##### 環境變數設定
請在終端機輸入 cp .env.example .env 來複製 .env.example 檔案，並依據 .env 內容調整相關欄位。
#####運行專案
```bash
npm run start
```

---

## 環境變數說明
```bash
# Server
PORT=3001

# Database Config
DB_HOST=your_host
DB_PORT=5432
DB_USERNAME=your_user
DB_PASSWORD=your_password
DB_DATABASE=your_database
DB_SYNCHRONIZE=true              # true 僅建議開發環境使用
DB_ENABLE_SSL=true               # 若部署於 Render、Heroku 等通常需設為 true

# JWT Config
JWT_EXPIRES_DAY=your_jwt_expires_day    # 可用 7d 或 604800 (秒)，視你程式處理方式
JWT_SECRET=your_jwt_secret

# Firebase Config
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_SERVICE_ACCOUNT=your_firebase_service_account_path_or_json_string

# Logging
LOG_LEVEL=debug                  # 可選: error, warn, info, debug, verbose
```

---

## 架構

```bash
Frontend-Dev-Nodejs/
├── bin/                 # 伺服器啟動程式
│   ├── www.js
├── config/              # 環境與密鑰設定
│   ├── db.js
│   ├── index.js
│   ├── secret.js
│   ├── web.js
├── controllers/         # API 控制器
│   ├── coupons.js  # 優惠券
│   ├── login.js  # 登入
│   ├── orders.js  # 訂單
│   ├── products.js  # 商品
│   ├── upload.js  # 上傳圖片
│   ├── users.js  # 使用者
├── db/                  # 資料庫
│   ├── data-source.js
├── entities/            # TypeORM 資料模型
│   ├── Brands.js
│   ├── Categories.js
│   ├── Conditions.js
│   ├── Coupons.js
│   ├── Favorites.js
│   ├── Order_items.js
│   ├── Orders.js
│   ├── Product_images.js
│   ├── Products.js
│   ├── Roles.js
│   ├── Users.js
├── middlewares/         # 中介層處理
│   ├── auth.js
│   ├── uploadImages.js
├── routes/              # 路由定義
│   ├── coupons.js  # 優惠券
│   ├── health.js
│   ├── login.js  # 登入
│   ├── orders.js  # 訂單
│   ├── products.js  # 商品
│   ├── upload.js  # 上傳圖片
│   ├── users.js  # 使用者
├── utils/               # 工具函式
│   ├── appError.js
│   ├── errorMessages.js
│   ├── handleErrorAsync.js
│   ├── logger.js
│   ├── productDataUnchange.js
│   ├── productsValidator.js
│   ├── validateFields.js
│   ├── validateLogin.js
│   ├── validatePatterns.js
│   ├── validateQuillDelta.js
│   ├── validateRules.js
│   ├── validOrderStatus.js
│   ├── validUtils.js
├── app.js               # Express 應用程式主檔
├── README.md
```

## 資料庫設計

本專案使用 PostgreSQL + TypeORM 管理資料，資料表結構如下：
[🔗 資料表設計圖（dbdiagram.io）](https://dbdiagram.io/d/Light-Peakers-67ea32794f7afba184c42005)

## 第三方服務

- Firebase

---

## 關於作者
#### 團隊成員
###### 後端
```bash
姓名: Tau 
Email: jason850629@gmail.com
GitHub: https://github.com/TauHsu
姓名: Angela
Email: AngelaChu1598753@gmail.com
GitHub: https://github.com/Angela-Chu
```

###### 全端
```bash
姓名: zxlee
Email: napoleon.lee0114@gmail.com
GitHub: https://github.com/zxlee0114
姓名: Hsiang 
Email: fdsa201305@gmail.com
GitHub: https://github.com/Hsiang1006
姓名：TX
Email: wutx24@gmail.com
GitHub: https://github.com/TXWuuu
姓名: Rosa
Email: ss91810@gmail.com
GitHub: https://github.com/Rosaaachi
```

如果您有任何問題或建議，歡迎與我們聯繫。感謝閱讀！
