<script setup lang="ts">
import { ref } from 'vue'
import ClaimsDistributionChart from '@/components/charts/ClaimsDistributionChart.vue'
import type { ClaimsData } from '@/types/claims.types'

// 賠案險種及理賠金額分布資料 (Mock Data)
const claimsData = ref<ClaimsData[]>([
  {
    id: 'c1',
    category: '車體',
    count: 10,
    amountDistribution: [
      { range: '500,000 以上', count: 0 },
      { range: '300,001-500,000', count: 1 },
      { range: '150,001-300,000', count: 0 },
      { range: '100,001-150,000', count: 3 },
      { range: '25,001-100,000', count: 6 },
      { range: '25,000 以下', count: 0 }
    ]
  },
  {
    id: 'c2',
    category: '竊盜',
    count: 0,
    amountDistribution: []
  },
  {
    id: 'c3',
    category: '責任',
    count: 6,
    amountDistribution: [
      { range: '500,000 以上', count: 0 },
      { range: '300,001-500,000', count: 0 },
      { range: '150,001-300,000', count: 1 },
      { range: '100,001-150,000', count: 2 },
      { range: '25,001-100,000', count: 3 },
      { range: '25,000 以下', count: 0 }
    ]
  },
  {
    id: 'c4',
    category: '傷害',
    count: 0,
    amountDistribution: []
  },
  {
    id: 'c5',
    category: '其他',
    count: 2,
    amountDistribution: [
      { range: '500,000 以上', count: 0 },
      { range: '300,001-500,000', count: 0 },
      { range: '150,001-300,000', count: 0 },
      { range: '100,001-150,000', count: 0 },
      { range: '25,001-100,000', count: 1 },
      { range: '25,000 以下', count: 1 }
    ]
  }
])

function handleCategorySelect(category: string) {
  console.log('Selected category:', category)
}
</script>

<template>
  <div class="claims-view">
    <div class="page-header">
      <h1>賠案險種統計</h1>
      <p class="subtitle">各險種理賠件數及金額分布情形</p>
    </div>

    <div class="chart-container-card">
      <div class="chart-header">
        <h2>賠案險種及理賠金額分布</h2>
      </div>
      <div class="chart-wrapper">
        <ClaimsDistributionChart
          :data="claimsData"
          :width="800"
          :height="400"
          @category-select="handleCategorySelect"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.claims-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 8px;
}

.subtitle {
  color: #7f8c8d;
  font-size: 16px;
}

.chart-container-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 40px;
}

.chart-header {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.chart-header h2 {
  font-size: 20px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.chart-wrapper {
  display: flex;
  justify-content: center;
}
</style>
