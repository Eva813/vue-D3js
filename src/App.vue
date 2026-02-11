<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h2>📊 Vue 3 + D3.js</h2>
      </div>
      <div class="nav-links">
        <RouterLink 
          :to="{ name: 'home' }"
          class="nav-link"
        >
          首頁
        </RouterLink>
        <RouterLink 
          :to="{ name: 'insurance-agents' }"
          class="nav-link"
        >
          產險業務員績效
        </RouterLink>
      </div>
    </nav>
    
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f7fa;
}

.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand h2 {
  color: #2c3e50;
  font-size: 20px;
  margin: 0;
  padding: 16px 0;
}

.nav-links {
  display: flex;
  gap: 8px;
}

.nav-link {
  padding: 10px 20px;
  color: #5a6c7d;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: #f0f3f7;
  color: #2c3e50;
}

.nav-link.router-link-active {
  background: #4a90e2;
  color: white;
}

.main-content {
  width: 100%;
  max-width: var(--content-max-width, 1280px);
  margin: 0 auto;
  padding: 0 20px;
  min-height: calc(100vh - 64px);
}
</style>
