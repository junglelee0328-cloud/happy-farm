import type {Player} from '../types'
import {levelForXp} from '../lib/growth'
import {UserButton} from '@clerk/clerk-react'
import {useT} from '../i18n'

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
  const {t, lang, setLang} = useT()
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
            <span className="role-tag">{t('hud.role')}</span>
            {showSwitch && players.length > 1 && (
              <select
                className="player-switch"
                value={player._id}
                onChange={(e) => onSwitchPlayer(e.target.value)}
                title={t('hud.switchPlayer')}
              >
                {players.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nickname}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="farm-name">{player.farmName ?? t('hud.farmDefault')}</div>
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
            <b>{t('hud.weather')}</b>
            <i>{t('hud.weatherSub')}</i>
          </div>
        </div>
        <div className="status-item">
          <span className="status-ico">🧺</span>
          <div>
            <b>{t('hud.ready', {n: readyCount})}</b>
            <i>{t('hud.readySub')}</i>
          </div>
        </div>
        <div className="status-item">
          <span className="status-ico">🐾</span>
          <div>
            <b>
              {stolenToday} / {stolenLimit}
            </b>
            <i>{t('hud.stealToday')}</i>
          </div>
        </div>
      </section>

      <section className="panel wallet-panel">
        <button className="wallet coin" onClick={onOpenShop} title={t('hud.shopTitle')}>
          <span className="wallet-ico">💰</span>
          <b>{player.coins.toLocaleString()}</b>
          <span className="wallet-plus">+</span>
        </button>
        <div className="wallet gem" title={t('hud.gem')}>
          <span className="wallet-ico">💎</span>
          <b>{Math.floor(player.coins / 50)}</b>
        </div>
        <button
          className="icon-btn"
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          title="中 / EN"
        >
          🌐
        </button>
        <button className="icon-btn" onClick={() => onToast('⚙️ Settings coming soon~')} title={t('hud.settings')}>
          ⚙️
        </button>
        <button className="icon-btn" onClick={() => onToast('📖 ' + t('hint.idle'))} title={t('hud.help')}>
          ❔
        </button>
        {showUserButton && <UserButton afterSignOutUrl="/" />}
      </section>
    </header>
  )
}
