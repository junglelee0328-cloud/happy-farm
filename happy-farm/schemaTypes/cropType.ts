import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'crop',
  title: '作物图鉴',
  type: 'document',
  fields: [
    defineField({name: 'name', title: '作物名称', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'nameEn', title: '英文名', type: 'string', description: '英文界面显示用'}),
    defineField({name: 'emoji', title: '成熟图标', type: 'string', description: 'Emoji，如 🥕'}),
    defineField({
      name: 'stageEmojis',
      title: '生长阶段图标',
      type: 'array',
      description: '从种子到成熟的各阶段 Emoji，例如 ["🌱", "🌿", "🥬", "🥕"]',
      of: [{type: 'string'}],
    }),
    defineField({name: 'seedPrice', title: '种子价格(金币)', type: 'number'}),
    defineField({name: 'sellPrice', title: '单个售价(金币)', type: 'number'}),
    defineField({name: 'growTime', title: '生长时长(秒)', type: 'number'}),
    defineField({name: 'exp', title: '收获经验', type: 'number'}),
    defineField({name: 'minLevel', title: '解锁等级', type: 'number'}),
    defineField({name: 'description', title: '简介', type: 'text', rows: 2}),
  ],
  preview: {
    select: {title: 'name', emoji: 'emoji', price: 'seedPrice'},
    prepare({title, emoji, price}) {
      return {title: `${emoji ?? '🌱'} ${title ?? ''}`, subtitle: `种子 ${price} 金币`}
    },
  },
})
