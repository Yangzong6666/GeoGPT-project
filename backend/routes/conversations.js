const express = require('express')
const { db } = require('../models/database')
const { authenticateToken } = require('../middleware/auth')
const geoGptApi = require('../utils/geoGptApi')

const router = express.Router()

// 保护所有对话相关的路由
router.use(authenticateToken)

// 获取用户的所有会话
router.get('/', (req, res) => {
  const userId = req.user.id

  db.all(
    'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: '获取会话失败' })
      }
      res.json(rows)
    }
  )
})

// 创建新会话
router.post('/', (req, res) => {
  const { title } = req.body
  const userId = req.user.id

  if (!title) {
    return res.status(400).json({ message: '会话标题是必需的' })
  }

  db.run(
    'INSERT INTO conversations (user_id, title) VALUES (?, ?)',
    [userId, title],
    function(err) {
      if (err) {
        return res.status(500).json({ message: '创建会话失败' })
      }

      const conversation = {
        id: this.lastID,
        user_id: userId,
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      res.status(201).json(conversation)
    }
  )
})

// 获取会话的所有消息
router.get('/:id/messages', (req, res) => {
  const conversationId = req.params.id
  const userId = req.user.id

  // 首先验证会话是否属于当前用户
  db.get(
    'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
    [conversationId, userId],
    (err, conversation) => {
      if (err) {
        return res.status(500).json({ message: '数据库错误' })
      }

      if (!conversation) {
        return res.status(404).json({ message: '会话不存在' })
      }

      // 获取消息
      db.all(
        'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
        [conversationId],
        (err, rows) => {
          if (err) {
            return res.status(500).json({ message: '获取消息失败' })
          }
          res.json(rows)
        }
      )
    }
  )
})

// 发送消息
router.post('/:id/messages', async (req, res) => {
  const conversationId = req.params.id
  const userId = req.user.id
  const { content } = req.body

  if (!content) {
    return res.status(400).json({ message: '消息内容是必需的' })
  }

  // 验证会话是否属于当前用户
  db.get(
    'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
    [conversationId, userId],
    async (err, conversation) => {
      if (err) {
        return res.status(500).json({ message: '数据库错误' })
      }

      if (!conversation) {
        return res.status(404).json({ message: '会话不存在' })
      }

      try {
        // 保存用户消息
        db.run(
          'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
          [conversationId, 'user', content],
          async function(err) {
            if (err) {
              return res.status(500).json({ message: '保存消息失败' })
            }

            const userMessage = {
              id: this.lastID,
              conversation_id: conversationId,
              role: 'user',
              content,
              created_at: new Date().toISOString()
            }

            try {
              // 调用GeoGPT API获取回复
              const aiResponse = await geoGptApi.sendMessage(content)

              // 保存AI回复
              db.run(
                'INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)',
                [conversationId, 'assistant', aiResponse],
                function(err) {
                  if (err) {
                    console.error('保存AI回复失败:', err)
                    return res.json(userMessage)
                  }

                  const assistantMessage = {
                    id: this.lastID,
                    conversation_id: conversationId,
                    role: 'assistant',
                    content: aiResponse,
                    created_at: new Date().toISOString()
                  }

                  // 更新会话的更新时间
                  db.run(
                    'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [conversationId]
                  )

                  res.json(assistantMessage)
                }
              )
            } catch (apiError) {
              console.error('GeoGPT API调用失败:', apiError)
              res.json(userMessage)
            }
          }
        )
      } catch (error) {
        res.status(500).json({ message: '发送消息失败' })
      }
    }
  )
})

// 删除会话
router.delete('/:id', (req, res) => {
  const conversationId = req.params.id
  const userId = req.user.id

  // 验证会话是否属于当前用户
  db.get(
    'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
    [conversationId, userId],
    (err, conversation) => {
      if (err) {
        return res.status(500).json({ message: '数据库错误' })
      }

      if (!conversation) {
        return res.status(404).json({ message: '会话不存在' })
      }

      // 删除会话及其消息
      db.serialize(() => {
        db.run('DELETE FROM messages WHERE conversation_id = ?', [conversationId])
        db.run('DELETE FROM conversations WHERE id = ?', [conversationId], function(err) {
          if (err) {
            return res.status(500).json({ message: '删除会话失败' })
          }
          res.json({ message: '会话删除成功' })
        })
      })
    }
  )
})

module.exports = router
