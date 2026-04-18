<template>
  <div class="pill-nav-container">
    <nav class="pill-nav" :class="className" :style="cssVars" aria-label="Primary">
      <!-- Logo 区域 -->
      <component
        :is="logoLinkComponent"
        :to="logoLinkComponent === 'router-link' ? items[0]?.href : undefined"
        :href="logoLinkComponent === 'a' ? items[0]?.href : undefined"
        class="pill-logo"
        aria-label="Home"
        @mouseenter="handleLogoEnter"
      >
        <img :src="logo" :alt="logoAlt" ref="logoImgRef" />
      </component>

      <!-- 桌面端导航项 -->
      <div class="pill-nav-items desktop-only" ref="navItemsRef">
        <ul class="pill-list" role="menubar">
          <li v-for="(item, idx) in items" :key="item.href || idx" role="none">
            <component
              :is="getLinkComponent(item.href)"
              :to="getLinkComponent(item.href) === 'router-link' ? item.href : undefined"
              :href="getLinkComponent(item.href) === 'a' ? item.href : undefined"
              class="pill"
              :class="{ 'is-active': activeHref === item.href }"
              :aria-label="item.ariaLabel || item.label"
              @mouseenter="() => handleEnter(idx)"
              @mouseleave="() => handleLeave(idx)"
            >
              <span class="hover-circle" aria-hidden="true" :ref="(el) => setCircleRef(el, idx)"></span>
              <span class="label-stack">
                <span class="pill-label">{{ item.label }}</span>
                <span class="pill-label-hover" aria-hidden="true">{{ item.label }}</span>
              </span>
            </component>
          </li>
        </ul>
      </div>

      <!-- 右侧用户区域（登录/注册 或 头像下拉菜单） -->
      <div class="user-actions">
        <template v-if="userStore.isLoggedIn">
          <div class="user-dropdown" ref="dropdownRef">
            <div class="user-avatar" @click.stop="toggleDropdown">
              {{ userStore.currentUser?.nickname?.charAt(0) || userStore.currentUser?.username?.charAt(0) }}
            </div>
            <div v-if="dropdownOpen" class="dropdown-menu">
              <div class="dropdown-header">Hi, {{ userStore.currentUser?.nickname || userStore.currentUser?.username }}</div>
              <router-link to="/user/profile" class="dropdown-item" @click="closeDropdown">个人资料</router-link>
              <router-link to="/user/favorites" class="dropdown-item" @click="closeDropdown">我的收藏</router-link>
              <router-link to="/user/history" class="dropdown-item" @click="closeDropdown">问药记录</router-link>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item logout" @click="handleLogout">退出登录</div>
            </div>
          </div>
        </template>
        <template v-else>
          <button @click="openLoginModal" class="auth-btn login-btn">登录</button>
        </template>
      </div>

      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-button mobile-only" @click="toggleMobileMenu" aria-label="Toggle menu" ref="hamburgerRef">
        <span class="hamburger-line" />
        <span class="hamburger-line" />
      </button>
    </nav>

    <!-- 移动端菜单弹窗 -->
    <div class="mobile-menu-popover mobile-only" ref="mobileMenuRef" :style="cssVars">
      <ul class="mobile-menu-list">
        <li v-for="item in items" :key="item.href">
          <component
            :is="getLinkComponent(item.href)"
            :to="getLinkComponent(item.href) === 'router-link' ? item.href : undefined"
            :href="getLinkComponent(item.href) === 'a' ? item.href : undefined"
            class="mobile-menu-link"
            :class="{ 'is-active': activeHref === item.href }"
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </component>
        </li>
        <!-- 移动端菜单中也显示登录/注册 -->
        <li v-if="!userStore.isLoggedIn" class="mobile-auth-item">
          <button class="mobile-menu-link auth-mobile-btn" @click="openLoginModal; closeMobileMenu()">登录</button>
        </li>
        <li v-if="userStore.isLoggedIn" class="mobile-auth-item">
          <button class="mobile-menu-link auth-mobile-btn" @click="handleLogout; closeMobileMenu()">退出登录</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  logo: { type: String, required: true },
  logoAlt: { type: String, default: 'Logo' },
  items: { type: Array, required: true },
  className: { type: String, default: '' },
  ease: { type: String, default: 'power3.easeOut' },
  baseColor: { type: String, default: '#0f1011' },
  pillColor: { type: String, default: '#191a1b' },
  hoveredPillTextColor: { type: String, default: '#f7f8f8' },
  pillTextColor: { type: String, default: '#d0d6e0' },
  activePillColor: { type: String, default: '#5e6ad2' },
  activePillTextColor: { type: String, default: '#ffffff' },
  initialLoadAnimation: { type: Boolean, default: true }
})

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const activeHref = computed(() => route.path)

