# Vue 3 + D3.js 元件架構與測試策略研究

**專案**: Vue 3 + D3.js 學習專案  
**研究日期**: 2025年12月26日  
**技術棧**: Vue 3.5+ (Composition API)、TypeScript strict mode、Vite 7、D3.js v7、Vitest

---

## 5. 元件架構設計

### 決策：Composable 函式庫 + Presentational 元件模式

### 核心架構

```
src/
├── components/
│   ├── charts/
│   │   ├── BarChart.vue          # 長條圖元件
│   │   ├── LineChart.vue         # 折線圖元件
│   │   └── ChartContainer.vue    # 共用容器元件
│   └── common/
│       └── ChartLegend.vue       # 圖例元件
├── composables/
│   ├── useD3Chart.ts             # 核心圖表邏輯
│   ├── useD3Scale.ts             # Scale 管理
│   ├── useD3Axis.ts              # 座標軸管理
│   ├── useChartResize.ts         # 響應式尺寸
│   └── useChartAnimation.ts      # 動畫控制
└── types/
    └── chart.types.ts            # 共用類型定義
```

### 理由

1. **職責分離**：Composables 處理 D3 邏輯，Vue 元件處理展示和互動
2. **可重用性**：Composables 可在多個圖表元件間共用
3. **可測試性**：純函式庫邏輯更容易單元測試
4. **型態安全**：集中式類型定義確保一致性
5. **符合 Vue 3 最佳實踐**：充分利用 Composition API 優勢

### 實作範例：可重用長條圖元件

#### 1. 共用類型定義

```typescript
// src/types/chart.types.ts

export interface ChartMargin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ChartDimensions {
  width: number
  height: number
  innerWidth: number
  innerHeight: number
}

export interface BarChartData {
  id: string
  label: string
  value: number
  color?: string
}

export interface LineChartData {
  id: string
  date: Date
  value: number
}

export interface ChartProps {
  width?: number
  height?: number
  margin?: Partial<ChartMargin>
  data: BarChartData[] | LineChartData[]
  animated?: boolean
}

export interface ChartConfig {
  colors: string[]
  transitionDuration: number
  axisTickCount: number
}
```

#### 2. 核心 Composable - useD3Chart

```typescript
// src/composables/useD3Chart.ts

import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import * as d3 from 'd3'
import type { ChartMargin, ChartDimensions } from '@/types/chart.types'

export interface UseD3ChartOptions {
  margin?: ChartMargin
  responsive?: boolean
}

export function useD3Chart(
  containerRef: Ref<HTMLElement | null>,
  options: UseD3ChartOptions = {}
) {
  const defaultMargin: ChartMargin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40,
    ...options.margin
  }

  const svg = ref<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null)
  const chartGroup = ref<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null)
  const dimensions = ref<ChartDimensions>({
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0
  })

  // 初始化 SVG
  const initSVG = (width: number, height: number) => {
    if (!containerRef.value) return

    // 清除現有內容
    d3.select(containerRef.value).selectAll('*').remove()

    // 建立 SVG
    svg.value = d3
      .select(containerRef.value)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('role', 'img')
      .attr('aria-label', 'Data visualization chart')

    // 建立主繪圖群組
    chartGroup.value = svg.value
      .append('g')
      .attr('transform', `translate(${defaultMargin.left},${defaultMargin.top})`)

    // 計算內部尺寸
    dimensions.value = {
      width,
      height,
      innerWidth: width - defaultMargin.left - defaultMargin.right,
      innerHeight: height - defaultMargin.top - defaultMargin.bottom
    }
  }

  // 響應式尺寸調整
  let resizeObserver: ResizeObserver | null = null

  const setupResize = (callback: (width: number, height: number) => void) => {
    if (!options.responsive || !containerRef.value) return

    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width, height } = entry.contentRect
        callback(width, height)
      }
    })

    resizeObserver.observe(containerRef.value)
  }

  // 清理資源
  const cleanup = () => {
    if (svg.value) {
      svg.value.selectAll('*').interrupt() // 中斷所有動畫
      svg.value.remove()
      svg.value = null
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    chartGroup.value = null
  }

  onUnmounted(cleanup)

  return {
    svg,
    chartGroup,
    dimensions,
    initSVG,
    setupResize,
    cleanup
  }
}
```

