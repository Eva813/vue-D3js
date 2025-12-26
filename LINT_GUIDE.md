# Lint 配置指南

> Vue 3 + TypeScript 專案的 Oxlint + ESLint 雙軌制配置

---

## 🚀 快速開始

### 開發時（推薦）
```bash
pnpm run lint:oxlint
```
超快速檢查（16-24ms），適合頻繁執行，即時反饋。

### 提交前
```bash
pnpm run lint
```
完整檢查（Oxlint + ESLint），確保程式碼品質。

### 自動修復
```bash
pnpm run lint:fix:all
```
雙重自動修復（Oxlint + ESLint），一鍵修復大部分問題。

---

## 📋 完整指令參考

| 指令 | 功能 | 執行時間 | 使用場景 |
|------|------|---------|---------|
| `lint` | Oxlint + ESLint 完整檢查 | ~1-2s | 提交前、CI/CD |
| `lint:oxlint` | 僅 Oxlint 快速檢查 | 16-24ms | 開發時頻繁執行 |
| `lint:eslint` | 僅 ESLint 完整檢查 | ~1-2s | 調試 ESLint 規則 |
| `lint:fix` | ESLint 自動修復 | ~1-2s | 修復格式問題 |
| `lint:fix:all` | Oxlint + ESLint 雙重修復 | ~1-2s | 完整自動修復（推薦） |

### 執行流程

```
開發階段          提交前           修復問題
   ↓                ↓                ↓
lint:oxlint  →    lint     →   lint:fix:all
(快速反饋)      (完整檢查)      (自動修復)
```

---

## ⚙️ 配置說明

### 已安裝套件

| 套件 | 版本 | 用途 |
|------|------|------|
| `oxlint` | 1.35.0 | 超快速 Rust linter |
| `eslint` | 9.39.2 | JavaScript/TypeScript linter |
| `eslint-plugin-vue` | 10.6.2 | Vue 3 專用規則 |
| `typescript-eslint` | 8.50.1 | TypeScript 支援 |
| `eslint-plugin-oxlint` | 1.35.0 | 避免規則重複 |

### 配置檔案

| 檔案 | 用途 |
|------|------|
| [eslint.config.js](eslint.config.js) | ESLint 9 Flat Config，包含 JS、TS、Vue 規則 |
| [.oxlintrc.json](.oxlintrc.json) | Oxlint 配置，包含 correctness、suspicious、perf 規則 |
| [package.json](package.json) | npm scripts 定義 |

### 檢查規則分類

**Oxlint 規則**（`<script>` 區塊）：
- `correctness` - 程式碼正確性（邏輯錯誤）
- `suspicious` - 可疑代碼模式
- `perf` - 性能問題
- `typescript` - TypeScript 特定問題

**ESLint 規則**（完整檢查）：
- Vue 模板規則（`<template>` 格式、組件命名等）
- TypeScript 規則（類型安全、未使用變數等）
- JavaScript 基礎規則

**涵蓋範圍**：
| 檢查項目 | Oxlint | ESLint |
|---------|--------|--------|
| JavaScript 基礎 | ✅ | ✅ |
| TypeScript | ✅ | ✅ |
| Vue `<script>` | ✅ | ✅ |
| Vue `<template>` | ❌ | ✅ |

---

## ⚡ 效能與最佳實踐

### 速度對比

| 工具 | 檔案數 | 執行時間 | 相對速度 |
|------|--------|----------|----------|
| Oxlint | 5 | 16-24ms | 基準（最快）|
| ESLint | 5 | ~1-2s | 慢 50-100 倍 |
| Oxlint + ESLint | 5 | ~1-2s | Oxlint 不影響總時間 |

### 使用建議

#### ✅ 開發時
```bash
# 每次儲存後快速檢查
pnpm run lint:oxlint
```
- 16-24ms 即時反饋
- 發現基本邏輯錯誤
- 不打斷開發流程

#### ✅ 提交前
```bash
# Git hook 或手動執行
pnpm run lint
```
- 先 Oxlint 快速過濾
- 再 ESLint 深度檢查
- 確保提交品質

#### ✅ 修復問題
```bash
# 自動修復大部分格式問題
pnpm run lint:fix:all
```
- Oxlint 修復（4ms）
- ESLint 修復（~1-2s）
- 約 90% 問題可自動修復

#### ✅ CI/CD
```yaml
# 在 CI pipeline 中
- run: pnpm run lint
```
- 完整檢查所有規則
- 失敗時阻止合併

---

## 🔧 常見問題

### Q1: ESLint 報錯但 Oxlint 沒有？
**A**: 這是正常的。ESLint 包含更多規則，特別是 Vue 模板規則（`<template>` 內的檢查）。Oxlint 目前只檢查 `<script>` 區塊。

**解決方案**: 使用雙軌制（`pnpm run lint`），兩者互補。

---

### Q2: 想關閉某個規則怎麼辦？
**A**: 編輯配置檔案：

**ESLint 規則**：
```javascript
// eslint.config.js
{
  rules: {
    'vue/multi-word-component-names': 'off',  // 關閉此規則
  }
}
```

**Oxlint 規則**：
```json
// .oxlintrc.json
{
  "rules": {
    "correctness": "off"  // 關閉整個分類
  }
}
```

---

### Q3: Oxlint 找不到問題？
**A**: Oxlint 專注於程式碼邏輯錯誤（correctness、suspicious、perf），格式問題由 ESLint 處理。

**說明**：
- Oxlint：邏輯錯誤、性能問題
- ESLint：格式、風格、Vue 模板規則

**建議**: 開發時用 `lint:oxlint` 快速檢查，提交前用 `lint` 完整檢查。

---

### Q4: 如何在 VSCode 中獲得即時提示？

**安裝延伸功能**：
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - ESLint 即時檢查
- [Oxc](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) - Oxlint 即時檢查

---

## 📚 參考資源

### 官方文檔
- [Oxlint Documentation](https://oxc.rs/docs/guide/usage/linter.html)
- [ESLint Vue Plugin](https://eslint.vuejs.org/user-guide/)
- [TypeScript ESLint](https://typescript-eslint.io/)

### 最佳實踐
- [Announcing Oxlint 1.0](https://voidzero.dev/posts/announcing-oxlint-1-stable)
- [Getting Started with Oxlint](https://betterstack.com/community/guides/scaling-nodejs/oxlint-explained/)

### GitHub
- [eslint-plugin-oxlint](https://github.com/oxc-project/eslint-plugin-oxlint)
- [Vue ESLint Config TypeScript](https://github.com/vuejs/eslint-config-typescript)

---

## 💡 技術說明

### 為什麼使用雙軌制？

**Oxlint 優勢**：
- ⚡ 快 50-100 倍（Rust 編寫）
- 🎯 專注邏輯錯誤
- 🚀 開發時即時反饋

**ESLint 優勢**：
- 📦 完整規則生態
- 🎨 Vue 模板支援
- 🔧 豐富的插件

**結合效果**：
```
開發流程: Oxlint (快速) → ESLint (完整)
         ↓                    ↓
      即時反饋            深度檢查
```

### 已知限制

**Oxlint**：
- ❌ 不支援 Vue `<template>` 檢查
- ⚠️ Type-aware linting 仍在預覽階段

**解決方案**：
- ESLint 處理 Vue 模板規則
- TypeScript 類型檢查由 `vue-tsc` 處理（`pnpm run build`）

---

**配置版本**: Oxlint 1.35.0 + ESLint 9.39.2 + Vue 3.5.26
**最後更新**: 2025-12-26
**狀態**: ✅ 已驗證並優化
