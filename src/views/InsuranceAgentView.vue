<script setup lang="ts">
import { ref, computed } from 'vue'
import HorizontalBarChart from '@/components/charts/HorizontalBarChart.vue'
import type { ChartData } from '@/types/chart.types'

// 產險業務員資料
const agentData = ref<ChartData[]>([
  { id: '1', label: '王小明', value: 45 },
  { id: '2', label: '李美玲', value: 62 },
  { id: '3', label: '張志豪', value: 38 },
  { id: '4', label: '陳雅婷', value: 71 },
  { id: '5', label: '林建宏', value: 55 }
])

// 排序狀態
const sortOrder = ref<'none' | 'asc' | 'desc'>('none')

// 計算排序後的資料
const sortedData = computed(() => {
  if (sortOrder.value === 'none') {
    return agentData.value
  }
  
  const sorted = [...agentData.value].sort((a, b) => {
    return sortOrder.value === 'asc' 
      ? a.value - b.value 
      : b.value - a.value
  })
  
  return sorted
})

// 點擊長條事件處理
function handleBarClick(data: ChartData) {
  const message = `業務員 ${data.label} 的保單數量為 ${data.value} 件`
  if (typeof globalThis.alert === 'function') {
    globalThis.alert(message)
  }
}

// 隨機更新資料
function randomizeData() {
  agentData.value = agentData.value.map(d => ({
    ...d,
    value: Math.floor(Math.random() * 80) + 20 // 20-99 之間
  }))
}

// 切換排序
function toggleSort() {
  if (sortOrder.value === 'none') {
    sortOrder.value = 'desc'
  } else if (sortOrder.value === 'desc') {
    sortOrder.value = 'asc'
  } else {
    sortOrder.value = 'none'
  }
}

// 取得排序按鈕文字
const sortButtonText = computed(() => {
  switch (sortOrder.value) {
    case 'desc':
      return '📊 由高到低'
    case 'asc':
      return '📊 由低到高'
    default:
      return '📊 預設排序'
  }
})

// 計算統計資訊
const statistics = computed(() => {
  const values = agentData.value.map(d => d.value)
  const total = values.reduce((sum, val) => sum + val, 0)
  const average = total / values.length
  const max = Math.max(...values)
  const maxAgent = agentData.value.find(d => d.value === max)
  
  return {
    total,
    average: Math.round(average),
    max,
    maxAgent: maxAgent?.label || ''
  }
})
</script>

<template>
  <div class="insurance-agent-view">
    <div class="header">
      <h1>🏢 產險業務員保單績效統計</h1>
      <p class="subtitle">
        本月保單成交數量統計
      </p>
    </div>
    
    <div class="statistics-panel">
      <div class="stat-card">
        <div class="stat-label">
          總保單數
        </div>
        <div class="stat-value">
          {{ statistics.total }} 件
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">
          平均數量
        </div>
        <div class="stat-value">
          {{ statistics.average }} 件
        </div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">
          最佳業務
        </div>
        <div class="stat-value">
          {{ statistics.maxAgent }}
        </div>
        <div class="stat-detail">
          {{ statistics.max }} 件
        </div>
      </div>
    </div>
    
    <div class="controls">
      <button 
        class="btn-primary"
        @click="randomizeData"
      >
        🎲 更新資料
      </button>
      <button 
        class="btn-secondary"
        @click="toggleSort"
      >
        {{ sortButtonText }}
      </button>
    </div>
    
    <div class="chart-section">
      <HorizontalBarChart
        :data="sortedData"
        :width="800"
        :height="350"
        @bar-click="handleBarClick"
      />
    </div>
    
    <div class="data-table">
      <h3>詳細資料</h3>
      <table>
        <thead>
          <tr>
            <th>業務員姓名</th>
            <th>保單數量</th>
            <th>佔比</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="agent in sortedData" 
            :key="agent.id"
          >
            <td class="agent-name">
              {{ agent.label }}
            </td>
            <td class="policy-count">
              {{ agent.value }} 件
            </td>
            <td class="percentage">
              {{ ((agent.value / statistics.total) * 100).toFixed(1) }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.insurance-agent-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 8px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 14px;
}

.statistics-panel {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  justify-content: center;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 150px;
}

.stat-card.highlight {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-detail {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  justify-content: center;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(149, 165, 166, 0.3);
}

.chart-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.data-table {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.data-table h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
}

tbody tr:hover {
  background: #f8f9fa;
}

.agent-name {
  font-weight: 500;
  color: #2c3e50;
}

.policy-count {
  color: #4a90e2;
  font-weight: 600;
}

.percentage {
  color: #7f8c8d;
}
</style>
