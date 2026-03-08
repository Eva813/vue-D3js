export interface AmountDistribution {
  range: string
  count: number
}

export interface ClaimsData {
  id: string
  category: string // e.g., "車體", "竊盜", "責任"
  count: number
  amountDistribution: AmountDistribution[] // Distribution of claim amounts for this category
}
