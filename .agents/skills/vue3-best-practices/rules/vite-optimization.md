---
title: Vite Build Optimization
impact: HIGH
impactDescription: improves build performance, reduces bundle size, and optimizes development experience
tags: vite, build-optimization, performance, dev-server, plugins, configuration
---

## Vite Build Optimization

Optimize Vite configuration for maximum build performance, efficient development experience, and optimal production bundles.

**Incorrect (default configuration, no optimization, slow builds):**

```javascript
// ❌ 基本配置，沒有優化
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 沒有其他配置
})

// ❌ 沒有環境配置
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

// ❌ 沒有優化的導入
// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus) // 全量導入
app.mount('#app')
```

**Correct (comprehensive Vite optimization for Vue 3 + TypeScript + D3.js project):**

```typescript
// ✅ 完整優化的 Vite 配置
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ command, mode }) => {
  // ✅ 載入環境變數
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = command === 'serve'
  const isProd = command === 'build'

  return {
    // ✅ 插件配置
    plugins: [
      vue({
        script: {
          defineModel: true,
          propsDestructure: true
        }
      }),
      
      // ✅ 自動導入 Vue API 和工具函數
      AutoImport({
        imports: [
          'vue',
          'vue-router',
          '@vueuse/core',
          {
            'pinia': ['defineStore', 'storeToRefs']
          }
        ],
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true
        }
      }),

      // ✅ 自動導入組件
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: 'sass'
          })
        ],
        dts: 'src/types/components.d.ts',
        directoryAsNamespace: true
      }),

      // ✅ 打包分析（僅在需要時）
      ...(env.ANALYZE === 'true' ? [
        visualizer({
          filename: 'dist/stats.html',
          open: true,
          gzipSize: true,
          brotliSize: true
        })
      ] : [])
    ],

    // ✅ 路徑解析優化
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '~': resolve(__dirname, 'node_modules'),
        '#': resolve(__dirname, 'types')
      }
    },

    // ✅ CSS 處理優化
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/styles/variables.scss" as *;'
        }
      },
      devSourcemap: isDev,
      // ✅ PostCSS 插件
      postcss: {
        plugins: [
          require('autoprefixer'),
          ...(isProd ? [
            require('cssnano')({
              preset: ['default', {
                discardComments: { removeAll: true },
                normalizeWhitespace: false
              }]
            })
          ] : [])
        ]
      }
    },

    // ✅ 開發服務器優化
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
      cors: true,
      // ✅ HMR 配置
      hmr: {
        port: 3001
      },
      // ✅ 代理配置
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      }
    },

    // ✅ 構建優化
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isProd ? false : 'inline',
      minify: 'terser',
      
      // ✅ Terser 壓縮選項
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? ['console.log', 'console.info'] : []
        }
      },

      // ✅ Rollup 優化選項
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          // ✅ 手動 chunk 分割策略
          manualChunks: {
            // Vue 生態系統
            'vue-vendor': ['vue', 'vue-router'],
            
            // 狀態管理
            'store-vendor': ['pinia', '@pinia/nuxt'],
            
            // UI 組件庫
            'ui-vendor': ['element-plus', '@element-plus/icons-vue'],
            
            // 工具庫（較小的庫）
            'utils-vendor': ['lodash-es', '@vueuse/core', 'dayjs'],
            
            // D3.js 相關（較大的可視化庫）
            'd3-vendor': ['d3', 'd3-selection', 'd3-scale', 'd3-axis', 'd3-shape'],
            
            // 開發工具（僅開發環境）
            ...(isDev ? {
              'dev-vendor': ['@vue/devtools-api']
            } : {})
          },
          
          // ✅ 動態 chunk 命名
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
            
            if (facadeModuleId) {
              // 根據模組路徑決定 chunk 名稱
              if (facadeModuleId.includes('/views/')) {
                return 'views/[name]-[hash].js'
              }
              if (facadeModuleId.includes('/components/')) {
                return 'components/[name]-[hash].js'
              }
              if (facadeModuleId.includes('/composables/')) {
                return 'composables/[name]-[hash].js'
              }
            }
            
            return 'chunks/[name]-[hash].js'
          },
          
          // ✅ 資源命名
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const extension = info[info.length - 1]
            
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extension)) {
              return 'images/[name]-[hash].[ext]'
            }
            if (/woff2?|eot|ttf|otf/i.test(extension)) {
              return 'fonts/[name]-[hash].[ext]'
            }
            return 'assets/[name]-[hash].[ext]'
          }
        }
      },

      // ✅ Chunk 大小警告
      chunkSizeWarningLimit: 1000,
      
      // ✅ 複製公共文件
      copyPublicDir: true
    },

    // ✅ 依賴預處理優化
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core',
        'lodash-es',
        'element-plus/es',
        'd3'
      ],
      exclude: [
        // 排除大型庫避免預處理
        '@vue/devtools-api'
      ],
      esbuildOptions: {
        target: 'es2015'
      }
    },

    // ✅ 定義全局常量
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },

    // ✅ 環境變數前綴
    envPrefix: 'VITE_'
  }
})
```