// 圆环动画相关
const circleRefs = ref([])
const tlRefs = ref([])
const activeTweenRefs = ref([])
const logoImgRef = ref(null)
const logoTweenRef = ref(null)
const hamburgerRef = ref(null)
const mobileMenuRef = ref(null)
const navItemsRef = ref(null)
const logoRef = ref(null)

// 用户下拉菜单
const dropdownOpen = ref(false)
const dropdownRef = ref(null)

const cssVars = computed(() => ({
  '--base': props.baseColor,
  '--pill-bg': props.pillColor,
  '--hover-text': props.hoveredPillTextColor,
  '--pill-text': props.pillTextColor,
  '--active-pill-bg': props.activePillColor,
  '--active-pill-text': props.activePillTextColor
}))

const getLinkComponent = (href) => {
  if (!href) return 'a'
  const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')
  return isExternal ? 'a' : 'router-link'
}

const logoLinkComponent = computed(() => {
  const firstHref = props.items[0]?.href
  return getLinkComponent(firstHref)
})

const setCircleRef = (el, idx) => {
  if (el) circleRefs.value[idx] = el
}

// 初始化每个 pill 的圆形动画
const initPillAnimations = () => {
  circleRefs.value.forEach((circle, idx) => {
    if (!circle?.parentElement) return
    const pill = circle.parentElement
    const rect = pill.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    const R = ((w * w) / 4 + h * h) / (2 * h)
    const D = Math.ceil(2 * R) + 2
    const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
    const originY = D - delta

    circle.style.width = `${D}px`
    circle.style.height = `${D}px`
    circle.style.bottom = `-${delta}px`

    gsap.set(circle, {
      xPercent: -50,
      scale: 0,
      transformOrigin: `50% ${originY}px`
    })

    const label = pill.querySelector('.pill-label')
    const white = pill.querySelector('.pill-label-hover')
    if (label) gsap.set(label, { y: 0 })
    if (white) gsap.set(white, { y: h + 12, opacity: 0 })

    const tl = gsap.timeline({ paused: true })
    tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease: props.ease, overwrite: 'auto' }, 0)
    if (label) tl.to(label, { y: -(h + 8), duration: 2, ease: props.ease, overwrite: 'auto' }, 0)
    if (white) {
      gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 })
      tl.to(white, { y: 0, opacity: 1, duration: 2, ease: props.ease, overwrite: 'auto' }, 0)
    }
    tlRefs.value[idx] = tl
  })
}

const handleEnter = (idx) => {
  const tl = tlRefs.value[idx]
  if (!tl) return
  if (activeTweenRefs.value[idx]) activeTweenRefs.value[idx].kill()
  activeTweenRefs.value[idx] = tl.tweenTo(tl.duration(), {
    duration: 0.3,
    ease: props.ease,
    overwrite: 'auto'
  })
}

const handleLeave = (idx) => {
  const tl = tlRefs.value[idx]
  if (!tl) return
  if (activeTweenRefs.value[idx]) activeTweenRefs.value[idx].kill()
  activeTweenRefs.value[idx] = tl.tweenTo(0, {
    duration: 0.2,
    ease: props.ease,
    overwrite: 'auto'
  })
}

const handleLogoEnter = () => {
  if (!logoImgRef.value) return
  if (logoTweenRef.value) logoTweenRef.value.kill()
  gsap.set(logoImgRef.value, { rotate: 0 })
  logoTweenRef.value = gsap.to(logoImgRef.value, {
    rotate: 360,
    duration: 0.2,
    ease: props.ease,
    overwrite: 'auto'
  })
}

