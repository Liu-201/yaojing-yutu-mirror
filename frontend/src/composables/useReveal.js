import { onMounted, onUnmounted, ref } from 'vue'

export function useReveal() {
  const observedElements = ref([])
  let observer = null

  onMounted(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

    const elements = document.querySelectorAll('.reveal')
    elements.forEach(el => observer.observe(el))
    observedElements.value = elements
  })

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })
}