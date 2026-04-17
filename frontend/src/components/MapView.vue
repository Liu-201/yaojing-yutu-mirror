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
  map = new window.AMap.Map('map-container', {
    zoom: 5,
    center: [104.0, 35.0],
    viewMode: '2D',
    mapStyle: 'amap://styles/dark', // 使用官方深色主题
    features: ['bg', 'road', 'building', 'point']
  })
  map.setDefaultCursor('pointer')
  map.on('complete', () => {
    addMarkers()
  })
}

function addMarkers() {
  const areas = herbStore.producingAreas
  if (!areas.length) return

  areas.forEach(area => {
    // 自定义标记点图标（更符合 Linear 风格的简洁圆点）
    const marker = new window.AMap.Marker({
      position: [area.lng, area.lat],
      title: area.name,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(16, 16),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png', // 可替换为自定义圆形图标
        imageSize: new window.AMap.Size(16, 16)
      }),
      offset: new window.AMap.Pixel(-8, -8)
    })
    marker.setMap(map)

    // 信息窗体内容（深色玻璃态，无白边）
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
      isCustom: true  // 完全自定义样式，不使用默认窗体
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
/* 全局覆盖高德地图默认信息窗体样式（确保深色无白边） */
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