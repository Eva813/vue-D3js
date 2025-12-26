# 快速開始：Vue 3 + D3.js 整合

**目標讀者**: 熟悉 Vue 3 基礎，想要學習 D3.js 整合的開發者  
**預計時間**: 30 分鐘  
**最後更新**: 2025年12月26日

---

## 📦 步驟 1：安裝 D3.js

### 使用 pnpm（推薦）

```bash
cd /Users/Eva/my-vue-D3

# 安裝 D3.js 和 TypeScript 類型定義
pnpm add d3
pnpm add -D @types/d3
```

### 驗證安裝

檢查 `package.json` 是否包含：

```json
{
  "dependencies": {
    "d3": "^7.9.0"
  },
  "devDependencies": {
    "@types/d3": "^7.4.3"
  }
}
```

---

## 🎨 步驟 2：建立第一個 D3 長條圖

### 2.1 建立類型定義檔案

建立 `src/types/chart.types.ts`：

```typescript
// src/types/chart.types.ts
export interface ChartData {
  id: string
  label: string
  value: number
}

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ChartDimensions {
  width: number
  height: number
  margin: Margin
}
```

### 2.2 建立簡單長條圖元件

建立 `src/components/charts/SimpleBarChart.vue`：

```vue
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'
import type { ChartData } from '@/types/chart.types'

// Props
interface Props {
  data: ChartData[]
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 600,
  height: 400
})

// Emits
const emit = defineEmits<{
  'bar-click': [data: ChartData]
}>()

// Template ref
const svgRef = ref<SVGSVGElement | null>(null)

// 渲染圖表函式
function renderChart() {
  if (!svgRef.value || props.data.length === 0) return
  
  // 清空舊內容
  d3.select(svgRef.value).selectAll('*').remove()
  
  // 建立 SVG
  const svg = d3.select(svgRef.value)
    .attr('width', props.width)
    .attr('height', props.height)
  
  // 設定 margin
  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = props.width - margin.left - margin.right
  const innerHeight = props.height - margin.top - margin.bottom
  
  // 建立主要群組
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
  
  // 建立 Scales
  const xScale = d3.scaleBand<string>()
    .domain(props.data.map(d => d.label))
    .range([0, innerWidth])
    .padding(0.1)
  
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(props.data, d => d.value) || 0])
    .range([innerHeight, 0])
  
  // 繪製長條
  g.selectAll<SVGRectElement, ChartData>('rect')
    .data(props.data)
    .join('rect')
    .attr('x', d => xScale(d.label) || 0)
    .attr('y', d => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', d => innerHeight - yScale(d.value))
    .attr('fill', 'steelblue')
    .style('cursor', 'pointer')
    // 互動：hover 效果
    .on('mouseenter', function() {
      d3.select(this).attr('fill', 'orange')
    })
    .on('mouseleave', function() {
      d3.select(this).attr('fill', 'steelblue')
    })
    // 互動：點擊事件
    .on('click', (event, d) => {
      emit('bar-click', d)
    })
  
  // 繪製 X 軸
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale))
  
  // 繪製 Y 軸
  g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale))
}

// 生命週期：掛載時渲染
onMounted(renderChart)

// 響應式：資料變更時重新渲染
watch(() => props.data, renderChart, { deep: true })
</script>

<template>
  <svg ref="svgRef" class="bar-chart"></svg>
</template>

<style scoped>
.bar-chart {
  border: 1px solid #ddd;
  background: #fafafa;
}

:deep(.x-axis text),
:deep(.y-axis text) {
  font-size: 12px;
  font-family: sans-serif;
}

:deep(.x-axis path),
:deep(.y-axis path),
:deep(.x-axis line),
:deep(.y-axis line) {
  stroke: #333;
}
</style>
```

### 2.3 使用元件

修改 `src/App.vue`：

```vue
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
  alert(`你點擊了 ${data.label}，數值為 ${data.value}`)
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
      <button @click="randomizeData">🎲 隨機更新數值</button>
      <button @click="addBar">➕ 新增長條</button>
      <button @click="removeBar">➖ 移除長條</button>
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
```

---

## 🚀 步驟 3：執行專案

```bash
# 啟動開發伺服器
pnpm dev
```

開啟瀏覽器訪問 `http://localhost:5173`，你應該會看到：

- ✅ 一個互動式長條圖
- ✅ 滑鼠懸停時長條變色
- ✅ 點擊長條時顯示 alert
- ✅ 三個按鈕可以更新資料

---

## 🧪 步驟 4：驗證 TypeScript 類型

在 `SimpleBarChart.vue` 中測試類型檢查：