#### 3. Scale 管理 Composable

```typescript
// src/composables/useD3Scale.ts

import * as d3 from 'd3'
import { computed, type Ref } from 'vue'
import type { BarChartData } from '@/types/chart.types'

export function useD3Scale(
  data: Ref<BarChartData[]>,
  width: Ref<number>,
  height: Ref<number>
) {
  // X 軸 Scale (類別)
  const xScale = computed(() => {
    return d3
      .scaleBand<string>()
      .domain(data.value.map(d => d.label))
      .range([0, width.value])
      .padding(0.1)
  })

  // Y 軸 Scale (數值)
  const yScale = computed(() => {
    const maxValue = d3.max(data.value, d => d.value) || 0
    return d3
      .scaleLinear()
      .domain([0, maxValue * 1.1]) // 留 10% 上方空間
      .range([height.value, 0])
      .nice() // 自動調整刻度為整數
  })

  // 顏色 Scale
  const colorScale = computed(() => {
    return d3
      .scaleOrdinal<string>()
      .domain(data.value.map(d => d.label))
      .range(d3.schemeCategory10)
  })

  return {
    xScale,
    yScale,
    colorScale
  }
}
```

#### 4. 座標軸管理 Composable

```typescript
// src/composables/useD3Axis.ts

import * as d3 from 'd3'
import type { Ref } from 'vue'

export function useD3Axis(
  chartGroup: Ref<d3.Selection<SVGGElement, unknown, null, undefined> | null>,
  xScale: Ref<d3.ScaleBand<string>>,
  yScale: Ref<d3.ScaleLinear<number, number>>,
  height: Ref<number>
) {
  const renderXAxis = () => {
    if (!chartGroup.value) return

    const xAxisGroup = chartGroup.value
      .selectAll<SVGGElement, unknown>('.x-axis')
      .data([null])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height.value})`)

    const xAxis = d3.axisBottom(xScale.value)
    xAxisGroup.call(xAxis)
    
    // 樣式美化
    xAxisGroup.selectAll('text')
      .attr('font-size', '12px')
      .attr('color', '#666')
  }

  const renderYAxis = () => {
    if (!chartGroup.value) return

    const yAxisGroup = chartGroup.value
      .selectAll<SVGGElement, unknown>('.y-axis')
      .data([null])
      .join('g')
      .attr('class', 'y-axis')

    const yAxis = d3.axisLeft(yScale.value).ticks(5)
    yAxisGroup.call(yAxis)
    
    // 樣式美化
    yAxisGroup.selectAll('text')
      .attr('font-size', '12px')
      .attr('color', '#666')
  }

  const updateAxes = () => {
    renderXAxis()
    renderYAxis()
  }

  return {
    renderXAxis,
    renderYAxis,
    updateAxes
  }
}
```

#### 5. 長條圖元件實作

```vue
<!-- src/components/charts/BarChart.vue -->

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import * as d3 from 'd3'
import { useD3Chart } from '@/composables/useD3Chart'
import { useD3Scale } from '@/composables/useD3Scale'
import { useD3Axis } from '@/composables/useD3Axis'
import type { BarChartData, ChartMargin } from '@/types/chart.types'

interface BarChartProps {
  data: BarChartData[]
  width?: number
  height?: number
  margin?: Partial<ChartMargin>
  animated?: boolean
  responsive?: boolean
}

const props = withDefaults(defineProps<BarChartProps>(), {
  width: 600,
  height: 400,
  animated: true,
  responsive: false
})

const emit = defineEmits<{
  barClick: [data: BarChartData]
  barHover: [data: BarChartData | null]
}>()

