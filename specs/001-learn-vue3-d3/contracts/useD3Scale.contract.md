# Composable 合約：useD3Scale

**函式名稱**: useD3Scale  
**檔案位置**: `src/composables/useD3Scale.ts`  
**用途**: 管理 D3 Scale（xScale, yScale），自動響應資料變更

---

## 函式簽名

```typescript
function useD3Scale(
  data: Ref<ChartData[]>,
  innerWidth: number,
  innerHeight: number
): D3ScaleReturn
```

## 參數

### data
- **類型**: `Ref<ChartData[]>`
- **說明**: 響應式圖表資料
- **必要性**: 必要

### innerWidth
- **類型**: `number`
- **說明**: 繪圖區域寬度（扣除 margin）
- **必要性**: 必要

### innerHeight
- **類型**: `number`
- **說明**: 繪圖區域高度（扣除 margin）
- **必要性**: 必要

## 返回值

```typescript
interface D3ScaleReturn {
  /** X 軸 Scale（scaleBand），domain 為 label[] */
  xScale: Ref<d3.ScaleBand<string>>
  
  /** Y 軸 Scale（scaleLinear），domain 為 [0, max(value)] */
  yScale: Ref<d3.ScaleLinear<number, number>>
}
```

## 使用範例

```typescript
<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useD3Scale } from '@/composables/useD3Scale'
import type { ChartData } from '@/types/chart.types'

const data = ref<ChartData[]>([
  { id: '1', label: 'A', value: 30 },
  { id: '2', label: 'B', value: 80 }
])

const { xScale, yScale } = useD3Scale(data, 500, 300)

// xScale 和 yScale 會自動響應 data 變更
console.log(xScale.value('A'))  // 回傳 X 座標
console.log(yScale.value(80))   // 回傳 Y 座標

// 更新資料時，scales 自動更新
data.value.push({ id: '3', label: 'C', value: 45 })
</script>
```

## 行為規範

### xScale (scaleBand)
- **Domain**: 從 `data` 中提取所有 `label` 值
- **Range**: `[0, innerWidth]`
- **Padding**: 0.1（長條之間的間距）
- **自動更新**: 當 `data` 變更時，重新計算 domain

### yScale (scaleLinear)
- **Domain**: `[0, d3.max(data, d => d.value) || 0]`
- **Range**: `[innerHeight, 0]`（注意反轉，因為 SVG Y 軸向下）
- **自動更新**: 當 `data` 變更時，重新計算 domain

### 響應式行為
- 使用 Vue 的 `computed` 包裝 scales
- 當 `data.value` 變更時，自動重新計算 domains
- `innerWidth` 和 `innerHeight` 在初始化後不可變

## 錯誤處理

- 如果 `data` 為空陣列，`yScale.domain()` 應為 `[0, 0]`
- 如果 `innerWidth` 或 `innerHeight` ≤ 0，應拋出錯誤

---

**版本**: 1.0.0  
**最後更新**: 2025年12月26日
