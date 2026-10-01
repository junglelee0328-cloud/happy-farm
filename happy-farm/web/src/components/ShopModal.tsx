import {useState} from 'react'
import type {Crop, Player, Plot} from '../types'
import {formatCountdown} from '../lib/growth'

interface Props {
  plot: Plot | null
  crops: Crop[]
  player: Player
  onClose: () => void
  onPick: (crop: Crop) => void
}

export default function ShopModal({plot, crops, player, onClose, onPick}: Props) {
  const [tab, setTab] = useState<'all' | 'basic' | 'pro'>('all')
  const list = crops.filter((c) =>
    tab === 'all' ? true : tab === 'basic' ? c.minLevel <= 3 : c.minLevel > 3,
  )

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="shop" onClick={(e) => e.stopPropagation()}>
        <div className="shop-head">
          <h3>🏪 种子商店</h3>
          <span className="shop-sub">
            {plot ? `第 ${plot.index} 号地 · 选中种子立即播种` : '选中种子会种到第一块空地'}
          </span>
          <div className="shop-coins">
            💰 <b>{player.coins.toLocaleString()}</b>
          </div>
          <button className="shop-x" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="shop-tabs">
          {(
            [
              ['all', '全部种子'],
              ['basic', '🌱 新手区'],
              ['pro', '🌟 高级区'],
            ] as const
          ).map(([key, label]) => (
            <button key={key} className={`shop-tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="shop-grid">
          {list.map((crop) => {
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
                    <b>{crop.name}</b>
                    <i>{crop.description ?? '种子包'}</i>
                  </div>
                </div>
                <div className="seed-card-stats">
                  <span>⏱ {formatCountdown(crop.growTime)}</span>
                  <span>✨ {crop.exp} 经验</span>
                </div>
                <div className="seed-card-foot">
                  <span className="price">
                    <span className="coin-mini">🪙</span>
                    {crop.seedPrice}
                  </span>
                  <span className="profit">净赚 +{profit}</span>
                </div>
                {locked && <span className="lock-ribbon">🔒 Lv.{crop.minLevel} 解锁</span>}
                {!locked && poor && <span className="lock-ribbon poor">金币不足</span>}
              </button>
            )
          })}
        </div>

        <div className="shop-foot">
          💡 种下去之后别忘了浇水，生长速度会快 20%；成熟后 1 小时内不收就会枯萎哦。
        </div>
      </div>
    </div>
  )
}
