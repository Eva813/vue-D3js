<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as d3 from 'd3'
import type { ClaimsData } from '@/types/claims.types'

// Props & Emit
interface Props {
  data: ClaimsData[]
  width?: number
  height?: number
  // Margin for the main chart
  margin?: { top: number; right: number; bottom: number; left: number }
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 400,
  margin: () => ({ top: 40, right: 350, bottom: 20, left: 60 }) // Right margin reserved for tooltip
})

const emit = defineEmits<{
  'category-select': [category: string]
}>()

// Refs
const chartContainer = ref<HTMLDivElement | null>(null)

// State
const activeData = ref<ClaimsData | null>(null)
const activeBarY = ref(0) // Y position of the active bar center for tooltip alignment
const tooltipLeft = ref(0)

// D3 Selection Types
type SVGSelection = d3.Selection<SVGSVGElement, unknown, null, undefined>
type GSelection = d3.Selection<SVGGElement, unknown, null, undefined>

// D3 Variables
let svg: SVGSelection | null = null
let g: GSelection | null = null
let xScale: d3.ScaleLinear<number, number> | null = null
let yScale: d3.ScaleBand<string> | null = null

// Constants from image analysis
const BAR_COLOR_DEFAULT = '#b8e0eb' // Light Blue
const BAR_COLOR_ACTIVE = '#63b7ce'  // Teal
const TEXT_COLOR = '#333'
const CONNECTOR_COLOR = '#b8e0eb'

// 連接線起點距離 bar 末端的留白，避免線條直接貼在 bar 邊緣。
const CONNECTOR_MARGIN_FROM_BAR = 8
// 連接線固定長度（像素）。直接調這個值可控制線條長短。
const CONNECTOR_LENGTH = 120
// tooltip 垂直微調：正值往下、負值往上。
const TOOLTIP_OFFSET_Y = 55

function getConnectorPositions(d: ClaimsData) {
  if (!xScale) return null

  const barEndX = xScale(d.count)
  const connectorStartX = barEndX + CONNECTOR_MARGIN_FROM_BAR
  const connectorEndX = connectorStartX + CONNECTOR_LENGTH

  return {
    connectorStartX,
    connectorEndX,
  }
}

// --- Core D3 Logic ---

const initChart = () => {
  if (!chartContainer.value) return

  // Clear existing
  d3.select(chartContainer.value).selectAll('*').remove()

  // SVG Container
  svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', props.width)
    .attr('height', props.height)
    .attr('class', 'claims-chart-svg')

  // Main Group
  g = svg.append('g')
    .attr('transform', `translate(${props.margin.left},${props.margin.top})`)

  // Axes Groups
  g.append('g').attr('class', 'y-axis')
  // No X-axis needed based on design, bars have values inside/next to them
}

const updateChart = () => {
  if (!svg || !g || !props.data.length) return

  const innerWidth = props.width - props.margin.left - props.margin.right
  const innerHeight = props.height - props.margin.top - props.margin.bottom

  // Scales
  yScale = d3.scaleBand()
    .domain(props.data.map(d => d.category))
    .range([0, innerHeight])
    .padding(0.4) // Spacing between bars

  xScale = d3.scaleLinear()
    .domain([0, d3.max(props.data, d => d.count) || 10]) // Default max if 0
    .range([0, innerWidth])

  // --- Draw Bars ---
  const bars = g.selectAll<SVGRectElement, ClaimsData>('.bar')
    .data(props.data, d => d.id)

  // Enter
  const barsEnter = bars.enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('y', d => yScale!(d.category) || 0)
    .attr('height', yScale!.bandwidth())
    .attr('x', 0)
    .attr('width', 0) // Animate from 0
    .attr('rx', 2) // Rounded corners
    .attr('ry', 2)
    .style('cursor', 'pointer')
    .on('mouseenter', (_event, d) => setActive(d))
    // Note: We don't remove active state on mouseleave immediately to allow interacting with tooltip if needed,
    // or just keep it for persistent detail view until another is hovered.
    // For this demo, let's keep it simple: hover triggers update. 

  // Update + Enter
  barsEnter.merge(bars)
    .transition().duration(500)
    .attr('y', d => yScale!(d.category) || 0)
    .attr('width', d => xScale!(d.count))
    .attr('fill', d => (activeData.value?.id === d.id ? BAR_COLOR_ACTIVE : BAR_COLOR_DEFAULT))

  // Exit
  bars.exit().remove()

  // --- Draw Labels (Category Name) on Axis ---
  const yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(10)
  g.select<SVGGElement>('.y-axis')
    .call(yAxis)
    .selectAll('text')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', TEXT_COLOR)
  
  g.select('.domain').remove() // Remove axis line

  // --- Draw Value Labels (Inside or Right of Bar) ---
  const labels = g.selectAll<SVGTextElement, ClaimsData>('.value-label')
    .data(props.data, d => d.id)

  labels.enter()
    .append('text')
    .attr('class', 'value-label')
    .merge(labels)
    .attr('y', d => (yScale!(d.category) || 0) + yScale!.bandwidth() / 2)
    .attr('x', d => xScale!(d.count) - 10) // Position inside right
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .text(d => d.count > 0 ? d.count : '')
    .style('fill', '#fff')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    // If bar is too small, move label outside
    .each(function(d) {
        const barWidth = xScale!(d.count)
        if (barWidth < 20) {
            d3.select(this)
                .attr('x', barWidth + 5)
                .attr('text-anchor', 'start')
                .style('fill', '#666')
        }
    })

  labels.exit().remove()
  
  // --- Connection Line Logic ---
  // If we have an active item, draw a line from bar end to tooltip area
  updateConnectionLine()
}