// Refs
const containerRef = ref<HTMLDivElement | null>(null)
const dataRef = computed(() => props.data)

// 使用 Composables
const { chartGroup, dimensions, initSVG, setupResize } = useD3Chart(
  containerRef,
  {
    margin: props.margin,
    responsive: props.responsive
  }
)

const innerWidth = computed(() => dimensions.value.innerWidth)
const innerHeight = computed(() => dimensions.value.innerHeight)

const { xScale, yScale, colorScale } = useD3Scale(
  dataRef,
  innerWidth,
  innerHeight
)

const { updateAxes } = useD3Axis(
  chartGroup,
  xScale,
  yScale,
  innerHeight
)

// 渲染長條圖
const renderBars = () => {
  if (!chartGroup.value) return

  const bars = chartGroup.value
    .selectAll<SVGRectElement, BarChartData>('rect.bar')
    .data(dataRef.value, d => d.id)

  // Exit
  bars.exit()
    .transition()
    .duration(props.animated ? 300 : 0)
    .attr('height', 0)
    .attr('y', innerHeight.value)
    .remove()

  // Update
  bars
    .transition()
    .duration(props.animated ? 300 : 0)
    .attr('x', d => xScale.value(d.label) || 0)
    .attr('y', d => yScale.value(d.value))
    .attr('width', xScale.value.bandwidth())
    .attr('height', d => innerHeight.value - yScale.value(d.value))
    .attr('fill', d => d.color || colorScale.value(d.label))

  // Enter
  bars
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale.value(d.label) || 0)
    .attr('y', innerHeight.value)
    .attr('width', xScale.value.bandwidth())
    .attr('height', 0)
    .attr('fill', d => d.color || colorScale.value(d.label))
    .attr('cursor', 'pointer')
    .attr('role', 'graphics-symbol')
    .attr('aria-label', d => `${d.label}: ${d.value}`)
    .on('click', (event, d) => {
      emit('barClick', d)
    })
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('opacity', 0.8)
      emit('barHover', d)
    })
    .on('mouseleave', function() {
      d3.select(this).attr('opacity', 1)
      emit('barHover', null)
    })
    .transition()
    .duration(props.animated ? 300 : 0)
    .attr('y', d => yScale.value(d.value))
    .attr('height', d => innerHeight.value - yScale.value(d.value))
}

// 完整圖表更新
const updateChart = () => {
  updateAxes()
  renderBars()
}

// 初始化
onMounted(() => {
  initSVG(props.width, props.height)
  updateChart()

  if (props.responsive) {
    setupResize((width, height) => {
      initSVG(width, height)
      updateChart()
    })
  }
})

// 監聽資料變化
watch(dataRef, updateChart, { deep: true })
</script>

<template>
  <div ref="containerRef" class="bar-chart-container">
    <!-- D3 會在這裡渲染 SVG -->
  </div>
</template>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* SVG 樣式 */
:deep(svg) {
  display: block;
}

:deep(.bar) {
  transition: opacity 0.2s ease;
}

:deep(.x-axis path),
:deep(.y-axis path),
:deep(.x-axis line),
:deep(.y-axis line) {
  stroke: #ddd;
}

