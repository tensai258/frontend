<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const { register, loading } = useAuth()

const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  email: '',
  role: 'student'
})

const validatePass2 = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择身份', trigger: 'change' }
  ]
}

const handleRegister = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      await register(form)
    }
  })
}

const goLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <div class="brand">
          <el-icon :size="48" color="#409EFF"><School /></el-icon>
          <h1 class="brand-title">智学伴行</h1>
          <p class="brand-desc">AI智能教育平台，让学习更高效</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <el-icon :size="24" color="#409EFF"><ChatDotRound /></el-icon>
            <span>智能答疑</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#409EFF"><Document /></el-icon>
            <span>作业管理</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24" color="#409EFF"><TrendCharts /></el-icon>
            <span>学情分析</span>
          </div>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-box">
          <h2 class="auth-title">创建账号</h2>
          <p class="auth-subtitle">注册开始使用智学伴行</p>
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            class="auth-form"
          >
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="用户名"
                :prefix-icon="'User'"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="nickname">
              <el-input
                v-model="form.nickname"
                placeholder="昵称"
                :prefix-icon="'Avatar'"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="email">
              <el-input
                v-model="form.email"
                placeholder="邮箱"
                :prefix-icon="'Message'"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                :prefix-icon="'Lock'"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="form.confirmPassword"
                type="password"
                placeholder="确认密码"
                :prefix-icon="'Lock'"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item prop="role">
              <el-radio-group v-model="form.role" size="large">
                <el-radio-button label="student">学生</el-radio-button>
                <el-radio-button label="teacher">教师</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="auth-btn"
                :loading="loading"
                @click="handleRegister"
              >
                注 册
              </el-button>
            </el-form-item>
          </el-form>
          <div class="auth-footer">
            <span>已有账号？</span>
            <el-link type="primary" @click="goLogin">立即登录</el-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-container {
  display: flex;
  width: 900px;
  min-height: 500px;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.auth-left {
  flex: 1;
  background: linear-gradient(135deg, #409EFF 0%, #5B8FF9 100%);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: #fff;
}

.brand {
  text-align: center;
  margin-bottom: 60px;
}

.brand-title {
  font-size: 32px;
  margin: 16px 0 8px;
}

.brand-desc {
  font-size: 16px;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow-y: auto;
  max-height: 100vh;
}

.auth-box {
  width: 100%;
  max-width: 320px;
}

.auth-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.auth-subtitle {
  font-size: 14px;
  color: #909399;
  margin-bottom: 32px;
}

.auth-form {
  :deep(.el-input__inner) {
    height: 44px;
  }
  :deep(.el-radio-group) {
    width: 100%;
    display: flex;
  }
  :deep(.el-radio-button) {
    flex: 1;
  }
  :deep(.el-radio-button__inner) {
    width: 100%;
  }
}

.auth-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    width: 100%;
    max-width: 400px;
  }
  .auth-left {
    padding: 30px;
  }
  .brand {
    margin-bottom: 24px;
  }
  .features {
    display: none;
  }
}
</style>
