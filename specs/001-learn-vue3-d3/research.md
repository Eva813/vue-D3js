# Vue 3 + D3.js 整合技術研究

**專案**: Vue 3 + D3.js 學習專案  
**研究日期**: 2025年12月26日  
**技術棧**: Vue 3.5+ (Composition API)、TypeScript strict mode、Vite 7、D3.js v7

---

## 1. 套件安裝策略

### 決策：採用完整版 D3 套件 + 必要時模組化匯入

**推薦安裝指令**：
```bash
pnpm add d3
pnpm add -D @types/d3
```

### 理由

1. **學習階段優勢**：完整版 D3 讓開發者能夠探索所有 API，無需預先知道需要哪些模組
2. **Tree-shaking 支援**：Vite 會自動移除未使用的程式碼，完整安裝不會增加最終 bundle 大小
3. **TypeScript 支援完善**：`@types/d3` 提供完整且同步的類型定義
4. **開發體驗佳**：單一匯入路徑，IDE 自動完成支援完整

### 替代方案

#### 方案 A：僅安裝需要的 D3 模組
```bash
pnpm add d3-selection d3-scale d3-axis d3-shape
pnpm add -D @types/d3-selection @types/d3-scale
```

**優點**：
- package.json 更明確列出依賴
- 初次安裝速度較快

**缺點**：
- 需要預知所需模組（不適合學習階段）
- 每次新需求需手動安裝新模組
- 多個 @types 套件需要維護版本一致性

#### 方案 B：使用 CDN
```html
<script src="https://d3js.org/d3.v7.min.js"></script>
```

**缺點**：
- 失去 TypeScript 類型檢查
- 不符合專案模組化架構
- 無法利用 Vite 的最佳化功能
- **不推薦用於此專案**

### 實作建議

#### 完整版匯入（推薦用於學習）
```typescript
// src/components/BarChart.vue
import * as d3 from 'd3'

// 使用任何 D3 功能
const svg = d3.select('#chart')
const scale = d3.scaleLinear()
```

#### 選擇性匯入（推薦用於生產環境）
```typescript
// 明確匯入所需功能，提升程式碼可讀性
import { select, selectAll } from 'd3-selection'
import { scaleLinear, scaleBand } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { line, area } from 'd3-shape'
```

#### tsconfig.json 驗證
現有配置已正確：
```jsonc
{
  "compilerOptions": {
    "strict": true,  // ✓ 強制類型檢查
    "types": ["vite/client"]  // D3 types 會自動載入
  }
}
```

---

## 2. Vue 生命週期整合

### 決策：使用 onMounted + templateRef 模式

### 核心模式

```typescript
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

// 1. Template ref 綁定 DOM
const chartRef = ref<HTMLElement | null>(null)

// 2. 儲存 D3 實例以便清理
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let resizeHandler: (() => void) | null = null

onMounted(() => {
  if (!chartRef.value) return
  
  // 3. 建立 D3 視覺化
  svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', 500)
    .attr('height', 300)
  
  // 4. 註冊事件監聽器
  resizeHandler = () => {
    // 處理視窗大小變化
  }
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  // 5. 清理資源
  if (svg) {
    svg.remove()
    svg = null
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
})
</script>

<template>
  <div ref="chartRef" class="chart-container"></div>
</template>
```

### 理由

1. **正確的 DOM 時機**：`onMounted` 保證 DOM 已渲染，可安全操作
2. **避免記憶體洩漏**：`onUnmounted` 確保移除 D3 建立的元素和事件監聽器
3. **TypeScript 類型安全**：`ref<HTMLElement>` 提供類型檢查
4. **Composition API 最佳實踐**：符合 Vue 3 慣用模式

### 常見記憶體洩漏來源及解決方案

#### 問題 1：未移除事件監聽器
```typescript
// ❌ 錯誤：洩漏
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// ✅ 正確：清理
onMounted(() => {
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
```

#### 問題 2：未清理 D3 計時器/過渡動畫
```typescript
// ❌ 錯誤：動畫可能在元件卸載後仍執行
svg.selectAll('circle')
  .transition()
  .duration(5000)
  .attr('r', 50)

// ✅ 正確：中斷進行中的過渡動畫
let transition: d3.Transition<any, any, any, any> | null = null

onMounted(() => {
  transition = svg.selectAll('circle')
    .transition()
    .duration(5000)
    .attr('r', 50)
})

onUnmounted(() => {
  if (transition) {
    transition.interrupt()
  }
  svg?.selectAll('*').interrupt() // 中斷所有動畫
})
```

