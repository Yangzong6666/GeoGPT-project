import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Chat from '../views/Chat.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    redirect: '/chat'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
