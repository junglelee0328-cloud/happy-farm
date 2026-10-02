import {createContext, useContext, useEffect, useState} from 'react'
import type {ReactNode} from 'react'

export type Lang = 'zh' | 'en'

const zh = {
  'loading.open': '🌻 正在打开农场大门…',
  'loading.fail': '😵 加载失败：{msg}',
  'loading.noplayer': '😢 还没有玩家，请先在 Studio 里创建一个',
  'loading.prepare': '🌻 正在准备你的农场…',
  'loading.bootstrapFail': '😵 建档失败：{msg}',

  'auth.title': '开心农场',
  'auth.slogan': '种菜 · 浇水 · 偷好友的菜',

  'hud.role': '农场主',
  'hud.farmDefault': '我的开心农场',
  'hud.weather': '晴朗',
  'hud.weatherSub': '适合种地',
  'hud.ready': '{n} 块可收',
  'hud.readySub': '点一下就能收',
  'hud.stealToday': '今日偷菜',
  'hud.switchPlayer': '切换玩家',
  'hud.shopTitle': '去商店买东西',
  'hud.gem': '元宝（演示数据）',
  'hud.settings': '设置',
  'hud.help': '帮助',

  'dock.seeds': '🌾 种子包',
  'dock.seedsActive': '点击空地即可播种',
  'dock.seedsIdle': '选一粒种子',
  'dock.tools': '🧰 工具箱',
  'dock.toolsSub': '一键操作',
  'dock.shop': '商店',
  'dock.harvestAll': '一键收获',
  'dock.waterAll': '一键浇水',
  'dock.bag': '背包',
  'dock.tasks': '任务',
  'dock.friends': '好友',
  'dock.visiting': '🥷 做客模式',
  'dock.visitingSub': '好友的菜只能偷，不能动他的仓库',
  'dock.goHome': '回我的农场',

  'hint.selectSeed': '🌱 已选中「{name}」，点空地播种 · Esc 取消',
  'hint.selectFert': '🧪 已选中「{name}」，点生长中的地施肥 · Esc 取消',
  'hint.idle': '💡 在下方「种子包」选一粒种子 → 点空地播种 · 浇水加速 · 成熟点一下就收',
  'hint.visiting': '🥷 做客模式：点成熟的菜偷走它 · 好友的生长中作物可以帮忙照料',
  'banner.visiting': '👀 你正在「{name}」做客',
  'banner.sub': '今日偷菜 {a}/{b} · 点成熟作物偷菜，也能帮忙浇水除草',
  'levelup.title': '升级啦！',
  'levelup.sub': '新的土地正在等你开垦',

  'shop.seeds': '种子',
  'shop.ferts': '化肥',
  'shop.title': '🌱 选择种子',
  'shop.titleFert': '🧪 买化肥',
  'shop.sub': '第 {n} 号地 · 我的金币 {coins} 💰',
  'shop.subGeneral': '种子买入即种 · 化肥存入背包',
  'shop.locked': '🔒 Lv.{n} 解锁',
  'shop.bought': '已放入背包',
  'shop.buy': '购买',
  'shop.stock': '背包 × {n}',
  'dock.noSeeds': '背包没有种子，点商店买吧',
  'toast.buySeed': '买了 {name} 种子 ×{n}，已放入背包',
  'err.noSeed': '背包里没有{name}种子了，去商店买吧',

  'bag.title': '🎒 背包',
  'bag.sub': '点「使用」后，再点一块生长中的地',
  'bag.empty': '背包空空如也，去商店买点化肥吧～',
  'bag.use': '使用',
  'bag.count': '× {n}',

  'friend.title': '👥 好友列表',
  'friend.sub': '去他们的农场偷菜 · 也可以帮忙浇水除草',
  'friend.empty': '还没有好友，去 Studio 里再创建一个玩家吧',
  'friend.visit': '去串门 🥷',
  'friend.farmDefault': '无名农场',

  'tip.empty': '空地 · 等待播种',
  'tip.growing': '还剩 {time}',
  'tip.ready': '可以收获啦（{time} 后枯萎）',
  'tip.withered': '枯萎了',
  'tip.locked': '达到 Lv.{n} 解锁',
  'tip.watered': '💧 已浇水 · 加速生长',
  'tip.weed': '🌾 杂草 · 生长减半',
  'tip.bug': '🐛 害虫 · 生长暂停',
  'tip.fertActive': '{emoji} {name}生效中 · 提速{s}%',
  'tip.fertYield': ' · 增产{y}%',
  'tip.tierNext': '⏫ Lv.{n} 起这块地升级为{tier}',
  'tip.tierStat': '产量+{y}% · 生长+{s}%',
  'tip.plotNo': '第 {n} 号地',
  'act.plantSeed': '🌱 种下{name}',
  'act.pickSeed': '🛒 选种子',
  'act.water': '💧 浇水',
  'act.weed': '🌾 除草',
  'act.bug': '🐛 除虫',
  'act.harvest': '🧺 收获 +{n}💰',
  'act.clear': '🧹 铲除',
  'act.fert': '🧪 施肥（背包）',
  'act.helpWater': '💧 帮忙浇水',
  'act.helpWeed': '🌾 帮忙除草',
  'act.helpBug': '🐛 帮忙除虫',
  'act.steal': '🥷 偷走它 +{n}💰',
  'act.stealDone': '这块已经偷过啦',
  'act.stealLimit': '今日次数用完',
  'friend.emptyPlot': '好友还没种东西',
  'friend.notRipe': '还没熟，还剩 {time}',
  'friend.canSteal': '熟了！可偷 {n}💰',
  'friend.stolenBy': '🥷 被偷过：{names}',
  'friend.withered': '枯萎了，真可惜',

  'toast.planted': '🌱 种下了 {name}！',
  'toast.watered': '浇水成功，生长加速 20%！',
  'toast.weed': '🌾 杂草清除，生长恢复正常！',
  'toast.bug': '🐛 害虫消灭，作物继续生长！',
  'toast.harvest': '收获 {name} +{coins} 金币',
  'toast.levelup': '🎉 收获 {name}，升级到 Lv.{level}！',
  'toast.cleared': '🧹 铲除了枯萎的作物',
  'toast.harvestAll': '🧺 一键收获 {n} 块地，+{coins} 金币 +{xp} 经验',
  'toast.waterAll': '🚿 给 {n} 块地浇了水，生长加速！',
  'toast.steal': '偷了{friend}的{name}，+{coins} 金币！',
  'toast.buyFert': '买了 {name} ×{n}，已放入背包',
  'toast.usedFert': '施了{name}，本茬提速 {s}%{y}！',
  'toast.noEmptyPlot': '🤔 没有可用的空地了，先收获或等升级解锁新地吧',
  'toast.noFert': '背包里没有化肥，先去商店买一包吧',
  'err.noPlayer': '没有选中玩家',
  'err.noCoins': '金币不足，先去收菜吧',
  'err.needLevel': '需要 Lv.{n} 才能种{name}',
  'err.noCrop': '这块地没有作物',
  'err.notRipe': '还没熟，等等再来',
  'err.stealLimit': '今天已偷满 {n} 次，明天再来',
  'err.stolenTwice': '这块地已经被你偷过啦',
  'err.nothingReady': '还没有成熟的作物',
  'err.allWatered': '所有作物都浇过水啦',
  'err.fertPoor': '金币不足，{name}需要 {price}💰',
}

