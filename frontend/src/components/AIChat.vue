<template>
  <div class="ai-chat-container">
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
        <div class="message-avatar">
          {{ msg.role === 'user' ? (userStore.currentUser?.nickname?.charAt(0) || '👤') : '🌿' }}
        </div>
        <div class="message-content">
          <div class="message-name">{{ msg.role === 'user' ? displayName : '药境小智' }}</div>
          <div class="message-text" v-html="msg.content"></div>
          <div v-if="msg.refs && msg.refs.length" class="message-refs">
            <span>参考：</span>
            <a v-for="ref in msg.refs" :key="ref" href="#" @click.prevent="openRef(ref)">{{ ref }}</a>
          </div>
        </div>
      </div>
      <div v-if="isTyping" class="message assistant">
        <div class="message-avatar">🌿</div>
        <div class="message-content">
          <div class="message-name">药境小智</div>
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-input-area">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        @keydown="handleKeydown"
        placeholder="问点什么吧，例如：党参的主要功效？"
        rows="2"
      ></textarea>
      <button @click="sendMessage" :disabled="isTyping || !inputText.trim()">
        发送
      </button>
    </div>
    <div class="disclaimer">
      * AI 回答仅供参考，不构成医疗建议。如有身体不适请咨询专业医师。
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useToastStore } from '@/stores/toastStore'
import api from '@/utils/api'

const userStore = useUserStore()
const toastStore = useToastStore()
const textareaRef = ref(null)

// 显示名称：登录用户用昵称，否则用“访客”
const displayName = computed(() => {
  if (userStore.isLoggedIn && userStore.currentUser?.nickname) {
    return userStore.currentUser.nickname
  }
  return '访客'
})

const messages = ref([
  {
    role: 'assistant',
    content: '你好呀！我是药境小智，可以问我任何关于中药材的问题，比如产地、功效、用法、历史典故等～' + (userStore.isLoggedIn ? '' : ' 登录后可以保存问答记录哦。'),
    refs: []
  }
])
const inputText = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

// 调用后端 AI 接口
async function callBackendAPI(question) {
  try {
    const res = await api.post('/ai/chat', { question })
    return {
      answer: res.answer || '抱歉，我暂时无法回答这个问题。',
      refs: res.refs || []
    }
  } catch (err) {
    console.error('AI 接口调用失败', err)
    toastStore.addToast('AI 服务暂时不可用，请稍后再试', 'error', 3000)
    return {
      answer: '网络开小差了，请稍后再试～',
      refs: []
    }
  }
}

// 键盘处理：回车键换行（不发送），只有点击发送按钮才发送
function handleKeydown(e) {
  if (e.key === !e.shiftKey) {
    e.preventDefault()
    const textarea = textareaRef.value
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = inputText.value
    inputText.value = value.substring(0, start) + '\n' + value.substring(end)
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 1
    })
  }
}

async function sendMessage() {
  const q = inputText.value.trim()
  if (!q || isTyping.value) return
  messages.value.push({
    role: 'user',
    content: q,
    refs: []
  })
  inputText.value = ''
  await nextTick()
  scrollToBottom()

  isTyping.value = true
  try {
    const res = await callBackendAPI(q)
    messages.value.push({
      role: 'assistant',
      content: res.answer,
      refs: res.refs || []
    })
    // 仅在登录时保存问答记录
    if (userStore.isLoggedIn) {
      await userStore.addQaRecord(q, res.answer, res.refs)
    }
    toastStore.addToast('回答已生成', 'success', 2000)
  } catch (err) {
    toastStore.addToast('处理失败，请重试', 'error', 3000)
  } finally {
    isTyping.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function openRef(ref) {
  toastStore.addToast(`参考来源：${ref}`, 'info', 2000)
}
</script>

<style scoped>
/* 样式保持不变，与原代码相同 */
.ai-chat-container {
  background: var(--bg-panel);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-standard);
  display: flex;
  flex-direction: column;
  height: 600px;
  overflow: hidden;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.message {
  display: flex;
  gap: var(--space-3);
  max-width: 85%;
}
.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
  text-align: right;
}
.message-avatar {
  width: 32px;
  height: 32px;
  background: var(--bg-surface);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 1px solid var(--border-standard);
  flex-shrink: 0;
}
.message.user .message-avatar {
  background: var(--brand-indigo);
  border: none;
}
.message-content {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-subtle);
  max-width: 100%;
}
.message.user .message-content {
  background: var(--brand-indigo);
  border-color: var(--brand-indigo);
}
.message-name {
  font-size: 12px;
  font-weight: 510;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.message.user .message-name {
  color: rgba(255,255,255,0.8);
  text-align: right;
}
.message-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  text-align: left;
}
.message.user .message-text {
  color: white;
  text-align: left;
}
.message-refs {
  margin-top: var(--space-2);
  font-size: 11px;
  color: var(--text-tertiary);
}
.message-refs a {
  color: var(--brand-accent);
  margin-left: 8px;
  text-decoration: underline;
  cursor: pointer;
}
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}
.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: blink 1.4s infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 60%, 100% { opacity: 0.4; transform: scale(1); }
  30% { opacity: 1; transform: scale(1.2); }
}
.chat-input-area {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-panel);
}
.chat-input-area textarea {
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
  resize: none;
}
.chat-input-area textarea:focus {
  outline: none;
  border-color: var(--brand-accent);
}
.chat-input-area button {
  background: var(--brand-indigo);
  border: none;
  border-radius: var(--radius-md);
  padding: 0 20px;
  color: white;
  font-weight: 510;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-input-area button:hover:not(:disabled) {
  background: var(--brand-hover);
}
.chat-input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.disclaimer {
  text-align: center;
  font-size: 11px;
  color: var(--text-quaternary);
  padding: var(--space-2) var(--space-4) var(--space-4);
}
</style>