#### 問題 3：未移除 D3 建立的 DOM 元素
```typescript
// ✅ 完整清理模式
onUnmounted(() => {
  // 方法 1：移除整個 SVG
  svg?.remove()
  
  // 方法 2：清空容器（如果需要保留容器元素）
  if (chartRef.value) {
    d3.select(chartRef.value).selectAll('*').remove()
  }
})
```

### 替代方案

#### 方案 A：使用 watchEffect
```typescript
import { watchEffect } from 'vue'

const chartRef = ref<HTMLElement | null>(null)

watchEffect((onCleanup) => {
  if (!chartRef.value) return
  
  const svg = d3.select(chartRef.value)
    .append('svg')
  
  // 自動追蹤依賴，資料變化時重新執行
  
  onCleanup(() => {
    svg.remove()
  })
})
```

**優點**：自動依賴追蹤
**缺點**：過於頻繁重建（每次依賴變化都完全重建），效能較差

#### 方案 B：Options API
```typescript
export default {
  mounted() {
    this.svg = d3.select(this.$refs.chart)
  },
  beforeUnmount() {
    this.svg?.remove()
  }
}
```

**缺點**：不符合專案要求（必須使用 Composition API）

---

## 3. 響應式資料更新策略

### 決策：混合策略 - 小規模完全重繪，大規模使用 Enter/Update/Exit

### 策略 A：完全重繪模式（推薦用於學習/簡單圖表）

```typescript
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'

interface DataPoint {
  label: string
  value: number
}

const chartRef = ref<HTMLElement | null>(null)
const data = ref<DataPoint[]>([
  { label: 'A', value: 30 },
  { label: 'B', value: 80 },
  { label: 'C', value: 45 }
])

const renderChart = () => {
  if (!chartRef.value) return
  
  // 清除舊內容
  d3.select(chartRef.value).selectAll('*').remove()
  
  // 完全重新繪製
  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', 500)
    .attr('height', 300)
  
  const xScale = d3.scaleBand()
    .domain(data.value.map(d => d.label))
    .range([0, 500])
    .padding(0.1)
  
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data.value, d => d.value) || 0])
    .range([300, 0])
  
  svg.selectAll('rect')
    .data(data.value)
    .join('rect')
    .attr('x', d => xScale(d.label) || 0)
    .attr('y', d => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', d => 300 - yScale(d.value))
    .attr('fill', 'steelblue')
}

onMounted(renderChart)

// Vue 資料變化時重繪
watch(data, renderChart, { deep: true })
</script>

<template>
  <div>
    <div ref="chartRef"></div>
    <button @click="data.push({ label: 'D', value: 60 })">
      新增資料
    </button>
  </div>
</template>
```

**優點**：
- 程式碼簡單易懂
- 適合學習階段
- 不易出錯

**適用場景**：
- 資料量 < 100 筆
- 更新頻率 < 1 次/秒
- 簡單圖表（長條圖、折線圖）

### 策略 B：Enter/Update/Exit 模式（推薦用於複雜/大規模圖表）

```typescript
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import * as d3 from 'd3'

interface DataPoint {
  id: string  // 重要：需要唯一識別碼
  label: string
  value: number
}

const chartRef = ref<HTMLElement | null>(null)
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let xScale: d3.ScaleBand<string> | null = null
let yScale: d3.ScaleLinear<number, number> | null = null

const data = ref<DataPoint[]>([
  { id: '1', label: 'A', value: 30 },
  { id: '2', label: 'B', value: 80 },
  { id: '3', label: 'C', value: 45 }
])

const initChart = () => {
  if (!chartRef.value) return
  
  svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', 500)
    .attr('height', 300)
  
  xScale = d3.scaleBand()
    .range([0, 500])
    .padding(0.1)
  
  yScale = d3.scaleLinear()
    .range([300, 0])
}

const updateChart = () => {
  if (!svg || !xScale || !yScale) return
  
  // 更新 scale domains
  xScale.domain(data.value.map(d => d.label))
  yScale.domain([0, d3.max(data.value, d => d.value) || 0])
  
  // Enter/Update/Exit 模式
  const bars = svg.selectAll<SVGRectElement, DataPoint>('rect')
    .data(data.value, d => d.id)  // key function 很重要！
  
  // EXIT: 移除不存在的資料
  bars.exit()
    .transition()
    .duration(300)
    .attr('height', 0)
    .attr('y', 300)
    .remove()
  
  // UPDATE: 更新現有元素
  bars.transition()
    .duration(300)
    .attr('x', d => xScale!(d.label) || 0)
    .attr('y', d => yScale!(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', d => 300 - yScale!(d.value))
  
  // ENTER: 新增新元素
  bars.enter()
    .append('rect')
    .attr('x', d => xScale!(d.label) || 0)
    .attr('y', 300)
    .attr('width', xScale.bandwidth())
    .attr('height', 0)
    .attr('fill', 'steelblue')
    .transition()
    .duration(300)
    .attr('y', d => yScale!(d.value))
    .attr('height', d => 300 - yScale!(d.value))
}

onMounted(() => {
  initChart()
  updateChart()
})

watch(data, updateChart, { deep: true })
</script>

<template>
  <div>
    <div ref="chartRef"></div>
    <button @click="data[0].value += 10">更新第一筆</button>
    <button @click="data.push({ 
      id: Date.now().toString(), 
      label: 'New', 
      value: 50 
    })">新增</button>
    <button @click="data.shift()">移除第一筆</button>
  </div>
</template>
```

