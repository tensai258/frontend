<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const { login, loading } = useAuth()

const formRef = ref<FormInstance>()
const form = reactive({ username: '', password: '' })

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) await login(form.username, form.password)
  })
}

const goRegister = () => router.push('/register')
</script>

<template>
  <div class="auth-page">
    <!-- Background decoration -->
    <div class="bg-decor">
      <div class="decor-circle decor-1"></div>
      <div class="decor-circle decor-2"></div>
      <div class="decor-circle decor-3"></div>
      <div class="decor-dots"></div>
    </div>

    <div class="auth-card">
      <!-- Left: Illustration & Brand -->
      <div class="auth-left">
        <div class="left-content">
          <div class="logo-area">
            <div class="logo-icon">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="10" width="48" height="38" rx="5" fill="#EEF2FF" stroke="#4F6EF7" stroke-width="2.5"/>
                <rect x="8" y="10" width="48" height="12" rx="5" fill="#4F6EF7"/>
                <rect x="8" y="17" width="48" height="5" fill="#4F6EF7"/>
                <circle cx="20" cy="30" r="6" fill="#DBE4FF" stroke="#4F6EF7" stroke-width="2"/>
                <path d="M17.5 30l2 2 3-3.5" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="32" y="26" width="16" height="3" rx="1.5" fill="#DBE4FF"/>
                <rect x="32" y="32" width="10" height="3" rx="1.5" fill="#DBE4FF"/>
              </svg>
            </div>
            <h1 class="brand-name">智学伴行</h1>
            <p class="brand-slogan">AI 智慧教育，让每一次学习都有回响</p>
          </div>

          <div class="feature-list">
            <div class="feature-card">
              <div class="fc-icon fc-icon-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <div class="fc-text">
                <strong>智能答疑</strong>
                <span>AI 实时解答学习疑问</span>
              </div>
            </div>
            <div class="feature-card">
              <div class="fc-icon fc-icon-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <div class="fc-text">
                <strong>作业管理</strong>
                <span>布置、提交、批改一体化</span>
              </div>
            </div>
            <div class="feature-card">
              <div class="fc-icon fc-icon-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div class="fc-text">
                <strong>学情分析</strong>
                <span>数据驱动精准学习建议</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Login Form -->
      <div class="auth-right">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>欢迎回来</h2>
            <p>登录你的账号继续学习</p>
          </div>

          <el-form ref="formRef" :model="form" :rules="rules" class="login-form" @keyup.enter="handleLogin">
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                size="large"
                class="custom-input"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                class="custom-input"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-btn"
                :loading="loading"
                @click="handleLogin"
              >
                <span v-if="!loading">登 录</span>
              </el-button>
            </el-form-item>
          </el-form>

          <div class="form-footer">
            <span>还没有账号？</span>
            <a class="form-link" @click="goRegister">立即注册</a>
          </div>

          <div class="demo-hint">
            <span class="demo-label">测试账号</span>
            <div class="demo-list">
              <code>student / student123</code>
              <code>teacher / teacher123</code>
              <code>admin / admin123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== Page ===== */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f8faff 0%, #eef1fb 40%, #f5f3ff 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

/* ===== Background Decor ===== */
.bg-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
}

.decor-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(79,110,247,0.06) 0%, transparent 70%);
  top: -15%; right: -8%;
}

.decor-2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%);
  bottom: -10%; left: -5%;
}

.decor-3 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
  top: 50%; left: 10%;
}

.decor-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(79,110,247,0.08) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* ===== Card ===== */
.auth-card {
  position: relative;
  z-index: 1;
  display: flex;
  width: 920px;
  min-height: 560px;
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 1px 3px rgba(0,0,0,0.04),
    0 8px 40px rgba(79,110,247,0.08),
    0 20px 80px rgba(0,0,0,0.06);
}

/* ===== Left Panel ===== */
.auth-left {
  flex: 1;
  background: linear-gradient(150deg, #f0f3ff 0%, #fafaff 60%, #f5f7ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.auth-left::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 15%;
  height: 70%;
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(79,110,247,0.08), transparent);
}

.left-content {
  padding: 48px 44px;
  max-width: 360px;
}

