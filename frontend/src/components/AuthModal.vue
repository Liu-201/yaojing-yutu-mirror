<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <button class="close-btn" @click="close">✕</button>

      <!-- 密码登录 / 验证码登录 选项卡（仅登录模式显示） -->
      <div class="tabs" v-if="mode === 'login'">
        <button :class="['tab', { active: loginType === 'password' }]" @click="loginType = 'password'">密码登录</button>
        <button :class="['tab', { active: loginType === 'sms' }]" @click="loginType = 'sms'">验证码登录</button>
      </div>

      <!-- 登录表单（密码登录） -->
      <form v-if="mode === 'login' && loginType === 'password'" @submit.prevent="handlePasswordLogin">
        <div class="form-group">
          <label>手机号</label>
          <input type="tel" v-model="loginForm.phone" placeholder="请输入手机号" required />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" v-model="loginForm.password" placeholder="请输入密码" required />
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="submit-btn">登录</button>
        <div class="form-footer">
          <a href="#" @click.prevent="switchMode('register')">立即注册</a>
          <a href="#" @click.prevent="switchMode('forgot')">忘记密码？</a>
        </div>
      </form>

      <!-- 登录表单（验证码登录） -->
      <form v-if="mode === 'login' && loginType === 'sms'" @submit.prevent="handleSmsLogin">
        <div class="form-group">
          <label>手机号</label>
          <input type="tel" v-model="smsForm.phone" placeholder="请输入手机号" required />
        </div>
        <div class="form-group">
          <label>验证码</label>
          <div class="sms-code-row">
            <input type="text" v-model="smsForm.code" placeholder="请输入验证码" required />
            <button type="button" class="send-code-btn" :disabled="smsCountdown > 0" @click="sendSmsCode">
              {{ smsCountdown > 0 ? `${smsCountdown}秒后重试` : '发送验证码' }}
            </button>
          </div>
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="submit-btn">登录</button>
        <div class="form-footer">
          <a href="#" @click.prevent="switchMode('register')">立即注册</a>
          <a href="#" @click.prevent="switchMode('forgot')">忘记密码？</a>
        </div>
      </form>

      <!-- 注册表单 -->
      <form v-if="mode === 'register'" @submit.prevent="handleRegister">
        <div class="form-group">
          <label>用户名</label>
          <input type="text" v-model="registerForm.username" placeholder="请输入用户名" required />
        </div>
        <div class="form-group">
          <label>手机号</label>
          <input type="tel" v-model="registerForm.phone" placeholder="请输入手机号" required />
        </div>
        <div class="form-group">
          <label>验证码</label>
          <div class="sms-code-row">
            <input type="text" v-model="registerForm.code" placeholder="请输入验证码" required />
            <button type="button" class="send-code-btn" :disabled="registerCountdown > 0" @click="sendRegisterCode">
              {{ registerCountdown > 0 ? `${registerCountdown}秒后重试` : '发送验证码' }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" v-model="registerForm.password" placeholder="请输入密码" required />
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input type="password" v-model="registerForm.confirmPassword" placeholder="请再次输入密码" required />
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="submit-btn">注册</button>
        <div class="form-footer">
          <a href="#" @click.prevent="switchMode('login')">已有账号？去登录</a>
        </div>
      </form>

      <!-- 忘记密码表单 -->
      <form v-if="mode === 'forgot'" @submit.prevent="handleForgot">
        <div class="form-group">
          <label>手机号</label>
          <input type="tel" v-model="forgotForm.phone" placeholder="请输入注册手机号" required />
        </div>
        <div class="form-group">
          <label>验证码</label>
          <div class="sms-code-row">
            <input type="text" v-model="forgotForm.code" placeholder="请输入验证码" required />
            <button type="button" class="send-code-btn" :disabled="forgotCountdown > 0" @click="sendForgotCode">
              {{ forgotCountdown > 0 ? `${forgotCountdown}秒后重试` : '发送验证码' }}
            </button>
          </div>
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="submit-btn">验证</button>
        <div class="form-footer">
          <a href="#" @click.prevent="switchMode('login')">返回登录</a>
        </div>
      </form>

      <!-- 重置密码表单（验证手机号成功后显示） -->
      <form v-if="mode === 'resetPassword'" @submit.prevent="handleResetPassword">
        <div class="form-group">
          <label>新密码</label>
          <input type="password" v-model="resetForm.newPassword" placeholder="请输入新密码" required />
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input type="password" v-model="resetForm.confirmPassword" placeholder="请再次输入新密码" required />
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="submit-btn">重置密码</button>
        <div class="form-footer">
          <a href="#" @click.prevent="switchMode('login')">返回登录</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'

const props = defineProps(['visible'])
const emit = defineEmits(['update:visible', 'success'])

const userStore = useUserStore()
const toastStore = useToastStore()

// 模式：login, register, forgot, resetPassword
const mode = ref('login')
const loginType = ref('password') // password 或 sms

// 表单数据
const loginForm = ref({ phone: '', password: '' })
const smsForm = ref({ phone: '', code: '' })
const registerForm = ref({ username: '', phone: '', code: '', password: '', confirmPassword: '' })
const forgotForm = ref({ phone: '', code: '' })
const resetForm = ref({ newPassword: '', confirmPassword: '' })

const errorMsg = ref('')

// 倒计时
const smsCountdown = ref(0)
const registerCountdown = ref(0)
const forgotCountdown = ref(0)
let timer = null

// 模拟发送验证码（演示用，实际应调用后端接口）
const sendMockCode = async (phone) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const mockCode = '123456'
  toastStore.addToast(`验证码：${mockCode}（演示用）`, 'info', 3000)
  return true
}

