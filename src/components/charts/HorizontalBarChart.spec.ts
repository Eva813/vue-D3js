import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HorizontalBarChart from './HorizontalBarChart.vue'
import type { ChartData } from '@/types/chart.types'

const mockData: ChartData[] = [
  { id: '1', label: 'Category A', value: 25 },
  { id: '2', label: 'Category B', value: 40 },
  { id: '3', label: 'Category C', value: 15 },
  { id: '4', label: 'Category D', value: 30 }
]

describe('HorizontalBarChart.vue', () => {
  // 1. Rendering & Snapshot
  describe('Rendering', () => {
    it('matches snapshot', () => {
      const wrapper = mount(HorizontalBarChart, {
        props: { data: mockData }
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it('renders correct number of bars based on data', () => {
      const wrapper = mount(HorizontalBarChart, {
        props: { data: mockData }
      })
      const bars = wrapper.findAll('rect')
      expect(bars).toHaveLength(mockData.length)
    })

    it('handles empty data gracefully', () => {
      const wrapper = mount(HorizontalBarChart, { props: { data: [] } })
      expect(wrapper.find('svg').exists()).toBe(true)
      expect(wrapper.findAll('rect')).toHaveLength(0)
    })
  })

  // 2. Logic: Scales & Dimensions
  describe('Logic & Scales', () => {
    it('calculates bar widths proportionally', () => {
      const wrapper = mount(HorizontalBarChart, {
        props: { data: mockData }
      })

      const bars = wrapper.findAll('rect')
      const widthA = parseFloat(bars[0]?.attributes('width') ?? '0')
      const widthB = parseFloat(bars[1]?.attributes('width') ?? '0') // 40
      const widthC = parseFloat(bars[2]?.attributes('width') ?? '0') // 15
      const widthD = parseFloat(bars[3]?.attributes('width') ?? '0') // 30

      expect(widthB).toBeGreaterThan(widthA)
      expect(widthA).toBeGreaterThan(widthC)
      expect(widthD).toBeGreaterThan(widthA)
    })
  })

  // 3. Interaction: Tooltip
  describe('Interaction: Tooltip', () => {
    it('shows tooltip on mouseenter and hides on mouseleave', async () => {
      const wrapper = mount(HorizontalBarChart, {
        props: { data: mockData }
      })

      const tooltip = wrapper.find('.tooltip')
      const firstBar = wrapper.find('rect')

      // Initial state
      expect(tooltip.attributes('style')).toContain('display: none')

      // Hover
      await firstBar.trigger('mouseenter')

      // Check visibility and content
      expect(tooltip.attributes('style')).not.toContain('display: none')
      expect(tooltip.text()).toContain('Category A')
      expect(tooltip.text()).toContain('25')

      // Check highlighting
      expect(firstBar.attributes('fill')).toBe('#ff6b6b')

      // Leave
      await firstBar.trigger('mouseleave')
      expect(tooltip.attributes('style')).toContain('display: none')
      expect(firstBar.attributes('fill')).toBe('#4a90e2')
    })

    it('positions tooltip dynamically', async () => {
      const wrapper = mount(HorizontalBarChart, {
        props: { data: mockData }
      })

      const firstBar = wrapper.find('rect')
      await firstBar.trigger('mouseenter')

      const tooltip = wrapper.find('.tooltip')
      const style = tooltip.attributes('style')

      expect(style).toContain('left:')
      expect(style).toContain('top:')
    })
  })

  // 4. Events
  describe('Events', () => {
    it('emits "bar-click" with correct data payload', async () => {
      const wrapper = mount(HorizontalBarChart, {
        props: { data: mockData }
      })

      const bars = wrapper.findAll('rect')
      await bars[1]?.trigger('click') // Category B

      expect(wrapper.emitted('bar-click')).toBeTruthy()
      expect(wrapper.emitted('bar-click')?.[0]).toEqual([mockData[1]])
    })
  })
})