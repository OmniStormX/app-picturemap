# app-picturemap

一款用于管理和分享图片的移动应用，支持标签功能。前端使用 React Native 构建，后端使用 Go 开发。该应用允许用户上传图像、添加标签、浏览图片列表，并按标签搜索。

Github：https://github.com/OmniStormX/app-picturemap

演示录屏：bilibili: https://www.bilibili.com/video/BV1uurSBREh5/

## 产品功能介绍

### 核心功能

- **用户认证**：支持用户注册和登录，使用基于令牌的安全认证（JWT）。用户可以创建账户并登录以访问个性化功能。
- **图片上传**：用户可以从设备图库中选择图像，添加名称，并附加多个标签后上传。应用处理图像压缩并上传到服务器。
- **图片浏览**：以网格列表形式显示图片，支持懒加载和无限滚动。包括下拉刷新以更新列表。
- **标签系统**：用户可以在上传时添加自定义标签。首页显示热门标签的水平可滚动列表，允许快速导航到特定标签的图片结果。
- **按标签搜索**：专用屏幕用于查看按特定标签过滤的图片，支持分页。
- **预览和占位图像**：优化图像加载，首先使用低分辨率占位符（例如 90x160 缩略图），以实现更快渲染，按需切换到全分辨率。

### 用户体验

- 使用 React Native Paper 实现 Material Design 3 (MD3) 兼容的 UI，提供现代、响应式的界面。
- 支持深色/浅色主题，通过 React Native Paper 实现。
- 错误处理和反馈，例如上传失败或无效输入的警报。
- 使用 Redux 进行状态管理，以高效处理数据（例如图片列表和加载状态）。

该应用设计用于希望通过标签简单组织和发现图片的用户，类似于带有社交标签元素的轻量级照片库。

## 程序概要设计

### 前端（React Native）

- **导航**：使用 React Navigation，底部标签用于首页（图片）和上传。栈导航用于登录/注册和标签结果屏幕。
- **组件**：
  - `PictureList`：可复用组件，用于显示分页图片网格，支持刷新和加载更多功能。
  - `Picture90x160`：单个图片卡片，支持占位符和懒加载。
  - `Upload`：用于图像选择、命名、标签和提交的表单。
- **状态管理**：Redux 分片用于图片（列表、加载状态）和用户（用户名、令牌）。
- **API 集成**：服务层（`services/`）抽象 API 调用（例如 `fetchPictures`、`uploadImage`），使用类似 Axios 的 HTTP 请求。
- **数据流**：应用加载时，获取初始图片和标签。上传触发服务器调用，使用 FormData 处理图像。

### 后端（Go）

- **API 结构**：RESTful 端点用于用户认证、图片上传、列表检索和标签管理。。
- **数据库**：MySQL 用于持久存储（用户、图片、标签）。`database/mapper/` 中的类似 GORM 的映射器用于 CRUD 操作。
- **缓存**：Redis 用于缓存（例如用户会话或频繁查询），通过 `cache/cache.go` 实现。
- **认证**：JWT 用于令牌生成和验证，在 `utils/jwt.go` 中实现。
- **图像处理**：上传在 `internal/service/routes/static_source_upload.go` 中处理，使用图像操作实用工具（`utils/image.go`）。
- **测试**：脚本如 `test/add_tag_test.py` 用于 API 测试。

### 整体设计原则

- **模块化**：关注点分离，使用服务、组件和实用工具。
- **可扩展**：API 和前端中的分页处理大型数据集。
- **安全**：密码使用 SHA-256 哈希（`utils/sha-256.go`），JWT 用于认证。
- **高效**：使用 Redis 缓存，优化图像缩略图。

## 软件架构图

以下是高级架构图，使用 ASCII 艺术表示：

