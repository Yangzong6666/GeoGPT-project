// GeoGPT API 配置
const API_CONFIG = {
    // 根据GeoGPT平台的实际情况配置
    baseUrl: 'https://geogpt.zero2x.org.cn/api/v1', // 基于提供的文档链接推断
    apiKey: 'sk-z75090H521z8f37O3973',
    apiName: 'CUG_key_first',
    // 可能的其他配置选项
    model: 'geogpt-base', // GeoGPT默认模型
    timeout: 30000 // 30秒超时
};

// 全局状态
let isLoading = false;
let conversationHistory = [];
let settings = {
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: '你是一个有用、无害、诚实的AI助手。',
    model: 'gpt-3.5-turbo'
};

// DOM 元素
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const clearButton = document.getElementById('clearButton');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const loadingIndicator = document.getElementById('loadingIndicator');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const charCount = document.getElementById('charCount');
const initialTime = document.getElementById('initialTime');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSettings();
    setupEventListeners();
    updateInitialTime();
});

function initializeApp() {
    // 测试API连接
    testApiConnection();
    
    // 自动调整输入框高度
    autoResizeTextarea(messageInput);
    
    // 显示配置信息（开发环境下）
    console.log('API配置:', {
        baseUrl: API_CONFIG.baseUrl,
        apiName: API_CONFIG.apiName,
        model: settings.model
    });
}

function updateInitialTime() {
    const now = new Date();
    initialTime.textContent = formatTime(now);
}

function formatTime(date) {
    return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function setupEventListeners() {
    // 发送消息
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 字符计数
    messageInput.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;
        
        if (length > 1800) {
            charCount.style.color = '#ef4444';
        } else if (length > 1500) {
            charCount.style.color = '#f59e0b';
        } else {
            charCount.style.color = '#64748b';
        }
    });

    // 清空对话
    clearButton.addEventListener('click', function() {
        if (confirm('确定要清空所有对话记录吗？')) {
            clearConversation();
        }
    });

    // 设置相关
    settingsButton.addEventListener('click', () => {
        settingsModal.classList.add('show');
    });

    closeSettings.addEventListener('click', () => {
        settingsModal.classList.remove('show');
    });

    settingsModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });

    saveSettings.addEventListener('click', saveSettingsHandler);

    // 设置滑块实时更新
    const temperatureSlider = document.getElementById('temperatureSlider');
    const temperatureValue = document.getElementById('temperatureValue');
    
    temperatureSlider.addEventListener('input', function() {
        temperatureValue.textContent = this.value;
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            settingsModal.classList.remove('show');
        }
    });
}