const en: typeof zh = {
  'loading.open': '🌻 Opening the farm gate…',
  'loading.fail': '😵 Failed to load: {msg}',
  'loading.noplayer': '😢 No player yet. Create one in Studio first.',
  'loading.prepare': '🌻 Preparing your farm…',
  'loading.bootstrapFail': '😵 Setup failed: {msg}',

  'auth.title': 'Happy Farm',
  'auth.slogan': 'Plant · Water · Steal from friends',

  'hud.role': 'Farmer',
  'hud.farmDefault': 'My Happy Farm',
  'hud.weather': 'Sunny',
  'hud.weatherSub': 'Perfect for farming',
  'hud.ready': '{n} ready',
  'hud.readySub': 'One click to harvest',
  'hud.stealToday': 'Steals today',
  'hud.switchPlayer': 'Switch player',
  'hud.shopTitle': 'Go shopping',
  'hud.gem': 'Gems (demo data)',
  'hud.settings': 'Settings',
  'hud.help': 'Help',

  'dock.seeds': '🌾 Seed Pack',
  'dock.seedsActive': 'Click an empty plot to plant',
  'dock.seedsIdle': 'Pick a seed',
  'dock.tools': '🧰 Toolbox',
  'dock.toolsSub': 'Quick actions',
  'dock.shop': 'Shop',
  'dock.harvestAll': 'Harvest All',
  'dock.waterAll': 'Water All',
  'dock.bag': 'Bag',
  'dock.tasks': 'Tasks',
  'dock.friends': 'Friends',
  'dock.visiting': '🥷 Visiting',
  'dock.visitingSub': "You can steal crops, but not touch their barn",
  'dock.goHome': 'Back to my farm',

  'hint.selectSeed': '🌱 「{name}」selected — click an empty plot to plant · Esc to cancel',
  'hint.selectFert': '🧪 「{name}」selected — click a growing plot to apply · Esc to cancel',
  'hint.idle': '💡 Pick a seed below → click an empty plot to plant · water to speed up · click when ripe',
  'hint.visiting': '🥷 Visiting: click ripe crops to steal · you can also help water and weed',
  'banner.visiting': '👀 Visiting 「{name}」',
  'banner.sub': 'Steals today {a}/{b} · click ripe crops to steal, or help tend their farm',
  'levelup.title': 'Level Up!',
  'levelup.sub': 'New land is waiting for you',

  'shop.seeds': 'Seeds',
  'shop.ferts': 'Fertilizer',
  'shop.title': '🌱 Pick a Seed',
  'shop.titleFert': '🧪 Buy Fertilizer',
  'shop.sub': 'Plot #{n} · My coins: {coins} 💰',
  'shop.subGeneral': 'Seeds plant instantly · fertilizer goes to your bag',
  'shop.locked': '🔒 Unlocks at Lv.{n}',
  'shop.bought': 'Added to bag',
  'shop.buy': 'Buy',
  'shop.stock': 'In bag × {n}',
  'dock.noSeeds': 'No seeds in bag — open the shop',
  'toast.buySeed': 'Bought {name} seeds ×{n}, added to bag',
  'err.noSeed': 'No {name} seeds left — buy some in the shop',

  'bag.title': '🎒 Backpack',
  'bag.sub': 'Tap "Use", then click a growing plot',
  'bag.empty': 'Your bag is empty. Buy some fertilizer in the shop~',
  'bag.use': 'Use',
  'bag.count': '× {n}',

  'friend.title': '👥 Friends',
  'friend.sub': 'Visit their farms to steal crops · or help out',
  'friend.empty': 'No friends yet. Create another player in Studio.',
  'friend.visit': 'Visit 🥷',
  'friend.farmDefault': 'Unnamed Farm',

  'tip.empty': 'Empty · waiting for seeds',
  'tip.growing': '{time} left',
  'tip.ready': 'Ready! (withers in {time})',
  'tip.withered': 'Withered',
  'tip.locked': 'Unlocks at Lv.{n}',
  'tip.watered': '💧 Watered · growing faster',
  'tip.weed': '🌾 Weeds · growth halved',
  'tip.bug': '🐛 Bugs · growth paused',
  'tip.fertActive': '{emoji} {name} active · +{s}% speed',
  'tip.fertYield': ' · +{y}% yield',
  'tip.tierNext': '⏫ Upgrades to {tier} at Lv.{n}',
  'tip.tierStat': 'Yield +{y}% · Speed +{s}%',
  'tip.plotNo': 'Plot #{n}',
  'act.plantSeed': '🌱 Plant {name}',
  'act.pickSeed': '🛒 Pick seeds',
  'act.water': '💧 Water',
  'act.weed': '🌾 Weed',
  'act.bug': '🐛 Debug',
  'act.harvest': '🧺 Harvest +{n}💰',
  'act.clear': '🧹 Clear',
  'act.fert': '🧪 Fertilize (bag)',
  'act.helpWater': '💧 Help water',
  'act.helpWeed': '🌾 Help weed',
  'act.helpBug': '🐛 Help debug',
  'act.steal': '🥷 Steal it +{n}💰',
  'act.stealDone': 'Already stole this one',
  'act.stealLimit': 'Daily limit reached',
  'friend.emptyPlot': "Friend hasn't planted anything",
  'friend.notRipe': 'Not ripe yet — {time} left',
  'friend.canSteal': 'Ripe! Steal for {n}💰',
  'friend.stolenBy': '🥷 Stolen by: {names}',
  'friend.withered': 'Withered. What a pity',

  'toast.planted': '🌱 Planted {name}!',
  'toast.watered': 'Watered! Growth +20%',
  'toast.weed': '🌾 Weeds cleared, back to normal growth!',
  'toast.bug': '🐛 Bugs gone, crops keep growing!',
  'toast.harvest': 'Harvested {name} +{coins} coins',
  'toast.levelup': '🎉 Harvested {name}, reached Lv.{level}!',
  'toast.cleared': '🧹 Cleared the withered crop',
  'toast.harvestAll': '🧺 Harvested {n} plots: +{coins} coins +{xp} XP',
  'toast.waterAll': '🚿 Watered {n} plots, growing faster!',
  'toast.steal': 'Stole {name} from {friend}: +{coins} coins!',
  'toast.buyFert': 'Bought {name} ×{n}, added to bag',
  'toast.usedFert': 'Applied {name}: +{s}% speed{y} this crop!',
  'toast.noEmptyPlot': '🤔 No empty plots. Harvest first or level up to unlock more',
  'toast.noFert': 'No fertilizer in your bag. Buy some in the shop first',
  'err.noPlayer': 'No player selected',
  'err.noCoins': 'Not enough coins — go harvest first',
  'err.needLevel': 'Lv.{n} required to plant {name}',
  'err.noCrop': 'Nothing planted here',
  'err.notRipe': 'Not ripe yet, come back later',
  'err.stealLimit': 'Already stole {n} times today, come back tomorrow',
  'err.stolenTwice': 'You already stole from this plot',
  'err.nothingReady': 'Nothing ripe yet',
  'err.allWatered': 'All crops already watered',
  'err.fertPoor': 'Not enough coins — {name} costs {price}💰',
}

