import type {Crop, Player} from '../types'
import {formatCountdown} from '../lib/growth'
import {lname, useT} from '../i18n'

interface Props {
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
            {(() => {
              const seedItems = (player.inventory ?? []).filter((e) => e.item && e.item._type === 'crop' && e.count > 0)
              if (seedItems.length === 0) {
                return (
                  <button className="seed-chip empty-hint" onClick={onOpenShop}>
                    <span className="seed-emoji">🌱</span>
                    <span className="seed-name">{t('dock.noSeeds')}</span>
                  </button>
                )
              }
              return seedItems.map((entry, i) => {
                const crop = entry.item as Crop
                const active = selectedSeedId === crop._id
                return (
                  <button
                    key={entry._key ?? crop._id}
                    className={`seed-chip ${active ? 'active' : ''}`}
                    onClick={() => onSelectSeed(active ? '' : crop._id)}
                    title={`${lname(crop, lang)} · ${formatCountdown(crop.growTime)} · ${crop.exp}XP`}
                  >
                    <span className="seed-emoji">{crop.emoji ?? '🌱'}</span>
                    <span className="seed-name">{lname(crop, lang)}</span>
                    <span className="seed-price">×{entry.count}</span>
                    {i < 9 && <span className="seed-key">{i + 1}</span>}
                  </button>
                )
              })
            })()}
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
