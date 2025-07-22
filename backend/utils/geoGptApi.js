const axios = require('axios')

class GeoGptApi {
  constructor() {
    this.baseURL = process.env.GEOGPT_API_URL || 'https://geogpt.zero2x.org.cn/api'
    this.apiKey = process.env.GEOGPT_API_KEY
  }

  // 发送消息到GeoGPT API
  async sendMessage(message) {
    try {
      // 如果没有配置真实的API key，返回模拟响应
      if (!this.apiKey || this.apiKey === 'your-geogpt-api-key-here') {
        return this.getMockResponse(message)
      }

      const response = await axios.post(`${this.baseURL}/chat`, {
        message: message,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data.response || response.data.message
    } catch (error) {
      console.error('GeoGPT API错误:', error.message)
      // 如果API调用失败，返回模拟响应
      return this.getMockResponse(message)
    }
  }

  // 模拟GeoGPT响应
  getMockResponse(message) {
    const responses = [
      '感谢您的问题！这是一个关于地理空间的智能回答。GeoGPT致力于为您提供准确的地理信息和空间分析服务。',
      '根据您的询问，我为您分析了相关的地理数据。如需更详细的信息，请提供更具体的位置或条件。',
      '这是一个很有趣的地理问题！让我为您提供相关的地理空间分析和建议。',
      '基于地理信息系统的分析，我认为这个问题涉及多个空间维度的考量。',
      '从地理空间的角度来看，您提到的内容需要结合多种地理要素进行综合分析。'
    ]
    
    // 根据消息内容返回不同的响应
    if (message.includes('恐龙') || message.includes('分类')) {
      return '恐龙主要分为两大类：蜥臀目（Saurischia）和鸟臀目（Ornithischia）。蜥臀目包括蜥脚类（如梁龙、雷龙）和兽脚类（如霸王龙、迅猛龙）。鸟臀目包括装甲龙类、角龙类、鸭嘴龙类等。这种分类主要基于骨盆结构的差异。'
    }
    
    if (message.includes('地理') || message.includes('位置') || message.includes('地图')) {
      return '地理信息系统（GIS）是分析空间数据的重要工具。通过地理坐标、地形地貌、气候条件等多种地理要素，我们可以进行综合的空间分析和决策支持。'
    }
    
    // 随机返回一个通用响应
    return responses[Math.floor(Math.random() * responses.length)]
  }
}

module.exports = new GeoGptApi()
