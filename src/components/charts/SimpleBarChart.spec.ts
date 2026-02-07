import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SimpleBarChart from './SimpleBarChart.vue'
import type { ChartData } from '@/types/chart.types'

const mockData: ChartData[] = [
  { id: '1', label: 'A', value: 10 },
  { id: '2', label: 'B', value: 20 },
  { id: '3', label: 'C', value: 15 }
]

describe('SimpleBarChart', () => {
  it('renders svg element', () => {
    const wrapper = mount(SimpleBarChart, {
      props: { data: mockData }
    })

    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('applies default width and height', () => {
    const wrapper = mount(SimpleBarChart, {
      props: { data: mockData }
    })

    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('600')
    expect(svg.attributes('height')).toBe('400')
  })

  it('applies custom width and height from props', () => {
    const wrapper = mount(SimpleBarChart, {
      props: {
        data: mockData,
        width: 800,
        height: 500
      }
    })

    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('800')
    expect(svg.attributes('height')).toBe('500')
  })

  it('renders bars for each data item', () => {
    const wrapper = mount(SimpleBarChart, {
      props: { data: mockData }
    })

    const bars = wrapper.findAll('rect')
    expect(bars.length).toBe(mockData.length)
  })

  it('emits bar-click event when bar is clicked', async () => {
    const wrapper = mount(SimpleBarChart, {
      props: { data: mockData }
    })

    const bars = wrapper.findAll('rect')
    await bars[0]!.trigger('click')

    expect(wrapper.emitted('bar-click')).toBeTruthy()
    expect(wrapper.emitted('bar-click')![0]).toEqual([mockData[0]])
  })

  it('tooltip is hidden by default', () => {
    const wrapper = mount(SimpleBarChart, {
      props: { data: mockData }
    })
    const tooltip = wrapper.find('.tooltip')

    // 若元素不存在，測試通過；若存在則檢查 display 狀態
    if (tooltip.exists()) {
      const element = tooltip.element as HTMLElement
      const isHidden = element.style.display === 'none' ||
        window.getComputedStyle(element).display === 'none'
      expect(isHidden).toBe(true)
    }
  })

  it('bar height is proportional to value', () => {
    const testData = [
      { id: '1', label: 'A', value: 10 },
      { id: '2', label: 'B', value: 20 },
      { id: '3', label: 'C', value: 15 }
    ]
    const wrapper = mount(SimpleBarChart, {
      props: { data: testData }
    })
    const bars = wrapper.findAll('rect')

    // 確保有長條被渲染
    expect(bars.length).toBeGreaterThan(0)

    const heights = bars.map(bar => parseFloat(bar.attributes('height') || '0')) as number[]
    const maxHeight = Math.max(...heights)

    // 驗證最大值對應最大的資料值
    expect(maxHeight).toBe(heights[1]!) // B(value: 20) 應該最高
    expect(heights[1]!).toBeGreaterThan(heights[0]!) // B(20) > A(10)
    expect(heights[1]!).toBeGreaterThan(heights[2]!) // B(20) > C(15)
  })

  it('handles empty data array', () => {
    const wrapper = mount(SimpleBarChart, {
      props: { data: [] }
    })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.findAll('rect').length).toBe(0)
  })

  it('re-renders when data changes', async () => {
    const wrapper = mount(SimpleBarChart, {
      props: { data: mockData }
    })

    expect(wrapper.findAll('rect').length).toBe(3)

    const newData: ChartData[] = [
      { id: '1', label: 'X', value: 5 },
      { id: '2', label: 'Y', value: 10 }
    ]

    await wrapper.setProps({ data: newData })
    expect(wrapper.findAll('rect').length).toBe(2)
  })
})
