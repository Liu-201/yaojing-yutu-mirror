<template>
  <div class="home">
    <section class="hero">
      <ShinyText
        text="药境·舆图"
        :speed="3"
        :delay="0"
        color="#f7f8f8"
        shineColor="#7170ff"
        :spread="120"
        direction="left"
        :yoyo="true"
        :pauseOnHover="false"
        class="hero-title"
      />
      <p class="hero-sub">道地药材生态溯源与知识问答平台</p>
    </section>
  </div>
</template>

<script setup>
import ShinyText from '@/components/ShinyText.vue'
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero {
  text-align: center;
  padding: var(--space-12) 0 var(--space-10);
}
.hero-title {
  font-size: 72px;
  font-weight: 510;
  letter-spacing: -1.584px;
  margin-bottom: var(--space-4);
  display: inline-block;
}
.hero-sub {
  font-size: 18px;
  color: var(--text-tertiary);
  margin-top: var(--space-4);
}
</style>