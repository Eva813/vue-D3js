# Composable 合約：useD3Axis

**函式名稱**: useD3Axis  
**檔案位置**: `src/composables/useD3Axis.ts`  
**用途**: 自動繪製和更新 D3 座標軸

---

## 函式簽名

```typescript
function useD3Axis(
  chartGroup: Ref<d3.Selection<SVGGElement, unknown, null, undefined> | null>,
  xScale: Ref<d3.ScaleBand<string>>,
  yScale: Ref<d3.ScaleLinear<number, number>>,
  innerHeight: number,
  config?: D3AxisConfig
): void
```

## 參數

### chartGroup
- **類型**: `Ref<d3.Selection<SVGGElement, unknown, null, undefined> | null>`
- **說明**: 主要圖表群組（來自 useD3Chart）
- **必要性**: 必要

### xScale
- **類型**: `Ref<d3.ScaleBand<string>>`
- **說明**: X 軸 Scale（來自 useD3Scale）
- **必要性**: 必要

### yScale
- **類型**: `Ref<d3.ScaleLinear<number, number>>`
- **說明**: Y 軸 Scale（來自 useD3Scale）
- **必要性**: 必要

### innerHeight
- **類型**: `number`
- **說明**: 內部繪圖區域高度（用於定位 X 軸）
- **必要性**: 必要

### config
- **類型**: `D3AxisConfig`
- **說明**: 座標軸配置（可選）
- **必要性**: 可選
- **預設值**: `{ xAxis: { show: true }, yAxis: { show: true } }`

## 配置選項

```typescript
interface AxisConfig {
  show: boolean          // 是否顯示此軸
  label?: string         // 軸標籤文字
  ticks?: number         // 刻度數量
  tickFormat?: (value: any) => string  // 刻度格式化
  color?: string         // 軸線顏色
}

interface D3AxisConfig {
  xAxis?: AxisConfig
  yAxis?: AxisConfig
}
```

## 使用範例

```typescript
<script setup lang="ts">
import { ref } from 'vue'
import { useD3Chart } from '@/composables/useD3Chart'
import { useD3Scale } from '@/composables/useD3Scale'
import { useD3Axis } from '@/composables/useD3Axis'
import type { ChartData } from '@/types/chart.types'

const svgRef = ref<SVGSVGElement | null>(null)
const data = ref<ChartData[]>([
  { id: '1', label: 'A', value: 30 },
  { id: '2', label: 'B', value: 80 }
])

const dimensions = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 50 }
}

const { chartGroup, getInnerWidth, getInnerHeight } = useD3Chart(
  svgRef,
  dimensions
)

const { xScale, yScale } = useD3Scale(
  data,
  getInnerWidth(),
  getInnerHeight()
)

// 自動繪製和更新座標軸
useD3Axis(chartGroup, xScale, yScale, getInnerHeight(), {
  xAxis: {
    show: true,
    label: '類別',
    color: '#333'
  },
  yAxis: {
    show: true,
    label: '數值',
    ticks: 5,
    tickFormat: (value) => `${value}%`
  }
})
</script>

<template>
  <svg ref="svgRef"></svg>
</template>
```

## 行為規範

### X 軸繪製
1. 使用 `d3.axisBottom(xScale.value)` 建立軸生成器
2. 在 `chartGroup` 中新增 `<g class="x-axis">` 元素
3. 套用 `transform` 定位到底部：`translate(0, ${innerHeight})`
4. 如果有 `label`，在軸下方新增文字標籤

### Y 軸繪製
1. 使用 `d3.axisLeft(yScale.value)` 建立軸生成器
2. 在 `chartGroup` 中新增 `<g class="y-axis">` 元素
3. 套用 `ticks` 和 `tickFormat` 配置
4. 如果有 `label`，在軸左方新增旋轉文字標籤

### 自動更新
- 使用 `watch([chartGroup, xScale, yScale], ...)` 監聽變更
- 每次更新前先移除舊的軸元素（`.selectAll('.x-axis').remove()`）
- 重新繪製新的軸元素

### CSS 類別
- X 軸：`.x-axis`
- Y 軸：`.y-axis`
- 軸標籤：`.axis-label`

## 錯誤處理

- 如果 `chartGroup.value` 為 null，不執行任何操作
- 如果 `config.xAxis.show` 或 `yAxis.show` 為 false，跳過該軸繪製

---

**版本**: 1.0.0  
**最後更新**: 2025年12月26日
