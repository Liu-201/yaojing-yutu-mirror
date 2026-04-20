<template>
  <figure
    ref="cardRef"
    class="tilted-card-figure"
    :style="{ height: containerHeight, width: containerWidth }"
    @mousemove="handleMouseMove"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 移动端警告 -->
    <div v-if="showMobileWarning" class="tilted-card-mobile-alert">
      此效果在移动设备上体验不佳，建议使用桌面浏览器
    </div>

    <!-- 内部可倾斜容器 -->
    <div
      class="tilted-card-inner"
      :style="{
        width: imageWidth,
        height: imageHeight,
        transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
        transition: 'transform 0.1s ease-out'
      }"
    >
      <img
        :src="imageSrc"
        :alt="altText"
        class="tilted-card-img"
        :style="{ width: imageWidth, height: imageHeight }"
      />

      <!-- 覆盖内容（可选） -->
      <div v-if="displayOverlayContent && overlayContent" class="tilted-card-overlay">
        <slot name="overlay">
          {{ overlayContent }}
        </slot>
      </div>
    </div>

    <!-- 跟随鼠标的 tooltip -->
    <figcaption
      v-if="showTooltip && captionText"
      class="tilted-card-caption"
      :style="{
        left: `${tooltipX}px`,
        top: `${tooltipY}px`,
        opacity: tooltipOpacity,
        transform: `rotate(${rotateFigcaption}deg)`
      }"
    >
      {{ captionText }}
    </figcaption>
  </figure>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  imageSrc: { type: String, required: true },
  altText: { type: String, default: 'Tilted card image' },
  captionText: { type: String, default: '' },
  containerHeight: { type: String, default: '300px' },
  containerWidth: { type: String, default: '100%' },
  imageHeight: { type: String, default: '300px' },
  imageWidth: { type: String, default: '300px' },
  scaleOnHover: { type: Number, default: 1.1 },
  rotateAmplitude: { type: Number, default: 14 },
  showMobileWarning: { type: Boolean, default: true },
  showTooltip: { type: Boolean, default: true },
  overlayContent: { type: String, default: null },
  displayOverlayContent: { type: Boolean, default: false }
})

const cardRef = ref(null)
const rotateX = ref(0)
const rotateY = ref(0)
const scale = ref(1)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipOpacity = ref(0)
const rotateFigcaption = ref(0)

let lastY = 0

// 重置所有倾斜和缩放状态
const resetTransform = () => {
  rotateX.value = 0
  rotateY.value = 0
  scale.value = 1
  tooltipOpacity.value = 0
  rotateFigcaption.value = 0
  lastY = 0
}

const handleMouseMove = (e) => {
  if (!cardRef.value) return

  const rect = cardRef.value.getBoundingClientRect()
  // 防止除零或无效尺寸
  if (rect.width === 0 || rect.height === 0) return

  const offsetX = e.clientX - rect.left - rect.width / 2
  const offsetY = e.clientY - rect.top - rect.height / 2

  let rotationX = (offsetY / (rect.height / 2)) * -props.rotateAmplitude
  let rotationY = (offsetX / (rect.width / 2)) * props.rotateAmplitude

  // 防止 NaN
  if (isNaN(rotationX)) rotationX = 0
  if (isNaN(rotationY)) rotationY = 0

  rotateX.value = rotationX
  rotateY.value = rotationY

  // 计算 tooltip 位置
  const relativeX = e.clientX - rect.left
  const relativeY = e.clientY - rect.top
  tooltipX.value = relativeX + 10
  tooltipY.value = relativeY - 20

  const velocityY = offsetY - lastY
  rotateFigcaption.value = -velocityY * 0.6
  lastY = offsetY
}

const handleMouseEnter = () => {
  scale.value = props.scaleOnHover
  tooltipOpacity.value = 1
}

const handleMouseLeave = () => {
  scale.value = 1
  rotateX.value = 0
  rotateY.value = 0
  tooltipOpacity.value = 0
  rotateFigcaption.value = 0
}

// 监听窗口缩放，重置所有变换
const handleResize = () => {
  resetTransform()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.tilted-card-figure {
  position: relative;
  width: 100%;
  height: 100%;
  perspective: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
}

.tilted-card-mobile-alert {
  position: absolute;
  top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  z-index: 10;
  display: none;
}

@media (max-width: 640px) {
  .tilted-card-mobile-alert {
    display: block;
  }
  .tilted-card-caption {
    display: none;
  }
}

.tilted-card-inner {
  position: relative;
  transform-style: preserve-3d;
}

.tilted-card-img {
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
  border-radius: 15px;
  will-change: transform;
  transform: translateZ(0);
}

.tilted-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  will-change: transform;
  transform: translateZ(30px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
  border-radius: 15px;
  color: white;
  font-weight: 500;
  text-align: center;
  padding: 1rem;
  box-sizing: border-box;
}

.tilted-card-caption {
  pointer-events: none;
  position: absolute;
  border-radius: 8px;
  background-color: #1a1b1e;
  backdrop-filter: blur(8px);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 510;
  color: #f7f8f8;
  white-space: nowrap;
  z-index: 3;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
</style>