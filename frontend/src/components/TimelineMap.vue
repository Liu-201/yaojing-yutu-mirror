<template>
  <div class="timeline-map-wrapper">
    <div class="timeline-controls">
      <div class="era-slider-container">
        <span class="era-label">{{ currentEra.label }}</span>
        <input type="range" v-model="eraIndex" :min="0" :max="eras.length - 1" class="era-slider" />
      </div>
      <div class="era-buttons">
        <button v-for="(era, idx) in eras" :key="idx" @click="eraIndex = idx" :class="{ active: idx === eraIndex }" class="era-btn">
          {{ era.shortName }}
        </button>
      </div>
    </div>
    <div id="timeline-map" class="timeline-map"></div>
    <div class="map-legend">
      <div class="legend-item"><span class="legend-dot historic"></span>历史产区</div>
      <div class="legend-item"><span class="legend-dot modern"></span>现代产区</div>
      <div class="legend-item"><span class="legend-line"></span>变迁路径</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

// 朝代数据
const eras = [
  { id: 'han', label: '汉代（公元25-220年）', shortName: '汉', color: '#5e6ad2' },
  { id: 'tang', label: '唐代（公元618-907年）', shortName: '唐', color: '#7170ff' },
  { id: 'song', label: '宋代（公元960-1279年）', shortName: '宋', color: '#828fff' },
  { id: 'ming', label: '明代（公元1368-1644年）', shortName: '明', color: '#5e6ad2' },
  { id: 'qing', label: '清代（公元1644-1912年）', shortName: '清', color: '#7170ff' },
  { id: 'modern', label: '现代（公元2000年至今）', shortName: '现代', color: '#10b981' }
]

const eraIndex = ref(eras.length - 1) // 默认现代
let chart = null

// 历史产区数据（以党参为例，实际可扩展多种药材）
const historicAreas = {
  han: [
    { name: '上党', lng: 113.05, lat: 36.18, herb: '党参' },  // 山西长治
    { name: '河东', lng: 111.0, lat: 35.03, herb: '党参' }
  ],
  tang: [
    { name: '潞州', lng: 113.05, lat: 36.18, herb: '党参' },
    { name: '泽州', lng: 112.88, lat: 35.50, herb: '党参' }
  ],
  song: [
    { name: '上党', lng: 113.05, lat: 36.18, herb: '党参' },
    { name: '秦州', lng: 105.73, lat: 34.58, herb: '党参' }  // 甘肃天水
  ],
  ming: [
    { name: '潞安', lng: 113.05, lat: 36.18, herb: '党参' },
    { name: '岷州', lng: 104.03, lat: 34.44, herb: '党参' }  // 甘肃岷县
  ],
  qing: [
    { name: '潞安', lng: 113.05, lat: 36.18, herb: '党参' },
    { name: '岷州', lng: 104.03, lat: 34.44, herb: '党参' },
    { name: '陇西', lng: 104.64, lat: 35.01, herb: '党参' }
  ],
  modern: [
    { name: '岷县', lng: 104.03, lat: 34.44, herb: '党参' },
    { name: '渭源', lng: 104.21, lat: 35.13, herb: '党参' },
    { name: '陇西', lng: 104.64, lat: 35.01, herb: '党参' },
    { name: '宕昌', lng: 104.39, lat: 34.05, herb: '党参' }
  ]
}

// 现代产区（用于对比）
const modernAreas = historicAreas.modern

// 获取变迁路径（从上一个主要产区到当前产区的连线）
function getTransitionLines(currentEraId) {
  // 简化：只展示现代到古代的连线
  if (currentEraId === 'modern') {
    return [
      { from: [113.05, 36.18], to: [104.03, 34.44], name: '潞安→岷县' },
      { from: [113.05, 36.18], to: [104.64, 35.01], name: '潞安→陇西' },
      { from: [104.03, 34.44], to: [104.21, 35.13], name: '岷州→渭源' }
    ]
  }
  return []
}

