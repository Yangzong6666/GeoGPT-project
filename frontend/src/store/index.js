import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    conversations: [],
    currentConversation: null,
    messages: []
  },
  
  getters: {
    isLoggedIn: state => !!state.token,
    currentUser: state => state.user,
    getConversations: state => state.conversations,
    getCurrentConversation: state => state.currentConversation,
    getMessages: state => state.messages
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
    
    SET_CONVERSATIONS(state, conversations) {
      state.conversations = conversations
    },
    
    ADD_CONVERSATION(state, conversation) {
      state.conversations.unshift(conversation)
    },
    
    SET_CURRENT_CONVERSATION(state, conversation) {
      state.currentConversation = conversation
    },
    
    SET_MESSAGES(state, messages) {
      state.messages = messages
    },
    
    ADD_MESSAGE(state, message) {
      state.messages.push(message)
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post('/api/auth/login', credentials)
        const { user, token } = response.data
        
        commit('SET_USER', user)
        commit('SET_TOKEN', token)
        
        return response.data
      } catch (error) {
        throw error
      }
    },
    
    async register({ commit }, userData) {
      try {
        const response = await axios.post('/api/auth/register', userData)
        const { user, token } = response.data
        
        commit('SET_USER', user)
        commit('SET_TOKEN', token)
        
        return response.data
      } catch (error) {
        throw error
      }
    },
    
    logout({ commit }) {
      commit('CLEAR_AUTH')
    },
    
    async fetchConversations({ commit }) {
      try {
        const response = await axios.get('/api/conversations')
        commit('SET_CONVERSATIONS', response.data)
        return response.data
      } catch (error) {
        throw error
      }
    },
    
    async createConversation({ commit }, title) {
      try {
        const response = await axios.post('/api/conversations', { title })
        commit('ADD_CONVERSATION', response.data)
        return response.data
      } catch (error) {
        throw error
      }
    },
    
    async fetchMessages({ commit }, conversationId) {
      try {
        const response = await axios.get(`/api/conversations/${conversationId}/messages`)
        commit('SET_MESSAGES', response.data)
        return response.data
      } catch (error) {
        throw error
      }
    },
    
    async sendMessage({ commit }, { conversationId, content }) {
      try {
        const response = await axios.post(`/api/conversations/${conversationId}/messages`, {
          content
        })
        commit('ADD_MESSAGE', response.data)
        return response.data
      } catch (error) {
        throw error
      }
    }
  }
})