const startCountdown = (type) => {
  let countdownRef
  if (type === 'sms') countdownRef = smsCountdown
  else if (type === 'register') countdownRef = registerCountdown
  else if (type === 'forgot') countdownRef = forgotCountdown
  else return

  if (countdownRef.value > 0) return
  countdownRef.value = 60
  const interval = setInterval(() => {
    if (countdownRef.value <= 1) {
      clearInterval(interval)
      countdownRef.value = 0
    } else {
      countdownRef.value--
    }
  }, 1000)
}

const sendSmsCode = async () => {
  if (!smsForm.value.phone) {
    errorMsg.value = '请输入手机号'
    return
  }
  await sendMockCode(smsForm.value.phone)
  startCountdown('sms')
}

const sendRegisterCode = async () => {
  if (!registerForm.value.phone) {
    errorMsg.value = '请输入手机号'
    return
  }
  await sendMockCode(registerForm.value.phone)
  startCountdown('register')
}

const sendForgotCode = async () => {
  if (!forgotForm.value.phone) {
    errorMsg.value = '请输入手机号'
    return
  }
  await sendMockCode(forgotForm.value.phone)
  startCountdown('forgot')
}

// 密码登录
const handlePasswordLogin = async () => {
  errorMsg.value = ''
  const res = await userStore.login(loginForm.value.phone, loginForm.value.password, 'password')
  if (res.success) {
    emit('update:visible', false)
    emit('success')
    toastStore.addToast('登录成功', 'success', 2000)
  } else {
    errorMsg.value = res.message
  }
}

// 验证码登录
const handleSmsLogin = async () => {
  errorMsg.value = ''
  const res = await userStore.login(smsForm.value.phone, smsForm.value.code, 'sms')
  if (res.success) {
    emit('update:visible', false)
    emit('success')
    toastStore.addToast('登录成功', 'success', 2000)
  } else {
    errorMsg.value = res.message
  }
}

// 注册
const handleRegister = async () => {
  errorMsg.value = ''
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }
  const res = await userStore.register({
    username: registerForm.value.username,
    phone: registerForm.value.phone,
    password: registerForm.value.password,
    code: registerForm.value.code
  })
  if (res.success) {
    emit('update:visible', false)
    emit('success')
    toastStore.addToast('注册成功，已自动登录', 'success', 2000)
  } else {
    errorMsg.value = res.message
  }
}