const updateConnectionLine = () => {
    if (!g || !activeData.value || !xScale || !yScale) {
        g?.select('.connector-line').remove()
        return
    }

    const d = activeData.value
    const barY = (yScale(d.category) || 0) + yScale.bandwidth() / 2

    const positions = getConnectorPositions(d)
    if (!positions) return

    const { connectorStartX, connectorEndX } = positions
    // 線終點轉為容器絕對座標後，作為 tooltip 左邊界，確保兩者直接相接。
    tooltipLeft.value = props.margin.left + connectorEndX

    const linePath = d3.path()
    linePath.moveTo(connectorStartX, barY)
    linePath.lineTo(connectorEndX, barY)
    
    const connector = g
      .selectAll<SVGPathElement, ClaimsData>('.connector-line')
      .data([activeData.value])
    
    connector.enter()
        .append('path')
        .attr('class', 'connector-line')
        .merge(connector)
        .transition().duration(200)
        .attr('d', linePath.toString())
        .attr('stroke', CONNECTOR_COLOR)
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        
    connector.exit().remove()
}

// --- Interaction ---

const setActive = (d: ClaimsData) => {
  activeData.value = d
  if (yScale) {
      // Calculate absolute Y position for tooltip alignment if needed, 
      // but we will use CSS absolute positioning inside relative container
      activeBarY.value = (yScale(d.category) || 0) + yScale.bandwidth() / 2 + props.margin.top + TOOLTIP_OFFSET_Y
  }
  emit('category-select', d.category)
  
  // Re-render to update colors and line
  updateChart()
}

// --- Lifecycle ---

onMounted(() => {
  initChart()
  if (props.data.length > 0) {
      // Set first item with data as active by default or just the first one
      const firstWithData = props.data.find(d => d.count > 0) || props.data[0]
      if (firstWithData) setActive(firstWithData)
  }
})

watch(() => props.data, () => {
  updateChart()
}, { deep: true })

</script>

<template>
  <div class="claims-chart-container" ref="chartContainer">
    <!-- SVG is appended here by D3 -->
    
    <!-- Custom HTML Tooltip / Detail Panel -->
    <div 
        v-if="activeData"
        class="detail-panel"
        :style="{ 
          left: `${tooltipLeft}px`,
            top: `${activeBarY}px`
        }"
    >
        <div class="detail-title">{{ activeData.category }}險理賠金額分布</div>
        
        <div class="distribution-list">
            <div 
                v-for="(item, index) in activeData.amountDistribution" 
                :key="index"
                class="dist-row"
            >
                <div class="dist-range">{{ item.range }}</div>
                <div class="dist-bar-container">
                    <div 
                        class="dist-bar"
                        :style="{ 
                            width: item.count > 0 ? `${(item.count / 10) * 100}%` : '0px', 
                            backgroundColor: '#63b7ce',
                            minWidth: item.count > 0 ? '4px' : '0'
                        }"
                    ></div>
                    <span v-if="item.count > 0" class="dist-value">{{ item.count }}</span>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.claims-chart-container {
  position: relative;
  font-family: 'PingFang TC', 'Microsoft JhengHei', sans-serif;
}

.detail-panel {
  position: absolute;
  transform: translateY(-50%); /* Center vertically relative to the bar */
  width: 300px;
  background: white;
  border: 1px solid #b8e0eb;
  border-radius: 12px; /* Rounded corners like image */
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  pointer-events: none; /* Let mouse pass through if needed, or auto to allow copying */
  transition: top 0.3s ease-out; /* Smooth movement when switching bars */
}

.detail-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
}

.dist-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #555;
}

.dist-range {
  width: 120px; /* Fixed width for labels */
  text-align: right;
  padding-right: 12px;
  flex-shrink: 0;
}

.dist-bar-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.dist-bar {
  height: 16px;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.dist-value {
  margin-left: 8px;
  color: #666;
  font-size: 12px;
}
</style>
