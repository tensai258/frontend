<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const { register, loading } = useAuth()

const formRef = ref<FormInstance>()
const form = reactive({
  username: '', password: '', confirmPassword: '',
  nickname: '', email: '', role: 'student'
})

const validatePass2 = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
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
  confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  role: [{ required: true, message: '请选择身份', trigger: 'change' }]
}

const handleRegister = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) await register(form)
  })
}

const goLogin = () => router.push('/login')
</script>

<template>
  <div class="auth-page">
    <div class="bg-decor">
      <div class="decor-circle decor-1"></div>
      <div class="decor-circle decor-2"></div>
      <div class="decor-dots"></div>
    </div>

    <div class="auth-card">
      <div class="auth-left">
        <div class="left-content">
          <div class="logo-area">
            <div class="logo-icon">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="10" width="48" height="38" rx="5" fill="#EEF2FF" stroke="#4F6EF7" stroke-width="2.5"/>
                <rect x="8" y="10" width="48" height="12" rx="5" fill="#4F6EF7"/>
                <rect x="8" y="17" width="48" height="5" fill="#4F6EF7"/>
                <circle cx="24" cy="31" r="8" fill="#DBE4FF" stroke="#4F6EF7" stroke-width="2"/>
                <path d="M21 31h6M24 28v6" stroke="#4F6EF7" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h1 class="brand-name">智学伴行</h1>
            <p class="brand-slogan">加入我们，开启智能学习之旅</p>
          </div>

          <div class="reg-illustration">
            <div class="illus-step">
              <span class="step-num">1</span>
              <span class="step-text">创建你的专属学习账号</span>
            </div>
            <div class="illus-step">
              <span class="step-num">2</span>
              <span class="step-text">选择身份：学生或教师</span>
            </div>
            <div class="illus-step">
              <span class="step-num">3</span>
              <span class="step-text">开始体验 AI 智能学习</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>创建账号</h2>
            <p>注册后即可使用全部功能</p>
          </div>

          <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
            <div class="form-row-2">
              <el-form-item prop="username">
                <el-input v-model="form.username" placeholder="用户名" size="large" class="custom-input">
                  <template #prefix><el-icon><User /></el-icon></template>
                </el-input>
              </el-form-item>
              <el-form-item prop="nickname">
                <el-input v-model="form.nickname" placeholder="昵称" size="large" class="custom-input">
                  <template #prefix><el-icon><Avatar /></el-icon></template>
                </el-input>
              </el-form-item>
            </div>

            <el-form-item prop="email">
              <el-input v-model="form.email" placeholder="邮箱" size="large" class="custom-input">
                <template #prefix><el-icon><Message /></el-icon></template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password class="custom-input">
                <template #prefix><el-icon><Lock /></el-icon></template>
              </el-input>
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" size="large" show-password class="custom-input">
                <template #prefix><el-icon><Lock /></el-icon></template>
              </el-input>
            </el-form-item>

            <el-form-item prop="role">
              <el-radio-group v-model="form.role" size="large" class="role-group">
                <el-radio-button label="student">学生</el-radio-button>
                <el-radio-button label="teacher">教师</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleRegister">
                <span v-if="!loading">注 册</span>
              </el-button>
            </el-form-item>
          </el-form>

          <div class="form-footer">
            <span>已有账号？</span>
            <a class="form-link" @click="goLogin">立即登录</a>
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
  background: linear-gradient(160deg, #f8faff 0%, #eef1fb 40%, #f5f3ff 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.bg-decor { position: absolute; inset: 0; pointer-events: none; }
.decor-circle { position: absolute; border-radius: 50%; opacity: 0.5; }
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
.decor-dots {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(79,110,247,0.08) 1px, transparent 1px);
  background-size: 40px 40px;
}

.auth-card {
  position: relative; z-index: 1;
  display: flex; width: 920px; min-height: 620px;
  background: #fff; border-radius: 24px; overflow: hidden;
  box-shadow:
    0 1px 3px rgba(0,0,0,0.04),
    0 8px 40px rgba(79,110,247,0.08),
    0 20px 80px rgba(0,0,0,0.06);
}

