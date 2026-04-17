<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <button class="close-btn" @click="close">✕</button>
      <div class="tabs">
        <button :class="['tab', { active: mode === 'login' }]" @click="mode = 'login'">登录</button>
        <button :class="['tab', { active: mode === 'register' }]" @click="mode = 'register'">注册</button>
      </div>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>用户名</label>
          <input type="text" v-model="form.username" placeholder="请输入用户名" required />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input type="password" v-model="form.password" placeholder="请输入密码" required />
        </div>
        <div class="form-group" v-if="mode === 'register'">
          <label>昵称（可选）</label>
          <input type="text" v-model="form.nickname" placeholder="昵称" />
        </div>
        <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
        <button type="submit" class="submit-btn">{{ mode === 'login' ? '登录' : '注册' }}</button>
        <div class="demo-tip" v-if="mode === 'login'">
          测试账号：testuser / 123456
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'

const props = defineProps(['visible'])
const emit = defineEmits(['update:visible', 'success'])
const userStore = useUserStore()

const mode = ref('login')
const form = ref({ username: '', password: '', nickname: '' })
const errorMsg = ref('')

async function handleSubmit() {
  errorMsg.value = ''
  if (mode.value === 'login') {
    const res = await userStore.login(form.value.username, form.value.password)
    if (res.success) {
      emit('update:visible', false)
      emit('success')
    } else {
      errorMsg.value = res.message
    }
  } else {
    const res = await userStore.register(form.value.username, form.value.password, form.value.nickname)
    if (res.success) {
      emit('update:visible', false)
      emit('success')
    } else {
      errorMsg.value = res.message
    }
  }
}

function close() {
  emit('update:visible', false)
}
</script>

<style scoped>
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
  margin: auto;
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
  padding: 0;
}
.close-btn:hover {
  color: var(--text-primary);
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
.demo-tip {
  text-align: center;
  font-size: 12px;
  color: var(--text-quaternary);
  margin-top: var(--space-4);
}
</style>