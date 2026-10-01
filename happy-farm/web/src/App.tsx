import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {client} from './lib/sanity'
import {computeGrowth, levelForXp} from './lib/growth'
import type {Crop, GameRule, Player, Plot} from './types'
import {plotAnchor} from './lib/iso'
import FarmScene from './components/FarmScene'
import type {Floater, PlotWithCrop} from './components/FarmScene'
import TopBar from './components/TopBar'
import Toolbar from './components/Toolbar'
import ShopModal from './components/ShopModal'
import './App.css'

let floaterId = 0

export default function App() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [playerId, setPlayerId] = useState<string>('')
  const [plots, setPlots] = useState<PlotWithCrop[]>([])
  const [rule, setRule] = useState<GameRule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [toastKind, setToastKind] = useState<'info' | 'good' | 'bad'>('info')
  const [shopPlotId, setShopPlotId] = useState<string | null>(null)
  const [shopOpen, setShopOpen] = useState(false)
  const [seedId, setSeedId] = useState('')
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [levelUp, setLevelUp] = useState<number | null>(null)
  const [clock, setClock] = useState(() => Date.now())
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const player = players.find((p) => p._id === playerId)

  const showToast = useCallback((msg: string, kind: 'info' | 'good' | 'bad' = 'info') => {
    setToast(msg)
    setToastKind(kind)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }, [])

  const addFloater = useCallback((plotIndex: number, text: string, tone: Floater['tone'], dy = 0) => {
    const a = plotAnchor(plotIndex)
    const id = ++floaterId
    setFloaters((f) => [...f, {id, x: a.x, y: a.y - 34 + dy, text, tone}])
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1400)
  }, [])

  const refresh = useCallback(async (pid: string) => {
    const [cropList, playerList, ruleDoc, plotList] = await Promise.all([
      client.fetch<Crop[]>('*[_type == "crop"] | order(minLevel asc)'),
      client.fetch<Player[]>('*[_type == "player"]'),
      client.fetch<GameRule | null>('*[_type == "gameRule"][0]'),
      pid
        ? client.fetch<PlotWithCrop[]>('*[_type == "plot" && owner._ref == $pid] | order(index asc) {..., crop->}', {pid})
        : Promise.resolve([] as PlotWithCrop[]),
    ])
    setCrops(cropList)
    setPlayers(playerList)
    setRule(ruleDoc)
    setPlots(plotList)
    return playerList
  }, [])

  useEffect(() => {
    refresh('')
      .then((playerList) => {
        setPlayerId(playerList[0]?._id ?? '')
        setLoading(false)
      })
      .catch((e) => {
        setError(String(e?.message ?? e))
        setLoading(false)
      })
  }, [refresh])

  useEffect(() => {
    if (!playerId) return
    refresh(playerId).catch((e) => setError(String(e?.message ?? e)))
    const poll = setInterval(() => {
      refresh(playerId).catch(() => {})
    }, 5000)
    return () => clearInterval(poll)
  }, [playerId, refresh])

  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const grown = useMemo(() => plots.map((plot) => ({plot, growth: computeGrowth(plot, rule, clock)})), [plots, rule, clock])

  const readyItems = grown.filter((g) => g.growth.status === 'ready' && g.plot.crop)
  const thirstyItems = grown.filter((g) => g.growth.status === 'growing' && !g.plot.isWatered && !g.plot.hasBug)
  const seed = crops.find((c) => c._id === seedId)

  async function run(action: () => Promise<string | void>, successMsg: string) {
    if (busy) return
    setBusy(true)
    try {
      const customMsg = await action()
      if (customMsg) showToast(customMsg, 'good')
      else if (successMsg) showToast(successMsg, 'good')
      await refresh(playerId)
    } catch (e) {
      showToast(`❌ ${String((e as Error)?.message ?? e)}`, 'bad')
    } finally {
      setBusy(false)
    }
  }

  const plant = (plot: PlotWithCrop, crop: Crop) =>
    run(async () => {
      if (!player) throw new Error('没有选中玩家')
      if (player.coins < crop.seedPrice) throw new Error('金币不足，先去收菜吧')
      if (player.level < crop.minLevel) throw new Error(`需要 Lv.${crop.minLevel} 才能种${crop.name}`)
      await client
        .transaction()
        .patch(player._id, (p) => p.dec({coins: crop.seedPrice}))
        .patch(plot._id, (p) =>
          p
            .set({
              crop: {_type: 'reference', _ref: crop._id},
              plantedAt: new Date().toISOString(),
              status: 'growing',
              isWatered: false,
              hasWeed: false,
              hasBug: false,
            })
            .unset(['stolenBy']),
        )
        .commit()
      addFloater(plot.index, `-${crop.seedPrice} 💰`, 'xp')
      return `🌱 种下了 ${crop.name}！`
    }, '')

  const water = (plot: PlotWithCrop) =>
    run(async () => {
      await client.patch(plot._id).set({isWatered: true}).commit()
      addFloater(plot.index, '💧 加速中', 'xp', -26)
    }, '浇水成功，生长加速 20%！')

  const clearWeed = (plot: PlotWithCrop) =>
    run(async () => {
      await client.patch(plot._id).set({hasWeed: false}).commit()
    }, '🌾 杂草清除，生长恢复正常！')

  const clearBug = (plot: PlotWithCrop) =>
    run(async () => {
      await client.patch(plot._id).set({hasBug: false}).commit()
    }, '🐛 害虫消灭，作物继续生长！')

  const harvest = (plot: PlotWithCrop) =>
    run(async () => {
      const crop = plot.crop
      if (!player || !crop) throw new Error('这块地没有作物')
      const newXp = player.xp + crop.exp
      const {level} = levelForXp(newXp, rule)
      const leveledUp = level > player.level
      await client
        .transaction()
        .patch(player._id, (p) => p.inc({coins: crop.sellPrice, xp: crop.exp}).set({level}))
        .patch(plot._id, (p) =>
          p.set({status: 'empty', isWatered: false, hasWeed: false, hasBug: false}).unset(['crop', 'plantedAt', 'stolenBy']),
        )
        .commit()
      addFloater(plot.index, `+${crop.sellPrice} 💰`, 'coin')
      addFloater(plot.index, `+${crop.exp} ✨`, 'xp', -30)
      if (leveledUp) {
        setLevelUp(level)
        setTimeout(() => setLevelUp(null), 3200)
      }
      return leveledUp ? `🎉 收获 ${crop.name}，升级到 Lv.${level}！` : `收获 ${crop.name} +${crop.sellPrice} 金币`
    }, '')

  const clearWithered = (plot: PlotWithCrop) =>
    run(async () => {
      await client
        .patch(plot._id)
        .set({status: 'empty', isWatered: false, hasWeed: false, hasBug: false})
        .unset(['crop', 'plantedAt', 'stolenBy'])
        .commit()
    }, '🧹 铲除了枯萎的作物')

  const quickHarvest = () =>
    run(async () => {
      if (!player) throw new Error('没有选中玩家')
      if (!readyItems.length) throw new Error('还没有成熟的作物')
      let xpGain = 0
      let coins = 0
      const tx = client.transaction()
      for (const {plot} of readyItems) {
        const crop = plot.crop
        if (!crop) continue
        xpGain += crop.exp
        coins += crop.sellPrice
        addFloater(plot.index, `+${crop.sellPrice} 💰`, 'coin')
        tx.patch(plot._id, (p) =>
          p.set({status: 'empty', isWatered: false, hasWeed: false, hasBug: false}).unset(['crop', 'plantedAt', 'stolenBy']),
        )
      }
      const {level} = levelForXp(player.xp + xpGain, rule)
      tx.patch(player._id, (p) => p.inc({coins, xp: xpGain}).set({level}))
      await tx.commit()
      if (level > player.level) {
        setLevelUp(level)
        setTimeout(() => setLevelUp(null), 3200)
      }
      return `🧺 一键收获 ${readyItems.length} 块地，+${coins} 金币 +${xpGain} 经验`
    }, '')

  const quickWater = () =>
    run(async () => {
      if (!thirstyItems.length) throw new Error('所有作物都浇过水啦')
      const tx = client.transaction()
      for (const {plot} of thirstyItems) {
        addFloater(plot.index, '💧', 'xp', -26)
        tx.patch(plot._id, (p) => p.set({isWatered: true}))
      }
      await tx.commit()
      return `🚿 给 ${thirstyItems.length} 块地浇了水，生长加速！`
    }, '')

  const openShopForPlot = (plot: PlotWithCrop) => {
    setShopPlotId(plot._id)
    setShopOpen(true)
  }

  const openGeneralShop = () => {
    if (!player) return
    const target = plots.find((p) => player.level >= (p.unlockLevel ?? 1) && !p.crop)
    setShopPlotId(target?._id ?? null)
    setShopOpen(true)
  }

  const handleTilePlant = (plot: PlotWithCrop) => {
    if (!seed) {
      openShopForPlot(plot)
      return
    }
    plant(plot, seed)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSeedId('')
        return
      }
      const n = Number(e.key)
      if (!n || n < 1 || n > 9) return
      const crop = crops[n - 1]
      if (crop && player && player.level >= crop.minLevel) setSeedId((cur) => (cur === crop._id ? '' : crop._id))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [crops, player])

  if (loading) return <div className="loading">🌻 正在打开农场大门…</div>
  if (error) return <div className="loading">😵 加载失败：{error}</div>
  if (!player) return <div className="loading">😢 还没有玩家，请先在 Studio 里创建一个</div>

  const levelInfo = levelForXp(player.xp, rule)
  const shopPlot = (plots.find((p) => p._id === shopPlotId) ?? null) as Plot | null

  return (
    <div className="app">
      <TopBar
        player={player}
        players={players}
        levelInfo={levelInfo}
        readyCount={readyItems.length}
        stolenToday={player.stolenToday ?? 0}
        stolenLimit={rule?.stealDailyLimit ?? 5}
        onSwitchPlayer={setPlayerId}
        onOpenShop={openGeneralShop}
        onToast={showToast}
      />

      <main className="stage">
        <FarmScene
          items={grown}
          player={player}
          busy={busy}
          seedName={seed?.name}
          floaters={floaters}
          onPlant={handleTilePlant}
          onOpenShop={openShopForPlot}
          onWater={water}
          onClearWeed={clearWeed}
          onClearBug={clearBug}
          onHarvest={harvest}
          onClearWithered={clearWithered}
        />

        <div className="stage-hint">
          {seed ? (
            <span className="hint-chip active">🌱 已选中「{seed.name}」，点空地播种 · Esc 取消</span>
          ) : (
            <span className="hint-chip">💡 在下方「种子包」选一粒种子 → 点空地播种 · 浇水加速 · 成熟点一下就收</span>
          )}
        </div>

        {levelUp !== null && (
          <div className="levelup">
            <div className="levelup-ring">Lv.{levelUp}</div>
            <div className="levelup-text">
              <b>升级啦！</b>
              <i>新的土地正在等你开垦</i>
            </div>
          </div>
        )}
      </main>

      <Toolbar
        crops={crops}
        player={player}
        selectedSeedId={seedId}
        readyCount={readyItems.length}
        thirstyCount={thirstyItems.length}
        onSelectSeed={setSeedId}
        onOpenShop={openGeneralShop}
        onQuickHarvest={quickHarvest}
        onQuickWater={quickWater}
        onToast={showToast}
      />

      {toast && <div className={`toast ${toastKind}`}>{toast}</div>}

      {shopOpen && (
        <ShopModal
          plot={shopPlot}
          crops={crops}
          player={player}
          onClose={() => setShopOpen(false)}
          onPick={(crop) => {
            const target = shopPlot ?? plots.find((p) => player.level >= (p.unlockLevel ?? 1) && !p.crop)
            setShopOpen(false)
            if (!target) {
              showToast('🤔 没有可用的空地了，先收获或者升级解锁新地吧', 'bad')
              return
            }
            plant(target as PlotWithCrop, crop)
          }}
        />
      )}
    </div>
  )
}
