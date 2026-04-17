<template>
  <div class="trace-page">
    <div class="page-header">
      <h1>溯源码体验</h1>
      <p class="subtitle">输入溯源码，追溯药材从产地到您的全过程</p>
    </div>
    <div class="trace-input-area">
      <input
        type="text"
        v-model="traceCode"
        placeholder="请输入溯源码，例如：TCM-2026-001"
        @keyup.enter="searchTrace"
      />
      <button @click="searchTrace" :disabled="!traceCode.trim()">溯源</button>
    </div>
    <div v-if="traceResult" class="trace-result">
      <div class="result-header">
        <span class="result-badge">溯源报告</span>
        <span class="result-code">{{ traceResult.code }}</span>
      </div>
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-icon">🌱</div>
          <div class="timeline-content">
            <h3>产地生态</h3>
            <p>{{ traceResult.producingArea }}</p>
            <button @click="goToMap(traceResult.areaId)" class="link-btn">查看生态画像 →</button>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon">📜</div>
          <div class="timeline-content">
            <h3>历史沿革</h3>
            <p>{{ traceResult.historicalStory }}</p>
            <button @click="goToTimeSpace" class="link-btn">时空对话 →</button>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon">📖</div>
          <div class="timeline-content">
            <h3>药材知识</h3>
            <p>{{ traceResult.herbName }} · {{ traceResult.herbEffect }}</p>
            <button @click="goToHerbDetail(traceResult.herbId)" class="link-btn">查看详情 →</button>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-icon">📦</div>
          <div class="timeline-content">
            <h3>采收加工</h3>
            <p>采收时间：{{ traceResult.harvestDate }}</p>
            <p>加工方式：{{ traceResult.processingMethod }}</p>
          </div>
        </div>
      </div>
      <div class="result-footer">
        <button @click="downloadReport" class="download-btn">下载报告（PDF）</button>
      </div>
    </div>
    <div v-else-if="searched && !traceResult" class="empty-result">
      <p>未找到该溯源码，请检查后重试～</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const traceCode = ref('')
const traceResult = ref(null)
const searched = ref(false)

// 模拟溯源码对应的数据（实际可对接后端）
const mockTraceData = {
  'TCM-2026-001': {
    code: 'TCM-2026-001',
    producingArea: '甘肃省岷县，海拔2500米，昼夜温差大，党参有效成分含量高。',
    areaId: 1,
    historicalStory: '党参从古代上党地区（今山西长治）逐渐西迁，明代以后岷县成为新的道地产区。',
    herbName: '党参',
    herbId: 2,
    herbEffect: '补中益气，健脾益肺',
    harvestDate: '2026年10月15-25日',
    processingMethod: '清洗→切片→自然晾晒→分级包装'
  },
  'TCM-2026-002': {
    code: 'TCM-2026-002',
    producingArea: '甘肃省陇西县，黄芪甲苷含量远超药典标准。',
    areaId: 2,
    historicalStory: '黄芪最早记载于《神农本草经》，历代推崇陇西黄芪为道地。',
    herbName: '黄芪',
    herbId: 1,
    herbEffect: '补气固表，利尿托毒',
    harvestDate: '2026年9月5-15日',
    processingMethod: '机械采挖→去泥→切片→烘干'
  },
  'TCM-2026-003': {
    code: 'TCM-2026-003',
    producingArea: '吉林省抚松县，长白山林下参，生长15年以上。',
    areaId: 4,
    historicalStory: '人参自古为“百草之王”，抚松有“人参之乡”美誉。',
    herbName: '人参',
    herbId: 4,
    herbEffect: '大补元气，复脉固脱',
    harvestDate: '2026年8月20日-9月10日',
    processingMethod: '人工采挖→刷洗→蒸制→晾晒（红参工艺）'
  }
}

function searchTrace() {
  searched.value = true
  const code = traceCode.value.trim().toUpperCase()
  if (mockTraceData[code]) {
    traceResult.value = mockTraceData[code]
  } else {
    traceResult.value = null
  }
}

function goToMap(areaId) {
  router.push(`/map?area=${areaId}`)
}

function goToTimeSpace() {
  router.push('/timespace')
}

function goToHerbDetail(herbId) {
  router.push(`/herbs/${herbId}`)
}

function downloadReport() {
  // 简单模拟：调用浏览器打印或生成 PDF
  alert('报告生成中，请稍后...\n（实际可调用 jsPDF 或后端生成）')
}
</script>

<style scoped>
.trace-page {
  max-width: 1000px;
  margin: 0 auto;
}
.page-header {
  margin-bottom: var(--space-6);
}
h1 {
  font-size: 32px;
  font-weight: 510;
  letter-spacing: -0.704px;
  margin-bottom: var(--space-2);
}
.subtitle {
  color: var(--text-tertiary);
}
.trace-input-area {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}
.trace-input-area input {
  flex: 1;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
}
.trace-input-area input:focus {
  outline: none;
  border-color: var(--brand-accent);
}
.trace-input-area button {
  background: var(--brand-indigo);
  border: none;
  border-radius: var(--radius-md);
  padding: 0 24px;
  color: white;
  font-weight: 510;
  cursor: pointer;
}
.trace-input-area button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.trace-result {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-standard);
  overflow: hidden;
}
.result-header {
  background: var(--bg-elevated);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.result-badge {
  background: var(--brand-indigo);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 510;
  color: white;
}
.result-code {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--text-secondary);
}
.timeline {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}
.timeline-item {
  display: flex;
  gap: var(--space-4);
}
.timeline-icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.03);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.timeline-content {
  flex: 1;
}
.timeline-content h3 {
  font-size: 16px;
  font-weight: 590;
  margin-bottom: 4px;
  color: var(--text-primary);
}
.timeline-content p {
  font-size: 14px;
  color: var(--text-tertiary);
  line-height: 1.5;
  margin-bottom: 6px;
}
.link-btn {
  background: none;
  border: none;
  color: var(--brand-accent);
  font-size: 12px;
  padding: 0;
  cursor: pointer;
  font-weight: 510;
}
.link-btn:hover {
  text-decoration: underline;
}
.result-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
  text-align: center;
}
.download-btn {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-md);
  padding: 8px 20px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
}
.empty-result {
  text-align: center;
  padding: var(--space-12);
  color: var(--text-tertiary);
}
</style>