.auth-left {
  flex: 1;
  background: linear-gradient(150deg, #f0f3ff 0%, #fafaff 60%, #f5f7ff 100%);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
.auth-left::after {
  content: ''; position: absolute;
  right: -1px; top: 15%; height: 70%; width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(79,110,247,0.08), transparent);
}
.left-content { padding: 48px 44px; max-width: 360px; }

.logo-area { text-align: center; margin-bottom: 36px; }
.logo-icon {
  width: 72px; height: 72px; margin: 0 auto 20px;
  display: flex; align-items: center; justify-content: center;
  background: #fff; border-radius: 20px;
  box-shadow: 0 4px 20px rgba(79,110,247,0.1);
}
.brand-name {
  font-size: 32px; font-weight: 800; color: #1e2140;
  margin: 0 0 8px; letter-spacing: 2px;
}
.brand-slogan { font-size: 13px; color: #8890b5; margin: 0; }

.reg-illustration {
  display: flex; flex-direction: column; gap: 16px;
}
.illus-step {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 18px; background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
.step-num {
  width: 30px; height: 30px;
  background: #4F6EF7; color: #fff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700;
  flex-shrink: 0;
}
.step-text { font-size: 14px; color: #1e2140; font-weight: 500; }

.auth-right {
  flex: 1; display: flex; align-items: center; justify-content: center;
  padding: 48px 44px; background: #fff;
}
.form-wrapper { width: 100%; max-width: 360px; }
.form-header { margin-bottom: 32px; }
.form-header h2 { font-size: 28px; font-weight: 700; color: #1e2140; margin: 0 0 8px; }
.form-header p { font-size: 14px; color: #8890b5; margin: 0; }

.form-row-2 { display: flex; gap: 12px; }
.form-row-2 :deep(.el-form-item) { flex: 1; }

.login-form :deep(.el-form-item) { margin-bottom: 18px; }

.custom-input :deep(.el-input__wrapper) {
  background: #f7f8fc; border: 1.5px solid transparent;
  border-radius: 12px; box-shadow: none;
  padding: 0 14px; transition: all 0.3s;
}
.custom-input :deep(.el-input__wrapper:hover) {
  background: #f0f2fa; border-color: #dde0f0;
}
.custom-input :deep(.el-input__wrapper.is-focus) {
  background: #fff; border-color: #4F6EF7;
  box-shadow: 0 0 0 3px rgba(79,110,247,0.08);
}
.custom-input :deep(.el-input__inner) { color: #1e2140; font-size: 14px; height: 46px; }
.custom-input :deep(.el-input__inner::placeholder) { color: #b8bed9; }
.custom-input :deep(.el-input__prefix) { color: #8890b5; margin-right: 6px; }

.role-group { width: 100%; display: flex; }
.role-group :deep(.el-radio-button) { flex: 1; }
.role-group :deep(.el-radio-button__inner) {
  width: 100%; background: #f7f8fc; border-color: transparent;
  color: #8890b5; border-radius: 10px; padding: 10px 0;
}
.role-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #eef2ff; border-color: #4F6EF7; color: #4F6EF7; box-shadow: none;
}

.login-btn {
  width: 100%; height: 50px; border-radius: 12px;
  font-size: 16px; font-weight: 600; letter-spacing: 4px;
  border: none; background: #4F6EF7; color: #fff;
  transition: all 0.3s; margin-top: 8px;
}
.login-btn:hover {
  background: #3d5cf0; transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(79,110,247,0.3);
}

.form-footer { margin-top: 24px; text-align: center; font-size: 14px; color: #8890b5; }
.form-link { color: #4F6EF7; cursor: pointer; margin-left: 4px; font-weight: 600; text-decoration: none; }
.form-link:hover { color: #3d5cf0; }

@media (max-width: 800px) {
  .auth-card { flex-direction: column; width: 100%; max-width: 420px; min-height: auto; }
  .auth-left { padding: 36px 28px 16px; }
  .auth-left::after {
    right: auto; bottom: -1px; top: auto; left: 15%; width: 70%; height: 1px;
    background: linear-gradient(to right, transparent, rgba(79,110,247,0.08), transparent);
  }
  .left-content { padding: 0; }
  .reg-illustration { flex-direction: row; gap: 6px; }
  .illus-step { flex-direction: column; text-align: center; gap: 6px; flex: 1; padding: 10px 6px; }
  .step-text { font-size: 11px; }
  .brand-name { font-size: 24px; }
  .logo-icon { width: 56px; height: 56px; border-radius: 16px; }
  .auth-right { padding: 28px 24px; }
}
</style>
