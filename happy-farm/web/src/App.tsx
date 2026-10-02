import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {client} from './lib/sanity'
import {computeGrowth, effectiveTier, levelForXp, tierYieldBoost} from './lib/growth'
import type {Crop, Fertilizer, GameRule, Player, Plot} from './types'
import {plotAnchor} from './lib/iso'
import FarmScene from './components/FarmScene'
import type {Floater, PlotWithCrop} from './components/FarmScene'
import TopBar from './components/TopBar'
import Toolbar from './components/Toolbar'
import ShopModal from './components/ShopModal'
import FriendModal from './components/FriendModal'
import BackpackModal from './components/BackpackModal'
import {lname, useT} from './i18n'
import './App.css'

let floaterId = 0

export default function App({forcedPlayerId}: {forcedPlayerId?: string}) {
  const {t, lang} = useT()
  const [crops, setCrops] = useState<Crop[]>([])
  const [fertilizers, setFertilizers] = useState<Fertilizer[]>([])
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
  const [friendId, setFriendId] = useState<string | null>(null)
  const [friendPlots, setFriendPlots] = useState<PlotWithCrop[]>([])
  const [friendModalOpen, setFriendModalOpen] = useState(false)
  const [bagOpen, setBagOpen] = useState(false)
  /** 背包里选中的化肥（进入点地施肥模式） */
  const [fertId, setFertId] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const player = players.find((p) => p._id === playerId)
  const friend = players.find((p) => p._id === friendId)
  const friends = players.filter((p) => p._id !== playerId)

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
    const [cropList, fertList, playerList, ruleDoc, plotList] = await Promise.all([
      client.fetch<Crop[]>('*[_type == "crop"] | order(minLevel asc)'),
      client.fetch<Fertilizer[]>('*[_type == "fertilizer"] | order(price asc)'),
      client.fetch<Player[]>('*[_type == "player"]{..., inventory[]{_key, count, item->}}'),
      client.fetch<GameRule | null>('*[_type == "gameRule"][0]'),
      pid
        ? client.fetch<PlotWithCrop[]>('*[_type == "plot" && owner._ref == $pid] | order(index asc) {..., crop->, fertilizer->}', {pid})
        : Promise.resolve([] as PlotWithCrop[]),
    ])
    setCrops(cropList)
    setFertilizers(fertList)
    setPlayers(playerList)
    setRule(ruleDoc)
    setPlots(plotList)
    return playerList
  }, [])

  useEffect(() => {
    refresh('')
      .then((playerList) => {
        // 登录模式直接玩自己的号；演示模式默认第一个玩家
        setPlayerId(forcedPlayerId ?? playerList[0]?._id ?? '')
        setLoading(false)
      })
      .catch((e) => {
        setError(String(e?.message ?? e))
        setLoading(false)
      })
  }, [refresh, forcedPlayerId])

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

  // 好友农场的土地数据（做客时加载并轮询）
  useEffect(() => {
    if (!friendId) {
      setFriendPlots([])
      return
    }
    const load = () =>
      client
        .fetch<PlotWithCrop[]>('*[_type == "plot" && owner._ref == $pid] | order(index asc) {..., crop->, fertilizer->}', {pid: friendId})
        .then(setFriendPlots)
        .catch(() => {})
    load()
    const poll = setInterval(load, 5000)
    return () => clearInterval(poll)
  }, [friendId])

  const friendGrown = useMemo(
    () => friendPlots.map((plot) => ({plot, growth: computeGrowth(plot, rule, clock, effectiveTier(plot, friend?.level ?? 1))})),
    [friendPlots, rule, clock, friend?.level],
  )

  const grown = useMemo(
    () => plots.map((plot) => ({plot, growth: computeGrowth(plot, rule, clock, effectiveTier(plot, player?.level ?? 1))})),
    [plots, rule, clock, player?.level],
  )

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
      if (!player) throw new Error(t('err.noPlayer'))
      if (player.coins < crop.seedPrice) throw new Error(t('err.noCoins'))
      if (player.level < crop.minLevel) throw new Error(t('err.needLevel', {n: crop.minLevel, name: lname(crop, lang)}))
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
            .unset(['stolenBy', 'fertilizer']),
        )
        .commit()
      addFloater(plot.index, `-${crop.seedPrice} 💰`, 'xp')
      return t('toast.planted', {name: lname(crop, lang)})
    }, '')

  const water = (plot: PlotWithCrop) =>
    run(async () => {
      await client.patch(plot._id).set({isWatered: true}).commit()
      addFloater(plot.index, '💧 加速中', 'xp', -26)
    }, t('toast.watered'))

  // 🧪 化肥：商店买入背包
  const buyFert = (fert: Fertilizer) =>
    run(async () => {
      if (!player) throw new Error(t('err.noPlayer'))
      if (player.coins < fert.price) throw new Error(t('err.fertPoor', {name: lname(fert, lang), price: fert.price}))
      const inv = (player.inventory ?? []).map((e) => ({
        _key: e._key,
        item: e.item ? {_type: 'reference' as const, _ref: e.item._id} : undefined,
        count: e.count,
      }))
      const idx = inv.findIndex((e) => e.item?._ref === fert._id)
      if (idx >= 0) inv[idx] = {...inv[idx], count: inv[idx].count + 1}
      else inv.push({_key: `fert-${fert._id}`, item: {_type: 'reference' as const, _ref: fert._id}, count: 1})
      await client
        .transaction()
        .patch(player._id, (p) => p.dec({coins: fert.price}).set({inventory: inv}))
        .commit()
      return t('toast.buyFert', {name: lname(fert, lang)})
    }, '')

  // 背包化肥 → 点到生长中的地上
  const useFertilizer = (plot: PlotWithCrop) =>
    run(async () => {
      if (!player) throw new Error(t('err.noPlayer'))
      const fert = fertilizers.find((f) => f._id === fertId)
      if (!fert) throw new Error(t('toast.noFert'))
      const inv = player.inventory ?? []
      const entry = inv.find((e) => e.item?._id === fert._id)
      if (!entry || entry.count <= 0) throw new Error(t('toast.noFert'))
      const newInv = inv
        .map((e) => ({
          _key: e._key,
          item: e.item ? {_type: 'reference' as const, _ref: e.item._id} : undefined,
          count: e.item?._id === fert._id ? e.count - 1 : e.count,
        }))
        .filter((e) => e.count > 0)
      await client
        .transaction()
        .patch(player._id, (p) => p.set({inventory: newInv}))
        .patch(plot._id, (p) => p.set({fertilizer: {_type: 'reference', _ref: fert._id}}))
        .commit()
      setFertId('')
      addFloater(plot.index, `${fert.emoji ?? '🧪'} +${Math.round(fert.speedBoost * 100)}%`, 'xp', -26)
      return t('toast.usedFert', {
        name: lname(fert, lang),
        s: Math.round(fert.speedBoost * 100),
        y: fert.yieldBoost ? t('tip.fertYield', {y: Math.round(fert.yieldBoost * 100)}) : '',
      })
    }, '')

  const clearWeed = (plot: PlotWithCrop) =>
    run(async () => {
      await client.patch(plot._id).set({hasWeed: false}).commit()
    }, t('toast.weed'))

  const clearBug = (plot: PlotWithCrop) =>
    run(async () => {
      await client.patch(plot._id).set({hasBug: false}).commit()
    }, t('toast.bug'))

  const harvest = (plot: PlotWithCrop) =>
    run(async () => {
      const crop = plot.crop
      if (!player || !crop) throw new Error(t('err.noCrop'))
      const yieldCoins = Math.round(
        crop.sellPrice * (1 + tierYieldBoost(effectiveTier(plot, player.level), rule) + (plot.fertilizer?.yieldBoost ?? 0)),
      )
      const newXp = player.xp + crop.exp
      const {level} = levelForXp(newXp, rule)
      const leveledUp = level > player.level
      await client
        .transaction()
        .patch(player._id, (p) => p.inc({coins: yieldCoins, xp: crop.exp}).set({level}))
        .patch(plot._id, (p) =>
          p.set({status: 'empty', isWatered: false, hasWeed: false, hasBug: false}).unset(['crop', 'plantedAt', 'stolenBy', 'fertilizer']),
        )
        .commit()
      addFloater(plot.index, `+${yieldCoins} 💰`, 'coin')
      addFloater(plot.index, `+${crop.exp} ✨`, 'xp', -30)
      if (leveledUp) {
        setLevelUp(level)
        setTimeout(() => setLevelUp(null), 3200)
      }
      return leveledUp ? t('toast.levelup', {name: lname(crop, lang), level}) : t('toast.harvest', {name: lname(crop, lang), coins: yieldCoins})
    }, '')

  const clearWithered = (plot: PlotWithCrop) =>
    run(async () => {
      await client
        .patch(plot._id)
        .set({status: 'empty', isWatered: false, hasWeed: false, hasBug: false})
        .unset(['crop', 'plantedAt', 'stolenBy', 'fertilizer'])
        .commit()
    }, t('toast.cleared'))

  // 🥷 偷菜：规则全部来自 gameRule 文档（stealRatio / stealDailyLimit）
  const steal = (plot: PlotWithCrop) =>
    run(async () => {
      const crop = plot.crop
      if (!player || !crop || !friend) throw new Error(t('err.noCrop'))
      if (computeGrowth(plot, rule).status !== 'ready') throw new Error(t('err.notRipe'))
      const limit = rule?.stealDailyLimit ?? 5
      if ((player.stolenToday ?? 0) >= limit) throw new Error(t('err.stealLimit', {n: limit}))
      const thieves = (plot.stolenBy ?? '').split('、').filter(Boolean)
      if (thieves.includes(player.nickname)) throw new Error(t('err.stolenTwice'))
      const amount = Math.max(1, Math.floor(crop.sellPrice * (rule?.stealRatio ?? 0.2)))
      await client
        .transaction()
        .patch(plot._id, (p) => p.set({stolenBy: [...thieves, player.nickname].join('、')}))
        .patch(player._id, (p) => p.inc({coins: amount, stolenToday: 1}))
        .commit()
      addFloater(plot.index, `🥷 +${amount} 💰`, 'coin')
      return t('toast.steal', {friend: friend.nickname, name: lname(crop, lang), coins: amount})
    }, '')

  const visitFriend = (f: Player) => {
    setFriendModalOpen(false)
    setFriendId(f._id)
    setSeedId('')
  }

  const goHome = () => {
    setFriendId(null)
    setSeedId('')
  }

  const quickHarvest = () =>
    run(async () => {
      if (!player) throw new Error(t('err.noPlayer'))
      if (!readyItems.length) throw new Error(t('err.nothingReady'))
      let xpGain = 0
      let coins = 0
      const tx = client.transaction()
      for (const {plot} of readyItems) {
        const crop = plot.crop
        if (!crop) continue
        xpGain += crop.exp
        const yieldCoins = Math.round(
          crop.sellPrice * (1 + tierYieldBoost(effectiveTier(plot, player.level), rule) + (plot.fertilizer?.yieldBoost ?? 0)),
        )
        coins += yieldCoins
        addFloater(plot.index, `+${yieldCoins} 💰`, 'coin')
        tx.patch(plot._id, (p) =>
          p.set({status: 'empty', isWatered: false, hasWeed: false, hasBug: false}).unset(['crop', 'plantedAt', 'stolenBy', 'fertilizer']),
        )
      }
      const {level} = levelForXp(player.xp + xpGain, rule)
      tx.patch(player._id, (p) => p.inc({coins, xp: xpGain}).set({level}))
      await tx.commit()
      if (level > player.level) {
        setLevelUp(level)
        setTimeout(() => setLevelUp(null), 3200)
      }
      return t('toast.harvestAll', {n: readyItems.length, coins, xp: xpGain})
    }, '')

  const quickWater = () =>
    run(async () => {
      if (!thirstyItems.length) throw new Error(t('err.allWatered'))
      const tx = client.transaction()
      for (const {plot} of thirstyItems) {
        addFloater(plot.index, '💧', 'xp', -26)
        tx.patch(plot._id, (p) => p.set({isWatered: true}))
      }
      await tx.commit()
      return t('toast.waterAll', {n: thirstyItems.length})
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
        setFertId('')
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

  if (loading) return <div className="loading">{t('loading.open')}</div>
  if (error) return <div className="loading">{t('loading.fail', {msg: error})}</div>
  if (!player) return <div className="loading">{t('loading.noplayer')}</div>

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
        showSwitch={!forcedPlayerId}
        showUserButton={!!forcedPlayerId}
        onSwitchPlayer={setPlayerId}
        onOpenShop={openGeneralShop}
        onToast={showToast}
      />

      <main className="stage">
        {friend && (
          <div className="visiting-banner">
            {t('banner.visiting', {name: friend.farmName ?? `${friend.nickname}`})}
            <span className="visiting-sub">
              {t('banner.sub', {a: player.stolenToday ?? 0, b: rule?.stealDailyLimit ?? 5})}
            </span>
            <button className="home-btn" onClick={goHome}>🏠 {t('dock.goHome')}</button>
          </div>
        )}
        <FarmScene
          items={friend ? friendGrown : grown}
          player={friend ?? player}
          busy={busy}
          seedName={friend ? undefined : seed ? lname(seed, lang) : undefined}
          floaters={floaters}
          rule={rule}
          mode={friend ? 'friend' : 'mine'}
          visitorName={player.nickname}
          stolenLeft={(rule?.stealDailyLimit ?? 5) - (player.stolenToday ?? 0)}
          stealRatio={rule?.stealRatio}
          fertSelected={!!fertId && !friend}
          onPlant={handleTilePlant}
          onOpenShop={openShopForPlot}
          onWater={water}
          onClearWeed={clearWeed}
          onClearBug={clearBug}
          onHarvest={harvest}
          onClearWithered={clearWithered}
          onSteal={steal}
          onFertilize={useFertilizer}
          onOpenBag={() => setBagOpen(true)}
        />

        <div className="stage-hint">
          {friend ? (
            <span className="hint-chip active">{t('hint.visiting')}</span>
          ) : fertId ? (
            <span className="hint-chip active">{t('hint.selectFert', {name: lname(fertilizers.find((f) => f._id === fertId), lang)})}</span>
          ) : seed ? (
            <span className="hint-chip active">{t('hint.selectSeed', {name: lname(seed, lang)})}</span>
          ) : (
            <span className="hint-chip">{t('hint.idle')}</span>
          )}
        </div>

        {levelUp !== null && (
          <div className="levelup">
            <div className="levelup-ring">Lv.{levelUp}</div>
            <div className="levelup-text">
              <b>{t('levelup.title')}</b>
              <i>{t('levelup.sub')}</i>
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
        visiting={!!friend}
        onSelectSeed={setSeedId}
        onOpenShop={openGeneralShop}
        onQuickHarvest={quickHarvest}
        onQuickWater={quickWater}
        onOpenFriends={() => setFriendModalOpen(true)}
        onOpenBag={() => setBagOpen(true)}
        onGoHome={goHome}
        onToast={showToast}
      />

      {toast && <div className={`toast ${toastKind}`}>{toast}</div>}

      {friendModalOpen && (
        <FriendModal friends={friends} onClose={() => setFriendModalOpen(false)} onVisit={visitFriend} />
      )}

      {bagOpen && (
        <BackpackModal
          player={player}
          onClose={() => setBagOpen(false)}
          onUse={(fert) => {
            setBagOpen(false)
            setFertId(fert._id)
          }}
        />
      )}

      {shopOpen && (
        <ShopModal
          plot={shopPlot}
          crops={crops}
          fertilizers={fertilizers}
          player={player}
          onClose={() => setShopOpen(false)}
          onBuyFert={buyFert}
          onPick={(crop) => {
            const target = shopPlot ?? plots.find((p) => player.level >= (p.unlockLevel ?? 1) && !p.crop)
            setShopOpen(false)
            if (!target) {
              showToast(t('toast.noEmptyPlot'), 'bad')
              return
            }
            plant(target as PlotWithCrop, crop)
          }}
        />
      )}
    </div>
  )
}
