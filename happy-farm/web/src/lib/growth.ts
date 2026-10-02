import type {GameRule, LandTier, Plot} from '../types'

export interface GrowthState {
  status: Plot['status']
  /** 0~1 */
  progress: number
  secondsLeft: number
  stageEmoji: string
  readySinceSeconds: number
}

const DEFAULT_EMOJI = ['🌱', '🌿', '🍃', '🌾']

/** 土地等级配置：标签 + 加成字段名 */
export const TIER_INFO: Record<LandTier, {label: string; emoji: string}> = {
  normal: {label: '普通土地', emoji: '🟫'},
  red: {label: '红土地', emoji: '🟥'},
  black: {label: '黑土地', emoji: '⬛'},
}

export function tierSpeedBoost(tier: LandTier | undefined, rule: GameRule | null): number {
  if (tier === 'red') return rule?.redSpeedBoost ?? 0
  if (tier === 'black') return rule?.blackSpeedBoost ?? 0
  return 0
}

export function tierYieldBoost(tier: LandTier | undefined, rule: GameRule | null): number {
  if (tier === 'red') return rule?.redYieldBoost ?? 0
  if (tier === 'black') return rule?.blackYieldBoost ?? 0
  return 0
}

/**
 * QQ 农场生长引擎（数据驱动，规则全部来自 Sanity 的 gameRule 文档）：
 * - 浇水：生长速度提升 waterSpeedBoost（如 0.2 → 提速 20%）
 * - 土地等级：红土/黑土按 rule 里的加成提速，收获也增产
 * - 杂草：生长速度减半，需要手动除草
 * - 害虫：生长完全暂停，需要手动除虫
 * - 成熟后超过 witherAfter 秒不收获 → 枯萎
 */
export function computeGrowth(plot: Plot, rule: GameRule | null, now = Date.now()): GrowthState {
  const empty: GrowthState = {status: 'empty', progress: 0, secondsLeft: 0, stageEmoji: '🟫', readySinceSeconds: 0}
  if (!plot.crop || !plot.plantedAt) return empty

  const growTime = plot.crop.growTime
  const boost = plot.isWatered ? (rule?.waterSpeedBoost ?? 0) : 0
  const effectiveGrowTime = growTime / ((1 + boost) * (1 + tierSpeedBoost(plot.tier, rule)))

  let rate = 1
  if (plot.hasBug) rate = 0
  else if (plot.hasWeed) rate = 0.5

  const plantedAt = new Date(plot.plantedAt).getTime()
  const elapsed = Math.max(0, (now - plantedAt) / 1000) * rate

  const stageEmojis = plot.crop.stageEmojis?.length ? plot.crop.stageEmojis : DEFAULT_EMOJI
  const stageEmoji = elapsed >= effectiveGrowTime
    ? plot.crop.emoji ?? stageEmojis[stageEmojis.length - 1]
    : stageEmojis[Math.min(stageEmojis.length - 1, Math.floor((elapsed / effectiveGrowTime) * stageEmojis.length))]

  if (elapsed >= effectiveGrowTime) {
    const readySinceSeconds = elapsed - effectiveGrowTime
    const witherAfter = rule?.witherAfter ?? 3600
    return {
      status: readySinceSeconds >= witherAfter ? 'withered' : 'ready',
      progress: 1,
      secondsLeft: 0,
      stageEmoji: readySinceSeconds >= witherAfter ? '🥀' : stageEmoji,
      readySinceSeconds,
    }
  }

  return {
    status: 'growing',
    progress: elapsed / effectiveGrowTime,
    secondsLeft: Math.ceil(effectiveGrowTime - elapsed),
    stageEmoji,
    readySinceSeconds: 0,
  }
}

export function formatCountdown(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds))
  if (total <= 0) return '0秒'
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}小时${m}分`
  if (m > 0) return `${m}分${s}秒`
  return `${s}秒`
}

/** 根据经验值和升级表算等级（满级后返回最高级） */
export function levelForXp(xp: number, rule: GameRule | null): {level: number; xpNeeded: number} {
  const table = [...(rule?.xpToNextLevel ?? [])].sort((a, b) => a.level - b.level)
  if (table.length === 0) return {level: 1, xpNeeded: 100}
  let level = table[0].level
  for (const row of table) {
    if (xp >= row.xpNeeded) level = row.level + 1
  }
  const next = table.find((r) => r.level === level)
  return {level, xpNeeded: next?.xpNeeded ?? table[table.length - 1].xpNeeded}
}
