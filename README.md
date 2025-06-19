# 拾光堂後台後端
## 專案開發環境與目錄結構介紹
主題：《拾光堂》二手攝影器材電商平台

簡介：二手攝影器材仍然具有極高的使用價值。許多保存良好的器材，因缺乏合適的流通平台被閒置或低價處理。且購買全新器材的價格高昂，在摸索攝影的過程金錢成本過高，許多人難以負擔。
所以我們希望打造一個專門的二手攝影器材交易平台，讓器材能夠在攝影愛好者之間流轉，延續其價值。讓舊有的器材有最有效的利用。

後台網址：[https://lightpickers.github.io/Frontend-Dev-React/#/](https://lightpickers.github.io/Manage-Dev-React/#/login)

---

## 功能

測試帳號密碼
```bash
帳號：admin@gmail.com
密碼：Admin1234
```
- 註冊 / 登入
- 管理使用者權限
- 管理商品
- 管理優惠券
- 管理訂單
 
---

## 專案技術

- **後端語言**：Node.js
- **後端框架**：Express
- **資料庫**：PostgreSQL
- **部署平台**：Render（Web, PostgreSQL）
- **身分驗證**：JWT、Bcrypt
- **Log 工具**：Pino（搭配 pino-pretty，方便開發時格式化 log）

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

## 聯絡作者
您可以透過以下方式與我聯絡
- email: lightpickers666@gmail.com
