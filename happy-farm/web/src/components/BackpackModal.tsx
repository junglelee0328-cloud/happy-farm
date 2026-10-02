import type {Player} from '../types'
import type {Fertilizer} from '../types'
import {lname, useT} from '../i18n'

interface Props {
  player: Player
  onClose: () => void
  /** 选中某个化肥进入「点地使用」模式 */
  onUse: (fert: Fertilizer) => void
}

export default function BackpackModal({player, onClose, onUse}: Props) {
  const {t, lang} = useT()
  const items = (player.inventory ?? []).filter((i) => i.item && i.count > 0)

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal friend-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{t('bag.title')}</h3>
          <span className="modal-sub">{t('bag.sub')}</span>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="friend-list">
          {items.length === 0 && <p className="friend-empty">{t('bag.empty')}</p>}
          {items.map((entry) => {
            const fert = entry.item!
            return (
              <div key={fert._id} className="friend-item bag-item">
                <span className="friend-avatar">{fert.emoji ?? '🧪'}</span>
                <span className="friend-info">
                  <b>{lname(fert, lang)}</b>
                  <i>
                    ⏩ +{Math.round(fert.speedBoost * 100)}%
                    {fert.yieldBoost > 0 ? ` · 💰 +${Math.round(fert.yieldBoost * 100)}%` : ''}
                  </i>
                </span>
                <span className="bag-count">{t('bag.count', {n: entry.count})}</span>
                <button className="friend-go" onClick={() => onUse(fert)}>{t('bag.use')}</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
