/**
 * 数值扩展种子脚本：100 级体系
 * - 16 种新作物（Lv.10 → Lv.100），价格/经验/时长按公式递增
 * - 经验曲线：升级所需 = 40 × level^2.2（前快后慢，满级约一年）
 * - 土地三级制：普通(8块) → 红土地(8块, Lv.8-40) → 黑土地(8块, Lv.45-100)
 * 运行：node scripts/seed-expansion.mjs
 */
import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'lha5ip1s',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: 'sk53MxegHLAX8EcB0N9WFIOe4mvHhxqr1zJfnOvlR8uTSfyJSmC0fmtdgaPltLt4bBOUjR0s6Lr5EPe4weyFCQglGSJ0jBZLZ6KEHtkaKjZokeox0xkCGBfA0zuhQUwwIYdP5qi4hx4FI3SghbGlKAaYnE1a7IqatMleotxs7UcVxbj4mQQS',
})

// ===== 1. 新作物 =====
const NEW_CROPS = [
  {level: 10, name: '南瓜', emoji: '🎃'},
  {level: 13, name: '土豆', emoji: '🥔'},
  {level: 16, name: '番茄', emoji: '🍅'},
  {level: 20, name: '葡萄', emoji: '🍇'},
  {level: 24, name: '茄子', emoji: '🍆'},
  {level: 28, name: '辣椒', emoji: '🌶️'},
  {level: 32, name: '芒果', emoji: '🥭'},
  {level: 38, name: '蓝莓', emoji: '🫐'},
  {level: 44, name: '菠萝', emoji: '🍍'},
  {level: 50, name: '椰子', emoji: '🥥'},
  {level: 58, name: '仙桃', emoji: '🍑'},
  {level: 66, name: '猕猴桃', emoji: '🥝'},
  {level: 74, name: '哈密瓜', emoji: '🍈'},
  {level: 82, name: '樱桃', emoji: '🍒'},
  {level: 90, name: '牛油果', emoji: '🥑'},
  {level: 100, name: '千年人参', emoji: '🫚'},
]

const round10 = (n) => Math.max(10, Math.round(n / 10) * 10)

const crops = NEW_CROPS.map(({level, name, emoji}) => ({
  _id: `crop-lv${level}`,
  _type: 'crop',
  name,
  emoji,
  stageEmojis: ['🌱', '🌿', '🍃', emoji],
  minLevel: level,
  seedPrice: round10(30 * level ** 1.28 * 0.45),
  sellPrice: round10(30 * level ** 1.28),
  growTime: Math.min(28800, Math.round((600 * level ** 0.9) / 60) * 60), // 最长 8 小时
  exp: Math.round(10 * level ** 1.3),
  description: `Lv.${level} 解锁的高级作物。`,
}))

// ===== 2. 经验曲线：40 × level^2.2，存满 1→99 级 =====
const xpToNextLevel = Array.from({length: 99}, (_, i) => ({
  level: i + 1,
  xpNeeded: Math.round(40 * (i + 1) ** 2.2),
}))

// ===== 3. 土地三级制：同一块地随等级升级 =====
// 普通土地 Lv.25 开满 → 红土地 Lv.60 开满 → 黑土地 Lv.100 开满
const plotLevels = (i) => ({
  unlockLevel: 1 + Math.round(((i - 1) * 24) / 23),
  redLevel: 26 + Math.round(((i - 1) * 34) / 23),
  blackLevel: 61 + Math.round(((i - 1) * 39) / 23),
})

async function main() {
  // 新作物
  let tx = client.transaction()
  for (const c of crops) tx.createOrReplace(c)
  await tx.commit()
  console.log(`✓ ${crops.length} 种新作物已入库（Lv.10 ~ Lv.100）`)

  // 规则文档：经验曲线 + 土地加成
  await client
    .patch('rule-main')
    .set({
      xpToNextLevel,
      redYieldBoost: 0.2,
      redSpeedBoost: 0.2,
      blackYieldBoost: 0.5,
      blackSpeedBoost: 0.4,
    })
    .commit()
  console.log('✓ 经验曲线（100 级）+ 红土/黑土加成已写入 rule-main')

  // 迁移所有土地（所有玩家）：按编号写入三级阈值，清掉旧的 tier 字段
  const plots = await client.fetch('*[_type == "plot"]{_id, index}')
  tx = client.transaction()
  for (const p of plots) {
    tx.patch(p._id, (patch) => patch.set(plotLevels(p.index)).unset(['tier']))
  }
  await tx.commit()
  console.log(`✓ ${plots.length} 块土地已按三级制迁移（普通25级开满 / 红土60级 / 黑土100级）`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
