<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as d3 from 'd3'
import type { ChartData, TooltipData } from '@/types/chart.types'

// Props
interface Props {
  data: ChartData[]
  width?: number
  height?: number
  tooltipOffset?: number
  tooltipOffsetX?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 600,
  height: 400,
  tooltipOffset: 130,
  tooltipOffsetX: 20
})

// Emits
const emit = defineEmits<{
  'bar-click': [data: ChartData]
}>()

// Template ref
const svgRef = ref(null)

// Tooltip state
const tooltip = ref<TooltipData>({
  label: '',
  value: 0,
  x: 0,
  y: 0,
  visible: false
})

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
  
  // 用於計算 tooltip 位置的輔助變數
  let xScale: d3.ScaleBand<string>
  let yScale: d3.ScaleLinear<number, number>
  let barWidth: number
  
  // 建立 Scales
  xScale = d3.scaleBand<string>()
    .domain(props.data.map(d => d.label))
    .range([0, innerWidth])
    .padding(0.1)
  
  yScale = d3.scaleLinear()
    .domain([0, d3.max(props.data, d => d.value) || 0])
    .range([innerHeight, 0])
  
  barWidth = xScale.bandwidth()
  
  // 繪製長條
  g.selectAll('rect')
    .data(props.data)
    .join('rect')
    .attr('x', d => xScale(d.label) || 0)
    .attr('y', d => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', d => innerHeight - yScale(d.value))
    .attr('fill', 'steelblue')
    .style('cursor', 'pointer')
    // 互動：hover 效果
    .on('mouseenter', function(event, d) {
      d3.select(this).attr('fill', 'orange')
      
      // 顯示 tooltip：定位在 bar 中心
      const barX = (xScale(d.label) || 0) + barWidth / 2
      const barY = yScale(d.value) - 10 + props.tooltipOffset
      
      tooltip.value = {
        label: d.label,
        value: d.value,
        x: barX + margin.left + props.tooltipOffsetX,
        y: barY + margin.top,
        visible: true
      }
    })
    .on('mouseleave', function() {
      d3.select(this).attr('fill', 'steelblue')
      tooltip.value.visible = false
    })
    // 互動：點擊事件
    .on('click', (_event, d) => {
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

// 清理：組件卸載時隱藏 tooltip
onUnmounted(() => {
  tooltip.value.visible = false
})
</script>

<template>
  <div class="bar-chart-container">
    <svg
      ref="svgRef"
      class="bar-chart"
    ></svg>
    <div
      v-show="tooltip.visible"
      class="tooltip"
      :style="{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`
      }"
    >
      <div class="tooltip-label">label: {{ tooltip.label }}</div>
      <div class="tooltip-value">value: {{ tooltip.value }}</div>
    </div>
  </div>
</template>

<style scoped>
.bar-chart-container {
  position: relative;
  display: inline-block;
}

.bar-chart {
  border: 1px solid #ddd;
  background: #fafafa;
}

.tooltip {
  position: absolute;
  background: white;
  border: 1px solid #999;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
  color: #000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  transform: translate(-50%, -100%);
  z-index: 10;
}

.tooltip-label {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-value {
  font-weight: normal;
  color: #666;
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
