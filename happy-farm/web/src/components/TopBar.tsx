import type {Player} from '../types'
import {levelForXp} from '../lib/growth'
import {UserButton} from '@clerk/clerk-react'

interface Props {
  player: Player
  players: Player[]
  levelInfo: ReturnType<typeof levelForXp>
  readyCount: number
  stolenToday: number
  stolenLimit: number
  showSwitch?: boolean
  showUserButton?: boolean
  onSwitchPlayer: (id: string) => void
  onOpenShop: () => void
  onToast: (msg: string) => void
}

export default function TopBar({
  player,
  players,
  levelInfo,
  readyCount,
  stolenToday,
  stolenLimit,
  showSwitch = true,
  showUserButton = false,
  onSwitchPlayer,
  onOpenShop,
  onToast,
}: Props) {
  const pct = Math.max(0, Math.min(100, (player.xp / levelInfo.xpNeeded) * 100))
  return (
    <header className="hud-top">
      <section className="panel player-panel">
        <div className="avatar-wrap">
          <div className="avatar-ring">
            <span className="avatar">{player.avatar ?? '🧑‍🌾'}</span>
          </div>
          <span className="lv-badge">Lv.{levelInfo.level}</span>
        </div>
        <div className="player-info">
          <div className="name-row">
            <span className="nickname">{player.nickname}</span>
            <span className="role-tag">农场主</span>
            {showSwitch && players.length > 1 && (
              <select
                className="player-switch"
                value={player._id}
                onChange={(e) => onSwitchPlayer(e.target.value)}
                title="切换玩家"
              >
                {players.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nickname}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="farm-name">{player.farmName ?? '我的开心农场'}</div>
          <div className="xp-row">
            <div className="xp-bar">
              <div className="xp-fill" style={{width: `${pct}%`}} />
              <span className="xp-text">
                {player.xp} / {levelInfo.xpNeeded}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel status-panel">
        <div className="status-item">
          <span className="status-ico">🌤️</span>
          <div>
            <b>晴朗</b>
            <i>适合种地</i>
          </div>
        </div>
        <div className="status-item">
          <span className="status-ico">🧺</span>
          <div>
            <b>{readyCount} 块可收</b>
            <i>点一下就能收</i>
          </div>
        </div>
        <div className="status-item">
          <span className="status-ico">🐾</span>
          <div>
            <b>
              {stolenToday} / {stolenLimit}
            </b>
            <i>今日偷菜</i>
          </div>
        </div>
      </section>

      <section className="panel wallet-panel">
        <button className="wallet coin" onClick={onOpenShop} title="去商店买种子">
          <span className="wallet-ico">💰</span>
          <b>{player.coins.toLocaleString()}</b>
          <span className="wallet-plus">+</span>
        </button>
        <div className="wallet gem" title="元宝（演示数据）">
          <span className="wallet-ico">💎</span>
          <b>{Math.floor(player.coins / 50)}</b>
        </div>
        <button className="icon-btn" onClick={() => onToast('⚙️ 设置面板还在施工中～')} title="设置">
          ⚙️
        </button>
        <button className="icon-btn" onClick={() => onToast('📖 玩法说明：浇水加速 · 除草除虫 · 成熟快收')} title="帮助">
          ❔
        </button>
        {showUserButton && <UserButton afterSignOutUrl="/" />}
      </section>
    </header>
  )
}