.logo-area {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(79,110,247,0.1);
}

.brand-name {
  font-size: 32px;
  font-weight: 800;
  color: #1e2140;
  margin: 0 0 8px;
  letter-spacing: 2px;
}

.brand-slogan {
  font-size: 13px;
  color: #8890b5;
  margin: 0;
  line-height: 1.6;
}

/* Feature cards */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(79,110,247,0.08);
}

.fc-icon {
  width: 42px; height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fc-icon svg {
  width: 22px; height: 22px;
}

.fc-icon-1 { background: #eef2ff; color: #4F6EF7; }
.fc-icon-2 { background: #fef7ed; color: #f59e0b; }
.fc-icon-3 { background: #ecfdf5; color: #10b981; }

.fc-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fc-text strong {
  font-size: 14px;
  color: #1e2140;
  font-weight: 600;
}

.fc-text span {
  font-size: 12px;
  color: #8890b5;
}

/* ===== Right Panel ===== */
.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 44px;
  background: #fff;
}

.form-wrapper {
  width: 100%;
  max-width: 340px;
}

.form-header {
  margin-bottom: 36px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1e2140;
  margin: 0 0 8px;
}

.form-header p {
  font-size: 14px;
  color: #8890b5;
  margin: 0;
}

/* ===== Form Elements ===== */
.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.custom-input :deep(.el-input__wrapper) {
  background: #f7f8fc;
  border: 1.5px solid transparent;
  border-radius: 12px;
  box-shadow: none;
  padding: 0 16px;
  transition: all 0.3s;
}

.custom-input :deep(.el-input__wrapper:hover) {
  background: #f0f2fa;
  border-color: #dde0f0;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  background: #fff;
  border-color: #4F6EF7;
  box-shadow: 0 0 0 3px rgba(79,110,247,0.08);
}

.custom-input :deep(.el-input__inner) {
  color: #1e2140;
  font-size: 15px;
  height: 50px;
}

.custom-input :deep(.el-input__inner::placeholder) {
  color: #b8bed9;
}

.custom-input :deep(.el-input__prefix) {
  color: #8890b5;
  margin-right: 8px;
}

.custom-input :deep(.el-input__suffix) {
  color: #8890b5;
}

/* Login button */
.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  border: none;
  background: #4F6EF7;
  color: #fff;
  transition: all 0.3s;
  margin-top: 4px;
}

.login-btn:hover {
  background: #3d5cf0;
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(79,110,247,0.3);
}

.login-btn:active {
  transform: translateY(0);
}

/* Footer */
.form-footer {
  margin-top: 28px;
  text-align: center;
  font-size: 14px;
  color: #8890b5;
}

.form-link {
  color: #4F6EF7;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.form-link:hover {
  color: #3d5cf0;
}

/* Demo accounts */
.demo-hint {
  margin-top: 32px;
  padding-top: 22px;
  border-top: 1px solid #f0f2fa;
}

.demo-label {
  font-size: 11px;
  color: #b8bed9;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 8px;
}

.demo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.demo-list code {
  font-size: 12px;
  color: #8890b5;
  background: #f7f8fc;
  padding: 5px 10px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
}

/* ===== Responsive ===== */
@media (max-width: 800px) {
  .auth-card {
    flex-direction: column;
    width: 100%;
    max-width: 420px;
    min-height: auto;
  }

  .auth-left {
    padding: 40px 28px 20px;
  }

  .auth-left::after {
    right: auto;
    bottom: -1px;
    top: auto;
    left: 15%;
    width: 70%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(79,110,247,0.08), transparent);
  }

  .left-content {
    padding: 0;
  }

  .feature-list {
    flex-direction: row;
    gap: 8px;
  }

  .feature-card {
    flex: 1;
    flex-direction: column;
    text-align: center;
    gap: 8px;
    padding: 12px 8px;
  }

  .fc-text strong { font-size: 12px; }
  .fc-text span { display: none; }

  .auth-right {
    padding: 32px 28px;
  }

  .brand-name { font-size: 24px; }
  .logo-area { margin-bottom: 24px; }
  .logo-icon { width: 56px; height: 56px; border-radius: 16px; }
}
</style>
