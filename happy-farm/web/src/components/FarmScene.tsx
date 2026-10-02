import {memo, useEffect, useMemo, useRef, useState} from 'react'
import type {ReactNode} from 'react'
import type {GrowthState} from '../lib/growth'
import {formatCountdown, effectiveTier, tierSpeedBoost, tierYieldBoost} from '../lib/growth'
import type {Crop, GameRule, Player, Plot} from '../types'
import {useT, lname, TIER_LABEL} from '../i18n'
import {BASE_VIEW, TILE_H, TILE_W, coverView, plotAnchor, round} from '../lib/iso'
import CropArt, {WM_CLIP_ID, WitheredArt} from '../art/CropArt'
import type {Stage} from '../art/CropArt'
import {BugOverlay, LockedTile, SoilTile, WeedOverlay} from '../art/TileArt'
import {
  Backdrop,
  BottomVignette,
  Chicken,
  DogHouse,
  FenceRing,
  Ground,
  Haystack,
  House,
  Mailbox,
  Path,
  Pond,
  Signboard,
  Sunflower,
  Tree,
  Windmill,
} from '../art/Scenery'

const HORIZON = 150

export interface PlotWithCrop extends Plot {
  crop?: Crop
}

export interface SceneItem {
  plot: PlotWithCrop
  growth: GrowthState
}

export interface Floater {
  id: number
  x: number
  y: number
  text: string
  tone?: 'coin' | 'xp' | 'bad'
}

interface Props {
  items: SceneItem[]
  player: Player
  busy: boolean
  seedName?: string
  floaters: Floater[]
  rule?: GameRule | null
  /** 'mine' = 自己的农场，'friend' = 好友农场（只能偷菜/帮忙） */
  mode?: 'mine' | 'friend'
  /** 好友模式下：当前访客（我）的昵称，用于判断这块地有没有被我偷过 */
  visitorName?: string
  /** 好友模式下：今天剩余的偷菜次数 */
  stolenLeft?: number
  stealRatio?: number
  /** 已从背包选中化肥，点生长中的地即可施肥 */
  fertSelected?: boolean
  onPlant: (plot: PlotWithCrop) => void
  onOpenShop: (plot: PlotWithCrop) => void
  onWater: (plot: PlotWithCrop) => void
  onClearWeed: (plot: PlotWithCrop) => void
  onClearBug: (plot: PlotWithCrop) => void
  onHarvest: (plot: PlotWithCrop) => void
  onClearWithered: (plot: PlotWithCrop) => void
  onSteal?: (plot: PlotWithCrop) => void
  onFertilize?: (plot: PlotWithCrop) => void
  onOpenBag?: () => void
}

function stageOf(growth: GrowthState): Stage {
  if (growth.status === 'empty') return 0
  if (growth.status === 'ready' || growth.status === 'withered') return 4
  const s = Math.floor(growth.progress * 5)
  return Math.max(0, Math.min(4, s)) as Stage
}

/** 每块地一点确定性的随机抖动，避免 24 株作物长得一模一样 */
function jitter(seed: number) {
  const a = Math.sin(seed * 12.9898) * 43758.5453
  const b = Math.sin(seed * 78.233) * 12345.6789
  return {
    scale: 0.94 + (a - Math.floor(a)) * 0.14,
    rotate: ((b - Math.floor(b)) - 0.5) * 7,
    sway: 2.6 + ((a - Math.floor(a)) * 1.8),
  }
}

interface PieceProps {
  /** 土地菱形中心 */
  x: number
  y: number
  index: number
  locked: boolean
  unlockLevel: number
  tier: 'normal' | 'red' | 'black'
  cropId: string
  cropName: string
  emoji?: string
  status: 'empty' | 'growing' | 'ready' | 'withered'
  stage: Stage
  watered: boolean
  weedy: boolean
  buggy: boolean
}

/**
 * 一块地的全部静态美术（土 + 作物 + 杂草虫害）。
 * 只吃基本类型参数，配合 memo——秒针每跳一次也几乎不会重绘。
 */
