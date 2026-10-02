import {useState} from 'react'
import type {Crop, Fertilizer, Player, Plot} from '../types'
import {formatCountdown} from '../lib/growth'
import {lname, useT} from '../i18n'

interface Props {
  plot: Plot | null
  crops: Crop[]
  fertilizers: Fertilizer[]
  player: Player
  onClose: () => void
  onPick: (crop: Crop) => void
  onBuyFert: (fert: Fertilizer) => void
}

export default function ShopModal({plot, crops, fertilizers, player, onClose, onPick, onBuyFert}: Props) {
  const {t, lang} = useT()
  const [tab, setTab] = useState<'seeds' | 'ferts'>('seeds')

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="shop" onClick={(e) => e.stopPropagation()}>
        <div className="shop-head">
          <h3>{tab === 'seeds' ? t('shop.title') : t('shop.titleFert')}</h3>
          <span className="shop-sub">
            {plot && tab === 'seeds' ? t('shop.sub', {n: plot.index, coins: player.coins}) : t('shop.subGeneral')}
          </span>
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
              const poor = player.coins < crop.seedPrice
              const disabled = locked || poor
              const profit = crop.sellPrice - crop.seedPrice
              return (
                <button
                  key={crop._id}
                  className={`seed-card ${disabled ? 'disabled' : ''}`}
                  disabled={disabled}
                  onClick={() => onPick(crop)}
                >
                  <div className="seed-card-top">
                    <span className="seed-card-emoji">{crop.emoji ?? '🌱'}</span>
                    <div className="seed-card-name">
                      <b>{lname(crop, lang)}</b>
                      <i>{crop.description ?? ''}</i>
                    </div>
                  </div>
                  <div className="seed-card-stats">
                    <span>⏱ {formatCountdown(crop.growTime)}</span>
                    <span>✨ {crop.exp} XP</span>
                  </div>
                  <div className="seed-card-foot">
                    <span className="price">
                      <span className="coin-mini">🪙</span>
                      {crop.seedPrice}
                    </span>
                    <span className="profit">+{profit}</span>
                  </div>
                  {locked && <span className="lock-ribbon">{t('shop.locked', {n: crop.minLevel})}</span>}
                  {!locked && poor && <span className="lock-ribbon poor">💰</span>}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="shop-grid">
            {fertilizers.map((fert) => {
              const poor = player.coins < fert.price
              return (
                <button
                  key={fert._id}
                  className={`seed-card ${poor ? 'disabled' : ''}`}
                  disabled={poor}
                  onClick={() => onBuyFert(fert)}
                >
                  <div className="seed-card-top">
                    <span className="seed-card-emoji">{fert.emoji ?? '🧪'}</span>
                    <div className="seed-card-name">
                      <b>{lname(fert, lang)}</b>
                      <i>{fert.description ?? ''}</i>
                    </div>
                  </div>
                  <div className="seed-card-stats">
                    <span>⏩ +{Math.round(fert.speedBoost * 100)}%</span>
                    {fert.yieldBoost > 0 && <span>💰 +{Math.round(fert.yieldBoost * 100)}%</span>}
                  </div>
                  <div className="seed-card-foot">
                    <span className="price">
                      <span className="coin-mini">🪙</span>
                      {fert.price}
                    </span>
                    <span className="profit">{t('shop.bought')}</span>
                  </div>
                  {poor && <span className="lock-ribbon poor">💰</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
