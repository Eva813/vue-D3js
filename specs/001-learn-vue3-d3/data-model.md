# 資料模型：Vue 3 D3.js Integration

**專案**: Vue 3 D3.js 學習專案  
**日期**: 2025年12月26日  
**目的**: 定義所有資料結構的 TypeScript 介面

---

## 核心資料實體

### 1. ChartData - 圖表資料點

圖表視覺化的基本資料單位，代表單一資料點。

```typescript
interface ChartData {
  /** 唯一識別碼（用於 D3 key function） */
  id: string
  
  /** 顯示標籤（X 軸） */
  label: string
  
  /** 數值（Y 軸） */
  value: number
  
  /** 可選：分類標籤 */
  category?: string
  
  /** 可選：自訂顏色 */
  color?: string
  
  /** 可選：額外後設資料 */
  metadata?: Record<string, unknown>
}
```

**使用範例**：
```typescript
const sampleData: ChartData[] = [
  { id: '1', label: 'A', value: 30 },
  { id: '2', label: 'B', value: 80, color: '#ff6b6b' },
  { id: '3', label: 'C', value: 45, category: 'Group 1' }
]
```

**驗證規則**：
- `id` 必須唯一（不可重複）
- `value` 必須為有效數字（不可為 NaN、Infinity）
- `label` 不可為空字串

---

### 2. ChartDimensions - 圖表尺寸配置

定義圖表的整體尺寸和邊距。

```typescript
interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

interface ChartDimensions {
  /** SVG 總寬度（像素） */
  width: number
  
  /** SVG 總高度（像素） */
  height: number
  
  /** 內邊距（為座標軸和標籤留空間） */
  margin: Margin
}
```

**預設值**：
```typescript
const defaultDimensions: ChartDimensions = {
  width: 600,
  height: 400,
  margin: {
    top: 20,
    right: 20,
    bottom: 40,  // X 軸標籤空間
    left: 50     // Y 軸標籤空間
  }
}
```

**計算內部繪圖區域**：
```typescript
const innerWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
const innerHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom
```

---

### 3. ChartConfig - 圖表配置

完整的圖表配置物件，包含資料、尺寸和樣式。

```typescript
interface ColorScheme {
  /** 主要顏色 */
  primary: string
  
  /** Hover 時顏色 */
  hover: string
  
  /** 選中時顏色 */
  selected?: string
  
  /** 軸線和文字顏色 */
  axis?: string
}

interface AnimationConfig {
  /** 是否啟用動畫 */
  enabled: boolean
  
  /** 動畫持續時間（毫秒） */
  duration: number
  
  /** 緩動函數名稱 */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

interface ChartConfig {
  /** 圖表資料 */
  data: ChartData[]
  
  /** 尺寸配置 */
  dimensions: ChartDimensions
  
  /** 顏色配置 */
  colors?: ColorScheme
  
  /** 動畫配置 */
  animation?: AnimationConfig
  
  /** 是否顯示 X 軸 */
  showXAxis?: boolean
  
  /** 是否顯示 Y 軸 */
  showYAxis?: boolean
  
  /** X 軸標籤 */
  xAxisLabel?: string
  
  /** Y 軸標籤 */
  yAxisLabel?: string
  
  /** 是否啟用互動（hover, click） */
  interactive?: boolean
}
```

**完整範例**：
```typescript
const chartConfig: ChartConfig = {
  data: [
    { id: '1', label: 'Jan', value: 30 },
    { id: '2', label: 'Feb', value: 80 },
    { id: '3', label: 'Mar', value: 45 }
  ],
  dimensions: {
    width: 800,
    height: 500,
    margin: { top: 20, right: 20, bottom: 50, left: 60 }
  },
  colors: {
    primary: '#4a90e2',
    hover: '#f39c12',
    axis: '#333'
  },
  animation: {
    enabled: true,
    duration: 750,
    easing: 'ease-in-out'
  },
  showXAxis: true,
  showYAxis: true,
  xAxisLabel: '月份',
  yAxisLabel: '銷售額',
  interactive: true
}
```

---

## 元件特定類型

### 4. BarChartProps - 長條圖 Props