function autoResizeTextarea(textarea) {
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

async function testApiConnection() {
    try {
        updateStatus('连接中...', 'connecting');
        
        // 发送一个真实的测试请求
        const testMessage = '你好';
        const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`,
                'X-API-Name': API_CONFIG.apiName
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    {
                        role: 'user',
                        content: testMessage
                    }
                ],
                max_tokens: 10,
                temperature: 0.1
            }),
            signal: AbortSignal.timeout(10000) // 10秒超时
        });

        if (response.ok) {
            const data = await response.json();
            console.log('API连接测试成功:', data);
            updateStatus('已连接', 'connected');
            
            // 显示连接成功的详细信息
            console.log('GeoGPT API配置验证成功:', {
                endpoint: `${API_CONFIG.baseUrl}/chat/completions`,
                model: API_CONFIG.model,
                apiName: API_CONFIG.apiName,
                responseReceived: true
            });
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('API连接测试失败:', error);
        updateStatus('连接失败', 'error');
        
        // 提供更详细的错误信息
        let errorMessage = '连接失败: ';
        if (error.name === 'AbortError') {
            errorMessage += '请求超时';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += '网络错误，请检查API地址和网络连接';
        } else if (error.message.includes('401')) {
            errorMessage += 'API密钥验证失败';
        } else if (error.message.includes('404')) {
            errorMessage += 'API端点不存在，请检查baseUrl配置';
        } else {
            errorMessage += error.message;
        }
        
        console.error('详细错误信息:', {
            endpoint: `${API_CONFIG.baseUrl}/chat/completions`,
            apiKey: API_CONFIG.apiKey.substring(0, 10) + '...',
            apiName: API_CONFIG.apiName,
            error: errorMessage
        });
    }
}

function updateStatus(text, type) {
    statusText.textContent = text;
    statusIndicator.className = `status-indicator ${type}`;
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isLoading) return;

    // 添加用户消息到界面
    addMessage('user', message);
    
    // 清空输入框
    messageInput.value = '';
    messageInput.style.height = 'auto';
    charCount.textContent = '0';

    // 禁用发送按钮
    isLoading = true;
    sendButton.disabled = true;
    showLoading(true);

    try {
        // 调用API
        const response = await callGeoGPTAPI(message);
        
        // 添加AI回复到界面
        addMessage('assistant', response);
        
    } catch (error) {
        console.error('发送消息失败:', error);
        addMessage('assistant', `抱歉，我遇到了一些问题：${error.message}\n\n请检查以下几点：\n1. 网络连接是否正常\n2. API配置是否正确\n3. API密钥是否有效\n\n如果问题持续存在，请联系管理员。`);
        updateStatus('发送失败', 'error');
    } finally {
        // 恢复界面状态
        isLoading = false;
        sendButton.disabled = false;
        showLoading(false);
    }
}

async function callGeoGPTAPI(message) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
        // 构建对话历史
        const messages = [
            {
                role: 'system',
                content: settings.systemPrompt
            },
            ...conversationHistory,
            {
                role: 'user',
                content: message
            }
        ];

        // 构建请求体 - 根据GeoGPT API实际需求调整
        const requestBody = {
            model: settings.model || API_CONFIG.model,
            messages: messages,
            temperature: settings.temperature,
            max_tokens: settings.maxTokens,
            stream: false
        };

        // 构建请求头
        const headers = {
            'Content-Type': 'application/json'
        };

        // 添加认证信息 - 根据GeoGPT API实际需求调整
        if (API_CONFIG.apiKey) {
            headers['Authorization'] = `Bearer ${API_CONFIG.apiKey}`;
        }
        
        if (API_CONFIG.apiName) {
            headers['X-API-Name'] = API_CONFIG.apiName;
            // 或者可能是其他头字段，如：
            // headers['X-API-Key'] = API_CONFIG.apiName;
            // headers['X-Client-ID'] = API_CONFIG.apiName;
        }

        console.log('发送API请求:', {
            url: `${API_CONFIG.baseUrl}/chat/completions`,
            method: 'POST',
            headers: Object.keys(headers),
            bodyKeys: Object.keys(requestBody),
            model: requestBody.model,
            messageCount: requestBody.messages.length
        });

        const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
            } catch {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('API响应:', data);
        
        // 解析响应 - 根据GeoGPT API实际响应格式调整
        let assistantMessage;
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            // OpenAI格式
            assistantMessage = data.choices[0].message.content;
        } else if (data.response) {
            // 自定义格式1
            assistantMessage = data.response;
        } else if (data.answer) {
            // 自定义格式2
            assistantMessage = data.answer;
        } else if (data.content) {
            // 自定义格式3
            assistantMessage = data.content;
        } else {
            // 降级处理
            assistantMessage = JSON.stringify(data);
        }

        if (!assistantMessage || assistantMessage.trim() === '') {
            throw new Error('收到了空的响应内容');
        }
        
        // 更新对话历史
        conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: assistantMessage }
        );

        // 限制对话历史长度（避免token过多）
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

        updateStatus('已连接', 'connected');
        return assistantMessage;

    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('请求超时，请稍后重试');
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('网络连接失败，请检查网络设置');
        }
        
        throw error;
    }
}

function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    
    // 处理换行和markdown格式
    textDiv.innerHTML = formatMessageContent(content);
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.innerHTML = `<span>${formatTime(new Date())}</span>`;
    
    contentDiv.appendChild(textDiv);
    contentDiv.appendChild(timeDiv);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatMessageContent(content) {
    // 简单的文本格式化，可以根据需要扩展
    return content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
}

function clearConversation() {
    // 清空界面消息（保留欢迎消息）
    const welcomeMessage = chatMessages.firstElementChild;
    chatMessages.innerHTML = '';
    if (welcomeMessage) {
        chatMessages.appendChild(welcomeMessage);
    }
    
    // 清空对话历史
    conversationHistory = [];
    
    // 重置状态
    updateStatus('已连接', 'connected');
}

function showLoading(show) {
    if (show) {
        loadingIndicator.classList.add('show');
    } else {
        loadingIndicator.classList.remove('show');
    }
}

function loadSettings() {
    const savedSettings = localStorage.getItem('geoGptSettings');
    if (savedSettings) {
        try {
            settings = { ...settings, ...JSON.parse(savedSettings) };
            updateSettingsUI();
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }
}

function updateSettingsUI() {
    document.getElementById('temperatureSlider').value = settings.temperature;
    document.getElementById('temperatureValue').textContent = settings.temperature;
    document.getElementById('maxTokensInput').value = settings.maxTokens;
    document.getElementById('systemPromptInput').value = settings.systemPrompt;
}

function saveSettingsHandler() {
    const temperature = parseFloat(document.getElementById('temperatureSlider').value);
    const maxTokens = parseInt(document.getElementById('maxTokensInput').value);
    const systemPrompt = document.getElementById('systemPromptInput').value.trim();

    // 验证设置
    if (isNaN(temperature) || temperature < 0 || temperature > 1) {
        alert('Temperature值必须在0-1之间');
        return;
    }

    if (isNaN(maxTokens) || maxTokens < 100 || maxTokens > 4000) {
        alert('最大回复长度必须在100-4000之间');
        return;
    }

    if (!systemPrompt) {
        alert('系统提示词不能为空');
        return;
    }

    // 保存设置
    settings = {
        temperature,
        maxTokens,
        systemPrompt,
        model: settings.model // 保持模型设置
    };

    localStorage.setItem('geoGptSettings', JSON.stringify(settings));
    settingsModal.classList.remove('show');
    
    // 显示保存成功提示
    const originalText = saveSettings.textContent;
    saveSettings.textContent = '已保存';
    saveSettings.style.background = '#22c55e';
    
    setTimeout(() => {
        saveSettings.textContent = originalText;
        saveSettings.style.background = '';
    }, 1500);
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('全局错误:', e.error);
    updateStatus('发生错误', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('未处理的Promise拒绝:', e.reason);
    updateStatus('网络错误', 'error');
});

// 网络状态监听
window.addEventListener('online', function() {
    updateStatus('已连接', 'connected');
    testApiConnection();
});

window.addEventListener('offline', function() {
    updateStatus('网络断开', 'error');
});

// 添加一些CSS动态样式类
const style = document.createElement('style');
style.textContent = `
    .status-indicator.connected {
        background: #4ade80;
    }
    
    .status-indicator.connecting {
        background: #f59e0b;
        animation: pulse 1s infinite;
    }
    
    .status-indicator.error {
        background: #ef4444;
        animation: none;
    }
    
    .message-text code {
        background: #f1f5f9;
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
    }
    
    .message-text pre {
        background: #f1f5f9;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 0.5rem 0;
    }
    
    .message-text pre code {
        background: none;
        padding: 0;
    }
    
    .message-text strong {
        font-weight: 600;
    }
    
    .message-text em {
        font-style: italic;
    }
`;
document.head.appendChild(style);