// 移动端菜单
const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  const newState = !isMobileMenuOpen.value
  isMobileMenuOpen.value = newState

  const hamburger = hamburgerRef.value
  const menu = mobileMenuRef.value

  if (hamburger) {
    const lines = hamburger.querySelectorAll('.hamburger-line')
    if (newState) {
      gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease: props.ease })
      gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease: props.ease })
    } else {
      gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease: props.ease })
      gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease: props.ease })
    }
  }

  if (menu) {
    if (newState) {
      gsap.set(menu, { visibility: 'visible' })
      gsap.fromTo(menu,
        { opacity: 0, y: 10, scaleY: 1 },
        { opacity: 1, y: 0, scaleY: 1, duration: 0.3, ease: props.ease, transformOrigin: 'top center' }
      )
    } else {
      gsap.to(menu, {
        opacity: 0,
        y: 10,
        scaleY: 1,
        duration: 0.2,
        ease: props.ease,
        transformOrigin: 'top center',
        onComplete: () => {
          gsap.set(menu, { visibility: 'hidden' })
        }
      })
    }
  }
}

const closeMobileMenu = () => {
  if (isMobileMenuOpen.value) toggleMobileMenu()
}

// 用户下拉菜单
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}
const closeDropdown = () => {
  dropdownOpen.value = false
}
const handleLogout = () => {
  userStore.logout()
  closeDropdown()
  router.push('/')
}
// 打开登录弹窗：触发全局事件，由 App.vue 统一处理
const openLoginModal = () => {
  window.dispatchEvent(new CustomEvent('open-auth-modal'))
}

// 点击外部关闭下拉菜单
const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

// 初始加载动画
const startInitialAnimation = () => {
  if (!props.initialLoadAnimation) return
  const logo = logoRef.value
  const navItems = navItemsRef.value
  if (logo) {
    gsap.set(logo, { scale: 0 })
    gsap.to(logo, { scale: 1, duration: 0.6, ease: props.ease })
  }
  if (navItems) {
    gsap.set(navItems, { width: 0, overflow: 'hidden' })
    gsap.to(navItems, { width: 'auto', duration: 0.6, ease: props.ease })
  }
}

const handleResize = () => {
  initPillAnimations()
}