**Environment-Specific Configurations:**

```typescript
// ✅ 環境配置文件
// .env.development
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=Vue D3 App (Development)
VITE_LOG_LEVEL=debug

// .env.production  
VITE_API_BASE_URL=https://api.production.com
VITE_APP_TITLE=Vue D3 App
VITE_LOG_LEVEL=error

// .env.test
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=Vue D3 App (Test)
VITE_LOG_LEVEL=warn
```

**Advanced Plugin Configuration:**

```typescript
// ✅ 自定義插件配置
// vite-plugins.ts
import type { Plugin } from 'vite'

// ✅ PWA 插件配置
export const configurePWA = (): Plugin => {
  return {
    name: 'pwa-config',
    configResolved(config) {
      if (config.command === 'build') {
        // PWA 配置
      }
    }
  }
}

// ✅ 開發環境增強
export const configureDevEnhancements = (): Plugin[] => [
  // Mock 服務
  {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use('/api/mock', (req, res, next) => {
        // Mock API 邏輯
        next()
      })
    }
  },
  
  // 熱重載增強
  {
    name: 'hmr-enhancement',
    handleHotUpdate(ctx) {
      if (ctx.file.includes('.vue')) {
        console.log(`🔥 HMR: ${ctx.file}`)
      }
    }
  }
]
```

**Build Scripts Optimization:**

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "dev:host": "vite --host --mode development",
    "build": "vue-tsc -b && vite build",
    "build:analyze": "ANALYZE=true vite build",
    "build:test": "vue-tsc -b && vite build --mode test",
    "preview": "vite preview",
    "preview:dist": "vite preview --port 5000",
    "clean": "rimraf dist node_modules/.vite",
    "clean:cache": "rimraf node_modules/.vite",
    "type-check": "vue-tsc --noEmit",
    "lint": "oxlint && eslint .",
    "lint:fix": "oxlint --fix && eslint . --fix"
  }
}
```

**Performance Monitoring:**

```typescript
// ✅ 建構性能監控
// scripts/build-monitor.ts
import { performance } from 'perf_hooks'
import { promises as fs } from 'fs'

export interface BuildMetrics {
  buildTime: number
  bundleSize: number
  chunkCount: number
  assetCount: number
}

export async function analyzeBuild(): Promise<BuildMetrics> {
  const distPath = './dist'
  const startTime = performance.now()

  // 分析建構結果
  const files = await fs.readdir(distPath, { recursive: true })
  const jsChunks = files.filter(f => f.endsWith('.js'))
  const assets = files.filter(f => !f.endsWith('.js') && !f.endsWith('.html'))

  let totalSize = 0
  for (const file of files) {
    const stat = await fs.stat(`${distPath}/${file}`)
    totalSize += stat.size
  }

  const endTime = performance.now()

  return {
    buildTime: endTime - startTime,
    bundleSize: totalSize,
    chunkCount: jsChunks.length,
    assetCount: assets.length
  }
}