:deep(.x-axis text),
:deep(.y-axis text) {
  fill: #666;
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
```

### Props 設計最佳實踐

#### 基本原則

1. **型態優先**：使用 TypeScript 介面定義 Props
2. **預設值合理**：提供實用的預設配置
3. **擴充性**：使用 `Partial<>` 允許部分覆寫
4. **驗證**：利用 TypeScript 編譯時檢查

#### 完整 Props 設計範例

```typescript
interface ChartPropsBase {
  // 必要 Props
  data: BarChartData[]
  
  // 尺寸控制
  width?: number
  height?: number
  margin?: Partial<ChartMargin>
  
  // 互動功能
  animated?: boolean
  responsive?: boolean
  interactive?: boolean
  
  // 樣式客製化
  colors?: string[]
  backgroundColor?: string
  
  // 座標軸配置
  xAxisLabel?: string
  yAxisLabel?: string
  showXAxis?: boolean
  showYAxis?: boolean
  
  // 進階選項
  tooltipEnabled?: boolean
  legendEnabled?: boolean
}

const props = withDefaults(defineProps<ChartPropsBase>(), {
  width: 600,
  height: 400,
  animated: true,
  responsive: false,
  interactive: true,
  showXAxis: true,
  showYAxis: true,
  tooltipEnabled: true,
  legendEnabled: false
})
```

### SVG 容器管理策略

#### 策略 1：固定尺寸容器

```vue
<BarChart :width="800" :height="600" :responsive="false" />
```

**優點**：
- 可預測的渲染結果
- 效能佳（無需監聽尺寸變化）
- 適合列印/匯出

**適用場景**：儀表板、報表

#### 策略 2：響應式容器

```vue
<div class="responsive-container">
  <BarChart :responsive="true" />
</div>

<style>
.responsive-container {
  width: 100%;
  height: 500px;
}
</style>
```

**優點**：自動適應容器大小
**適用場景**：全螢幕圖表、行動裝置

#### 策略 3：AspectRatio 保持比例

```typescript
interface AspectRatioChartProps {
  aspectRatio?: number // 例如 16/9
}

const setupAspectRatio = () => {
  if (!containerRef.value) return
  
  const updateSize = () => {
    const width = containerRef.value!.clientWidth
    const height = width / (props.aspectRatio || 16/9)
    initSVG(width, height)
    updateChart()
  }
  
  updateSize()
  window.addEventListener('resize', updateSize)
  
  return () => window.removeEventListener('resize', updateSize)
}
```

### 替代方案比較

#### 方案 A：單體元件（不推薦）

```vue
<script setup lang="ts">
// 所有 D3 邏輯直接寫在元件內，300+ 行程式碼
</script>
```

**缺點**：
- 程式碼重複
- 難以測試
- 難以維護

#### 方案 B：Class-based（不推薦）

```typescript
class BarChart {
  private svg: d3.Selection<any, any, any, any>
  render(data: any[]) { }
  update(data: any[]) { }
  destroy() { }
}
```

**缺點**：
- 不符合 Vue 3 慣用模式
- 與響應式系統整合較差

### 建議學習順序

1. **階段 1**：建立簡單長條圖元件（單檔案，無 Composables）
2. **階段 2**：重構為 Composables 架構
3. **階段 3**：建立折線圖，重用 Composables
4. **階段 4**：加入進階功能（Tooltip、Legend、動畫）

---

## 6. 測試策略

### 決策：分層測試策略 - 單元測試 + 元件測試 + 視覺驗證

### 測試金字塔

```
        /\
       /  \      E2E 測試（可選）
      /----\     視覺回歸測試
     /------\    元件整合測試
    /--------\   Composables 單元測試
   /----------\  工具函式單元測試
```

### 測試環境設定

#### 1. 安裝測試依賴

```bash
# Vitest + Vue Test Utils
pnpm add -D vitest @vue/test-utils jsdom

# 視覺回歸測試（選用）
pnpm add -D @vitest/ui playwright

# D3 測試工具
pnpm add -D @testing-library/jest-dom
```

#### 2. Vitest 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom', // 重要：模擬瀏覽器 DOM
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.spec.ts',
        '**/*.test.ts'
      ]
    }
  }
})
```

#### 3. 測試設定檔

```typescript
// src/test/setup.ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@vue/test-utils'
import '@testing-library/jest-dom'

// 每個測試後清理
afterEach(() => {
  cleanup()
})

// 自訂 Matcher
expect.extend({
  toHaveSVGAttribute(received: SVGElement, attr: string, value?: string) {
    const actualValue = received.getAttribute(attr)
    
    if (value !== undefined) {
      return {
        pass: actualValue === value,
        message: () =>
          `Expected element to have attribute ${attr}="${value}", but got "${actualValue}"`
      }
    }
    
    return {
      pass: actualValue !== null,
      message: () =>
        `Expected element to have attribute ${attr}, but it was not present`
    }
  }
})
```

### 測試策略 A：Composables 單元測試

```typescript
// src/composables/__tests__/useD3Scale.spec.ts

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useD3Scale } from '../useD3Scale'
import type { BarChartData } from '@/types/chart.types'

describe('useD3Scale', () => {
  const mockData = ref<BarChartData[]>([
    { id: '1', label: 'A', value: 10 },
    { id: '2', label: 'B', value: 20 },
    { id: '3', label: 'C', value: 30 }
  ])

  const width = ref(500)
  const height = ref(300)

  it('應建立正確的 X Scale', () => {
    const { xScale } = useD3Scale(mockData, width, height)

    // 驗證 domain
    expect(xScale.value.domain()).toEqual(['A', 'B', 'C'])

    // 驗證 range
    expect(xScale.value.range()).toEqual([0, 500])

    // 驗證 bandwidth 計算
    expect(xScale.value.bandwidth()).toBeGreaterThan(0)
  })

  it('應建立正確的 Y Scale', () => {
    const { yScale } = useD3Scale(mockData, width, height)

    // Domain 應從 0 到最大值的 1.1 倍
    const domain = yScale.value.domain()
    expect(domain[0]).toBe(0)
    expect(domain[1]).toBeGreaterThanOrEqual(30)

    // Range 應從 height 到 0（Y 軸反轉）
    expect(yScale.value.range()).toEqual([300, 0])
  })

  it('當資料變化時應更新 Scale', () => {
    const { yScale } = useD3Scale(mockData, width, height)

    const initialDomain = yScale.value.domain()

    // 更新資料
    mockData.value = [
      ...mockData.value,
      { id: '4', label: 'D', value: 100 }
    ]

    const newDomain = yScale.value.domain()
    expect(newDomain[1]).toBeGreaterThan(initialDomain[1])
  })

  it('應處理空資料陣列', () => {
    const emptyData = ref<BarChartData[]>([])
    const { xScale, yScale } = useD3Scale(emptyData, width, height)

    expect(xScale.value.domain()).toEqual([])
    expect(yScale.value.domain()[1]).toBe(0)
  })
})
```

### 測試策略 B：元件整合測試

```typescript
// src/components/charts/__tests__/BarChart.spec.ts

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BarChart from '../BarChart.vue'
import type { BarChartData } from '@/types/chart.types'

describe('BarChart', () => {
  const mockData: BarChartData[] = [
    { id: '1', label: 'A', value: 30 },
    { id: '2', label: 'B', value: 80 },
    { id: '3', label: 'C', value: 45 }
  ]

  it('應正確渲染元件', () => {
    const wrapper = mount(BarChart, {
      props: {
        data: mockData,
        width: 500,
        height: 300
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.bar-chart-container').exists()).toBe(true)
  })

  it('應建立 SVG 元素', async () => {
    const wrapper = mount(BarChart, {
      props: {
        data: mockData,
        width: 500,
        height: 300
      }
    })

    // 等待 onMounted 執行
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.attributes('width')).toBe('500')
    expect(svg.attributes('height')).toBe('300')
  })

  it('應渲染正確數量的長條', async () => {
    const wrapper = mount(BarChart, {
      props: {
        data: mockData,
        width: 500,
        height: 300
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const bars = wrapper.findAll('rect.bar')
    expect(bars).toHaveLength(3)
  })

  it('應觸發 barClick 事件', async () => {
    const wrapper = mount(BarChart, {
      props: {
        data: mockData,
        width: 500,
        height: 300
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const firstBar = wrapper.find('rect.bar')
    await firstBar.trigger('click')

    expect(wrapper.emitted('barClick')).toBeTruthy()
    expect(wrapper.emitted('barClick')?.[0]).toEqual([mockData[0]])
  })

  it('應處理資料更新', async () => {
    const wrapper = mount(BarChart, {
      props: {
        data: mockData,
        width: 500,
        height: 300
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // 初始長條數量
    let bars = wrapper.findAll('rect.bar')
    expect(bars).toHaveLength(3)

    // 更新資料
    const newData = [
      ...mockData,
      { id: '4', label: 'D', value: 60 }
    ]
    await wrapper.setProps({ data: newData })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 400))

    // 新的長條數量
    bars = wrapper.findAll('rect.bar')
    expect(bars).toHaveLength(4)
  })
})
```

### 測試策略 C：DOM 查詢驗證技巧

```typescript
// src/test/utils/svgHelpers.ts

import type { DOMWrapper } from '@vue/test-utils'

/**
 * 獲取 SVG 元素的數值屬性
 */
export function getSVGNumericAttribute(
  element: DOMWrapper<Element>,
  attr: string
): number {
  const value = element.attributes(attr)
  return value ? parseFloat(value) : 0
}

/**
 * 驗證元素是否在特定範圍內
 */
export function expectInRange(
  value: number,
  min: number,
  max: number,
  message?: string
) {
  expect(value).toBeGreaterThanOrEqual(min)
  expect(value).toBeLessThanOrEqual(max)
}

/**
 * 驗證長條是否按順序排列
 */
export function expectBarsOrdered(
  wrapper: DOMWrapper<Element>,
  expectedLabels: string[]
) {
  const bars = wrapper.findAll('rect.bar')
  bars.forEach((bar, index) => {
    const label = bar.attributes('aria-label')
    expect(label).toContain(expectedLabels[index])
  })
}

// 使用範例
describe('BarChart SVG 驗證', () => {
  it('應正確定位長條', async () => {
    const wrapper = mount(BarChart, {
      props: { data: mockData, width: 500, height: 300 }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    const bars = wrapper.findAll('rect.bar')
    
    bars.forEach(bar => {
      const x = getSVGNumericAttribute(bar, 'x')
      const y = getSVGNumericAttribute(bar, 'y')
      const width = getSVGNumericAttribute(bar, 'width')
      const height = getSVGNumericAttribute(bar, 'height')

      // X 座標應在圖表範圍內
      expectInRange(x, 0, 500, 'X coordinate out of bounds')

      // Y 座標應在圖表範圍內
      expectInRange(y, 0, 300, 'Y coordinate out of bounds')

      // 寬度和高度應大於 0
      expect(width).toBeGreaterThan(0)
      expect(height).toBeGreaterThan(0)
    })
  })
})
```

### 測試策略 D：視覺回歸測試

#### 方法 1：使用 Playwright 截圖比對

```typescript
// tests/visual/BarChart.visual.spec.ts

import { test, expect } from '@playwright/test'

test.describe('BarChart Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
  })

  test('應與基準截圖相符', async ({ page }) => {
    await page.waitForSelector('svg')
    await page.waitForTimeout(500) // 等待動畫完成

    const chart = await page.locator('.bar-chart-container')
    await expect(chart).toHaveScreenshot('bar-chart-baseline.png', {
      maxDiffPixels: 100
    })
  })

  test('資料更新後應正確渲染', async ({ page }) => {
    await page.waitForSelector('svg')
    await page.click('text=新增資料')
    await page.waitForTimeout(500)

    const chart = await page.locator('.bar-chart-container')
    await expect(chart).toHaveScreenshot('bar-chart-after-add.png')
  })
})
```

#### 方法 2：使用 Storybook

```typescript
// src/components/charts/BarChart.stories.ts

import type { Meta, StoryObj } from '@storybook/vue3'
import BarChart from './BarChart.vue'
import type { BarChartData } from '@/types/chart.types'

const meta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof BarChart>

const sampleData: BarChartData[] = [
  { id: '1', label: 'A', value: 30 },
  { id: '2', label: 'B', value: 80 },
  { id: '3', label: 'C', value: 45 }
]

export const Default: Story = {
  args: {
    data: sampleData,
    width: 600,
    height: 400,
    animated: true
  }
}

export const NoAnimation: Story = {
  args: {
    data: sampleData,
    width: 600,
    height: 400,
    animated: false
  }
}

export const EmptyData: Story = {
  args: {
    data: [],
    width: 600,
    height: 400
  }
}
```

### package.json 測試腳本

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:visual": "playwright test",
    "test:visual:update": "playwright test --update-snapshots"
  }
}
```

### 測試覆蓋率目標

| 層級 | 目標覆蓋率 | 說明 |
|------|-----------|------|
| Composables | 90%+ | 純函式庫邏輯容易測試 |
| 元件邏輯 | 80%+ | 互動邏輯和事件處理 |
| 視覺元素 | 關鍵路徑 | 基準截圖 + 互動狀態 |
| E2E | 核心流程 | 完整圖表生命週期 |

### 理由

1. **快速回饋**：單元測試在秒級完成，立即發現錯誤
2. **信心保證**：元件測試確保 D3 + Vue 整合正確
3. **視覺保證**：截圖比對捕捉視覺問題
4. **可維護性**：分層測試策略易於擴充和維護

### 替代方案比較

#### 方案 A：僅視覺測試（不推薦）

**缺點**：
- 無法自動化
- 無法捕捉邏輯錯誤
- 回歸測試成本高

#### 方案 B：端對端測試為主（不推薦）

**缺點**：
- 測試執行慢
- 難以定位問題來源
- 維護成本高

### 測試最佳實踐清單

- [ ] 為每個 Composable 編寫單元測試
- [ ] 為每個圖表元件編寫整合測試
- [ ] 使用自訂 Matcher 簡化 SVG 斷言
- [ ] 測試資料更新和動畫過渡
- [ ] 測試邊界情況（空資料、極大/極小值）
- [ ] 測試互動事件（點擊、懸停）
- [ ] 測試無障礙屬性（ARIA labels）
- [ ] 為關鍵元件建立視覺基準
- [ ] 設定 CI/CD 自動執行測試
- [ ] 定期檢視測試覆蓋率報告

---

## 總結：元件架構與測試策略

### 架構決策總覽

| 面向 | 決策 | 關鍵優勢 |
|------|------|----------|
| **程式碼組織** | Composables + Presentational Components | 可重用、可測試、職責分離 |
| **Props 設計** | TypeScript 介面 + withDefaults | 類型安全、良好開發體驗 |
| **SVG 管理** | 混合策略（固定/響應式） | 彈性適應不同場景 |
| **測試方法** | 分層測試金字塔 | 快速回饋、全面覆蓋 |

### 學習路徑建議

#### 階段 1：基礎（1-2 週）
- [ ] 建立第一個長條圖元件（單檔案）
- [ ] 編寫基本元件測試
- [ ] 實作固定尺寸 SVG 容器

#### 階段 2：重構（1 週）
- [ ] 提取 Composables（useD3Chart、useD3Scale）
- [ ] 編寫 Composables 單元測試
- [ ] 加入響應式容器支援

#### 階段 3：擴充（1-2 週）
- [ ] 建立折線圖，重用 Composables
- [ ] 實作互動功能測試
- [ ] 設定視覺回歸測試基準

#### 階段 4：最佳化（持續）
- [ ] 效能測試和最佳化
- [ ] 建立元件庫文件
- [ ] 設定 CI/CD 自動測試

### 參考資源

- [Vue Test Utils 官方文件](https://test-utils.vuejs.org/)
- [Vitest 官方文件](https://vitest.dev/)
- [D3 測試範例](https://observablehq.com/@d3/testing-d3)
- [Playwright Visual Testing](https://playwright.dev/docs/test-snapshots)
- [Vue Testing Handbook](https://lmiller1990.github.io/vue-testing-handbook/)
- [D3.js 官方文件](https://d3js.org/)
- [Testing Library](https://testing-library.com/)