onMounted(() => {
  startInitialAnimation()
  initPillAnimations()
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
  if (document.fonts?.ready) {
    document.fonts.ready.then(initPillAnimations)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
  tlRefs.value.forEach(tl => tl?.kill())
  if (logoTweenRef.value) logoTweenRef.value.kill()
})

watch(() => props.items, () => {
  circleRefs.value = []
  tlRefs.value = []
  activeTweenRefs.value = []
  setTimeout(initPillAnimations, 0)
}, { deep: true })
</script>

<style scoped>
/* 原有样式保持不变，新增用户相关样式 */
.pill-nav-container {
  position: absolute;
  top: 1em;
  z-index: 99;
  width: 100%;
  left: 0;
  display: flex;
  justify-content: center;
}
@media (max-width: 768px) {
  .pill-nav-container {
    width: 100%;
    left: 0;
    top: 0.5em;
  }
}
.pill-nav {
  --nav-h: 42px;
  --logo: 36px;
  --pill-pad-x: 18px;
  --pill-gap: 3px;
  width: max-content;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  background: transparent;
  border-radius: 9999px;
  gap: 12px;
}
@media (max-width: 768px) {
  .pill-nav {
    width: 100%;
    justify-content: space-between;
    padding: 0 1rem;
    background: transparent;
    gap: 0;
  }
}
.pill-nav-items {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--nav-h);
  background: var(--base, #0f1011);
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}
.pill-logo {
  width: var(--nav-h);
  height: var(--nav-h);
  border-radius: 50%;
  background: var(--base, #0f1011);
  padding: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-right: 4px;
}
.pill-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pill-list {
  list-style: none;
  display: flex;
  align-items: stretch;
  gap: var(--pill-gap);
  margin: 0;
  padding: 3px;
  height: 100%;
}
.pill-list > li {
  display: flex;
  height: 100%;
}
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 var(--pill-pad-x);
  background: var(--pill-bg, #191a1b);
  color: var(--pill-text, #d0d6e0);
  text-decoration: none;
  border-radius: 9999px;
  box-sizing: border-box;
  font-weight: 510;
  font-size: 14px;
  line-height: 0;
  letter-spacing: 0.2px;
  white-space: nowrap;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: background 0.2s ease, color 0.2s ease;
}
.pill.is-active {
  background: var(--active-pill-bg, #5e6ad2);
  color: var(--active-pill-text, #ffffff);
}
.pill.is-active .pill-label-hover {
  display: none;
}
.pill.is-active::after {
  display: none;
}
.pill .hover-circle {
  position: absolute;
  left: 50%;
  bottom: 0;
  border-radius: 50%;
  background: var(--base, #0f1011);
  z-index: 1;
  display: block;
  pointer-events: none;
  will-change: transform;
}
.pill .label-stack {
  position: relative;
  display: inline-block;
  line-height: 1;
  z-index: 2;
}
.pill .pill-label {
  position: relative;
  z-index: 2;
  display: inline-block;
  line-height: 1;
  will-change: transform;
}
.pill .pill-label-hover {
  position: absolute;
  left: 0;
  top: 0;
  color: var(--hover-text, #f7f8f8);
  z-index: 3;
  display: inline-block;
  will-change: transform, opacity;
}

/* 用户区域 */
.user-actions {
  margin-left: 8px;
}
.auth-btn.login-btn {
  background: var(--brand-indigo, #5e6ad2);
  border: none;
  border-radius: 9999px; 
  height: var(--nav-h, 42px);
  padding: 0 18px;
  font-size: 14px;
  font-weight: 510;
  line-height: 1;
  color: white;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.auth-btn.login-btn:hover {
  background: var(--brand-hover, #7170ff);
  transform: scale(1.02);
}
.auth-btn.login-btn:active {
  transform: scale(0.98);
}
.user-dropdown {
  position: relative;
  cursor: pointer;
}
.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--brand-indigo, #5e6ad2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 590;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
}
.user-avatar:hover {
  transform: scale(1.05);
}
.dropdown-menu {
  position: absolute;
  top: 45px;
  right: 0;
  background: var(--bg-panel, #0f1011);
  border: 1px solid var(--border-standard, rgba(255,255,255,0.08));
  border-radius: var(--radius-lg, 12px);
  min-width: 160px;
  backdrop-filter: blur(12px);
  z-index: 100;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}
.dropdown-header {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 510;
  color: var(--text-primary, #f7f8f8);
  border-bottom: 1px solid var(--border-subtle, rgba(255,255,255,0.05));
}
.dropdown-item {
  display: block;
  padding: 10px 16px;
  font-size: 13px;
  color: var(--text-secondary, #d0d6e0);
  text-decoration: none;
  transition: background 0.2s;
  cursor: pointer;
}
.dropdown-item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-primary, #f7f8f8);
}
.dropdown-divider {
  height: 1px;
  background: var(--border-subtle, rgba(255,255,255,0.05));
  margin: 4px 0;
}
.logout {
  color: #ff7a7a;
}

/* 移动端适配 */
.mobile-only {
  display: none;
}
.desktop-only {
  display: block;
}
@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: block;
  }
  .user-actions {
    margin-left: 0;
  }
}
.mobile-menu-button {
  width: var(--nav-h);
  height: var(--nav-h);
  border-radius: 50%;
  background: var(--base, #0f1011);
  border: none;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
  position: relative;
}
@media (max-width: 768px) {
  .mobile-menu-button {
    display: flex;
  }
}
.hamburger-line {
  width: 16px;
  height: 2px;
  background: var(--pill-text, #d0d6e0);
  border-radius: 1px;
  transition: all 0.01s ease;
  transform-origin: center;
}
.mobile-menu-popover {
  position: absolute;
  top: 3em;
  left: 1rem;
  right: 1rem;
  background: var(--base, #0f1011);
  border-radius: 27px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 998;
  opacity: 0;
  transform-origin: top center;
  visibility: hidden;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
}
.mobile-menu-list {
  list-style: none;
  margin: 0;
  padding: 3px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.mobile-menu-popover .mobile-menu-link {
  display: block;
  padding: 12px 16px;
  color: var(--pill-text, #d0d6e0);
  background-color: var(--pill-bg, #191a1b);
  text-decoration: none;
  font-size: 16px;
  font-weight: 510;
  border-radius: 50px;
  transition: all 0.2s ease;
  text-align: center;
}
.mobile-menu-popover .mobile-menu-link:hover {
  cursor: pointer;
  background-color: var(--base);
  color: var(--hover-text, #f7f8f8);
}
.mobile-menu-popover .mobile-menu-link.is-active {
  background-color: var(--active-pill-bg, #5e6ad2);
  color: white;
}
.mobile-auth-item {
  margin-top: 4px;
}
.auth-mobile-btn {
  background: var(--brand-indigo, #5e6ad2);
  border: none;
  border-radius: 9999px;
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 510;
  color: white;
  width: 100%;
  text-align: center;
}
</style>