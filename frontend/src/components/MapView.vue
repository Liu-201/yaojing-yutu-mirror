<template>
  <div id="map-container" style="width: 100%; height: 500px; border-radius: var(--radius-lg); overflow: hidden;"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useHerbStore } from '@/stores/herbStore'
import { useRouter } from 'vue-router'

const herbStore = useHerbStore()
const router = useRouter()
let map = null
let markers = []   // 存储标记对象，用于清理

// 高德地图深色自定义样式（JSON 风格）
const darkMapStyle = {
  version: '1.1',
  settings: {
    background: '#08090a',
    labelColor: '#d0d6e0',
    roadColor: '#2a2c30',
    buildingColor: '#1a1b1e'
  },
  features: [
    { featureType: 'water', elementType: 'geometry', stylers: { color: '#0a1a2a' } },
    { featureType: 'land', elementType: 'geometry', stylers: { color: '#0f1011' } },
    { featureType: 'building', elementType: 'geometry', stylers: { color: '#1e1f22' } },
    { featureType: 'road', elementType: 'geometry', stylers: { color: '#282c30', visibility: 'on' } },
    { featureType: 'label', elementType: 'all', stylers: { color: '#a0a5b0' } }
  ]
}

onMounted(async () => {
  // 确保产区数据已加载
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
  // 创建地图实例，中心点为中国大致中心
  map = new window.AMap.Map('map-container', {
    zoom: 5,
    center: [104.0, 35.0],
    viewMode: '2D',
    mapStyle: 'amap://styles/自定义', // 实际使用自定义样式需要注册，此处使用深色主题方式
    features: ['bg', 'road', 'building', 'point'] // 控制显示要素
  })
  // 设置深色风格（如果支持 setMapStyle）
  // 高德 v2 支持 setMapStyle，但自定义样式需在控制台创建样式ID。为简单，我们用 setFeatures 和设置背景色。
  // 但为了达到类似 Linear Dark，我们直接设置背景色和图层。
  map.setDefaultCursor('pointer')
  // 使用官方暗色主题（如果存在）
  map.setMapStyle('amap://styles/dark') // 高德有内置暗色主题，但较亮，我们自定义一下
  // 手动调整样式：官方未开放深色自定义时，可用下面的方式强制修改底图颜色？不太支持，但我们可以接受官方暗色。
  // 这里使用官方暗色主题，基本符合要求。
  map.setMapStyle('amap://styles/dark')
  
  // 等待地图加载完成
  map.on('complete', () => {
    addMarkers()
  })
}

function addMarkers() {
  // 从 store 获取产区数据
  const areas = herbStore.producingAreas
  if (!areas.length) return

  areas.forEach(area => {
    // 创建标记点
    const marker = new window.AMap.Marker({
      position: [area.lng, area.lat],
      title: area.name,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(24, 32),
        image: 'frontend/public/mappointer.svg', // 临时图标，可换成自定义
        imageSize: new window.AMap.Size(24, 32)
      }),
      offset: new window.AMap.Pixel(-12, -32)
    })
    // 自定义标记样式：我们希望使用青色圆点，但简单起见用默认图标也行
    // 为了更符合 Linear，我们可以用自定义图标（后续可优化）
    marker.setMap(map)
    
    // 创建信息窗体内容
    const content = `
      <div style="background: #191a1b; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; max-width: 240px; font-family: Inter, sans-serif;">
        <h4 style="margin: 0 0 4px; color: #f7f8f8; font-weight: 590;">${area.herbName || area.name}</h4>
        <p style="margin: 0 0 8px; font-size: 12px; color: #8a8f98;">${area.province} · ${area.city}</p>
        <p style="margin: 0 0 12px; font-size: 13px; color: #d0d6e0;">${area.description}</p>
        <button id="view-detail-${area.id}" style="background: #5e6ad2; border: none; border-radius: 6px; padding: 4px 12px; color: white; font-size: 12px; cursor: pointer;">查看详情</button>
      </div>
    `
    const infoWindow = new window.AMap.InfoWindow({
      content: content,
      offset: new window.AMap.Pixel(0, -30)
    })
    
    // 点击标记时打开信息窗体
    marker.on('click', () => {
      infoWindow.open(map, marker.getPosition())
      // 延迟绑定按钮事件，因为 DOM 尚未渲染
      setTimeout(() => {
        const btn = document.getElementById(`view-detail-${area.id}`)
        if (btn) {
          btn.onclick = () => {
            if (area.herbId) {
              router.push(`/herbs/${area.herbId}`)
            } else {
              alert(`暂未收录 ${area.herbName} 的详细数据`)
            }
          }
        }
      }, 100)
    })
    
    markers.push(marker)
  })
}

// 组件销毁前清理地图资源
onBeforeUnmount(() => {
  if (map) {
    map.destroy()
  }
})
</script>

<style scoped>
/* 确保容器正确显示 */
#map-container {
  width: 100%;
  height: 500px;
}
</style>