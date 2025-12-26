// src/types/chart.types.ts
export interface ChartData {
  id: string
  label: string
  value: number
}

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ChartDimensions {
  width: number
  height: number
  margin: Margin
}

export interface TooltipData {
  label: string
  value: number
  x: number
  y: number
  visible: boolean
}
