import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'gameRule',
  title: '游戏规则',
  type: 'document',
  fields: [
    defineField({
      name: 'xpToNextLevel',
      title: '升级经验表',
      type: 'array',
      description: '每升一级所需经验',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'level', title: '等级', type: 'number'},
            {name: 'xpNeeded', title: '所需经验', type: 'number'},
          ],
          preview: {select: {level: 'level', xp: 'xpNeeded'}, prepare: ({level, xp}) => ({title: `Lv.${level} → ${xp} XP`})},
        },
      ],
    }),
    defineField({name: 'waterSpeedBoost', title: '浇水加速比例', type: 'number', description: '如 0.2 = 浇水后生长速度提升 20%'}),
    defineField({name: 'witherAfter', title: '枯萎时限(秒)', type: 'number', description: '成熟后多久不收获会枯萎'}),
    defineField({name: 'weedChance', title: '长杂草概率', type: 'number', description: '0~1，每块生长中的地每天长草概率'}),
    defineField({name: 'bugChance', title: '生虫概率', type: 'number', description: '0~1，虫害会暂停生长'}),
    defineField({name: 'stealDailyLimit', title: '每日偷菜次数上限', type: 'number'}),
    defineField({name: 'stealRatio', title: '单次偷取比例', type: 'number', description: '如 0.2 = 每次偷走产量的 20%'}),
    defineField({name: 'basePlotCount', title: '初始土地数量', type: 'number'}),
  ],
  preview: {prepare: () => ({title: '📜 游戏规则', subtitle: '改这里，游戏行为立刻变化'})},
})
