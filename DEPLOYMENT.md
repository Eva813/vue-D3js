# 部署指南 / Deployment Guide

本文件說明如何將專案部署到 GitHub Pages。

This document explains how to deploy the project to GitHub Pages.

---

## 🚀 自動部署 / Automatic Deployment

### 設置步驟 / Setup Steps

1. **啟用 GitHub Pages**
   - 前往 GitHub 專案的 Settings > Pages
   - Source 選擇 "GitHub Actions"
   
   Enable GitHub Pages:
   - Go to your repository's Settings > Pages
   - Set Source to "GitHub Actions"

2. **推送到 main 分支**
   - 每次推送到 `main` 分支會自動觸發建置和部署
   
   Push to main branch:
   - Every push to `main` branch automatically triggers build and deployment

3. **查看部署狀態**
   - 前往 Actions 標籤查看工作流程狀態
   - 部署成功後，網站將在 `https://<username>.github.io/vue-D3js/` 上線
   
   Check deployment status:
   - Go to the Actions tab to view workflow status
   - After successful deployment, the site will be live at `https://<username>.github.io/vue-D3js/`

---

## 🔧 手動部署 / Manual Deployment

### 方法 1: GitHub Actions Workflow Dispatch

1. 前往 Actions 標籤
2. 選擇 "Build and Deploy" 工作流程
3. 點擊 "Run workflow" 按鈕
4. 選擇分支並執行

Method 1: GitHub Actions Workflow Dispatch

1. Go to the Actions tab
2. Select the "Build and Deploy" workflow
3. Click "Run workflow" button
4. Select branch and run

### 方法 2: 本地建置 / Local Build

```bash
# 1. 建置專案
npm run build

# 2. 手動部署 dist 資料夾
# 可以使用 GitHub CLI 或手動上傳
```

---

## 📝 配置檔案說明 / Configuration Files

### `.github/workflows/build-and-deploy.yml`

GitHub Actions 工作流程配置：
- **Build Job**: 安裝依賴、執行 lint、建置專案
- **Deploy Job**: 部署到 GitHub Pages（僅在 main 分支）

GitHub Actions workflow configuration:
- **Build Job**: Install dependencies, run lint, build project
- **Deploy Job**: Deploy to GitHub Pages (main branch only)

### `vite.config.ts`

Vite 建置配置：
```typescript
base: process.env.NODE_ENV === 'production' ? '/vue-D3js/' : '/'
```

- 開發環境：base path 為 `/`
- 生產環境：base path 為 `/vue-D3js/`（GitHub Pages 子路徑）

Development: base path is `/`
Production: base path is `/vue-D3js/` (GitHub Pages subpath)

---

## 🔍 常見問題 / FAQ

### Q1: 為什麼需要設置 base path？

GitHub Pages 會將專案部署到子路徑（如 `/vue-D3js/`），
因此需要在 Vite 配置中設置 base path，確保資源路徑正確。

Why do we need to set the base path?

GitHub Pages deploys projects to a subpath (e.g., `/vue-D3js/`),
so we need to set the base path in Vite config to ensure correct resource paths.

### Q2: 如何在本地測試生產建置？

```bash
# 建置
NODE_ENV=production npm run build

# 預覽
npm run preview
```

How to test production build locally?

```bash
# Build
NODE_ENV=production npm run build

# Preview
npm run preview
```

### Q3: 部署失敗怎麼辦？

1. 檢查 Actions 日誌
2. 確認 GitHub Pages 已啟用
3. 確認 package.json 中的依賴是否正確
4. 檢查 lint 是否通過

What to do if deployment fails?

1. Check Actions logs
2. Verify GitHub Pages is enabled
3. Verify dependencies in package.json are correct
4. Check if lint passes

---

## 📦 建置產物 / Build Output

建置完成後，產物會在 `dist/` 目錄：

After building, output will be in the `dist/` directory:

```
dist/
├── index.html          # 主頁面 / Main page
├── vite.svg           # Vite logo
├── assets/            # 資源檔案 / Asset files
│   ├── index-*.css    # 樣式 / Styles
│   └── index-*.js     # JavaScript bundles
```

---

## 🔗 相關連結 / Related Links

- [GitHub Pages 文檔](https://docs.github.com/en/pages)
- [Vite 部署指南](https://vite.dev/guide/static-deploy.html)
- [GitHub Actions 文檔](https://docs.github.com/en/actions)

---

**最後更新 / Last Updated**: 2026-02-07
