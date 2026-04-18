<template>
  <div class="home">
    <section class="hero">
      <h1 class="hero-title">药境·舆图</h1>
      <p class="hero-sub">道地药材生态溯源与知识问答平台</p>
      <div class="hero-buttons">
        <router-link to="/herbs" class="btn-primary">探索药典</router-link>
        <router-link to="/map" class="btn-ghost">舆图寻药</router-link>
        <button class="btn-ghost">AI 问药</button>
      </div>
    </section>
    <!-- 后续加地图预览等 -->
  </div>
</template>

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
  background: linear-gradient(135deg, #f7f8f8 0%, #7170ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  margin-bottom: var(--space-4);
}
.hero-sub {
  font-size: 18px;
  color: var(--text-tertiary);
  margin-bottom: var(--space-8);
}
.btn-primary, .btn-ghost {
  display: inline-block;
  padding: 10px 24px;
  border-radius: var(--radius-md);
  font-weight: 510;
  font-size: 15px;
  margin: 0 var(--space-2);
}
.btn-primary {
  background: var(--brand-indigo);
  color: white;
  border: none;
}
.btn-primary:hover {
  background: var(--brand-hover);
}
.btn-ghost {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border-standard);
  color: var(--text-secondary);
}
</style>