**優點**：
- 效能優異（僅更新變化的元素）
- 支援流暢的過渡動畫
- 適合大規模資料

**適用場景**：
- 資料量 > 100 筆
- 即時更新（如儀表板）
- 需要精細動畫效果

### 策略比較

| 特性 | 完全重繪 | Enter/Update/Exit |
|------|----------|-------------------|
| 程式碼複雜度 | 低 | 中高 |
| 效能 | 資料量小時足夠 | 優異 |
| 動畫品質 | 基本 | 精細 |
| 學習曲線 | 平緩 | 陡峭 |
| 記憶體使用 | 每次分配新記憶體 | 重複使用現有元素 |
| **推薦用於** | **學習、原型、簡單圖表** | **生產環境、複雜互動** |

### 理由

1. **漸進式學習**：先掌握完全重繪，理解基礎後再學習 Enter/Update/Exit
2. **符合 Vue 響應式**：`watch` 監聽資料變化自動觸發更新
3. **效能可控**：根據實際需求選擇策略
4. **TypeScript 支援**：key function 提供類型推斷

### 替代方案：使用 d3.join() 簡化語法

```typescript
// D3 v5+ 提供的簡化 API
const updateChart = () => {
  if (!svg || !xScale || !yScale) return
  
  svg.selectAll<SVGRectElement, DataPoint>('rect')
    .data(data.value, d => d.id)
    .join(
      // enter
      enter => enter
        .append('rect')
        .attr('y', 300)
        .attr('height', 0)
        .call(enter => enter.transition().duration(300)
          .attr('y', d => yScale!(d.value))
          .attr('height', d => 300 - yScale!(d.value))
        ),
      // update
      update => update
        .call(update => update.transition().duration(300)
          .attr('x', d => xScale!(d.label) || 0)
          .attr('y', d => yScale!(d.value))
          .attr('width', xScale.bandwidth())
          .attr('height', d => 300 - yScale!(d.value))
        ),
      // exit
      exit => exit
        .call(exit => exit.transition().duration(300)
          .attr('height', 0)
          .attr('y', 300)
          .remove()
        )
    )
    .attr('x', d => xScale!(d.label) || 0)
    .attr('width', xScale.bandwidth())
    .attr('fill', 'steelblue')
}
```

**優點**：語法更簡潔，功能相同

---

## 4. TypeScript 類型定義策略

### 決策：漸進式類型標註 + 泛型選擇器

### 核心模式

```typescript
// 1. 資料介面定義
interface ChartData {
  id: string
  label: string
  value: number
  category?: string
}

// 2. D3 選擇器類型標註
import * as d3 from 'd3'

// 明確標註選擇器類型
const svg: d3.Selection<SVGSVGElement, unknown, null, undefined> = 
  d3.select<SVGSVGElement, unknown>('svg')

// 帶資料綁定的選擇器
const bars: d3.Selection<SVGRectElement, ChartData, SVGSVGElement, unknown> = 
  svg.selectAll<SVGRectElement, ChartData>('rect')
    .data(chartData)

// 3. Scale 類型
const xScale: d3.ScaleBand<string> = d3.scaleBand<string>()
  .domain(data.map(d => d.label))
  .range([0, width])

const yScale: d3.ScaleLinear<number, number> = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value) || 0])
  .range([height, 0])

// 4. 事件處理器類型
const handleClick = (
  event: MouseEvent, 
  d: ChartData
): void => {
  console.log('Clicked:', d.label)
}

bars.on('click', handleClick)
```

