import {useState} from 'react'
import type {Crop, Fertilizer, Player} from '../types'
import {formatCountdown} from '../lib/growth'
import {lname, useT} from '../i18n'

interface Props {
  crops: Crop[]
  fertilizers: Fertilizer[]
  player: Player
  /** 当前可用空地数（种子默认购买数量） */
  emptyPlots: number
  onClose: () => void
  onBuyCrop: (crop: Crop, qty: number) => void
  onBuyFert: (fert: Fertilizer, qty: number) => void
}

/** 单个商品卡：数量加减 + 购买 */
function BuyCard({
  emoji,
  name,
  desc,
  stats,
  unitPrice,
  defaultQty,
  stock,
  maxAfford,
  disabled,
  lockText,
  buyText,
  stockText,
  onBuy,
}: {
  emoji: string
  name: string
  desc: string
  stats: string[]
  unitPrice: number
  defaultQty: number
  stock: number
  maxAfford: number
  disabled: boolean
  lockText?: string
  buyText: string
  stockText: (n: number) => string
  onBuy: (qty: number) => void
}) {
  const [qty, setQty] = useState(() => Math.max(1, Math.min(defaultQty, maxAfford || 1)))
  const max = Math.max(1, maxAfford)
  const clamp = (n: number) => Math.max(1, Math.min(max, n))
  return (
    <div className={`seed-card buy-card ${disabled ? 'disabled' : ''}`}>
      <div className="seed-card-top">
        <span className="seed-card-emoji">{emoji}</span>
        <div className="seed-card-name">
          <b>{name}</b>
          <i>{desc}</i>
        </div>
      </div>
      <div className="seed-card-stats">
        {stats.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
      <div className="buy-row">
        <div className="qty-ctl">
          <button disabled={disabled || qty <= 1} onClick={() => setQty(clamp(qty - 1))}>−</button>
          <b>{qty}</b>
          <button disabled={disabled || qty >= max} onClick={() => setQty(clamp(qty + 1))}>＋</button>
        </div>
        <button className="buy-btn" disabled={disabled} onClick={() => onBuy(qty)}>
          {buyText} · {unitPrice * qty}💰
        </button>
      </div>
      <div className="buy-stock">{stockText(stock)}</div>
      {lockText && <span className="lock-ribbon">{lockText}</span>}
    </div>
  )
}

export default function ShopModal({crops, fertilizers, player, emptyPlots, onClose, onBuyCrop, onBuyFert}: Props) {
  const {t, lang} = useT()
  const [tab, setTab] = useState<'seeds' | 'ferts'>('seeds')
  const stockOf = (id: string) => player.inventory?.find((e) => e.item?._id === id)?.count ?? 0

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="shop" onClick={(e) => e.stopPropagation()}>
        <div className="shop-head">
          <h3>{tab === 'seeds' ? t('shop.title') : t('shop.titleFert')}</h3>
          <span className="shop-sub">{t('shop.subGeneral')}</span>
          <div className="shop-coins">
            💰 <b>{player.coins.toLocaleString()}</b>
          </div>
          <button className="shop-x" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="shop-tabs">
          <button className={`shop-tab ${tab === 'seeds' ? 'active' : ''}`} onClick={() => setTab('seeds')}>
            🌱 {t('shop.seeds')}
          </button>
          <button className={`shop-tab ${tab === 'ferts' ? 'active' : ''}`} onClick={() => setTab('ferts')}>
            🧪 {t('shop.ferts')}
          </button>
        </div>

        {tab === 'seeds' ? (
          <div className="shop-grid">
            {crops.map((crop) => {
              const locked = player.level < crop.minLevel
              const maxAfford = Math.floor(player.coins / crop.seedPrice)
              return (
                <BuyCard
                  key={crop._id}
                  emoji={crop.emoji ?? '🌱'}
                  name={lname(crop, lang)}
                  desc={crop.description ?? ''}
                  stats={[`⏱ ${formatCountdown(crop.growTime)}`, `✨ ${crop.exp} XP`, `💰 售 ${crop.sellPrice}`]}
                  unitPrice={crop.seedPrice}
                  defaultQty={Math.max(1, emptyPlots)}
                  stock={stockOf(crop._id)}
                  maxAfford={maxAfford}
                  disabled={locked || maxAfford < 1}
                  lockText={locked ? t('shop.locked', {n: crop.minLevel}) : maxAfford < 1 ? '💰' : undefined}
                  buyText={t('shop.buy')}
                  stockText={(n) => t('shop.stock', {n})}
                  onBuy={(qty) => onBuyCrop(crop, qty)}
                />
              )
            })}
          </div>
        ) : (
          <div className="shop-grid">
            {fertilizers.map((fert) => {
              const maxAfford = Math.floor(player.coins / fert.price)
              return (
                <BuyCard
                  key={fert._id}
                  emoji={fert.emoji ?? '🧪'}
                  name={lname(fert, lang)}
                  desc={fert.description ?? ''}
                  stats={[
                    `⏩ +${Math.round(fert.speedBoost * 100)}%`,
                    ...(fert.yieldBoost > 0 ? [`💰 +${Math.round(fert.yieldBoost * 100)}%`] : []),
                  ]}
                  unitPrice={fert.price}
                  defaultQty={1}
                  stock={stockOf(fert._id)}
                  maxAfford={maxAfford}
                  disabled={maxAfford < 1}
                  lockText={maxAfford < 1 ? '💰' : undefined}
                  buyText={t('shop.buy')}
                  stockText={(n) => t('shop.stock', {n})}
                  onBuy={(qty) => onBuyFert(fert, qty)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
