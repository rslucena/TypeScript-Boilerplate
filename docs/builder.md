---
layout: page
---

<script setup>
</script>

<div class="builder-container">
  <h1>Diagram Builder</h1>
  <p>Drag nodes, connect them, edit properties, and export to usage code.</p>
  
  <ClientOnly>
    <DiagramBuilder />
  </ClientOnly>

</div>

<style>
.builder-container {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.builder-container .p {
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}
</style>
