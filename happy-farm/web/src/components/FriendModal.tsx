import type {Player} from '../types'

interface Props {
  friends: Player[]
  onClose: () => void
  onVisit: (friend: Player) => void
}

export default function FriendModal({friends, onClose, onVisit}: Props) {
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal friend-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>👥 好友列表</h3>
          <span className="modal-sub">去他们的农场偷菜 · 也可以帮忙浇水除草</span>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="friend-list">
          {friends.length === 0 && <p className="friend-empty">还没有好友，去 Studio 里再创建一个玩家吧</p>}
          {friends.map((f) => (
            <button key={f._id} className="friend-item" onClick={() => onVisit(f)}>
              <span className="friend-avatar">{f.avatar ?? '🧑‍🌾'}</span>
              <span className="friend-info">
                <b>{f.nickname}</b>
                <i>{f.farmName ?? '无名农场'} · Lv.{f.level}</i>
              </span>
              <span className="friend-go">去串门 🥷</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
