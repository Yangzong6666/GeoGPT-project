const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const conversationRoutes = require('./routes/conversations')
const { initDatabase } = require('./models/database')

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../frontend/dist')))

// 初始化数据库
initDatabase()

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/conversations', conversationRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// 前端SPA路由处理
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = app
