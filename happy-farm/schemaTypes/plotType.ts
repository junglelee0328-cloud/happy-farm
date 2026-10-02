import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'plot',
  title: '土地',
  type: 'document',
  fields: [
    defineField({name: 'index', title: '土地编号', type: 'number', validation: (r) => r.required()}),
    defineField({name: 'unlockLevel', title: '解锁等级(普通土地)', type: 'number', initialValue: 1, description: '玩家达到该等级解锁这块地'}),
    defineField({name: 'redLevel', title: '升级红土地等级', type: 'number', description: '玩家达到该等级，这块地变为红土地（增产+提速）'}),
    defineField({name: 'blackLevel', title: '升级黑土地等级', type: 'number', description: '玩家达到该等级，这块地变为黑土地（更高增产+提速）'}),
    defineField({
      name: 'owner',
      title: '所属玩家',
      type: 'reference',
      to: [{type: 'player'}],
      validation: (r) => r.required(),
    }),
    defineField({name: 'crop', title: '当前作物', type: 'reference', to: [{type: 'crop'}]}),
    defineField({name: 'plantedAt', title: '种植时间', type: 'datetime'}),
    defineField({
      name: 'status',
      title: '状态',
      type: 'string',
      options: {
        list: [
          {title: '🟤 空地', value: 'empty'},
          {title: '🌱 生长中', value: 'growing'},
          {title: '✅ 已成熟', value: 'ready'},
          {title: '🥀 已枯萎', value: 'withered'},
        ],
        layout: 'radio',
      },
      initialValue: 'empty',
    }),
    defineField({name: 'isWatered', title: '已浇水(加速生长)', type: 'boolean', initialValue: false}),
    defineField({name: 'fertilizer', title: '已施化肥', type: 'reference', to: [{type: 'fertilizer'}], description: '本茬作物生效，收获后清除'}),
    defineField({name: 'hasWeed', title: '长了杂草', type: 'boolean', initialValue: false}),
    defineField({name: 'hasBug', title: '生了害虫', type: 'boolean', initialValue: false}),
    defineField({name: 'stolenBy', title: '被偷记录', type: 'string', description: '谁偷过这块地，逗号分隔昵称'}),
  ],
  preview: {
    select: {index: 'index', status: 'status', cropName: 'crop.name', cropEmoji: 'crop.emoji', unlockLevel: 'unlockLevel'},
    prepare({index, status, cropName, cropEmoji, unlockLevel}) {
      const statusMap: Record<string, string> = {
        empty: '🟤 空地',
        growing: '🌱 生长中',
        ready: '✅ 已成熟',
        withered: '🥀 已枯萎',
      }
      const lock = (unlockLevel ?? 1) > 1 ? ` · 🔒 Lv.${unlockLevel} 解锁` : ''
      return {
        title: `第 ${index} 号地`,
        subtitle: `${statusMap[status ?? 'empty']} · ${cropEmoji ?? ''} ${cropName ?? '无作物'}${lock}`,
      }
    },
  },
})
