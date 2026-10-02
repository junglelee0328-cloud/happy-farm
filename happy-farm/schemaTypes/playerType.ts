import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'player',
  title: '玩家',
  type: 'document',
  fields: [
    defineField({name: 'nickname', title: '昵称', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'authId', title: '登录账号ID', type: 'string', description: 'Clerk user id，注册时自动写入'}),
    defineField({name: 'avatar', title: '头像', type: 'string', description: 'Emoji 头像，如 🧑‍🌾'}),
    defineField({name: 'farmName', title: '农场名', type: 'string'}),
    defineField({name: 'level', title: '等级', type: 'number', initialValue: 1}),
    defineField({name: 'xp', title: '当前经验', type: 'number', initialValue: 0}),
    defineField({name: 'coins', title: '金币', type: 'number', initialValue: 200}),
    defineField({name: 'stolenToday', title: '今日已偷菜次数', type: 'number', initialValue: 0}),
    defineField({
      name: 'inventory',
      title: '背包',
      type: 'array',
      description: '化肥等道具库存',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'item', title: '道具', type: 'reference', to: [{type: 'fertilizer'}]},
            {name: 'count', title: '数量', type: 'number'},
          ],
          preview: {
            select: {name: 'item.name', count: 'count'},
            prepare: ({name, count}) => ({title: `${name ?? '道具'} × ${count ?? 0}`}),
          },
        },
      ],
    }),
  ],
  preview: {
    select: {title: 'nickname', avatar: 'avatar', level: 'level', coins: 'coins'},
    prepare({title, avatar, level, coins}) {
      return {title: `${avatar ?? '🧑‍🌾'} ${title ?? ''}`, subtitle: `Lv.${level} · ${coins} 金币`}
    },
  },
})
