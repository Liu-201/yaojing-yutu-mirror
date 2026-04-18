<template>
  <div class="dot-field-container" ref="containerRef">
    <canvas ref="canvasRef" class="dot-field-canvas"></canvas>
    <svg class="dot-field-svg" aria-hidden="true">
      <defs>
        <radialGradient :id="glowId">
          <stop offset="0%" :stop-color="glowColor" />
          <stop offset="100%" stop-color="transparent" />
        </radialGradient>
      </defs>
      <circle ref="glowCircleRef" cx="-9999" cy="-9999" :r="glowRadius" :fill="`url(#${glowId})`" style="opacity: 0; will-change: opacity;" />
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

// 可配置参数（props）
const props = defineProps({
  dotRadius: { type: Number, default: 1.5 },
  dotSpacing: { type: Number, default: 14 },
  cursorRadius: { type: Number, default: 500 },
  cursorForce: { type: Number, default: 0.1 },
  bulgeOnly: { type: Boolean, default: true },
  bulgeStrength: { type: Number, default: 67 },
  glowRadius: { type: Number, default: 160 },
  sparkle: { type: Boolean, default: false },
  waveAmplitude: { type: Number, default: 0 },
  gradientFrom: { type: String, default: 'rgba(94, 106, 210, 0.35)' },   // 品牌靛蓝
  gradientTo: { type: String, default: 'rgba(113, 112, 255, 0.25)' },     // 亮紫
  glowColor: { type: String, default: '#120F17' },
})

const containerRef = ref(null)
const canvasRef = ref(null)
const glowCircleRef = ref(null)
let ctx = null
let animationId = null
let dots = []
let mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 }
let size = { w: 0, h: 0, offsetX: 0, offsetY: 0 }
let glowOpacity = 0
let engagement = 0
let frameCount = 0
let speedInterval = null

const TWO_PI = Math.PI * 2
const glowId = `dot-glow-${Math.random().toString(36).slice(2, 9)}`

// 构建粒子网格
function buildDots(w, h) {
  const step = props.dotRadius + props.dotSpacing
  const cols = Math.floor(w / step)
  const rows = Math.floor(h / step)
  const padX = (w % step) / 2
  const padY = (h % step) / 2
  const newDots = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const ax = padX + col * step + step / 2
      const ay = padY + row * step + step / 2
      newDots.push({
        ax, ay,
        sx: ax, sy: ay,
        vx: 0, vy: 0,
        x: ax, y: ay,
      })
    }
  }
  dots = newDots
}

// 鼠标移动事件
function onMouseMove(e) {
  const rect = containerRef.value?.getBoundingClientRect()
  if (!rect) return
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
}

// 更新鼠标速度
function updateMouseSpeed() {
  const dx = mouse.prevX - mouse.x
  const dy = mouse.prevY - mouse.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  mouse.speed += (dist - mouse.speed) * 0.5
  if (mouse.speed < 0.001) mouse.speed = 0
  mouse.prevX = mouse.x
  mouse.prevY = mouse.y
}

// 调整画布尺寸及DPI
function resizeCanvas() {
  if (!containerRef.value || !canvasRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const w = rect.width
  const h = rect.height
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  canvasRef.value.width = w * dpr
  canvasRef.value.height = h * dpr
  canvasRef.value.style.width = `${w}px`
  canvasRef.value.style.height = `${h}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  size = {
    w, h,
    offsetX: rect.left + window.scrollX,
    offsetY: rect.top + window.scrollY,
  }
  buildDots(w, h)
}

// 动画循环
function animate() {
  if (!ctx) return
  frameCount++
  const { w, h } = size
  const t = frameCount * 0.02

  // 更新鼠标速度对 engagement 的影响
  const targetEngagement = Math.min(mouse.speed / 5, 1)
  engagement += (targetEngagement - engagement) * 0.06
  if (engagement < 0.001) engagement = 0
  glowOpacity += (engagement - glowOpacity) * 0.08
  if (glowOpacity < 0.001) glowOpacity = 0

  // 更新 SVG 发光圆的位置和透明度
  if (glowCircleRef.value) {
    glowCircleRef.value.setAttribute('cx', mouse.x)
    glowCircleRef.value.setAttribute('cy', mouse.y)
    glowCircleRef.value.style.opacity = glowOpacity
  }

  ctx.clearRect(0, 0, w, h)

  // 创建渐变（对角线性渐变）
  const grad = ctx.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, props.gradientFrom)
  grad.addColorStop(1, props.gradientTo)
  ctx.fillStyle = grad

  const cr = props.cursorRadius
  const crSq = cr * cr
  const rad = props.dotRadius
  const isBulge = props.bulgeOnly
  const eng = engagement

  ctx.beginPath()

  for (let i = 0; i < dots.length; i++) {
    const d = dots[i]
    const dx = mouse.x - d.ax
    const dy = mouse.y - d.ay
    const distSq = dx * dx + dy * dy

    if (distSq < crSq && eng > 0.01) {
      const dist = Math.sqrt(distSq)
      if (isBulge) {
        const tPush = 1 - dist / cr
        const push = tPush * tPush * props.bulgeStrength * eng
        const angle = Math.atan2(dy, dx)
        d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15
        d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15
      } else {
        const angle = Math.atan2(dy, dx)
        const move = (500 / dist) * (mouse.speed * props.cursorForce)
        d.vx += Math.cos(angle) * -move
        d.vy += Math.sin(angle) * -move
      }
    } else if (isBulge) {
      d.sx += (d.ax - d.sx) * 0.1
      d.sy += (d.ay - d.sy) * 0.1
    }

    if (!isBulge) {
      d.vx *= 0.9
      d.vy *= 0.9
      d.x = d.ax + d.vx
      d.y = d.ay + d.vy
      d.sx += (d.x - d.sx) * 0.1
      d.sy += (d.y - d.sy) * 0.1
    }

    let drawX = d.sx
    let drawY = d.sy
    if (props.waveAmplitude > 0) {
      drawY += Math.sin(d.ax * 0.03 + t) * props.waveAmplitude
      drawX += Math.cos(d.ay * 0.03 + t * 0.7) * props.waveAmplitude * 0.5
    }

    if (props.sparkle) {
      const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0
      if ((hash % 100) < 3) {
        ctx.moveTo(drawX + rad * 1.8, drawY)
        ctx.arc(drawX, drawY, rad * 1.8, 0, TWO_PI)
        continue
      }
    }
    ctx.moveTo(drawX + rad, drawY)
    ctx.arc(drawX, drawY, rad, 0, TWO_PI)
  }
  ctx.fill()

  animationId = requestAnimationFrame(animate)
}

// 监听窗口变化
function handleResize() {
  resizeCanvas()
}

// 监听 props 变化时重建粒子网格（如 dotRadius, dotSpacing 改变）
watch(
  () => [props.dotRadius, props.dotSpacing],
  () => {
    if (size.w > 0 && size.h > 0) buildDots(size.w, size.h)
  },
  { deep: false }
)

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d', { alpha: true })
  if (!ctx) return

  resizeCanvas()
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  speedInterval = setInterval(updateMouseSpeed, 20)
  animationId = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (speedInterval) clearInterval(speedInterval)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<style scoped>
.dot-field-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;  /* 让鼠标事件穿透到下层内容 */
  z-index: 0;
}
.dot-field-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.dot-field-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>