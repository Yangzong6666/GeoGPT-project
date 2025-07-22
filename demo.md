# GeoGPT 对话界面演示

## �� 项目概述

本项目实现了一个类似GeoGPT的大模型对话界面，具有以下特色功能：

### ✨ 核心功能
- 🔐 **用户认证系统**：安全的注册/登录功能
- 💬 **智能对话**：集成GeoGPT API的对话功能
- 📝 **会话管理**：支持创建、选择、删除会话
- 🎨 **现代化界面**：基于Element Plus的美观UI设计
- 📱 **响应式布局**：适配各种屏幕尺寸

### 🏗️ 技术架构
- **前端**：Vue 3 + Element Plus + Vite
- **后端**：Node.js + Express + SQLite
- **认证**：JWT + bcryptjs
- **API集成**：支持真实GeoGPT API调用和模拟模式

## 🚀 快速体验

### 1. 访问应用
打开浏览器访问：http://localhost:3001

### 2. 用户注册/登录
- 点击"注册"标签页创建新账户
- 或使用"登录"标签页登录现有账户

### 3. 开始对话
- 点击"新建会话"创建对话
- 在输入框中输入问题并发送
- 支持恐龙分类、地理信息等多种话题

## 📸 界面展示

### 登录界面
- 简洁美观的登录/注册表单
- 表单验证和错误提示
- 渐变背景设计

### 对话界面
- 左侧会话列表管理
- 右侧实时对话区域
- 仿ChatGPT的消息气泡设计
- 用户头像和AI标识

## 🔧 配置说明

### 环境配置
编辑 `backend/.env` 文件：

```env
# 服务端口
PORT=3001

# JWT密钥（请修改为安全的密钥）
JWT_SECRET=your-secret-key-here

# 数据库路径
DB_PATH=./database.sqlite

# GeoGPT API配置
GEOGPT_API_URL=https://geogpt.zero2x.org.cn/api
GEOGPT_API_KEY=your-geogpt-api-key-here
```

### API集成模式

#### 1. 模拟模式（默认）
- 当 `GEOGPT_API_KEY` 未配置时自动启用
- 提供预设的智能回复
- 支持恐龙分类、地理信息等话题

#### 2. 真实API模式
- 配置有效的 `GEOGPT_API_KEY`
- 直接调用GeoGPT官方API
- 更准确的地理空间智能回复

## 🛠️ 开发指南

### 启动开发环境
```bash
# 方式1：使用便捷脚本
./start.sh

# 方式2：分别启动
cd backend && npm run dev  # 后端开发服务器
cd frontend && npm run dev # 前端开发服务器
```

### 生产部署
```bash
# 一键部署
./deploy.sh

# 手动部署
cd frontend && npm run build
cd backend && npm start
```

### 数据库管理
- SQLite数据库自动创建
- 包含用户、会话、消息三个表
- 支持数据持久化存储

## 🔍 API接口文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 会话接口
- `GET /api/conversations` - 获取会话列表
- `POST /api/conversations` - 创建新会话
- `DELETE /api/conversations/:id` - 删除会话

### 消息接口
- `GET /api/conversations/:id/messages` - 获取会话消息
- `POST /api/conversations/:id/messages` - 发送消息

## 💡 使用技巧

### 对话技巧
- 输入"#"可以触发技能选择（前端功能）
- 支持Ctrl+Enter快速发送消息
- 自动滚动到最新消息

### 会话管理
- 会话按更新时间倒序排列
- 点击会话即可切换对话
- 支持删除不需要的会话

## 🎨 界面特色

### 设计亮点
- 🎨 现代化的渐变背景
- 💬 类ChatGPT的对话气泡
- 👤 个性化的用户头像
- 🔄 平滑的动画过渡
- 📱 完全响应式设计

### 用户体验
- ⚡ 快速响应的界面交互
- 🔔 友好的错误提示信息
- 💾 自动保存会话状态
- 🎯 直观的操作引导

## 🚨 注意事项

1. **API密钥配置**：请确保GeoGPT API密钥的安全性
2. **数据备份**：定期备份SQLite数据库文件
3. **端口冲突**：确保3001端口未被占用
4. **网络访问**：需要互联网连接以调用外部API

## 📞 技术支持

如遇到问题，请检查：
1. Node.js版本是否支持（建议v14+）
2. 端口是否被占用
3. 网络连接是否正常
4. 日志文件：`server.log`

---

🎉 **祝您使用愉快！**
