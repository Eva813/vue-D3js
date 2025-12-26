import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import ts from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'
import oxlint from 'eslint-plugin-oxlint'

export default [
  // 基本 JS 推薦規則
  js.configs.recommended,

  // TypeScript 推薦規則
  ...ts.configs.recommended,

  // Vue 推薦規則
  ...vue.configs['flat/recommended'],

  // Oxlint 插件配置 - 關閉與 Oxlint 重複的規則
  // 必須在自訂規則之前，讓自訂規則可以覆蓋 Oxlint 的設定
  ...oxlint.configs['flat/recommended'],
  ...oxlint.configs['flat/vue'],
  ...oxlint.configs['flat/typescript'],

  // 自訂規則配置（放在 Oxlint 之後，確保優先級）
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: ts.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // Vue 相關規則
      'vue/multi-word-component-names': 'warn',
      'vue/no-unused-vars': 'warn',

      // TypeScript 相關規則
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
    },
  },

  // 忽略檔案
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      '.vite/**',
    ],
  },
]