### 完整範例：類型安全的長條圖元件

```typescript
<script setup lang="ts">
import { ref, onMounted, watch, type Ref } from 'vue'
import * as d3 from 'd3'

// 1. 定義資料結構
interface BarChartData {
  id: string
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  width?: number
  height?: number
  data: BarChartData[]
}

// 2. Props 定義（使用 TypeScript 介面）
const props = withDefaults(defineProps<BarChartProps>(), {
  width: 500,
  height: 300
})

// 3. 類型化 refs
const chartRef: Ref<HTMLDivElement | null> = ref(null)
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let xScale: d3.ScaleBand<string> | null = null
let yScale: d3.ScaleLinear<number, number> | null = null

// 4. 初始化函式
const initChart = (): void => {
  if (!chartRef.value) return
  
  // 明確類型標註
  svg = d3.select<HTMLDivElement, unknown>(chartRef.value)
    .append('svg')
    .attr('width', props.width)
    .attr('height', props.height)
  
  xScale = d3.scaleBand<string>()
    .range([0, props.width])
    .padding(0.1)
  
  yScale = d3.scaleLinear()
    .range([props.height, 0])
}

// 5. 更新函式（完整類型標註）
const updateChart = (): void => {
  if (!svg || !xScale || !yScale) return
  
  // 更新 domains
  xScale.domain(props.data.map((d: BarChartData) => d.label))
  yScale.domain([0, d3.max(props.data, (d: BarChartData) => d.value) || 0])
  
  // 類型化的資料綁定
  const bars: d3.Selection<
    SVGRectElement, 
    BarChartData, 
    SVGSVGElement, 
    unknown
  > = svg
    .selectAll<SVGRectElement, BarChartData>('rect')
    .data(props.data, (d: BarChartData) => d.id)
  
  // Enter/Update/Exit with types
  bars.exit().remove()
  
  const barsEnter = bars.enter()
    .append('rect')
    .attr('fill', (d: BarChartData) => d.color || 'steelblue')
  
  bars.merge(barsEnter)
    .attr('x', (d: BarChartData) => xScale!(d.label) || 0)
    .attr('y', (d: BarChartData) => yScale!(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', (d: BarChartData) => props.height - yScale!(d.value))
}

// 6. 生命週期
onMounted((): void => {
  initChart()
  updateChart()
})

watch(() => props.data, updateChart, { deep: true })

// 7. 類型化事件處理
const handleBarClick = (event: MouseEvent, data: BarChartData): void => {
  console.log('Clicked bar:', data.label, data.value)
}
</script>

<template>
  <div ref="chartRef" class="bar-chart"></div>
</template>

<style scoped>
.bar-chart {
  width: 100%;
  height: 100%;
}
</style>
```

### 理由

1. **編譯時錯誤檢測**：TypeScript 在開發階段捕捉類型錯誤
2. **IDE 支援**：完整的自動完成和文件提示
3. **重構安全**：類型系統確保修改不破壞現有程式碼
4. **符合專案要求**：strict mode 強制類型標註

### 常見類型挑戰及解決方案

#### 挑戰 1：D3 選擇器泛型複雜

```typescript
// ❌ 類型過於複雜，難以維護
const selection: d3.Selection<
  SVGGElement, 
  ChartData, 
  SVGSVGElement, 
  unknown
> = svg.selectAll<SVGGElement, ChartData>('g')

// ✅ 使用類型別名簡化
type ChartSelection = d3.Selection<
  SVGGElement, 
  ChartData, 
  SVGSVGElement, 
  unknown
>

const selection: ChartSelection = svg.selectAll<SVGGElement, ChartData>('g')
```

#### 挑戰 2：動態屬性存取

```typescript
// ❌ TypeScript 無法推斷屬性類型
const getValue = (d: any, key: string) => d[key]

// ✅ 使用泛型和 keyof
const getValue = <T, K extends keyof T>(obj: T, key: K): T[K] => {
  return obj[key]
}

// 使用
interface DataPoint {
  label: string
  value: number
}

const data: DataPoint = { label: 'A', value: 10 }
const value = getValue(data, 'value')  // 類型推斷為 number
```

#### 挑戰 3：D3 事件處理器類型

