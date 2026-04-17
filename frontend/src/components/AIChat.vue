<template>
  <div class="ai-chat">
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(msg, idx) in messages" :key="idx" :class="['message', msg.role]">
        <div class="message-avatar">
          <span v-if="msg.role === 'user'">🧑</span>
          <span v-else>🌿</span>
        </div>
        <div class="message-content">
          <div class="message-name">{{ msg.role === 'user' ? '你' : '药境助手' }}</div>
          <div class="message-text" v-html="formatMessage(msg.content)"></div>
          <div v-if="msg.sources" class="message-sources">
            <span>📚 参考：</span>
            <a v-for="(src, i) in msg.sources" :key="i" href="#" @click.prevent="openSource(src)">{{ src }}</a>
          </div>
        </div>
      </div>
      <div v-if="isTyping" class="message assistant typing">
        <div class="message-avatar"><span>🌿</span></div>
        <div class="message-content">
          <div class="message-name">药境助手</div>
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-input-area">
      <textarea 
        v-model="inputText" 
        @keydown.enter.prevent="sendMessage" 
        placeholder="问点啥？比如「黄芪的功效」「党参哪里产的好」..."
        rows="2"
      ></textarea>
      <button @click="sendMessage" :disabled="isTyping || !inputText.trim()" class="send-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    <div class="chat-tips">
      <button v-for="q in quickQuestions" :key="q" @click="inputText = q; sendMessage()" class="tip-btn">
        {{ q }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

// 消息列表
const messages = ref([
  { role: 'assistant', content: '你好呀！我是药境助手，可以问我关于中药材的产地、功效、用法、历史典故等问题～试试输入「黄芪有什么功效」吧。' }
])
const inputText = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

// 快速提问示例
const quickQuestions = [
  '党参的主要产地在哪里？',
  '黄芪有什么功效？',
  '人参和党参的区别',
  '道地药材是什么意思？'
]

// 简单的模拟回答库（真实场景可替换为API调用）
function getMockReply(question) {
  const q = question.toLowerCase()
  if (q.includes('党参') && q.includes('产地')) {
    return {
      content: '党参的道地产区历史上在山西上党（今长治），现在主要产于甘肃岷县、渭源、陇西等地。甘肃产的党参因海拔高、昼夜温差大，有效成分含量高，品质优良。',
      sources: ['《中国道地药材》', '甘肃农业大学研究']
    }
  }
  if (q.includes('黄芪') && q.includes('功效')) {
    return {
      content: '黄芪性甘、温，归脾、肺经。主要功效：补气固表，利尿托毒，排脓敛疮生肌。常用于气虚乏力、食少便溏、中气下陷、久泻脱肛等。现代研究表明，黄芪能增强免疫力、抗衰老、降血压。',
      sources: ['《中国药典》2020年版', '《中药学》教材']
    }
  }
  if (q.includes('人参') && q.includes('党参')) {
    return {
      content: '人参和党参都是补气药，但人参补气作用更强，能大补元气，用于气虚欲脱；党参补气较为平和，兼能健脾养血。人参偏温，党参偏平。人参价格昂贵，党参则更平民。',
      sources: ['《中药学》', '《本草纲目》']
    }
  }
  if (q.includes('道地药材')) {
    return {
      content: '道地药材是指经过中医临床长期应用优选出来的，产在特定地域，品质和疗效优良的药材。比如甘肃的当归、宁夏的枸杞、四川的黄连、吉林的人参等。道地药材的形成与当地的气候、土壤、水文等自然条件密切相关。',
      sources: ['《道地药材理论与文献研究》']
    }
  }
  // 默认回复
  return {
    content: '嗯嗯，这个问题我需要查一下资料～目前我的知识库还在完善中，你可以试试问「黄芪的功效」或「党参的产地」等常见问题。',
    sources: []
  }
}

// 模拟API调用（延时+随机）
async function askAI(question) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockReply(question))
    }, 800 + Math.random() * 500)
  })
}

// 发送消息
async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return
  // 添加用户消息
  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()
  isTyping.value = true
  
  try {
    const reply = await askAI(text)
    messages.value.push({
      role: 'assistant',
      content: reply.content,
      sources: reply.sources
    })
  } catch (err) {
    messages.value.push({ role: 'assistant', content: '网络开小差了，稍后再试试吧～' })
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 格式化消息（支持换行、简单markdown）
function formatMessage(text) {
  return text.replace(/\n/g, '<br>')
}

// 打开参考来源（模拟）
function openSource(src) {
  alert(`资料来源：${src}（演示版，实际可跳转至详情页）`)
}

// 监听消息变化自动滚动
watch(messages, () => scrollToBottom(), { deep: true })
</script>

<style scoped>
.ai-chat {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-standard);
  display: flex;
  flex-direction: column;
  height: 600px;
  max-height: 70vh;
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
}
.message.assistant {
  align-self: flex-start;
}
.message-avatar {
  width: 32px;
  height: 32px;
  background: var(--bg-elevated);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.message.user .message-avatar {
  background: var(--brand-indigo);
}
.message-content {
  background: var(--bg-panel);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-subtle);
  max-width: calc(100% - 44px);
}
.message.user .message-content {
  background: var(--brand-indigo);
  border-color: var(--brand-indigo);
}
.message-name {
  font-size: 12px;
  font-weight: 510;
  color: var(--text-tertiary);
  margin-bottom: 4px;
}
.message.user .message-name {
  color: rgba(255,255,255,0.7);
}
.message-text {
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.5;
  word-break: break-word;
}
.message.user .message-text {
  color: white;
}
.message-sources {
  margin-top: var(--space-2);
  font-size: 11px;
  color: var(--text-quaternary);
}
.message-sources a {
  color: var(--brand-accent);
  margin-left: 6px;
  text-decoration: none;
}
.message-sources a:hover {
  text-decoration: underline;
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
  animation: blink 1.2s infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink {
  0%, 60%, 100% { opacity: 0.2; }
  30% { opacity: 1; }
}
.chat-input-area {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}
.chat-input-area textarea {
  flex: 1;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
  resize: none;
}
.chat-input-area textarea:focus {
  outline: none;
  border-color: var(--brand-accent);
}
.send-btn {
  background: var(--brand-indigo);
  border: none;
  border-radius: var(--radius-md);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}
.send-btn:hover {
  background: var(--brand-hover);
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.chat-tips {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}
.tip-btn {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-full);
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.tip-btn:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary);
}
</style>