import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'fertilizer',
  title: '化肥',
  type: 'document',
  fields: [
    defineField({name: 'name', title: '名称', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'emoji', title: '图标', type: 'string'}),
    defineField({name: 'price', title: '价格(金币)', type: 'number'}),
    defineField({name: 'speedBoost', title: '生长提速', type: 'number', description: '如 0.1 = 提速 10%'}),
    defineField({name: 'yieldBoost', title: '增产', type: 'number', description: '如 0.1 = 收获金币 +10%，0 表示不增产'}),
    defineField({name: 'description', title: '简介', type: 'text', rows: 2}),
  ],
  preview: {
    select: {title: 'name', emoji: 'emoji', price: 'price'},
    prepare({title, emoji, price}) {
      return {title: `${emoji ?? '🧪'} ${title ?? ''}`, subtitle: `${price} 金币`}
    },
  },
})
