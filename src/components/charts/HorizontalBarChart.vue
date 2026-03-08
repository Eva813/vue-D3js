<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as d3 from 'd3'
import type { ChartData, TooltipData } from '@/types/chart.types'

// Props
interface Props {
  data: ChartData[]
  width?: number
  height?: number
  tooltipOffsetX?: number
  tooltipOffsetY?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 700,
  height: 400,
  tooltipOffsetX: 10,
  tooltipOffsetY: -10
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

// 渲染橫向長條圖函式
function renderChart() {
  if (!svgRef.value || props.data.length === 0) return
  
  // 清空舊內容
  d3.select(svgRef.value).selectAll('*').remove()
  
  // 建立 SVG
  const svg = d3.select(svgRef.value)
    .attr('width', props.width)
    .attr('height', props.height)
  
  // 設定 margin - 左側需要更多空間顯示標籤
  const margin = { top: 20, right: 30, bottom: 40, left: 120 }
  const innerWidth = props.width - margin.left - margin.right
  const innerHeight = props.height - margin.top - margin.bottom
  
  // 建立主要群組
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)
  
  // 建立 Scales - 橫向長條圖需要交換 X 和 Y 的用途
  // X 軸：數值（水平方向）
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(props.data, d => d.value) || 0])
    .range([0, innerWidth])
  
  // Y 軸：標籤（垂直方向）
  const yScale = d3.scaleBand<string>()
    .domain(props.data.map(d => d.label))
    .range([0, innerHeight])
    .padding(0.2)
  
  const barHeight = yScale.bandwidth()
  
  // 繪製橫向長條
  g.selectAll('rect')
    .data(props.data)
    .join('rect')
    .attr('x', 0)
    .attr('y', d => yScale(d.label) || 0)
    .attr('width', d => xScale(d.value))
    .attr('height', yScale.bandwidth())
    .attr('fill', '#4a90e2')
    .style('cursor', 'pointer')
    // 互動：hover 效果
    .on('mouseenter', function(_event, d) {
      d3.select(this).attr('fill', '#ff6b6b')
      
      // 顯示 tooltip：定位在 bar 右側
      const barX = xScale(d.value)
      const barY = (yScale(d.label) || 0) + barHeight / 2
      
      tooltip.value = {
        label: d.label,
        value: d.value,
        x: barX + margin.left + props.tooltipOffsetX,
        y: barY + margin.top + props.tooltipOffsetY,
        visible: true
      }
    })
    .on('mouseleave', function() {
      d3.select(this).attr('fill', '#4a90e2')
      tooltip.value.visible = false
    })
    // 互動：點擊事件
    .on('click', (_event, d) => {
      emit('bar-click', d)
    })
  
  // 繪製 X 軸（底部，顯示數值）
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale).ticks(5))
  
  // 繪製 Y 軸（左側，顯示標籤）
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
  <div class="horizontal-bar-chart-container">
    <svg
      ref="svgRef"
      class="horizontal-bar-chart"
    />
    <div
      v-show="tooltip.visible"
      class="tooltip"
      :style="{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`
      }"
    >
      <div class="tooltip-label">
        {{ tooltip.label }}
      </div>
      <div class="tooltip-value">
        保單數量: {{ tooltip.value }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.horizontal-bar-chart-container {
  position: relative;
  display: inline-block;
}

.horizontal-bar-chart {
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
  z-index: 10;
  white-space: nowrap;
}

.tooltip-label {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
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

:deep(.y-axis text) {
  font-weight: 500;
}

:deep(.x-axis path),
:deep(.y-axis path),
:deep(.x-axis line),
:deep(.y-axis line) {
  stroke: #333;
}
</style>
