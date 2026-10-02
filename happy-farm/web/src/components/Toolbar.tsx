import type {Crop, Player} from '../types'
import {formatCountdown} from '../lib/growth'
import {lname, useT} from '../i18n'

interface Props {
  crops: Crop[]
  player: Player
  selectedSeedId: string
  readyCount: number
  thirstyCount: number
  visiting: boolean
  onSelectSeed: (id: string) => void
  onOpenShop: () => void
  onQuickHarvest: () => void
  onQuickWater: () => void
  onOpenFriends: () => void
  onOpenBag: () => void
  onGoHome: () => void
  onToast: (msg: string) => void
}

export default function Toolbar({
  crops,
  player,
  selectedSeedId,
  readyCount,
  thirstyCount,
  visiting,
  onSelectSeed,
  onOpenShop,
  onQuickHarvest,
  onQuickWater,
  onOpenFriends,
  onOpenBag,
  onGoHome,
  onToast,
}: Props) {
  const {t, lang} = useT()
  if (visiting) {
    return (
      <footer className="hud-bottom">
        <div className="dock">
          <div className="dock-section visiting-section">
            <div className="dock-title">
              <span>{t('dock.visiting')}</span>
              <i>{t('dock.visitingSub')}</i>
            </div>
            <div className="tool-row">
              <button className="tool-btn" onClick={onGoHome}>
                <span className="tool-ico">🏠</span>
                <span>{t('dock.goHome')}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="hud-bottom">
      <div className="dock">
        <div className="dock-section seed-section">
          <div className="dock-title">
            <span>{t('dock.seeds')}</span>
            <i>{selectedSeedId ? t('dock.seedsActive') : t('dock.seedsIdle')}</i>
          </div>
          <div className="seed-list">
            {crops.map((crop, i) => {
              const locked = player.level < crop.minLevel
              const poor = player.coins < crop.seedPrice
              const active = selectedSeedId === crop._id
              return (
                <button
                  key={crop._id}
                  className={`seed-chip ${active ? 'active' : ''} ${locked ? 'locked' : ''}`}
                  disabled={locked}
                  onClick={() => onSelectSeed(active ? '' : crop._id)}
                  title={
                    locked
                      ? t('shop.locked', {n: crop.minLevel})
                      : `${lname(crop, lang)} · ${crop.seedPrice}💰 · ${formatCountdown(crop.growTime)} · ${crop.exp}XP`
                  }
                >
                  <span className="seed-emoji">{crop.emoji ?? '🌱'}</span>
                  <span className="seed-name">{lname(crop, lang)}</span>
                  <span className={`seed-price ${poor && !locked ? 'poor' : ''}`}>
                    {locked ? `🔒${crop.minLevel}` : `${crop.seedPrice}`}
                  </span>
                  {i < 9 && <span className="seed-key">{i + 1}</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="dock-section tool-section">
          <div className="dock-title">
            <span>{t('dock.tools')}</span>
            <i>{t('dock.toolsSub')}</i>
          </div>
          <div className="tool-row">
            <button className="tool-btn" onClick={onOpenShop}>
              <span className="tool-ico">🛒</span>
              <span>{t('dock.shop')}</span>
            </button>
            <button className="tool-btn" onClick={onQuickHarvest} disabled={readyCount === 0}>
              <span className="tool-ico">🧺</span>
              <span>{t('dock.harvestAll')}</span>
              {readyCount > 0 && <em className="dot">{readyCount}</em>}
            </button>
            <button className="tool-btn" onClick={onQuickWater} disabled={thirstyCount === 0}>
              <span className="tool-ico">🚿</span>
              <span>{t('dock.waterAll')}</span>
              {thirstyCount > 0 && <em className="dot blue">{thirstyCount}</em>}
            </button>
            <button className="tool-btn" onClick={onOpenBag}>
              <span className="tool-ico">🎒</span>
              <span>{t('dock.bag')}</span>
            </button>
            <button className="tool-btn" onClick={() => onToast('📋 Tasks: harvest 3 times today!')}>
              <span className="tool-ico">📋</span>
              <span>{t('dock.tasks')}</span>
            </button>
            <button className="tool-btn" onClick={onOpenFriends}>
              <span className="tool-ico">👥</span>
              <span>{t('dock.friends')}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
