<template>
  <div class="chat-container">
    <!-- 左侧会话列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <el-button 
          type="primary" 
          size="large"
          @click="createNewConversation"
          style="width: 100%"
        >
          <el-icon><Plus /></el-icon>
          新建会话
        </el-button>
      </div>
      
      <div class="conversation-list">
        <div class="list-header">
          <h3>最近会话记录</h3>
        </div>
        
        <div 
          v-for="conversation in conversations" 
          :key="conversation.id"
          class="conversation-item"
          :class="{ active: currentConversation?.id === conversation.id }"
          @click="selectConversation(conversation)"
        >
          <div class="conversation-title">{{ conversation.title }}</div>
          <div class="conversation-time">{{ formatTime(conversation.updatedAt) }}</div>
        </div>
        
        <div v-if="conversations.length === 0" class="empty-state">
          <p>暂无会话记录</p>
        </div>
      </div>
      
      <!-- 用户信息 -->
      <div class="user-info">
        <el-dropdown @command="handleUserAction">
          <div class="user-profile">
            <el-avatar :size="32">{{ user?.username?.charAt(0) }}</el-avatar>
            <span class="username">{{ user?.username }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    
    <!-- 右侧聊天区域 -->
    <div class="chat-area">
      <div v-if="!currentConversation" class="welcome-screen">
        <div class="welcome-content">
          <h2>请给我恐龙的分类</h2>
          <p>嗨，用户让我提供恐龙的分类信息。首先，我需要明确您的需求是什么。可能是一个学生做作业，或者是对古生物学感兴趣的爱好者。不管怎样，他们希望了解恐龙的基本分类结构。</p>
          
          <div class="category-section">
            <h3>恐龙主要分为两个大目：蜥臀目和鸟臀目。我应该介绍两个不同这两个主要分类，然后再细分下去。蜥臀目包括蜥脚类和兽脚类，而鸟臀目则有各种类，比如头足类、甲龙类等。需要确保每个类别下的例子准确，比如霸王龙主要属于兽脚类、梁龙属于蜥臀类等。</h3>
          </div>
          
          <div class="info-box">
            <h4>恐龙是中生代多样化的一类爬行动物，主要生活于三叠纪至白垩纪（约2.3亿年前至6600万年前）。根据骨盆结构和形态特征，恐龙可分为以下两大类：</h4>
          </div>
          
          <div class="dinosaur-categories">
            <div class="category">
              <h4>一、蜥臀目（Saurischia）</h4>
              <p><strong>特征：</strong>骨盆骨略似现代蜥蜴，耻骨向前延伸。</p>
            </div>
          </div>
          
          <div class="action-hint">
            <p>发送消息或在输入框中输入 "#" 来选择技能。</p>
          </div>
        </div>
      </div>
      
      <div v-else class="chat-content">
        <!-- 聊天消息区域 -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="message"
            :class="{ 'user-message': message.role === 'user', 'assistant-message': message.role === 'assistant' }"
          >
            <div class="message-avatar">
              <el-avatar v-if="message.role === 'user'" :size="32">
                {{ user?.username?.charAt(0) }}
              </el-avatar>
              <div v-else class="ai-avatar">AI</div>
            </div>
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.createdAt) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-container">
            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="发送消息或在输入框中输入 &quot;#&quot; 来选择技能"
              resize="none"
              @keydown.enter.ctrl="sendMessage"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <div class="input-actions">
              <el-button 
                type="primary" 
                :loading="sending"
                @click="sendMessage"
                :disabled="!inputMessage.trim()"
              >
                发送
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'Chat',
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const inputMessage = ref('')
    const sending = ref(false)
    const messagesContainer = ref(null)
    
    const user = computed(() => store.getters.currentUser)
    const conversations = computed(() => store.getters.getConversations)
    const currentConversation = computed(() => store.getters.getCurrentConversation)
    const messages = computed(() => store.getters.getMessages)
    
    const createNewConversation = async () => {
      try {
        const title = `新对话 ${new Date().toLocaleString()}`
        const conversation = await store.dispatch('createConversation', title)
        store.commit('SET_CURRENT_CONVERSATION', conversation)
        store.commit('SET_MESSAGES', [])
      } catch (error) {
        ElMessage.error('创建会话失败')
      }
    }
    
    const selectConversation = async (conversation) => {
      store.commit('SET_CURRENT_CONVERSATION', conversation)
      try {
        await store.dispatch('fetchMessages', conversation.id)
      } catch (error) {
        ElMessage.error('加载消息失败')
      }
    }
    
    const sendMessage = async () => {
      if (!inputMessage.value.trim() || !currentConversation.value) return
      
      sending.value = true
      const content = inputMessage.value.trim()
      inputMessage.value = ''
      
      try {
        // 添加用户消息
        const userMessage = {
          id: Date.now(),
          content,
          role: 'user',
          createdAt: new Date()
        }
        store.commit('ADD_MESSAGE', userMessage)
        
        // 发送到后端并获取AI回复
        await store.dispatch('sendMessage', {
          conversationId: currentConversation.value.id,
          content
        })
        
        // 滚动到底部
        await nextTick()
        scrollToBottom()
        
      } catch (error) {
        ElMessage.error('发送消息失败')
      } finally {
        sending.value = false
      }
    }
    
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }
    
    const formatTime = (time) => {
      return new Date(time).toLocaleString()
    }
    
    const handleUserAction = (command) => {
      if (command === 'logout') {
        ElMessageBox.confirm('确认要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('logout')
          router.push('/login')
        })
      }
    }
    
    onMounted(async () => {
      try {
        await store.dispatch('fetchConversations')
      } catch (error) {
        ElMessage.error('加载会话列表失败')
      }
    })
    
    return {
      inputMessage,
      sending,
      messagesContainer,
      user,
      conversations,
      currentConversation,
      messages,
      createNewConversation,
      selectConversation,
      sendMessage,
      formatTime,
      handleUserAction
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.list-header {
  padding: 15px 20px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.list-header h3 {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.conversation-item {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.conversation-item:hover {
  background: #f8f9fa;
}

.conversation-item.active {
  background: #e3f2fd;
}

.conversation-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-time {
  font-size: 12px;
  color: #999;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.user-info {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 10px;
  font-size: 14px;
  color: #333;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.welcome-content {
  max-width: 800px;
  text-align: left;
}

.welcome-content h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.welcome-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.category-section h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.6;
}

.info-box {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-box h4 {
  color: #333;
  line-height: 1.6;
  margin: 0;
}

.dinosaur-categories {
  margin-bottom: 30px;
}

.category {
  margin-bottom: 15px;
}

.category h4 {
  color: #1976d2;
  margin-bottom: 8px;
}

.action-hint {
  text-align: center;
  color: #999;
  font-size: 14px;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  display: flex;
  margin-bottom: 20px;
}

.message-avatar {
  margin-right: 12px;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  background: #1976d2;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 44px);
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  color: #333;
  line-height: 1.5;
  word-wrap: break-word;
}

.user-message .message-text {
  background: #1976d2;
  color: white;
  margin-left: auto;
  max-width: 70%;
}

.assistant-message .message-text {
  background: white;
  border: 1px solid #e0e0e0;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

.input-container {
  position: relative;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