// 忘记密码 - 验证手机号（调用 userStore 的异步方法）
const handleForgot = async () => {
  errorMsg.value = ''
  const exists = await userStore.checkPhoneExists(forgotForm.value.phone)
  if (!exists) {
    errorMsg.value = '该手机号未注册'
    return
  }
  // 验证码简单校验（演示固定为 123456）
  if (forgotForm.value.code !== '123456') {
    errorMsg.value = '验证码错误'
    return
  }
  // 验证通过，切换到重置密码模式
  mode.value = 'resetPassword'
}

// 重置密码
const handleResetPassword = async () => {
  errorMsg.value = ''
  if (resetForm.value.newPassword !== resetForm.value.confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }
  const res = await userStore.resetPassword(forgotForm.value.phone, resetForm.value.newPassword)
  if (res.success) {
    toastStore.addToast('密码重置成功，请重新登录', 'success', 2000)
    mode.value = 'login'
    loginForm.value = { phone: '', password: '' }
    forgotForm.value = { phone: '', code: '' }
    resetForm.value = { newPassword: '', confirmPassword: '' }
  } else {
    errorMsg.value = res.message
  }
}

const switchMode = (newMode) => {
  mode.value = newMode
  errorMsg.value = ''
  if (newMode === 'login') {
    loginType.value = 'password'
  }
}

const close = () => {
  emit('update:visible', false)
  // 重置表单和模式
  mode.value = 'login'
  loginType.value = 'password'
  errorMsg.value = ''
  loginForm.value = { phone: '', password: '' }
  smsForm.value = { phone: '', code: '' }
  registerForm.value = { username: '', phone: '', code: '', password: '', confirmPassword: '' }
  forgotForm.value = { phone: '', code: '' }
  resetForm.value = { newPassword: '', confirmPassword: '' }
}

watch(() => props.visible, (val) => {
  if (!val) {
    close()
  }
})
</script>

<style scoped>
/* 样式与原代码完全相同，此处省略重复内容，请保留原有样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-container {
  background: var(--bg-panel);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-xl);
  width: 400px;
  max-width: 90%;
  padding: var(--space-6);
  position: relative;
  box-shadow: 0 20px 35px rgba(0,0,0,0.5);
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 20px;
  color: var(--text-tertiary);
  cursor: pointer;
}
.tabs {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}
.tab {
  background: transparent;
  border: none;
  padding: 8px 0;
  font-size: 16px;
  font-weight: 510;
  color: var(--text-tertiary);
  cursor: pointer;
}
.tab.active {
  color: var(--text-primary);
  border-bottom: 2px solid var(--brand-indigo);
}
.form-group {
  margin-bottom: var(--space-4);
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 510;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.form-group input {
  width: 100%;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
}
.form-group input:focus {
  outline: none;
  border-color: var(--brand-accent);
}
.sms-code-row {
  display: flex;
  gap: 12px;
}
.sms-code-row input {
  flex: 1;
}
.send-code-btn {
  background: var(--brand-indigo);
  border: none;
  border-radius: var(--radius-md);
  padding: 0 12px;
  font-size: 13px;
  color: white;
  cursor: pointer;
  white-space: nowrap;
}
.send-code-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error-message {
  background: rgba(255,70,70,0.1);
  border: 1px solid #ff4646;
  border-radius: var(--radius-md);
  padding: 8px;
  font-size: 12px;
  color: #ff7a7a;
  margin-bottom: var(--space-4);
}
.submit-btn {
  width: 100%;
  background: var(--brand-indigo);
  border: none;
  border-radius: var(--radius-md);
  padding: 10px;
  font-size: 14px;
  font-weight: 510;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}
.submit-btn:hover {
  background: var(--brand-hover);
}
.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-4);
}
.form-footer a {
  color: var(--brand-accent);
  font-size: 12px;
  text-decoration: none;
}
.form-footer a:hover {
  text-decoration: underline;
}
</style>