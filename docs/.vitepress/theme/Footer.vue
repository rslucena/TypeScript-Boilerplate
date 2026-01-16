<script setup lang="ts">
import { useData } from 'vitepress'
const { site } = useData()
</script>

<template>
  <footer class="VPFooter">
    <div class="container">
      <p class="footer-text">Released under the MIT License.</p>
      <p class="footer-text">Copyright © 2023 - Present.</p>
    </div>
  </footer>
</template>

<style scoped>
.VPFooter {
  padding: 32px 24px;
  border-top: 1px solid var(--vp-c-divider);
  text-align: center;
  background-color: var(--vp-c-bg);
}

.VPFooter .container {
  max-width: var(--vp-layout-max-width);
  margin: 0 auto;
}

.footer-text {
  margin: 0;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.dark .VPFooter {
  border-color: var(--vp-c-divider);
}
</style>
