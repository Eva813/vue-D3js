# Implementation Plan: Vue 3 D3.js Integration Learning Project

**Branch**: `001-learn-vue3-d3` | **Date**: 2025年12月26日 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-learn-vue3-d3/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

建立 Vue 3 專案中整合 D3.js 的學習範例，包括：
1. 安裝和設定 D3.js v7（完整版 + TypeScript 類型）
2. 建立可重用的 D3 視覺化元件（長條圖為主要範例）
3. 整合 Vue 3 Composition API 與 D3 生命週期
4. 實作響應式資料更新機制
5. 提供完整的 TypeScript 類型定義和測試範例

**技術方法**：採用 Composable 函式庫 + Presentational 元件混合架構，使用 onMounted/onUnmounted 管理 D3 生命週期，漸進式學習從完全重繪到 Enter/Update/Exit 最佳化模式。

## Technical Context

**Language/Version**: TypeScript 5.7+ with Vue 3.5+ (Composition API + `<script setup>` 專用)
**Primary Dependencies**: 
- Vue 3.5+ (Composition API)
- D3.js v7+ (完整版，依賴 Vite tree-shaking)
- @types/d3 (TypeScript 類型定義)
- Vite 7 (建構工具)
- Vitest (測試框架)
- Vue Test Utils (元件測試)
- pnpm (套件管理)

**Testing Framework**: 
- Vitest (單元測試)
- Vue Test Utils (元件整合測試)
- jsdom (DOM 模擬環境)
- Playwright (可選：視覺回歸測試)

**Target Platform**: 現代瀏覽器 (ES2020+)，不需要支援 IE
**Project Type**: 單一頁面應用 (SPA) 學習專案，包含可重用元件函式庫

**Performance Goals**: 
- Vue 元件渲染：<16ms (60fps)
- D3 過渡動畫：<1000ms
- 初始頁面載入：<2s (4G 網路)
- Bundle size 增量：<50KB gzipped per feature

**Constraints**: 
- TypeScript strict mode 必須啟用
- 測試覆蓋率 ≥80%
- 所有程式碼必須通過 ESLint 檢查
- 使用 Composition API，禁用 Options API
- 記憶體洩漏預防：必須清理 D3 事件監聽器和動畫

**Scale/Scope**: 
- 3-5 個基礎 D3 視覺化元件（長條圖、折線圖等）
- 2-3 個可重用 Composables (useD3Chart, useD3Scale, useD3Axis)
- 完整的 TypeScript 類型定義
- 包含互動功能（hover, click）
- 學習優先，不需要處理超大資料集（<1000 筆資料點）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Phase 1 檢查結果（設計階段）

| 原則 | 要求 | 狀態 | 說明 |
|------|------|------|------|
| **I. Test-First Development** | TDD 必須 | ⏳ 待實作 | 將在 Phase 2 實作前撰寫測試 |
| **II. TypeScript Strictness** | strict mode + 無 any | ✅ 通過 | 所有類型定義完整，無 any |
| **III. User Experience** | 統一設計系統 | ⏳ 部分 | 學習專案，使用簡單一致的樣式 |
| **IV. Performance** | 60fps + 2s TTI | ✅ 通過 | 資料量小，效能需求可達成 |
| **Vue 3 Requirement** | Composition API 專用 | ✅ 通過 | 所有元件使用 `<script setup>` |
| **D3 Integration** | v7+ + 生命週期管理 | ✅ 通過 | Composables 定義完整清理策略 |

### Phase 1 設計品質確認

- [x] 所有元件 Props 有完整 TypeScript 介面（見 contracts/）
- [x] 資料模型類型定義完整（見 data-model.md）
- [x] 所有 Composables 有明確類型簽名（見 contracts/）
- [x] API 合約涵蓋所有核心功能
- [x] 快速開始指南提供完整範例
- [x] 無使用 any 類型
- [x] 所有可選屬性正確使用 `?`

### 無違規項目