```typescript
interface BarChartProps {
  /** 圖表資料（必要） */
  data: ChartData[]
  
  /** SVG 寬度 */
  width?: number
  
  /** SVG 高度 */
  height?: number
  
  /** 邊距配置 */
  margin?: Margin
  
  /** 長條之間的間距比例 (0-1) */
  padding?: number
  
  /** 顏色配置 */
  colors?: ColorScheme
  
  /** 是否啟用動畫 */
  animated?: boolean
  
  /** 動畫持續時間（毫秒） */
  animationDuration?: number
  
  /** 是否顯示座標軸 */
  showAxes?: boolean
  
  /** X 軸標籤 */
  xAxisLabel?: string
  
  /** Y 軸標籤 */
  yAxisLabel?: string
}
```

**預設值建議**：
```typescript
const defaultBarChartProps: Partial<BarChartProps> = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 50 },
  padding: 0.1,
  colors: {
    primary: 'steelblue',
    hover: 'orange'
  },
  animated: true,
  animationDuration: 750,
  showAxes: true
}
```

---

### 5. LineChartProps - 折線圖 Props

```typescript
interface LineChartProps {
  /** 圖表資料（必要） */
  data: ChartData[]
  
  /** SVG 尺寸 */
  width?: number
  height?: number
  margin?: Margin
  
  /** 線條樣式 */
  lineColor?: string
  lineWidth?: number
  
  /** 是否顯示資料點 */
  showPoints?: boolean
  
  /** 資料點半徑 */
  pointRadius?: number
  
  /** 是否填充線條下方區域 */
  fillArea?: boolean
  
  /** 填充顏色 */
  areaColor?: string
  
  /** 曲線類型 */
  curveType?: 'linear' | 'monotone' | 'step' | 'basis'
  
  /** 動畫配置 */
  animated?: boolean
  animationDuration?: number
  
  /** 座標軸配置 */
  showAxes?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
}
```

---

### 6. ChartEmits - 圖表事件

定義圖表元件可以發出的事件。

```typescript
interface ChartEmits {
  /** 當資料點被點擊時觸發 */
  'data-click': [data: ChartData, event: MouseEvent]
  
  /** 當滑鼠懸停在資料點上時觸發 */
  'data-hover': [data: ChartData | null, event: MouseEvent]
  
  /** 當圖表渲染完成時觸發 */
  'chart-ready': []
  
  /** 當圖表更新完成時觸發 */
  'chart-updated': []
  
  /** 當發生錯誤時觸發 */
  'error': [error: Error]
}
```

**在元件中使用**：
```typescript
const emit = defineEmits<ChartEmits>()

// 觸發事件
emit('data-click', chartData, mouseEvent)
emit('data-hover', chartData, mouseEvent)
emit('chart-ready')
```

**在父元件中監聽**：
```vue
<template>
  <BarChart 
    :data="chartData"
    @data-click="handleDataClick"
    @data-hover="handleDataHover"
    @chart-ready="handleChartReady"
  />
</template>
```

---

## Composables 類型定義

### 7. D3ChartReturn - useD3Chart 返回值

```typescript
import type { Ref } from 'vue'
import type * as d3 from 'd3'

interface D3ChartReturn {
  /** SVG 選擇器 */
  svg: Ref<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>
  
  /** 主要圖表群組（套用 margin transform） */
  chartGroup: Ref<d3.Selection<SVGGElement, unknown, null, undefined> | null>
  
  /** 取得內部繪圖區域寬度 */
  getInnerWidth: () => number
  
  /** 取得內部繪圖區域高度 */
  getInnerHeight: () => number
  
  /** 清理函式（手動呼叫） */
  cleanup: () => void
}
```

---

### 8. D3ScaleReturn - useD3Scale 返回值

```typescript
interface D3ScaleReturn {
  /** X 軸 Scale（通常為 scaleBand） */
  xScale: Ref<d3.ScaleBand<string>>
  
  /** Y 軸 Scale（通常為 scaleLinear） */
  yScale: Ref<d3.ScaleLinear<number, number>>
  
  /** 更新 Scale domains（當資料變更時） */
  updateScales: (data: ChartData[]) => void
}
```

---

### 9. D3AxisConfig - 座標軸配置

```typescript
interface AxisConfig {
  /** 是否顯示此軸 */
  show: boolean
  
  /** 軸標籤 */
  label?: string
  
  /** 刻度數量 */
  ticks?: number
  
  /** 刻度格式化函式 */
  tickFormat?: (value: any) => string
  
  /** 軸線顏色 */
  color?: string
}

interface D3AxisConfig {
  /** X 軸配置 */
  xAxis?: AxisConfig
  
  /** Y 軸配置 */
  yAxis?: AxisConfig
}
```

---

## 工具類型

