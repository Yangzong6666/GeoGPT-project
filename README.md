# GeoGPT 对话界面

这是一个类似GeoGPT的大模型对话界面，提供用户登录、会话管理和智能对话功能。

## 功能特点

- ✅ 用户注册/登录系统
- ✅ 会话管理（新建、选择、删除会话）
- ✅ 实时对话功能
- ✅ 美观的现代化界面
- ✅ 响应式设计
- ✅ JWT身份验证
- ✅ SQLite数据库存储
- ✅ GeoGPT API集成（支持模拟模式）

## 技术栈

### 前端
- Vue 3 + Composition API
- Vue Router 4
- Vuex 4
- Element Plus UI组件库
- Vite构建工具
- Axios HTTP客户端

### 后端
- Node.js + Express
- SQLite数据库
- JWT身份验证
- bcryptjs密码加密
- CORS跨域支持

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 2. 配置环境变量

编辑 `backend/.env` 文件，配置以下参数：

```env
PORT=3001
JWT_SECRET=your-secret-key-here
DB_PATH=./database.sqlite
GEOGPT_API_URL=https://geogpt.zero2x.org.cn/api
GEOGPT_API_KEY=your-geogpt-api-key-here
```

### 3. 启动服务

使用提供的启动脚本：

```bash
./start.sh
```

或者分别启动前后端：

```bash
# 启动后端服务
cd backend
npm run dev

# 在新终端启动前端服务
cd frontend
npm run dev
```

### 4. 访问应用

- 前端地址: http://localhost:3000
- 后端API: http://localhost:3001

## 项目结构

```
.
├── frontend/                 # Vue前端项目
│   ├── src/
│   │   ├── components/       # 组件
│   │   ├── views/           # 页面
│   │   ├── router/          # 路由配置
│   │   ├── store/           # Vuex状态管理
│   │   └── utils/           # 工具函数
│   ├── index.html           # HTML入口
│   ├── vite.config.js       # Vite配置
│   └── package.json
├── backend/                  # Node.js后端项目
│   ├── routes/              # API路由
│   ├── middleware/          # 中间件
│   ├── models/              # 数据库模型
│   ├── utils/               # 工具函数
│   ├── app.js               # Express应用
│   ├── .env                 # 环境配置
│   └── package.json
├── start.sh                 # 启动脚本
└── README.md
```

## API接口

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 会话接口

- `GET /api/conversations` - 获取会话列表
- `POST /api/conversations` - 创建新会话
- `GET /api/conversations/:id/messages` - 获取会话消息
- `POST /api/conversations/:id/messages` - 发送消息
- `DELETE /api/conversations/:id` - 删除会话

## GeoGPT API集成

本项目支持调用真实的GeoGPT API，也提供了模拟模式：

1. **真实API模式**：在`.env`文件中配置正确的`GEOGPT_API_KEY`
2. **模拟模式**：当API密钥未配置或调用失败时，自动切换到模拟响应

## 开发说明

### 前端开发

```bash
cd frontend
npm run dev     # 启动开发服务器
npm run build   # 构建生产版本
```

### 后端开发

```bash
cd backend
npm run dev     # 启动开发服务器（nodemon）
npm start       # 启动生产服务器
```

### 数据库

项目使用SQLite数据库，数据库文件会在后端首次启动时自动创建。

### 部署

1. 构建前端：`cd frontend && npm run build`
2. 启动后端：`cd backend && npm start`
3. 后端会自动服务前端静态文件

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License
