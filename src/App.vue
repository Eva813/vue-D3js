<script setup lang="ts">
import { ref } from 'vue'
import SimpleBarChart from './components/charts/SimpleBarChart.vue'
import type { ChartData } from './types/chart.types'

const chartData = ref<ChartData[]>([
  { id: '1', label: 'A', value: 30 },
  { id: '2', label: 'B', value: 80 },
  { id: '3', label: 'C', value: 45 },
  { id: '4', label: 'D', value: 60 },
  { id: '5', label: 'E', value: 20 }
])

function handleBarClick(data: ChartData) {
  const message = `你點擊了 ${data.label}，數值為 ${data.value}`
  if (typeof globalThis.alert === 'function') {
    globalThis.alert(message)
  }
}

function randomizeData() {
  chartData.value = chartData.value.map(d => ({
    ...d,
    value: Math.floor(Math.random() * 100)
  }))
}

function addBar() {
  const newId = String(chartData.value.length + 1)
  const newLabel = String.fromCharCode(65 + chartData.value.length) // A, B, C...
  chartData.value.push({
    id: newId,
    label: newLabel,
    value: Math.floor(Math.random() * 100)
  })
}

function removeBar() {
  if (chartData.value.length > 0) {
    chartData.value.pop()
  }
}
</script>

<template>
  <div class="app">
    <h1>Vue 3 + D3.js 長條圖範例</h1>
    
    <div class="controls">
      <button @click="randomizeData">
        🎲 隨機更新數值
      </button>
      <button @click="addBar">
        ➕ 新增長條
      </button>
      <button @click="removeBar">
        ➖ 移除長條
      </button>
    </div>
    
    <SimpleBarChart
      :data="chartData"
      :width="800"
      :height="500"
      @bar-click="handleBarClick"
    />
    
    <div class="data-display">
      <h3>目前資料：</h3>
      <pre>{{ JSON.stringify(chartData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

h1 {
  color: #333;
}

.controls {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #357abd;
}

.data-display {
  margin-top: 30px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

pre {
  font-size: 12px;
  overflow-x: auto;
}
</style>
