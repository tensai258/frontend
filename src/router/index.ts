import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { public: true, title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { public: true, title: '注册' }
    },
    {
      path: '/',
      component: () => import('@/layout/MainLayout.vue'),
      redirect: '/chat',
      children: [
        {
          path: 'chat',
          name: 'Chat',
          component: () => import('@/views/chat/ChatView.vue'),
          meta: { title: '智能答疑', icon: 'ChatDotRound' }
        },
        {
          path: 'assignments',
          name: 'Assignments',
          component: () => import('@/views/assignment/AssignmentView.vue'),
          meta: { title: '作业中心', icon: 'Document' }
        },
        {
          path: 'assignments/:id',
          name: 'AssignmentDetail',
          component: () => import('@/views/assignment/AssignmentDetail.vue'),
          meta: { title: '作业详情', hidden: true }
        },
        {
          path: 'analysis',
          name: 'Analysis',
          component: () => import('@/views/analysis/AnalysisView.vue'),
          meta: { title: '学情分析', icon: 'TrendCharts' },
          redirect: '/analysis/student',
          children: [
            {
              path: 'student',
              name: 'StudentAnalysis',
              component: () => import('@/views/analysis/StudentAnalysis.vue'),
              meta: { title: '个人分析' }
            },
            {
              path: 'class',
              name: 'ClassAnalysis',
              component: () => import('@/views/analysis/ClassAnalysis.vue'),
              meta: { title: '班级分析' }
            }
          ]
        },
        {
          path: 'admin',
          name: 'Admin',
          component: () => import('@/views/admin/AdminView.vue'),
          meta: { title: '管理后台', icon: 'Setting', requiresAdmin: true }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.title) {
    document.title = `${to.meta.title} - 智学伴行`
  }

  if (to.meta.public) {
    if (userStore.isLoggedIn) {
      next('/')
    } else {
      next()
    }
    return
  }

  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }

  if (to.meta.requiresAdmin && userStore.user?.role !== 'admin') {
    ElMessage.error('需要管理员权限')
    next('/')
    return
  }

  next()
})

export default router