const PlotPiece = memo(function PlotPiece({
  x,
  y,
  index,
  locked,
  unlockLevel,
  tier,
  cropId,
  cropName,
  emoji,
  status,
  stage,
  watered,
  weedy,
  buggy,
}: PieceProps) {
  const j = jitter(index)
  return (
    <g transform={`translate(${round(x)} ${round(y)})`}>
      {locked ? (
        <LockedTile level={unlockLevel} tier={tier} />
      ) : (
        <SoilTile x={0} y={0} seed={index} state={status} watered={watered} tier={tier} />
      )}
      {!locked && status !== 'empty' && (
        <>
          {status === 'withered' ? (
            <WitheredArt />
          ) : (
            <CropArt
              cropId={cropId}
              cropName={cropName}
              emoji={emoji}
              stage={stage}
              x={0}
              y={0}
              scale={j.scale}
              rotate={j.rotate}
              sway
              swayDelay={-index * 0.23}
            />
          )}
          {weedy && status !== 'withered' && <WeedOverlay x={0} y={0} />}
          {buggy && status !== 'withered' && <BugOverlay x={0} y={0} />}
        </>
      )}
    </g>
  )
})

export default function FarmScene({
  items,
  player,
  busy,
  seedName,
  floaters,
  rule = null,
  mode = 'mine',
  visitorName,
  stolenLeft,
  stealRatio,
  fertSelected = false,
  onPlant,
  onOpenShop,
  onWater,
  onClearWeed,
  onClearBug,
  onHarvest,
  onClearWithered,
  onSteal,
  onFertilize,
  onOpenBag,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [aspect, setAspect] = useState(BASE_VIEW.w / BASE_VIEW.h)
  const [hovered, setHovered] = useState<number | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setAspect(r.width / r.height)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const view = useMemo(() => coverView(aspect), [aspect])

  const paintOrder = useMemo(
    () => [...items].sort((a, b) => plotAnchor(a.plot.index).depth - plotAnchor(b.plot.index).depth || a.plot.index - b.plot.index),
    [items],
  )

  const hoveredItem = items.find((it) => it.plot.index === hovered)
  const hoveredAnchor = hoveredItem ? plotAnchor(hoveredItem.plot.index) : null

  /** 天空 / 地面 / 远景装饰：一辈子只用建一次 */
  const staticBackdrop = useMemo(
    () => (
      <>
        <Backdrop horizon={HORIZON} />
        <Ground horizon={HORIZON} />
        <Pond x={1240} y={702} rx={142} ry={54} />
        <Path />
        <Tree x={140} y={322} scale={0.94} />
        <Tree x={262} y={240} scale={0.68} />
        <Tree x={92} y={486} scale={0.78} kind="pine" />
        <Tree x={1252} y={292} scale={0.84} />
        <Windmill x={350} y={300} scale={0.86} />
        <House x={998} y={362} scale={0.9} />
      </>
    ),
    [],
  )

  /** 篱笆 + 前景院子，压在田地上方 */
  const staticForeground = useMemo(
    () => (
      <>
        <FenceRing />
        <Haystack x={84} y={644} scale={0.74} />
        <Sunflower x={178} y={724} scale={0.76} />
        <Sunflower x={250} y={762} scale={0.64} flip />
        <Signboard x={556} y={706} text={player.farmName ?? '开心农场'} scale={0.76} />
        <Chicken x={722} y={748} scale={0.76} delay={0} />
        <Chicken x={786} y={768} scale={0.64} delay={1.1} />
        <Chicken x={658} y={770} scale={0.7} delay={2.2} />
        <DogHouse x={944} y={762} scale={0.72} />
        <Mailbox x={1066} y={628} scale={0.76} unread />
        {(
          [
            [40, 746],
            [332, 768],
            [438, 748],
            [880, 772],
            [1120, 752],
            [1440, 748],
            [1520, 772],
          ] as [number, number][]
        ).map(([gx, gy], i) => (
          <g key={i} transform={`translate(${gx} ${gy})`}>
            <path d="M0 0 q4 -12 9 -2" stroke="#6cb144" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M10 0 q3 -9 7 -1" stroke="#87c95c" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            {i % 3 === 0 && (
              <g transform="translate(24 -6)">
                {[0, 72, 144, 216, 288].map((ang) => (
                  <ellipse
                    key={ang}
                    cx="0"
                    cy="-3.4"
                    rx="2.4"
                    ry="3.4"
                    fill={i % 2 ? '#fff3c4' : '#ffd7ea'}
                    transform={`rotate(${ang})`}
                  />
                ))}
                <circle cx="0" cy="0" r="1.6" fill="#ffc93c" />
              </g>
            )}
          </g>
        ))}
        <BottomVignette />
      </>
    ),
    [player.farmName],
  )

  const pct = (x: number, y: number) => ({
    left: `${((x - view.x) / view.w) * 100}%`,
    top: `${((y - view.y) / view.h) * 100}%`,
  })

  function clickPlot(plot: PlotWithCrop, growth: GrowthState) {
    if (busy) return
    if (mode === 'friend') {
      if (growth.status === 'ready') onSteal?.(plot)
      return
    }
    if (growth.status === 'growing' && fertSelected) {
      onFertilize?.(plot)
      return
    }
    if (growth.status === 'empty') {
      if (seedName) onPlant(plot)
      else onOpenShop(plot)
    } else if (growth.status === 'ready') onHarvest(plot)
    else if (growth.status === 'withered') onClearWithered(plot)
  }

  return (
    <div className="scene" ref={wrapRef}>
      <svg
        className="scene-svg"
        viewBox={`${round(view.x)} ${round(view.y)} ${round(view.w)} ${round(view.h)}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="sky-grad" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON - 300} x2="0" y2={HORIZON}>
            <stop offset="0%" stopColor="#2f93d6" />
            <stop offset="45%" stopColor="#63bdec" />
            <stop offset="78%" stopColor="#9fdcf6" />
            <stop offset="100%" stopColor="#c8ecfb" />
          </linearGradient>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff8d0" />
            <stop offset="100%" stopColor="#ffd75e" />
          </radialGradient>
          <linearGradient id="grass-grad" gradientUnits="userSpaceOnUse" x1="0" y1={HORIZON} x2="0" y2={HORIZON + 1500}>
            <stop offset="0%" stopColor="#a4dc6f" />
            <stop offset="45%" stopColor="#86ca55" />
            <stop offset="100%" stopColor="#5da738" />
          </linearGradient>
          <pattern id="grass-noise" width="46" height="46" patternUnits="userSpaceOnUse">
            <path d="M8 30 q4 -10 8 0" stroke="#8ecb60" strokeWidth="2.4" fill="none" opacity=".55" />
            <path d="M28 14 q3 -8 6 0" stroke="#6cb144" strokeWidth="2" fill="none" opacity=".5" />
            <path d="M18 42 q3 -8 6 0" stroke="#a3dc74" strokeWidth="2" fill="none" opacity=".4" />
          </pattern>
          <linearGradient id="soil-shade" x1="0.2" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".24" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#3b2210" stopOpacity=".3" />
          </linearGradient>
          <linearGradient id="grass-shade" x1="0.2" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".22" />
            <stop offset="100%" stopColor="#2f5a1c" stopOpacity=".3" />
          </linearGradient>
          <linearGradient id="water-grad" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#8fd8ef" />
            <stop offset="60%" stopColor="#59b4dc" />
            <stop offset="100%" stopColor="#3d8fbe" />
          </linearGradient>
          <linearGradient id="wall-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".28" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#8f6b3a" stopOpacity=".28" />
          </linearGradient>
          <linearGradient id="glass-grad" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#bfe9ff" />
            <stop offset="100%" stopColor="#6bb6dd" />
          </linearGradient>
          <radialGradient id="seed-grad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#a97a3e" />
            <stop offset="100%" stopColor="#5b3a15" />
          </radialGradient>
          <clipPath id={WM_CLIP_ID}>
            <ellipse cx="0" cy="0" rx="30" ry="24" />
          </clipPath>
          <linearGradient id="ground-fade" gradientUnits="userSpaceOnUse" x1="0" y1="830" x2="0" y2="1420">
            <stop offset="0%" stopColor="#3d6b22" stopOpacity="0" />
            <stop offset="55%" stopColor="#3d6b22" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#2f5719" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="sky-fade" gradientUnits="userSpaceOnUse" x1="0" y1="-900" x2="0" y2="40">
            <stop offset="0%" stopColor="#1f6ea8" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#1f6ea8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {staticBackdrop}

        {/* 土地 + 作物：按画家算法从后往前画，每块地单独 memo */}
        <g>
          {paintOrder.map(({plot, growth}) => {
            const a = plotAnchor(plot.index)
            return (
              <PlotPiece
                key={plot._id}
                x={a.x}
                y={a.y}
                index={plot.index}
                locked={player.level < (plot.unlockLevel ?? 1)}
                unlockLevel={plot.unlockLevel ?? 1}
                tier={effectiveTier(plot, player.level)}
                cropId={plot.crop?._id ?? ''}
                cropName={plot.crop?.name ?? ''}
                emoji={plot.crop?.emoji}
                status={growth.status}
                stage={stageOf(growth)}
                watered={!!plot.isWatered && !plot.hasBug}
                weedy={!!plot.hasWeed}
                buggy={!!plot.hasBug}
              />
            )
          })}
        </g>

        {staticForeground}

        {/* 点击热区 + 悬停高亮 */}
        {items.map(({plot, growth}) => {
          const a = plotAnchor(plot.index)
          const locked = player.level < (plot.unlockLevel ?? 1)
          const isHover = hovered === plot.index
          const hot = `${round(a.x)},${round(a.y - TILE_H)} ${round(a.x + TILE_W)},${round(a.y)} ${round(a.x)},${round(a.y + TILE_H)} ${round(a.x - TILE_W)},${round(a.y)}`
          return (
            <g key={`hit-${plot._id}`}>
              <polygon
                points={hot}
                fill="transparent"
                style={{cursor: busy || locked ? 'default' : 'pointer'}}
                onMouseEnter={() => setHovered(plot.index)}
                onMouseLeave={() => setHovered((h) => (h === plot.index ? null : h))}
                onClick={() => !locked && clickPlot(plot, growth)}
              />
              {isHover && !locked && (
                <polygon
                  className={`tile-focus s-${growth.status}`}
                  points={`${round(a.x)},${round(a.y - TILE_H + 1)} ${round(a.x + TILE_W - 1)},${round(a.y)} ${round(a.x)},${round(a.y + TILE_H - 1)} ${round(a.x - TILE_W + 1)},${round(a.y)}`}
                  fill="none"
                  strokeWidth="3.4"
                />
              )}
            </g>
          )
        })}
      </svg>

      {/* 悬浮信息卡 */}
      {hoveredItem && hoveredAnchor && (
        <div className="plot-tip" style={pct(hoveredAnchor.x, hoveredAnchor.y - TILE_H - 6)}>
          <PlotTip
            item={hoveredItem}
            player={player}
            busy={busy}
            seedName={seedName}
            rule={rule}
            mode={mode}
            visitorName={visitorName}
            stolenLeft={stolenLeft}
            stealRatio={stealRatio}
            onPlant={onPlant}
            onOpenShop={onOpenShop}
            onWater={onWater}
            onClearWeed={onClearWeed}
            onClearBug={onClearBug}
            onHarvest={onHarvest}
            onClearWithered={onClearWithered}
            onSteal={onSteal}
            onOpenBag={onOpenBag}
          />
        </div>
      )}

      {/* 飘字 */}
      {floaters.map((f) => (
        <div key={f.id} className={`floater ${f.tone ?? 'coin'}`} style={pct(f.x, f.y)}>
          {f.text}
        </div>
      ))}
    </div>
  )
}

interface TipProps {
  item: SceneItem
  player: Player
  busy: boolean
  seedName?: string
  rule?: GameRule | null
  mode: 'mine' | 'friend'
  visitorName?: string
  stolenLeft?: number
  stealRatio?: number
  onOpenBag?: () => void
  onPlant: (plot: PlotWithCrop) => void
  onOpenShop: (plot: PlotWithCrop) => void
  onWater: (plot: PlotWithCrop) => void
  onClearWeed: (plot: PlotWithCrop) => void
  onClearBug: (plot: PlotWithCrop) => void
  onHarvest: (plot: PlotWithCrop) => void
  onClearWithered: (plot: PlotWithCrop) => void
  onSteal?: (plot: PlotWithCrop) => void
  onFertilize?: (plot: PlotWithCrop) => void
}

function PlotTip({
  item,
  player,
  busy,
  seedName,
  rule,
  mode,
  visitorName,
  stolenLeft,
  stealRatio,
  onPlant,
  onOpenShop,
  onWater,
  onClearWeed,
  onClearBug,
  onHarvest,
  onClearWithered,
  onSteal,
  onOpenBag,
}: TipProps) {
  const {t, lang} = useT()
  const {plot, growth} = item
  const locked = player.level < (plot.unlockLevel ?? 1)
  if (locked) {
    return (
      <div className="tip-card">
        <div className="tip-title">🔒 {t('tip.plotNo', {n: plot.index})}</div>
        <div className="tip-sub">{t('tip.locked', {n: plot.unlockLevel ?? 1})}</div>
      </div>
    )
  }

  // ===== 好友农场模式：偷菜 / 帮忙 =====
  if (mode === 'friend') {
    const alreadyStolen = !!visitorName && (plot.stolenBy ?? '').split('、').includes(visitorName)
    const stealAmount = plot.crop ? Math.max(1, Math.floor(plot.crop.sellPrice * (stealRatio ?? 0.2))) : 0
    const actions: ReactNode[] = []
    if (growth.status === 'ready') {
      const disabled = busy || alreadyStolen || (stolenLeft ?? 0) <= 0
      actions.push(
        <button key="s" className="tip-btn warn" disabled={disabled} onClick={() => onSteal?.(plot)}>
          🥷 {alreadyStolen ? t('act.stealDone') : (stolenLeft ?? 0) <= 0 ? t('act.stealLimit') : t('act.steal', {n: stealAmount})}
        </button>,
      )
    }
    if (growth.status === 'growing') {
      if (!plot.isWatered)
        actions.push(<button key="w" className="tip-btn" disabled={busy} onClick={() => onWater(plot)}>{t('act.helpWater')}</button>)
      if (plot.hasWeed)
        actions.push(<button key="g" className="tip-btn" disabled={busy} onClick={() => onClearWeed(plot)}>{t('act.helpWeed')}</button>)
      if (plot.hasBug)
        actions.push(<button key="b" className="tip-btn" disabled={busy} onClick={() => onClearBug(plot)}>{t('act.helpBug')}</button>)
    }
    const friendText =
      growth.status === 'empty'
        ? t('friend.emptyPlot')
        : growth.status === 'growing'
          ? t('friend.notRipe', {time: formatCountdown(growth.secondsLeft)})
          : growth.status === 'ready'
            ? alreadyStolen
              ? t('act.stealDone')
              : t('friend.canSteal', {n: stealAmount})
            : t('friend.withered')
    return (
      <div className="tip-card">
        <div className="tip-title">
          <span className="tip-emoji">{plot.crop?.emoji ?? '🟫'}</span>
          {t('tip.plotNo', {n: plot.index})}
          {plot.crop && <span className="tip-crop">{lname(plot.crop, lang)}</span>}
        </div>
        <div className="tip-sub">{friendText}</div>
        {plot.stolenBy && <div className="tip-sub">{t('friend.stolenBy', {names: plot.stolenBy})}</div>}
        {actions.length > 0 && <div className="tip-actions">{actions}</div>}
      </div>
    )
  }
  const actions: ReactNode[] = []
  if (growth.status === 'empty') {
    actions.push(
      <button key="plant" className="tip-btn primary" disabled={busy} onClick={() => (seedName ? onPlant(plot) : onOpenShop(plot))}>
        {seedName ? t('act.plantSeed', {name: seedName}) : t('act.pickSeed')}
      </button>,
    )
  }
  if (growth.status === 'growing') {
    if (!plot.isWatered)
      actions.push(
        <button key="w" className="tip-btn" disabled={busy} onClick={() => onWater(plot)}>
          {t('act.water')}
        </button>,
      )
    if (!plot.fertilizer)
      actions.push(
        <button key="f" className="tip-btn" disabled={busy} onClick={() => onOpenBag?.()}>
          {t('act.fert')}
        </button>,
      )
    if (plot.hasWeed)
      actions.push(
        <button key="g" className="tip-btn warn" disabled={busy} onClick={() => onClearWeed(plot)}>
          {t('act.weed')}
        </button>,
      )
    if (plot.hasBug)
      actions.push(
        <button key="b" className="tip-btn warn" disabled={busy} onClick={() => onClearBug(plot)}>
          {t('act.bug')}
        </button>,
      )
  }
  if (growth.status === 'ready')
    actions.push(
      <button key="h" className="tip-btn primary" disabled={busy} onClick={() => onHarvest(plot)}>
        {t('act.harvest', {n: plot.crop?.sellPrice ?? 0})}
      </button>,
    )
  if (growth.status === 'withered')
    actions.push(
      <button key="c" className="tip-btn" disabled={busy} onClick={() => onClearWithered(plot)}>
        {t('act.clear')}
      </button>,
    )

  const statusText =
    growth.status === 'empty'
      ? t('tip.empty')
      : growth.status === 'growing'
        ? t('tip.growing', {time: formatCountdown(growth.secondsLeft)})
        : growth.status === 'ready'
          ? t('tip.ready', {time: formatCountdown(growth.readySinceSeconds)})
          : t('tip.withered')

  return (
    <div className="tip-card">
      <div className="tip-title">
        <span className="tip-emoji">{plot.crop?.emoji ?? '🟫'}</span>
        {t('tip.plotNo', {n: plot.index})}
        {plot.crop && <span className="tip-crop">{lname(plot.crop, lang)}</span>}
      </div>
      <div className="tip-sub">{statusText}</div>
      {(() => {
        const tier = effectiveTier(plot, player.level)
        const yPct = Math.round(tierYieldBoost(tier, rule ?? null) * 100)
        const sPct = Math.round(tierSpeedBoost(tier, rule ?? null) * 100)
        const nextLevel = tier === 'normal' ? plot.redLevel : tier === 'red' ? plot.blackLevel : undefined
        const nextLabel = tier === 'normal' ? TIER_LABEL.red[lang] : TIER_LABEL.black[lang]
        return (
          <>
            {tier !== 'normal' && (
              <div className="tip-sub">
                {TIER_LABEL[tier][lang]} · {t('tip.tierStat', {y: yPct, s: sPct})}
              </div>
            )}
            {nextLevel != null && (
              <div className="tip-sub">{t('tip.tierNext', {n: nextLevel, tier: nextLabel})}</div>
            )}
          </>
        )
      })()}
      {growth.status === 'growing' && (
        <div className="tip-progress">
          <div className="tip-progress-fill" style={{width: `${growth.progress * 100}%`}} />
        </div>
      )}
      {(plot.hasWeed || plot.hasBug) && (
        <div className="tip-badges">
          {plot.hasWeed && <span className="badge bad">{t('tip.weed')}</span>}
          {plot.hasBug && <span className="badge bad">{t('tip.bug')}</span>}
        </div>
      )}
      {plot.isWatered && growth.status === 'growing' && <div className="tip-badges"><span className="badge good">{t('tip.watered')}</span></div>}
      {plot.fertilizer && growth.status === 'growing' && (
        <div className="tip-badges">
          <span className="badge good">
            {t('tip.fertActive', {emoji: plot.fertilizer.emoji ?? '🧪', name: lname(plot.fertilizer, lang), s: Math.round(plot.fertilizer.speedBoost * 100)})}
            {plot.fertilizer.yieldBoost ? t('tip.fertYield', {y: Math.round(plot.fertilizer.yieldBoost * 100)}) : ''}
          </span>
        </div>
      )}
      {actions.length > 0 && <div className="tip-actions">{actions}</div>}
    </div>
  )
}
