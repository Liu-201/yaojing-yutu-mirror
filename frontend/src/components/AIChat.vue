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
    content: '你好呀！我是药境小智，可以问我任何关于中药材的问题，比如产地、功效、用法、历史典故等～',
    refs: []
  }
])
const inputText = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

// 模拟后端 API（后续可替换为真实请求）
async function callMockAPI(question) {
  await new Promise(resolve => setTimeout(resolve, 800))
  const lowerQ = question.toLowerCase()
  if (lowerQ.includes('党参') && lowerQ.includes('功效')) {
    return {
      answer: '党参，性平，味甘。主要功效为：<strong>补中益气、健脾益肺</strong>。常用于脾肺气虚、食少倦怠、咳嗽虚喘、气血不足等症状。现代研究表明，党参具有增强免疫力、抗疲劳、调节血压等作用。',
      refs: ['《中国药典》2020年版', '《中药学》教材']
    }
  } else if (lowerQ.includes('黄芪') && lowerQ.includes('产地')) {
    return {
      answer: '黄芪的道地产区主要在<strong>山西、甘肃、内蒙古</strong>。其中山西浑源、甘肃陇西所产黄芪品质最佳，被称为“黄芪之乡”。',
      refs: ['《中药材生产区划》', '中国道地药材']
    }
  } else if (lowerQ.includes('人参') && lowerQ.includes('故事')) {
    return {
      answer: '人参的故事可多了～《神农本草经》将其列为上品，称其“主补五脏，安精神，定魂魄”。民间传说人参有灵性，千年人参会变成穿红肚兜的小娃娃，所以挖参人要用红绳绑住参苗，防止它“逃跑”。',
      refs: ['《本草纲目》', '中国民间故事']
    }
  } else {
    return {
      answer: `关于“${question}”，我暂时还没学习到足够的信息。你可以试试问“党参的功效”、“黄芪的产地”、“人参的故事”等～`,
      refs: []
    }
  }
}

// 键盘处理：回车键换行（不发送），只有点击发送按钮才发送
function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
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
    const res = await callMockAPI(q)
    messages.value.push({
      role: 'assistant',
      content: res.answer,
      refs: res.refs || []
    })
    if (userStore.isLoggedIn) {
      userStore.addQaRecord(q, res.answer, res.refs)
    }
    toastStore.addToast('回答已生成', 'success', 2000)
  } catch (err) {
    toastStore.addToast('网络开小差了，请重试', 'error', 3000)
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
  text-align: right; /* 用户消息整体右对齐 */
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
  text-align: right; /* 用户名称右对齐 */
}
.message-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  text-align: left; /* 文本默认左对齐 */
}
.message.user .message-text {
  color: white;
  text-align: left; /* 用户消息文本仍左对齐，但整体容器右对齐 */
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