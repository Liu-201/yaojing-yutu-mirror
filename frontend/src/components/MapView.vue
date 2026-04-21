<template>
  <div id="map-container" style="width: 100%; height: 500px; border-radius: var(--radius-lg); overflow: hidden;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useHerbStore } from '@/stores/herbStore'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toastStore'

const herbStore = useHerbStore()
const router = useRouter()
const toastStore = useToastStore()
let map = null
let markers = []

onMounted(async () => {
  if (!herbStore.producingAreas.length) {
    await herbStore.fetchProducingAreas()
  }
  if (window.AMap) {
    initMap()
  } else {
    window.addEventListener('load', initMap)
  }
})

function initMap() {
  // 创建地图实例，增加限制范围属性
  map = new window.AMap.Map('map-container', {
    zoom: 5,
    center: [104.0, 35.0],
    viewMode: '2D',
    mapStyle: 'amap://styles/dark',
    features: ['bg', 'road', 'building', 'point'],
    // 限制地图显示范围为中国境内（粗略边界）
    limitBounds: new window.AMap.Bounds(
      new window.AMap.LngLat(73.0, 18.0),
      new window.AMap.LngLat(135.0, 53.0)
    )
  })
  map.setDefaultCursor('pointer')
  
  map.on('complete', () => {
    addMarkers()
    // 获取并显示审图号
    showApprovalNumber()
  })
}

// 显示审图号
function showApprovalNumber() {
  if (!map) return
  // 高德 JS API 2.0 提供 getApprovalNumber 方法
  const approval = map.getApprovalNumber()
  const mapContentNum = approval.mapContentApprovalNumber || ''
  const satelliteNum = approval.satelliteImageApprovalNumber || ''
  
  let approvalDiv = document.getElementById('amap-approval-number')
  if (!approvalDiv) {
    approvalDiv = document.createElement('div')
    approvalDiv.id = 'amap-approval-number'
    approvalDiv.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(0,0,0,0.65);
      color: #ccc;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      z-index: 100;
      pointer-events: none;
      font-family: monospace;
      backdrop-filter: blur(4px);
    `
    const container = document.getElementById('map-container')
    if (container) container.appendChild(approvalDiv)
  }
  approvalDiv.innerHTML = `地图审图号：${mapContentNum}`
}

function addMarkers() {
  const areas = herbStore.producingAreas
  if (!areas.length) return

  areas.forEach(area => {
    const marker = new window.AMap.Marker({
      position: [area.lng, area.lat],
      title: area.name,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(20, 20),
        image: '/ggjdingwei.svg',
        imageSize: new window.AMap.Size(20, 20)
      }),
      offset: new window.AMap.Pixel(-10, -10)
    })
    marker.setMap(map)

    const content = `
      <div class="custom-info-window glass-card">
        <h4>${area.herbName || area.name}</h4>
        <p class="location">${area.province} · ${area.city}</p>
        <p class="desc">${area.description}</p>
        <button class="info-btn clickable-scale" data-id="${area.id}">查看详情</button>
      </div>
    `
    const infoWindow = new window.AMap.InfoWindow({
      content: content,
      offset: new window.AMap.Pixel(0, -30),
      isCustom: true
    })

    marker.on('click', () => {
      infoWindow.open(map, marker.getPosition())
      setTimeout(() => {
        const btn = document.querySelector(`.custom-info-window .info-btn[data-id="${area.id}"]`)
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation()
            if (area.herbId) {
              router.push(`/herbs/${area.herbId}`)
              toastStore.addToast('跳转到药材详情', 'info', 1500)
            } else {
              toastStore.addToast(`暂未收录 ${area.herbName} 的详细数据`, 'error', 2000)
            }
            infoWindow.close()
          }
        }
      }, 50)
    })
    markers.push(marker)
  })
}

onBeforeUnmount(() => {
  if (map) {
    map.destroy()
  }
})
</script>

<style scoped>
#map-container {
  width: 100%;
  height: 500px;
  transition: all 0.3s ease;
}
</style>

<style>
/* 全局覆盖高德地图默认信息窗体样式 */
.amap-info-window {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
.amap-info-content {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}
.amap-info-sharp {
  display: none !important;
}
.amap-info-close {
  display: none !important;
}
.custom-info-window {
  background: rgba(25, 26, 27, 0.85) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  border-radius: 12px !important;
  padding: 12px 16px !important;
  max-width: 260px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}
.custom-info-window h4 {
  margin: 0 0 4px 0;
  color: #f7f8f8;
  font-size: 16px;
  font-weight: 590;
}
.custom-info-window .location {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #8a8f98;
}
.custom-info-window .desc {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #d0d6e0;
  line-height: 1.4;
}
.custom-info-window .info-btn {
  background: #5e6ad2;
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 510;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}
.custom-info-window .info-btn:hover {
  background: #7170ff;
  transform: scale(1.02);
}
.custom-info-window .info-btn:active {
  transform: scale(0.98);
}
</style>