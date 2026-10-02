export interface Crop {
  _id: string
  name: string
  emoji?: string
  stageEmojis?: string[]
  seedPrice: number
  sellPrice: number
  growTime: number
  exp: number
  minLevel: number
  description?: string
}

export interface Player {
  _id: string
  nickname: string
  avatar?: string
  farmName?: string
  level: number
  xp: number
  coins: number
  stolenToday?: number
  authId?: string
}

export type LandTier = 'normal' | 'red' | 'black'

export interface Plot {
  _id: string
  index: number
  unlockLevel?: number
  tier?: LandTier
  crop?: Crop
  plantedAt?: string
  status: 'empty' | 'growing' | 'ready' | 'withered'
  isWatered: boolean
  hasWeed: boolean
  hasBug: boolean
  stolenBy?: string
}

export interface GameRule {
  _id: string
  xpToNextLevel?: {level: number; xpNeeded: number}[]
  waterSpeedBoost?: number
  witherAfter?: number
  weedChance?: number
  bugChance?: number
  stealDailyLimit?: number
  stealRatio?: number
  basePlotCount?: number
  redYieldBoost?: number
  redSpeedBoost?: number
  blackYieldBoost?: number
  blackSpeedBoost?: number
}
