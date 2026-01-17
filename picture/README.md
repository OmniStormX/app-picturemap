# PictureMap - 图床应用

PictureMap是一个基于React Native的移动应用程序，结合Go后端服务，提供图片上传、管理、标签化和浏览功能。该应用允许用户上传图片，系统自动解析图片标签并存储到数据库中，便于后续检索和分类。

## 功能特性

- **用户认证系统**: 提供用户注册和登录功能，使用JWT进行身份验证
- **图片上传**: 支持用户从相册选择图片并上传到服务器
- **智能标签解析**: 自动从图片名称中提取标签信息
- **图片管理**: 提供图片列表展示、详情查看和缩放功能
- **缓存机制**: 使用Redis缓存提高数据访问速度
- **图片处理**: 自动生成多种尺寸的缩略图，优化加载性能
- **数据库集成**: 使用MySQL存储图片元数据，支持快速查询
- **跨平台支持**: 支持Android和iOS双平台

## 技术栈

### 前端 (React Native)
- React Native 0.83.1
- TypeScript
- Redux Toolkit (状态管理)
- React Navigation (导航)
- React Native Paper (UI组件)
- react-native-image-picker (图片选择)
- react-native-fast-image (高性能图片加载)
- react-native-zoomable-view (图片缩放)

### 后端 (Go)
- Go 1.25
- Gin Web Framework
- GORM (数据库操作)
- JWT (身份验证)
- MySQL (数据库)
- Redis (缓存)
- gRPC (可选服务通信)
- Imaging (图片处理)

## 系统架构

### 前端组件
- **用户界面**: 使用React Native构建跨平台UI
- **导航系统**: React Navigation实现多层级导航
- **状态管理**: Redux Toolkit统一管理应用状态
- **网络请求**: 封装的HTTP客户端处理API通信
- **图片处理**: 本地图片选择、预览和上传

### 后端服务
- **API层**: Gin框架提供RESTful API
- **业务逻辑**: Go服务处理用户请求和业务规则
- **数据访问**: GORM ORM操作MySQL数据库
- **缓存层**: Redis缓存热点数据
- **图片处理**: 生成多种尺寸的图片缩略图
- **安全机制**: JWT令牌验证用户身份

## 数据库设计

### 主要表结构
- **users**: 存储用户信息（用户名、密码哈希等）
- **pictures**: 存储图片元数据（名称、哈希值、PID）
- **tags**: 存储标签信息（标签名称、关联的图片ID）
- **relations**: 存储图片与标签的关联关系

### 约束与索引
- 图片名称(name)字段设置唯一索引，防止重复名称
- 图片哈希(hash)字段设置唯一索引，防止重复上传
- 使用复合索引优化按标签查询图片的性能

## 安全特性

- **JWT认证**: 所有受保护路由需要有效的JWT令牌
- **密码加密**: 用户密码使用bcrypt算法加密存储
- **输入验证**: 对所有用户输入进行验证和清理
- **SQL注入防护**: 使用参数化查询防止SQL注入
- **CORS策略**: 配置适当的跨域资源共享策略

## 图片处理流程

1. 用户选择图片并上传到服务器
2. 服务器计算图片哈希值，检查是否已存在
3. 解析图片名称提取标签信息
4. 生成多种尺寸的缩略图（原图、9x16预览、90x160缩略图）
5. 保存图片到文件系统，元数据存入数据库
6. 创建图片与标签的关联关系

## 性能优化

- **缓存策略**: 使用Redis缓存热门图片列表和详情
- **图片压缩**: 自动将上传的图片转换为WebP格式以减少存储空间
- **懒加载**: 在图片列表中实现懒加载以提高滚动性能
- **分页查询**: 对图片列表使用分页减少单次数据库查询量
- **布隆过滤器**: 使用布隆过滤器快速判断图片是否已存在

## 环境配置

### 前端依赖
- Node.js >= 20
- React Native CLI
- Android Studio (Android开发)
- Xcode (iOS开发)

### 后端依赖
- Go 1.25+
- MySQL 8.0+
- Redis 6.0+

### 环境变量配置

#### 前端 (.env)
```env
BASE_URL=http://localhost:8080
```

#### 后端 (.env)
```env
JWT_SECRET="OmnistormPicture"
DATABASE_URL="mysql://root:123456@tcp(127.0.0.1:3306)/picturemap"
PORT=8080
UPLOAD_DIR="./uploads"
UPLOAD_IMAGE_DIR="./uploads/img"
MYSQL_USER="root"
MYSQL_PASSWORD="123456"
MYSQL_DATABASE="picturemap"
MYSQL_HOST="127.0.0.1"
MYSQL_PORT="3306"
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
```

## 安装与运行

### 前端设置
1. 进入前端项目目录
```bash
cd picture
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm start
```

4. 运行应用
```bash
# Android
npm run android

# iOS
npm run ios
```

### 后端设置
1. 进入后端项目目录
```bash
cd backend
```

2. 安装Go依赖
```bash
go mod tidy
```

3. 启动服务（推荐使用Air热重载）
```bash
air
```

或者直接运行
```bash
go run cmd/main.go
```

### 数据库初始化
1. 创建MySQL数据库
```sql
CREATE DATABASE picturemap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 运行迁移脚本或让GORM自动创建表结构

### Redis设置
1. 安装并启动Redis服务
2. 确保Redis配置与.env文件中的设置匹配

## API接口

### 用户认证
- `POST /register` - 用户注册
- `POST /login` - 用户登录

### 图片管理
- `GET /protected/list` - 获取图片列表（分页）
- `POST /protected/upload` - 上传图片
- `GET /protected/tag/search` - 按标签搜索图片
- `GET /protected/tag/list` - 获取标签列表
- `GET /download/:filename` - 下载图片

### 认证要求
除注册和登录外，所有API都需要在请求头中包含有效的JWT令牌：