此專案完全符合 Constitution 要求，無需 Complexity Tracking 章節。

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/              # Vue 元件
│   ├── charts/             # D3 視覺化元件
│   │   ├── BarChart.vue    # 長條圖（Phase 1 主要範例）
│   │   ├── LineChart.vue   # 折線圖（Phase 1 延伸）
│   │   └── ScatterPlot.vue # 散點圖（Phase 2 可選）
│   └── demos/              # 使用範例元件
│       └── ChartDemo.vue   # 展示所有圖表的 Demo 頁面
├── composables/            # 可重用 Composition functions
│   ├── useD3Chart.ts       # D3 圖表通用邏輯（生命週期管理）
│   ├── useD3Scale.ts       # Scale 管理（xScale, yScale）
│   ├── useD3Axis.ts        # 座標軸處理
│   └── useD3Transition.ts  # 動畫過渡處理
├── types/                  # TypeScript 類型定義
│   └── chart.types.ts      # 圖表相關介面（ChartData, ChartDimensions, etc.）
├── utils/                  # 工具函式
│   └── d3-helpers.ts       # D3 輔助函式（formatters, validators）
├── App.vue                 # 主應用程式
├── main.ts                 # 應用程式入口
└── style.css              # 全域樣式

tests/
├── unit/                   # 單元測試
│   ├── composables/        # Composables 測試
│   │   ├── useD3Chart.spec.ts
│   │   ├── useD3Scale.spec.ts
│   │   └── useD3Axis.spec.ts
│   └── utils/              # 工具函式測試
│       └── d3-helpers.spec.ts
├── integration/            # 整合測試
│   └── components/         # 元件測試
│       ├── BarChart.spec.ts
│       ├── LineChart.spec.ts
│       └── ChartDemo.spec.ts
└── utils/                  # 測試工具
    └── svg-helpers.ts      # SVG DOM 查詢輔助函式

public/                     # 靜態資源（現有）
```

**Structure Decision**: 

此專案採用 **Option 1: Single Project** 架構，因為：

1. **單一 SPA 應用**：無後端需求，所有邏輯在前端完成
2. **元件導向**：D3 視覺化封裝為 Vue 元件，放置於 `src/components/charts/`
3. **Composables 模式**：可重用邏輯提取為 Composables，符合 Vue 3 最佳實踐
4. **類型安全**：所有共用類型定義集中在 `src/types/`
5. **測試分層**：清楚區分單元測試（Composables, utils）和整合測試（元件）

**現有檔案保留**：
- `src/components/HelloWorld.vue` → 可移除或保留作為對照
- `src/App.vue` → 將改為載入 ChartDemo 元件
- `public/` → 保留用於靜態資源（如範例資料 JSON）

## Phase 1 完成報告

✅ **設計階段完成** - 所有資料模型和 API 合約已定義

### 已生成文件

1. **data-model.md** - 完整的資料模型定義
   - 11 個核心類型介面（ChartData, ChartDimensions, ChartConfig 等）
   - 類型守衛函式（isChartData, isChartDataArray, isMargin）
   - 資料驗證策略（ValidationResult, DataValidator）
   - 完整的使用範例和說明

2. **contracts/** - API 合約文件
   - BarChart.contract.md：長條圖元件完整規範
   - useD3Chart.contract.md：圖表生命週期 Composable
   - useD3Scale.contract.md：Scale 管理 Composable
   - useD3Axis.contract.md：座標軸繪製 Composable

3. **quickstart.md** - 快速開始指南
   - 完整的安裝步驟
   - 第一個長條圖範例（含完整程式碼）
   - 互動功能示範
   - 6 個常見問題解答
   - TypeScript 驗證方法

### 設計決策

- **類型定義策略**：使用 interface 而非 type，便於未來擴充
- **Props 設計**：所有可選項有明確預設值
- **資料驗證**：提供獨立的 validator 模組
- **錯誤處理**：所有 Composables 定義明確的錯誤處理規範

### 下一步：Phase 2 實作

現在可以開始 TDD 實作流程：

1. 根據 contracts/ 撰寫測試（先失敗）
2. 實作 src/types/chart.types.ts
3. 實作 src/composables/
4. 實作 src/components/charts/
5. 驗證測試通過和類型檢查

**指令**：使用 `/speckit.tasks` 生成實作任務清單（Phase 2 工具，尚未執行）

---

**Phase 1 完成時間**: 2025年12月26日
