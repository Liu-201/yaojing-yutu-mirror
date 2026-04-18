<template>
  <span
    ref="textRef"
    class="shiny-text"
    :class="className"
    :style="gradientStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    {{ text }}
  </span>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  speed: { type: Number, default: 2 },
  className: { type: String, default: '' },
  color: { type: String, default: '#b5b5b5' },
  shineColor: { type: String, default: '#ffffff' },
  spread: { type: Number, default: 120 },
  yoyo: { type: Boolean, default: false },
  pauseOnHover: { type: Boolean, default: false },
  direction: { type: String, default: 'left' }, // 'left' or 'right'
  delay: { type: Number, default: 0 }
})

const textRef = ref(null)
let isPaused = ref(false)

const gradientStyle = computed(() => ({
  backgroundImage: `linear-gradient(${props.spread}deg, ${props.color} 0%, ${props.color} 35%, ${props.shineColor} 50%, ${props.color} 65%, ${props.color} 100%)`,
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
}))

const handleMouseEnter = () => {
  if (props.pauseOnHover) {
    isPaused.value = true
    if (textRef.value) textRef.value.style.animationPlayState = 'paused'
  }
}
const handleMouseLeave = () => {
  if (props.pauseOnHover) {
    isPaused.value = false
    if (textRef.value) textRef.value.style.animationPlayState = 'running'
  }
}

const startAnimation = () => {
  if (props.disabled || !textRef.value) return
  const directionVal = props.direction === 'left' ? 'left' : 'right'
  const duration = props.speed
  const delayVal = props.delay
  const animationName = `shiny-${directionVal}-${Date.now()}`
  const style = document.createElement('style')
  let keyframes = ''
  if (directionVal === 'left') {
    keyframes = `
      @keyframes ${animationName} {
        0% { background-position: 150% center; }
        100% { background-position: -50% center; }
      }
    `
  } else {
    keyframes = `
      @keyframes ${animationName} {
        0% { background-position: -50% center; }
        100% { background-position: 150% center; }
      }
    `
  }
  if (props.yoyo) {
    keyframes = keyframes.replace('100%', '50%')
    if (directionVal === 'left') {
      keyframes = `
        @keyframes ${animationName} {
          0% { background-position: 150% center; }
          50% { background-position: -50% center; }
          100% { background-position: 150% center; }
        }
      `
    } else {
      keyframes = `
        @keyframes ${animationName} {
          0% { background-position: -50% center; }
          50% { background-position: 150% center; }
          100% { background-position: -50% center; }
        }
      `
    }
  }
  style.textContent = keyframes
  document.head.appendChild(style)
  textRef.value.style.animation = `${animationName} ${duration}s ${delayVal}s infinite ${props.yoyo ? 'alternate' : 'normal'}`
  textRef.value.style.animationTimingFunction = 'ease-in-out'
  textRef.value.dataset.animationName = animationName
}

onMounted(() => {
  startAnimation()
})

watch(() => [props.disabled, props.speed, props.delay, props.direction, props.yoyo], () => {
  if (textRef.value && textRef.value.dataset.animationName) {
    const oldName = textRef.value.dataset.animationName
    const oldStyle = Array.from(document.head.querySelectorAll('style')).find(s => s.textContent.includes(oldName))
    if (oldStyle) oldStyle.remove()
  }
  startAnimation()
})

onBeforeUnmount(() => {
  if (textRef.value && textRef.value.dataset.animationName) {
    const oldName = textRef.value.dataset.animationName
    const oldStyle = Array.from(document.head.querySelectorAll('style')).find(s => s.textContent.includes(oldName))
    if (oldStyle) oldStyle.remove()
  }
})
</script>

<style scoped>
.shiny-text {
  display: inline-block;
  background-size: 200% auto;
}
</style>