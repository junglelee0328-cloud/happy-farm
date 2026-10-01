import type {Crop, Player} from '../types'
import {formatCountdown} from '../lib/growth'

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
  onGoHome,
  onToast,
}: Props) {
  if (visiting) {
    return (
      <footer className="hud-bottom">
        <div className="dock">
          <div className="dock-section visiting-section">
            <div className="dock-title">
              <span>🥷 做客模式</span>
              <i>好友的菜只能偷，不能动他的仓库</i>
            </div>
            <div className="tool-row">
              <button className="tool-btn" onClick={onGoHome}>
                <span className="tool-ico">🏠</span>
                <span>回我的农场</span>
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
            <span>🌾 种子包</span>
            <i>{selectedSeedId ? '点击空地即可播种' : '选一粒种子'}</i>
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
                      ? `Lv.${crop.minLevel} 解锁`
                      : `${crop.name} · 种子 ${crop.seedPrice}💰 · ${formatCountdown(crop.growTime)} · ${crop.exp}经验`
                  }
                >
                  <span className="seed-emoji">{crop.emoji ?? '🌱'}</span>
                  <span className="seed-name">{crop.name}</span>
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
            <span>🧰 工具箱</span>
            <i>一键操作</i>
          </div>
          <div className="tool-row">
            <button className="tool-btn" onClick={onOpenShop}>
              <span className="tool-ico">🛒</span>
              <span>商店</span>
            </button>
            <button className="tool-btn" onClick={onQuickHarvest} disabled={readyCount === 0}>
              <span className="tool-ico">🧺</span>
              <span>一键收获</span>
              {readyCount > 0 && <em className="dot">{readyCount}</em>}
            </button>
            <button className="tool-btn" onClick={onQuickWater} disabled={thirstyCount === 0}>
              <span className="tool-ico">🚿</span>
              <span>一键浇水</span>
              {thirstyCount > 0 && <em className="dot blue">{thirstyCount}</em>}
            </button>
            <button className="tool-btn" onClick={() => onToast('📦 仓库里堆着 0 件农产品，先种点东西吧～')}>
              <span className="tool-ico">📦</span>
              <span>仓库</span>
            </button>
            <button className="tool-btn" onClick={() => onToast('📋 任务系统：收获 3 次作物即可完成今日任务')}>
              <span className="tool-ico">📋</span>
              <span>任务</span>
            </button>
            <button className="tool-btn" onClick={onOpenFriends}>
              <span className="tool-ico">👥</span>
              <span>好友</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
