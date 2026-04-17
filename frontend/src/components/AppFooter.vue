<template>
  <footer class="app-footer">
    <div class="footer-container">
      <p class="copyright">© 2026 药境·舆图 | 数据来源于《中国药典》及公开文献，AI回答仅供参考</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-panel);
  padding: var(--space-6) 0;
}
.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
  padding: 0 var(--space-6);
}
.copyright {
  font-size: 13px;
  color: var(--text-quaternary);
}
</style>