```typescript
// D3 v6+ 事件類型變更
import { type D3DragEvent } from 'd3'

const dragHandler = d3.drag<SVGCircleElement, ChartData>()
  .on('start', function(event: D3DragEvent<SVGCircleElement, ChartData, ChartData>) {
    // event 完整類型支援
    console.log(event.x, event.y)
    
    // this 是 SVGCircleElement
    d3.select(this).attr('fill', 'red')
  })
  .on('drag', function(event: D3DragEvent<SVGCircleElement, ChartData, ChartData>) {
    d3.select(this)
      .attr('cx', event.x)
      .attr('cy', event.y)
  })
```

#### 挑戰 4：可選鏈與 D3

```typescript
// ❌ D3 方法鏈可能因 null 中斷
const width = svg?.select('.axis')?.node()?.getBBox()?.width

// ✅ 使用類型守衛
const getAxisWidth = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null
): number => {
  if (!svg) return 0
  
  const axis = svg.select<SVGGElement>('.axis')
  if (axis.empty()) return 0
  
  const node = axis.node()
  if (!node) return 0
  
  return node.getBBox().width
}
```

### 類型定義最佳實踐

```typescript
// 1. 定義通用類型
type D3Selection<T extends d3.BaseType> = d3.Selection<T, unknown, null, undefined>
type D3DataSelection<T extends d3.BaseType, D> = d3.Selection<T, D, any, any>

// 2. 元件內使用
const svg: D3Selection<SVGSVGElement> = d3.select('svg')
const bars: D3DataSelection<SVGRectElement, ChartData> = 
  svg.selectAll<SVGRectElement, ChartData>('rect')

// 3. 工具函式
const createScale = <Domain extends string | number>(
  domain: Domain[],
  range: [number, number]
): d3.ScaleLinear<number, number> | d3.ScaleBand<string> => {
  if (typeof domain[0] === 'number') {
    return d3.scaleLinear()
      .domain(domain as number[])
      .range(range)
  } else {
    return d3.scaleBand<string>()
      .domain(domain as string[])
      .range(range)
  }
}
```

### 替代方案

#### 方案 A：最小化類型標註
```typescript
// 依賴 TypeScript 推斷
const svg = d3.select('svg')  // 推斷為 Selection<any, ...>
const bars = svg.selectAll('rect')
```

**缺點**：失去類型安全，不符合 strict mode 要求

#### 方案 B：使用 `as` 類型斷言
```typescript
const svg = d3.select('svg') as d3.Selection<SVGSVGElement, unknown, null, undefined>
```

**缺點**：繞過類型檢查，可能隱藏錯誤

### TypeScript 配置建議

```jsonc
// tsconfig.app.json（當前配置已正確）
{
  "compilerOptions": {
    "strict": true,                      // ✓ 必須
    "noUnusedLocals": true,             // ✓ 捕捉未使用變數
    "noUnusedParameters": true,         // ✓ 捕捉未使用參數
    "noUncheckedIndexedAccess": true,   // ✓ 陣列存取安全
    "strictNullChecks": true,           // ✓ 空值檢查（由 strict 啟用）
    "noImplicitAny": true               // ✓ 禁止隱式 any（由 strict 啟用）
  }
}
```

---

## 總結與建議

### 學習路徑

1. **第一階段**：安裝完整版 D3 + 完全重繪模式
   - 專注理解 Vue 與 D3 的基本整合
   - 建立簡單的長條圖/折線圖
   
2. **第二階段**：Enter/Update/Exit 模式
   - 理解 D3 資料綁定機制
   - 加入過渡動畫
   
3. **第三階段**：進階類型與效能最佳化
   - 精細的 TypeScript 類型標註
   - 根據需求選擇性匯入 D3 模組

### 檢查清單

- [ ] 安裝 `d3` 和 `@types/d3`
- [ ] 建立第一個使用 `onMounted` 的 D3 元件
- [ ] 實作 `onUnmounted` 清理邏輯
- [ ] 使用 `watch` 監聽響應式資料變化
- [ ] 為資料介面定義 TypeScript 類型
- [ ] 測試完全重繪模式
- [ ] 學習 Enter/Update/Exit 模式（選用）
- [ ] 標註 D3 選擇器類型（strict mode 需求）

### 參考資源

- [D3.js 官方文件](https://d3js.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [D3 TypeScript 範例](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/d3)
- [@types/d3 文件](https://www.npmjs.com/package/@types/d3)
