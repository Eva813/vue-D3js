# 元件合約：BarChart.vue

**元件名稱**: BarChart  
**檔案位置**: `src/components/charts/BarChart.vue`  
**用途**: 可重用的長條圖元件，支援響應式資料更新和互動功能

---

## Props 介面

```typescript
interface BarChartProps {
  /**
   * 圖表資料（必要）
   * 每個資料點必須包含 id, label, value
   */
  data: ChartData[]
  
  /**
   * SVG 寬度（像素）
   * @default 600
   */
  width?: number
  
  /**
   * SVG 高度（像素）
   * @default 400
   */
  height?: number
  
  /**
   * 圖表邊距
   * @default { top: 20, right: 20, bottom: 40, left: 50 }
   */
  margin?: Margin
  
  /**
   * 長條之間的間距比例 (0-1)
   * @default 0.1
   */
  padding?: number
  
  /**
   * 顏色配置
   * @default { primary: 'steelblue', hover: 'orange' }
   */
  colors?: ColorScheme
  
  /**
   * 是否啟用過渡動畫
   * @default true
   */
  animated?: boolean
  
  /**
   * 動畫持續時間（毫秒）
   * @default 750
   */
  animationDuration?: number
  
  /**
   * 是否顯示座標軸
   * @default true
   */
  showAxes?: boolean
  
  /**
   * X 軸標籤文字
   */
  xAxisLabel?: string
  
  /**
   * Y 軸標籤文字
   */
  yAxisLabel?: string
}
```

## Emits 定義

```typescript
interface BarChartEmits {
  /**
   * 當長條被點擊時觸發
   * @param data - 被點擊的資料點
   * @param event - 滑鼠事件物件
   */
  'bar-click': [data: ChartData, event: MouseEvent]
  
  /**
   * 當滑鼠懸停在長條上時觸發
   * @param data - 懸停的資料點（null 表示離開）
   * @param event - 滑鼠事件物件
   */
  'bar-hover': [data: ChartData | null, event: MouseEvent]
  
  /**
   * 當圖表首次渲染完成時觸發
   */
  'chart-ready': []
  
  /**
   * 當圖表因資料變更而更新完成時觸發
   */
  'chart-updated': []
}
```

## 使用範例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import BarChart from '@/components/charts/BarChart.vue'
import type { ChartData } from '@/types/chart.types'

const chartData = ref<ChartData[]>([
  { id: '1', label: 'A', value: 30 },
  { id: '2', label: 'B', value: 80 },
  { id: '3', label: 'C', value: 45 }
])

function handleBarClick(data: ChartData, event: MouseEvent) {
  console.log('Clicked:', data.label, data.value)
}

function handleBarHover(data: ChartData | null, event: MouseEvent) {
  if (data) {
    console.log('Hovering:', data.label)
  }
}
</script>

<template>
  <BarChart
    :data="chartData"
    :width="800"
    :height="500"
    :animated="true"
    :show-axes="true"
    x-axis-label="類別"
    y-axis-label="數值"
    @bar-click="handleBarClick"
    @bar-hover="handleBarHover"
    @chart-ready="() => console.log('Chart ready!')"
  />
</template>
```

## 行為規範

### 資料更新
- 當 `data` prop 變更時，圖表應使用 Enter/Update/Exit 模式更新
- 如果 `animated` 為 true，應顯示平滑過渡動畫
- 動畫持續時間由 `animationDuration` 控制

### 互動行為
- 滑鼠懸停時，長條顏色變更為 `colors.hover`
- 點擊長條時觸發 `bar-click` 事件
- 滑鼠離開時恢復原始顏色

### 錯誤處理
- 如果 `data` 為空陣列，應顯示空狀態訊息
- 如果資料驗證失敗，應在 console 警告並拒絕渲染

---

**版本**: 1.0.0  
**最後更新**: 2025年12月26日