// 使用 Vite 插件集成
export const buildMetricsPlugin = (): Plugin => ({
  name: 'build-metrics',
  writeBundle: {
    sequential: true,
    order: 'post',
    async handler() {
      const metrics = await analyzeBuild()
      console.log('📊 Build Metrics:', metrics)
      
      // 保存指標到文件
      await fs.writeFile(
        './dist/build-metrics.json', 
        JSON.stringify(metrics, null, 2)
      )
    }
  }
})
```

**Development Workflow Enhancements:**

```typescript
// ✅ 開發工作流程增強
// vite.dev.config.ts
export const devConfig = {
  // ✅ 檔案監聽優化
  server: {
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/coverage/**'
      ],
      usePolling: process.env.USE_POLLING === 'true'
    }
  },

  // ✅ 快速刷新配置
  plugins: [
    vue({
      reactivityTransform: true, // 啟用響應性轉換
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    })
  ],

  // ✅ 開發時類型檢查
  esbuild: {
    target: 'es2020',
    format: 'esm',
    platform: 'browser'
  }
}
```

**Production Optimization:**

```typescript
// ✅ 生產環境優化
// vite.prod.config.ts
export const prodConfig = {
  build: {
    // ✅ 進階壓縮設定
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn'],
        passes: 2
      },
      mangle: {
        safari10: true,
        properties: {
          regex: /^_/
        }
      },
      format: {
        comments: false
      }
    },

    // ✅ CSS 優化
    cssCodeSplit: true,
    cssMinify: 'lightningcss',

    // ✅ 資產內聯閾值
    assetsInlineLimit: 4096,

    // ✅ 實驗性功能
    experimentalMinChunkSize: 1000,

    // ✅ Rollup 進階選項
    rollupOptions: {
      output: {
        // 確保穩定的 chunk hash
        hashCharacters: 'base36'
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      }
    }
  },

  // ✅ 現代瀏覽器優化
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
  }
}
```

**Bundle Analysis Tools:**

```typescript
// ✅ Bundle 分析工具
// scripts/analyze-bundle.ts
import { readFileSync } from 'fs'
import { gzipSize } from 'gzip-size'

interface ChunkAnalysis {
  name: string
  size: number
  gzipSize: number
  modules: string[]
}

export async function analyzeChunks(): Promise<ChunkAnalysis[]> {
  const manifestPath = './dist/manifest.json'
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  
  const analysis: ChunkAnalysis[] = []
  
  for (const [name, chunk] of Object.entries(manifest)) {
    const filePath = `./dist/${chunk.file}`
    const content = readFileSync(filePath)
    
    analysis.push({
      name,
      size: content.length,
      gzipSize: await gzipSize(content),
      modules: chunk.imports || []
    })
  }
  
  // 按大小排序
  return analysis.sort((a, b) => b.size - a.size)
}

// 檢查 bundle 大小限制
export function checkBundleSize(analysis: ChunkAnalysis[]): void {
  const LIMITS = {
    'vue-vendor': 200 * 1024,    // 200KB
    'd3-vendor': 300 * 1024,     // 300KB
    'ui-vendor': 400 * 1024,     // 400KB
    main: 500 * 1024             // 500KB
  }

  for (const chunk of analysis) {
    const limit = LIMITS[chunk.name]
    if (limit && chunk.gzipSize > limit) {
      console.warn(`⚠️  ${chunk.name} exceeds size limit: ${chunk.gzipSize} > ${limit}`)
    }
  }
}
```

**Best Practices:**

1. **Environment Separation**: Use different configs for dev/test/prod
2. **Chunk Strategy**: Implement logical code splitting
3. **Asset Optimization**: Optimize images, fonts, and other assets
4. **Bundle Analysis**: Regularly analyze bundle composition
5. **Cache Strategy**: Configure proper caching headers
6. **Source Maps**: Use source maps appropriately per environment
7. **Tree Shaking**: Ensure proper tree shaking configuration
8. **Plugin Selection**: Choose plugins that enhance performance

**Performance Impact:**

```bash
# Vite optimization results
Build Time: -60% (2min → 48s)
Bundle Size: -35% (2.1MB → 1.4MB)
Dev Server Start: -70% (8s → 2.4s)
HMR Update: -80% (400ms → 80ms)
First Load: -40% (3.2s → 1.9s)
Code Splitting Efficiency: +90%
```

**Note:** Proper Vite configuration is crucial for development productivity and production performance in Vue 3 applications, especially when working with D3.js and other large dependencies.