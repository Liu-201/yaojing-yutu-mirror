import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHerbStore = defineStore('herb', () => {
  const herbs = ref([])

  async function fetchHerbs() {
    // 模拟异步加载数据（实际可从 API 获取）
    // 这里硬编码一些示例药材，后续可替换
    herbs.value = [
      {
        id: 1,
        name: '黄芪',
        latinName: 'Astragalus membranaceus',
        category: 'root',
        categoryLabel: '根茎类',
        image: 'https://picsum.photos/id/104/300/300', // 临时占位图
        effectShort: '补气固表',
        effects: '补气固表，利尿托毒，排脓敛疮生肌。',
        propertyFlavor: '甘，温。归脾、肺经。',
        producingArea: '山西、甘肃、内蒙古',
        chemicalComposition: '黄芪多糖、黄芪甲苷、毛蕊异黄酮等。',
        historicalStory: '黄芪原名“黄耆”，李时珍释名：“耆，长也。黄耆色黄，为补药之长。”',
        status: 'common'
      },
      {
        id: 2,
        name: '党参',
        latinName: 'Codonopsis pilosula',
        category: 'root',
        categoryLabel: '根茎类',
        image: 'https://picsum.photos/id/106/300/300',
        effectShort: '健脾益肺',
        effects: '补中益气，健脾益肺。用于脾肺虚弱，气短心悸。',
        propertyFlavor: '甘，平。归脾、肺经。',
        producingArea: '甘肃、四川、陕西',
        chemicalComposition: '党参多糖、党参苷、生物碱等。',
        historicalStory: '党参因产于山西上党地区而得名，古时与人参混用。',
        status: 'common'
      },
      {
        id: 3,
        name: '丹参',
        latinName: 'Salvia miltiorrhiza',
        category: 'root',
        categoryLabel: '根茎类',
        image: 'https://picsum.photos/id/10/300/300',
        effectShort: '活血祛瘀',
        effects: '活血祛瘀，通经止痛，清心除烦。',
        propertyFlavor: '苦，微寒。归心、肝经。',
        producingArea: '四川、山东、河南',
        chemicalComposition: '丹参酮、丹参酚酸等。',
        historicalStory: '“一味丹参，功同四物”，民间常以之代茶饮。',
        status: 'common'
      },
      {
        id: 4,
        name: '人参',
        latinName: 'Panax ginseng',
        category: 'root',
        categoryLabel: '根茎类',
        image: 'https://picsum.photos/id/112/300/300',
        effectShort: '大补元气',
        effects: '大补元气，复脉固脱，补脾益肺。',
        propertyFlavor: '甘、微苦，微温。归脾、肺、心、肾经。',
        producingArea: '吉林、辽宁、黑龙江',
        chemicalComposition: '人参皂苷、多糖、挥发油等。',
        historicalStory: '《神农本草经》列为上品，誉为“百草之王”。',
        status: 'rare'
      }
    ]
  }

  return { herbs, fetchHerbs }
})