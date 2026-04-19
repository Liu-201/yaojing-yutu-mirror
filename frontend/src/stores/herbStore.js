import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/utils/api'

export const useHerbStore = defineStore('herb', () => {
  const herbs = ref([])
  const producingAreas = ref([])

  // 从后端获取药材列表，并映射字段以兼容前端组件
  async function fetchHerbs() {
    try {
      const data = await api.get('/herbs')
      // 映射后端字段到前端期望的字段名
      herbs.value = data.map(item => ({
        id: item.id,
        name: item.name,
        latinName: item.latin_name,
        category: item.category,
        categoryLabel: item.category_label,
        image: item.image_url,
        effectShort: item.effect_short,
        effects: item.effects,
        propertyFlavor: item.property_flavor,
        producingArea: item.producing_area,
        chemicalComposition: item.chemical_composition,
        historicalStory: item.historical_story,
        status: item.status
      }))
    } catch (error) {
      console.error('获取药材列表失败:', error)
      herbs.value = []
    }
  }

  // 从后端获取产区列表
  async function fetchProducingAreas() {
    try {
      const data = await api.get('/herbs/areas/all')
      producingAreas.value = data.map(item => ({
        id: item.id,
        name: item.name,
        city: item.city,
        province: item.province,
        herbId: item.herb_id,
        herbName: item.herb_name,
        lng: parseFloat(item.lng),
        lat: parseFloat(item.lat),
        description: item.description
      }))
    } catch (error) {
      console.error('获取产区列表失败:', error)
      producingAreas.value = []
    }
  }

  return { herbs, producingAreas, fetchHerbs, fetchProducingAreas }
})