### 10. DataValidator - 資料驗證

```typescript
interface ValidationResult {
  /** 是否通過驗證 */
  valid: boolean
  
  /** 錯誤訊息陣列 */
  errors: string[]
}

interface DataValidator {
  /** 驗證單一資料點 */
  validateDataPoint: (data: ChartData) => ValidationResult
  
  /** 驗證資料陣列 */
  validateDataArray: (data: ChartData[]) => ValidationResult
  
  /** 驗證尺寸配置 */
  validateDimensions: (dimensions: ChartDimensions) => ValidationResult
}
```

**驗證範例**：
```typescript
const validator: DataValidator = {
  validateDataPoint: (data) => {
    const errors: string[] = []
    
    if (!data.id) errors.push('id is required')
    if (!data.label) errors.push('label is required')
    if (typeof data.value !== 'number' || isNaN(data.value)) {
      errors.push('value must be a valid number')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },
  
  validateDataArray: (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        valid: false,
        errors: ['data must be a non-empty array']
      }
    }
    
    const ids = new Set<string>()
    const errors: string[] = []
    
    data.forEach((d, index) => {
      if (ids.has(d.id)) {
        errors.push(`Duplicate id "${d.id}" at index ${index}`)
      }
      ids.add(d.id)
      
      const result = this.validateDataPoint(d)
      if (!result.valid) {
        errors.push(...result.errors.map(e => `Index ${index}: ${e}`))
      }
    })
    
    return {
      valid: errors.length === 0,
      errors
    }
  },
  
  validateDimensions: (dimensions) => {
    const errors: string[] = []
    
    if (dimensions.width <= 0) errors.push('width must be > 0')
    if (dimensions.height <= 0) errors.push('height must be > 0')
    
    const innerWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    const innerHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom
    
    if (innerWidth <= 0) errors.push('Inner width too small (adjust margins)')
    if (innerHeight <= 0) errors.push('Inner height too small (adjust margins)')
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}
```

---

## 類型守衛

### 11. Type Guards - 執行時類型檢查

```typescript
/** 檢查是否為有效的 ChartData */
export function isChartData(obj: unknown): obj is ChartData {
  if (typeof obj !== 'object' || obj === null) return false
  
  const data = obj as Record<string, unknown>
  return (
    typeof data.id === 'string' &&
    typeof data.label === 'string' &&
    typeof data.value === 'number' &&
    !isNaN(data.value)
  )
}

/** 檢查是否為有效的 ChartData 陣列 */
export function isChartDataArray(obj: unknown): obj is ChartData[] {
  return Array.isArray(obj) && obj.every(isChartData)
}

/** 檢查是否為有效的 Margin */
export function isMargin(obj: unknown): obj is Margin {
  if (typeof obj !== 'object' || obj === null) return false
  
  const margin = obj as Record<string, unknown>
  return (
    typeof margin.top === 'number' &&
    typeof margin.right === 'number' &&
    typeof margin.bottom === 'number' &&
    typeof margin.left === 'number'
  )
}
```

---

## 實作位置

所有類型定義應放置於：

```
src/types/chart.types.ts
```

**匯出結構**：
```typescript
// src/types/chart.types.ts
export type {
  ChartData,
  Margin,
  ChartDimensions,
  ColorScheme,
  AnimationConfig,
  ChartConfig,
  BarChartProps,
  LineChartProps,
  ChartEmits,
  D3ChartReturn,
  D3ScaleReturn,
  AxisConfig,
  D3AxisConfig,
  ValidationResult,
  DataValidator
}

export {
  isChartData,
  isChartDataArray,
  isMargin
}
```

---

## 總結

### 資料流向

```
原始資料 (JSON/API)
    ↓
驗證 (DataValidator)
    ↓
ChartData[]
    ↓
元件 Props (BarChartProps, LineChartProps)
    ↓
Composables (useD3Chart, useD3Scale)
    ↓
D3 渲染
    ↓
事件發出 (ChartEmits)
```

### 類型安全檢查清單

- [ ] 所有 Props 定義有預設值
- [ ] 所有 Emits 有完整類型簽名
- [ ] Composables 返回值有明確類型
- [ ] 資料驗證有 Type Guards
- [ ] 沒有使用 `any` 類型
- [ ] 所有可選屬性使用 `?`
- [ ] 複雜類型使用 `interface` 而非 `type`（便於擴充）

**文件版本**: 1.0.0  
**最後更新**: 2025年12月26日
