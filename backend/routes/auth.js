const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { db } = require('../models/database')

const router = express.Router()

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: '所有字段都是必需的' })
    }

    // 检查用户是否已存在
    db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email],
      async (err, row) => {
        if (err) {
          return res.status(500).json({ message: '数据库错误' })
        }

        if (row) {
          return res.status(400).json({ message: '用户名或邮箱已存在' })
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10)

        // 创建用户
        db.run(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hashedPassword],
          function(err) {
            if (err) {
              return res.status(500).json({ message: '创建用户失败' })
            }

            const user = {
              id: this.lastID,
              username,
              email
            }

            // 生成JWT令牌
            const token = jwt.sign(
              { id: user.id, username: user.username },
              process.env.JWT_SECRET,
              { expiresIn: '24h' }
            )

            res.status(201).json({
              message: '注册成功',
              user,
              token
            })
          }
        )
      }
    )
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码都是必需的' })
    }

    // 查找用户
    db.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ message: '数据库错误' })
        }

        if (!user) {
          return res.status(400).json({ message: '用户不存在' })
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
          return res.status(400).json({ message: '密码错误' })
        }

        // 生成JWT令牌
        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        )

        res.json({
          message: '登录成功',
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          token
        })
      }
    )
  } catch (error) {
    res.status(500).json({ message: '服务器错误' })
  }
})

module.exports = router
