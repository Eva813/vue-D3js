# Composable 合約：useD3Chart

**函式名稱**: useD3Chart  
**檔案位置**: `src/composables/useD3Chart.ts`  
**用途**: 管理 D3 圖表的生命週期、SVG 初始化和清理

---

## 函式簽名

```typescript
function useD3Chart(
  svgRef: Ref<SVGSVGElement | null>,
  dimensions: ChartDimensions
): D3ChartReturn
```

## 參數

### svgRef
- **類型**: `Ref<SVGSVGElement | null>`
- **說明**: Vue template ref，指向 SVG 元素
- **必要性**: 必要

### dimensions
- **類型**: `ChartDimensions`
- **說明**: 圖表尺寸配置（width, height, margin）
- **必要性**: 必要

## 返回值

```typescript
interface D3ChartReturn {
  /** SVG D3 選擇器 */
  svg: Ref<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>
  
  /** 主要圖表群組（已套用 margin transform） */
  chartGroup: Ref<d3.Selection<SVGGElement, unknown, null, undefined> | null>
  
  /** 計算內部繪圖區域寬度 */
  getInnerWidth: () => number
  
  /** 計算內部繪圖區域高度 */
  getInnerHeight: () => number
  
  /** 手動清理函式（通常不需要，onUnmounted 會自動呼叫） */
  cleanup: () => void
}
```

## 使用範例

```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useD3Chart } from '@/composables/useD3Chart'
import type { ChartDimensions } from '@/types/chart.types'

const svgRef = ref<SVGSVGElement | null>(null)

const dimensions: ChartDimensions = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 50 }
}

const { svg, chartGroup, getInnerWidth, getInnerHeight } = useD3Chart(
  svgRef,
  dimensions
)

onMounted(() => {
  if (!chartGroup.value) return
  
  // 使用 chartGroup 繪製圖表
  chartGroup.value
    .append('rect')
    .attr('width', getInnerWidth())
    .attr('height', getInnerHeight())
    .attr('fill', 'lightgray')
})
</script>

<template>
  <svg ref="svgRef"></svg>
</template>
```

## 行為規範

### 初始化（onMounted）
1. 建立 D3 選擇器指向 `svgRef.value`
2. 設定 SVG 的 width 和 height 屬性
3. 建立主要 `<g>` 群組並套用 margin transform
4. 將選擇器存入 reactive refs

### 清理（onUnmounted）
1. 中斷所有進行中的過渡動畫
2. 移除所有事件監聽器
3. 清空 SVG 內容
4. 將 refs 設為 null

### 內部區域計算
- `getInnerWidth()`: `dimensions.width - margin.left - margin.right`
- `getInnerHeight()`: `dimensions.height - margin.top - margin.bottom`

## 錯誤處理

- 如果 `svgRef.value` 為 null，應在 console 警告並返回空選擇器
- 如果 margin 導致內部區域 ≤ 0，應拋出錯誤

---

**版本**: 1.0.0  
**最後更新**: 2025年12月26日