```typescript
// ✅ 正確：符合 ChartData 介面
const validData: ChartData = {
  id: '1',
  label: 'A',
  value: 30
}

// ❌ 錯誤：TypeScript 會報錯
const invalidData: ChartData = {
  id: '1',
  label: 'A'
  // 缺少 value 屬性
}
```

---

## 📚 下一步學習

### 進階主題

1. **使用 Composables 重構**
   - 建立 `useD3Chart`, `useD3Scale`, `useD3Axis`
   - 將邏輯從元件中提取
   - 參考：[research.md](./research.md) 第 5 章

2. **實作 Enter/Update/Exit 模式**
   - 更高效的資料更新
   - 平滑的過渡動畫
   - 參考：[research.md](./research.md) 第 3 章

3. **建立更多圖表類型**
   - 折線圖（LineChart.vue）
   - 散點圖（ScatterPlot.vue）
   - 圓餅圖（PieChart.vue）

4. **撰寫測試**
   - Composables 單元測試
   - 元件整合測試
   - 參考：[research.md](./research.md) 第 6 章

---

## ❓ 常見問題

### Q1: D3 和 Vue 的響應式系統會衝突嗎？

**A**: 不會，只要遵循以下原則：
- ✅ 使用 Vue 的 reactive data 儲存資料
- ✅ 使用 D3 進行 DOM 操作（繪製 SVG）
- ❌ 不要讓 D3 直接修改 Vue 的 reactive data

### Q2: 為什麼要在 onMounted 中初始化 D3？

**A**: 因為 D3 需要操作真實的 DOM 元素，而 Vue 只有在 `onMounted` 後才會將元素掛載到 DOM 上。如果在 `setup()` 中直接操作，`svgRef.value` 會是 `null`。

### Q3: 如何避免記憶體洩漏？

**A**: 在 `onUnmounted` 中清理 D3 資源：

```typescript
onUnmounted(() => {
  if (svgRef.value) {
    d3.select(svgRef.value)
      .selectAll('*')
      .interrupt()  // 停止所有動畫
      .remove()     // 移除所有元素
  }
})
```

### Q4: TypeScript 報錯「類型不匹配」怎麼辦？

**A**: D3 的泛型可能很複雜，使用明確的類型標註：

```typescript
// 明確標註選擇器類型
const svg = d3.select<SVGSVGElement, unknown>(svgRef.value)

// 明確標註資料綁定類型
const bars = svg.selectAll<SVGRectElement, ChartData>('rect')
```

參考：[research.md](./research.md) 第 4 章

### Q5: 圖表沒有顯示怎麼辦？

**檢查清單**：
- [ ] 確認 `svgRef.value` 不是 `null`（在 onMounted 中檢查）
- [ ] 確認 `data` 不是空陣列
- [ ] 確認 SVG 有設定 width 和 height
- [ ] 打開瀏覽器開發者工具，檢查是否有 console 錯誤
- [ ] 使用 Elements 面板檢查 SVG 元素是否正確生成

### Q6: 如何調整圖表尺寸讓它響應式？

**A**: 使用 `ResizeObserver` 監聽容器變化：

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref<HTMLDivElement | null>(null)
const svgSize = ref({ width: 0, height: 0 })

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!containerRef.value) return
  
  resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect
    svgSize.value = { width, height }
  })
  
  resizeObserver.observe(containerRef.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
```

---

## 🔗 相關資源

### 專案文件
- [spec.md](./spec.md) - 功能規格
- [research.md](./research.md) - 技術研究
- [data-model.md](./data-model.md) - 資料模型定義
- [contracts/](./contracts/) - API 合約

### 外部資源
- [D3.js 官方文件](https://d3js.org/)
- [Vue 3 文件](https://vuejs.org/)
- [TypeScript 手冊](https://www.typescriptlang.org/docs/)
- [D3 TypeScript 範例](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/d3)

---

## ✅ 檢查清單

完成以下項目代表你已成功設定 Vue 3 + D3.js 環境：

- [ ] D3.js 和 @types/d3 已安裝
- [ ] 建立 `src/types/chart.types.ts` 類型定義
- [ ] 建立 `SimpleBarChart.vue` 元件
- [ ] 在 `App.vue` 中使用元件
- [ ] 專案能成功啟動（`pnpm dev`）
- [ ] 瀏覽器中能看到長條圖
- [ ] 滑鼠懸停和點擊互動正常運作
- [ ] 點擊按鈕能更新圖表資料
- [ ] TypeScript 無報錯（執行 `pnpm build` 驗證）

---

**恭喜！🎉** 你已成功建立第一個 Vue 3 + D3.js 整合專案。

接下來可以探索更進階的主題，或參考 [research.md](./research.md) 學習最佳實踐和效能最佳化。