export const TIER_LABEL: Record<string, {zh: string; en: string}> = {
  normal: {zh: '🟫 普通土地', en: '🟫 Normal Soil'},
  red: {zh: '🟥 红土地', en: '🟥 Red Soil'},
  black: {zh: '⬛ 黑土地', en: '⬛ Black Soil'},
}

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: keyof typeof zh, vars?: Record<string, string | number>) => string
}

const Ctx = createContext<LangCtx>({
  lang: 'zh',
  setLang: () => {},
  t: (k) => zh[k],
})

export function LangProvider({children}: {children: ReactNode}) {
  const [lang, setLangState] = useState<Lang>(() =>
    localStorage.getItem('farm-lang') === 'en' ? 'en' : 'zh',
  )
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])
  const setLang = (l: Lang) => {
    localStorage.setItem('farm-lang', l)
    setLangState(l)
  }
  const t = (key: keyof typeof zh, vars?: Record<string, string | number>) => {
    let s: string = (lang === 'en' ? en : zh)[key] ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
    return s
  }
  return <Ctx.Provider value={{lang, setLang, t}}>{children}</Ctx.Provider>
}

export function useT() {
  return useContext(Ctx)
}

/** 内容类名称（作物/化肥来自 Sanity，带 nameEn 字段） */
export function lname(item: {name: string; nameEn?: string} | undefined, lang: Lang): string {
  if (!item) return ''
  return lang === 'en' && item.nameEn ? item.nameEn : item.name
}