// 获取当前朝代的点数据
function getCurrentPoints(eraId) {
  const areas = historicAreas[eraId] || []
  return areas.map(a => ({ name: a.name, value: [a.lng, a.lat], herb: a.herb }))
}

// 绘制地图
function renderMap() {
  if (!chart) return
  const currentEra = eras[eraIndex.value]
  const points = getCurrentPoints(currentEra.id)
  const lines = getTransitionLines(currentEra.id)
  
  const series = [
    {
      type: 'scatter',
      name: '历史产区',
      data: points.map(p => p.value),
      symbolSize: 14,
      itemStyle: { color: currentEra.color, borderColor: '#ffffff', borderWidth: 1.5 },
      label: {
        show: true,
        formatter: (params) => points[params.dataIndex]?.name || '',
        position: 'top',
        color: '#d0d6e0',
        fontSize: 11,
        offset: [0, 5]
      },
      emphasis: { scale: 1.2 }
    }
  ]
  
  // 如果是现代，额外添加现代产区点（绿色）
  if (currentEra.id === 'modern') {
    series.push({
      type: 'scatter',
      name: '现代产区',
      data: modernAreas.map(a => [a.lng, a.lat]),
      symbolSize: 14,
      itemStyle: { color: '#10b981', borderColor: '#ffffff', borderWidth: 1.5 },
      label: {
        show: true,
        formatter: (params) => modernAreas[params.dataIndex]?.name,
        position: 'top',
        color: '#d0d6e0',
        fontSize: 11
      }
    })
  }
  
  // 添加变迁路径线（仅现代）
  if (lines.length) {
    series.push({
      type: 'lines',
      name: '变迁路径',
      data: lines.map(l => ({ coords: [l.from, l.to] })),
      lineStyle: { color: '#7170ff', width: 2, curveness: 0.3, type: 'dashed' },
      effect: {
        show: true,
        period: 6,
        trailLength: 0.2,
        symbol: 'arrow',
        symbolSize: 8
      },
      label: { show: false }
    })
  }
  
  chart.setOption({
    title: { show: false },
    tooltip: { trigger: 'item', formatter: '{b}' },
    xAxis: { show: false, min: 70, max: 135 },
    yAxis: { show: false, min: 15, max: 55 },
    grid: { left: '5%', right: '5%', top: '5%', bottom: '5%', containLabel: false },
    backgroundColor: 'transparent',
    series: series
  }, true)
}

// 初始化图表
function initChart() {
  const dom = document.getElementById('timeline-map')
  if (!dom) return
  chart = echarts.init(dom)
  renderMap()
  window.addEventListener('resize', () => chart?.resize())
}

watch(eraIndex, () => {
  renderMap()
})

onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<style scoped>
.timeline-map-wrapper {
  background: var(--bg-panel);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  border: 1px solid var(--border-standard);
}
.timeline-controls {
  margin-bottom: var(--space-5);
}
.era-slider-container {
  margin-bottom: var(--space-4);
}
.era-label {
  display: block;
  font-size: 14px;
  font-weight: 510;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}
.era-slider {
  width: 100%;
  height: 2px;
  -webkit-appearance: none;
  background: var(--border-solid);
  border-radius: 2px;
}
.era-slider:focus {
  outline: none;
}
.era-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--brand-accent);
  cursor: pointer;
  border: none;
}
.era-buttons {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
.era-btn {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  border-radius: var(--radius-full);
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 510;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.era-btn.active {
  background: var(--brand-indigo);
  border-color: var(--brand-indigo);
  color: white;
}
.timeline-map {
  width: 100%;
  height: 500px;
}
.map-legend {
  display: flex;
  gap: var(--space-5);
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 12px;
  color: var(--text-tertiary);
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.legend-dot.historic {
  background: #7170ff;
}
.legend-dot.modern {
  background: #10b981;
}
.legend-line {
  width: 20px;
  height: 2px;
  background: #7170ff;
  display: inline-block;
  position: relative;
}
.legend-line::after {
  content: '→';
  position: absolute;
  right: -12px;
  top: -6px;
  color: #7170ff;
  font-size: 10px;
}
</style>