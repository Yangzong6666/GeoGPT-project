# GeoGPT API 配置说明

## 概述

本文档说明如何配置GeoGPT API以便与前端聊天界面正常工作。

## 当前配置

根据您提供的信息，当前配置如下：

```javascript
const API_CONFIG = {
    baseUrl: 'https://api.geogpt.com/v1', // 需要替换为实际的API地址
    apiKey: 'sk-z75090H521z8f37O3973',
    apiName: 'CUG_key_first',
    model: 'gpt-3.5-turbo',
    timeout: 30000
};
```

## 配置步骤

### 1. 获取正确的API地址

由于没有找到GeoGPT的官方API文档，您需要：

1. 联系GeoGPT服务提供商获取正确的API端点
2. 确认API的请求格式（OpenAI兼容格式或自定义格式）
3. 获取完整的API文档

### 2. 修改配置

在 `script.js` 文件的顶部找到 `API_CONFIG` 对象，根据实际情况修改：

```javascript
const API_CONFIG = {
    baseUrl: '您的实际API地址',        // 必须修改
    apiKey: 'sk-z75090H521z8f37O3973',   // 您的API密钥
    apiName: 'CUG_key_first',           // API名称/客户端ID
    model: '实际的模型名称',              // 根据API文档设置
    timeout: 30000                      // 请求超时时间(毫秒)
};
```

### 3. 可能的API格式

根据代码中的适配逻辑，支持以下几种响应格式：

#### OpenAI兼容格式
```json
{
    "choices": [
        {
            "message": {
                "content": "AI的回复内容"
            }
        }
    ]
}
```

#### 自定义格式1
```json
{
    "response": "AI的回复内容"
}
```

#### 自定义格式2
```json
{
    "answer": "AI的回复内容"
}
```

#### 自定义格式3
```json
{
    "content": "AI的回复内容"
}
```

### 4. 认证头字段

代码支持以下认证方式，您可能需要根据实际API要求调整：

```javascript
// 标准Bearer Token
headers['Authorization'] = `Bearer ${API_CONFIG.apiKey}`;

// 自定义API名称头（可能的字段名）
headers['X-API-Name'] = API_CONFIG.apiName;
// headers['X-API-Key'] = API_CONFIG.apiName;
// headers['X-Client-ID'] = API_CONFIG.apiName;
```

## 常见问题

### 1. 连接失败

如果出现连接失败，请检查：
- API地址是否正确
- 网络是否可以访问该地址
- 是否存在CORS跨域问题

### 2. 认证失败

如果出现认证相关错误：
- 检查API密钥是否正确
- 确认认证头字段名称是否正确
- 验证API名称/客户端ID是否有效

### 3. 响应解析失败

如果AI回复为空或格式错误：
- 检查API响应格式是否被正确解析
- 在浏览器开发者工具中查看实际的API响应
- 根据实际响应格式修改解析逻辑

## 调试步骤

1. 打开浏览器开发者工具(F12)
2. 切换到Console标签页
3. 发送一条消息
4. 查看控制台输出，包括：
   - "API配置" 日志
   - "发送API请求" 日志
   - "API响应" 日志
   - 任何错误信息

## 修改API调用逻辑

如果需要修改API调用逻辑，主要修改 `callGeoGPTAPI` 函数：

```javascript
async function callGeoGPTAPI(message) {
    // 1. 修改请求体格式
    const requestBody = {
        // 根据实际API要求调整
    };

    // 2. 修改请求头
    const headers = {
        // 根据实际API要求调整
    };

    // 3. 修改API端点
    const response = await fetch(`${API_CONFIG.baseUrl}/your-endpoint`, {
        // 请求配置
    });

    // 4. 修改响应解析逻辑
    const data = await response.json();
    const assistantMessage = /* 解析逻辑 */;

    return assistantMessage;
}
```

## 联系支持

如果您有GeoGPT API的官方文档或需要技术支持，请：

1. 查阅GeoGPT官方文档
2. 联系GeoGPT技术支持团队
3. 根据官方文档更新配置

## 注意事项

1. 请妥善保管API密钥，不要在公开代码中暴露
2. 建议在生产环境中使用环境变量管理敏感信息
3. 定期检查API配额和使用情况
4. 遵守API服务提供商的使用条款和限制