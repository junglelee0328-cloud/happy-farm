import type {Player} from '../types'
import {useT} from '../i18n'

interface Props {
  friends: Player[]
  onClose: () => void
  onVisit: (friend: Player) => void
}

export default function FriendModal({friends, onClose, onVisit}: Props) {
  const {t} = useT()
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal friend-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{t('friend.title')}</h3>
          <span className="modal-sub">{t('friend.sub')}</span>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="friend-list">
          {friends.length === 0 && <p className="friend-empty">{t('friend.empty')}</p>}
          {friends.map((f) => (
            <button key={f._id} className="friend-item" onClick={() => onVisit(f)}>
              <span className="friend-avatar">{f.avatar ?? '🧑‍🌾'}</span>
              <span className="friend-info">
                <b>{f.nickname}</b>
                <i>{f.farmName ?? t('friend.farmDefault')} · Lv.{f.level}</i>
              </span>
              <span className="friend-go">{t('friend.visit')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