```
+-------------------+       +-------------------+
|   Mobile Client   |       |     Backend       |
| (React Native)    |       |      (Go)         |
+-------------------+       +-------------------+
| - App.tsx         |       | - cmd/main.go     |
| - Navigation      |  HTTP | - API Routes      |
|   - Bottom Tabs   |<----->|   - User Service  |
|   - Stack Screens | (JWT) |   - Picture Upload|
| - Components      |       | - Database (MySQL)|
|   - PictureList   |       | - Cache (Redis)   |
|   - Upload Form   |       | - Utils (JWT, Img)|
| - Redux Store     |       +-------------------+
| - Services (API)  |
+-------------------+
          |
          v
+-------------------+
|   External Libs   |
| - RN Image Picker |
| - RN Paper (UI)   |
| - AsyncStorage    |
+-------------------+
```

- **客户端-服务器交互**：前端发送 HTTP 请求（例如 POST 用于上传，GET 用于列表），通过存储在 AsyncStorage 中的 JWT 令牌进行认证。
- **数据层**：后端与 MySQL 交互进行 CRUD，并使用 Redis 进行缓存。
- **流程示例**：用户登录 → 存储令牌 → 获取图片 → 在网格中显示 → 上传新图像并添加标签 → 刷新更新列表。

## 技术亮点及其实现原理

### 1. **懒加载图像与占位符**

   - **亮点**：通过首先加载低分辨率缩略图，然后加载全图像，提高性能。
   - **原理**：使用 `getPreviewUrl` 和 `getImageUrl` 首先获取 90x160 WEBP 缩略图。Redux 跟踪加载状态（`setLoadedById`）。在滚动/查看时，使用 React Native 的 `Image` 组件切换到全 WEBP，支持渐进加载。

### 2. **JWT 认证**

   - **亮点**：无需服务器端会话的安全会话管理。
   - **原理**：后端在登录/注册时生成 JWT 令牌（`utils/jwt.go`）。前端存储在 AsyncStorage 中，并在受保护路由的头部中包含。后端验证防止未授权访问。

### 3. **Redux 用于状态管理**

   - **亮点**：图片和用户的集中状态，便于高效更新（例如上传后）。
   - **原理**：分片（如 `picture.ts`、`userSlice.ts`）处理操作如 `addPicture` 和 `clearPictures`（登出时）。选择器获取数据，无需属性钻取。

### 4. **Redis 缓存**

   - **亮点**：加速频繁查询，如标签列表或用户数据。
   - **原理**：`cache/cache.go` 集成 Redis 用于存储序列化数据。在 API 调用时，首先检查缓存；如果未命中，则查询 DB 并缓存结果，带过期时间。

### 5. **带标签的图像上传**

   - **亮点**：多部分表单处理，标签作为数组。
   - **原理**：前端使用 `FormData` 附加图像、名称和标签[]。后端在 `static_source_upload.go` 中解析，存储在 DB 中，并使用 `utils/image.go` 生成缩略图（可能使用像 imaging 这样的图像库）。

## 安装和运行

### 先决条件

- Node.js（用于前端）
- Go（用于后端）
- MySQL 和 Redis 服务器
- Android/iOS 模拟器或设备

### 后端设置

1. 导航到 `backend/`。
2. 运行 `go mod tidy` 安装依赖。
3. 在 `configs/config.go` 中配置 DB/Redis 细节。
4. 使用 `go run cmd/main.go` 启动。
5. 如需要，使用 `docker-compose.yml` 设置 MySQL/Redis。

### 前端设置

1. 导航到 `picture/`。
2. 运行 `npm install` 或 `yarn install`。
3. 对于 Android：`npx react-native run-android`。
4. 对于 iOS：`npx pod-install` 然后 `npx react-native run-ios`。

### 测试

- 使用 `backend/test/add_tag_test.py` 进行 API 测试。
- 确保后端运行在 `src/config.ts` 中定义的基本 URL 上。

## 许可证

```
Copyright (c) [年份] [版权所有者]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```