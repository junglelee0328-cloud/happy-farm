import {useEffect, useState} from 'react'
import {SignedIn, SignedOut, SignIn, useUser} from '@clerk/clerk-react'
import {client} from '../lib/sanity'

const AVATARS = ['🧑‍🌾', '👨‍🌾', '👩‍🌾', '🧑‍🌻', '🐮', '🐰', '🐥', '🦊']

/** 和 Studio 种子数据一致的土地解锁规则 */
const unlockLevel = (i: number) => (i <= 6 ? 1 : Math.floor((i - 7) / 2) + 2)

/**
 * 首次登录时建档：创建玩家文档 + 24 块地。
 * authId（Clerk user id）是玩家和登录账号的唯一关联。
 */
async function ensurePlayer(userId: string, nickname: string): Promise<string> {
  const existing = await client.fetch<{_id: string} | null>('*[_type == "player" && authId == $uid][0]{_id}', {uid: userId})
  if (existing) return existing._id

  const playerId = `player-${userId.replace(/[^a-zA-Z0-9]/g, '_')}`
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]
  const tx = client.transaction()
  tx.createIfNotExists({
    _id: playerId,
    _type: 'player',
    authId: userId,
    nickname,
    avatar,
    farmName: `${nickname}的农场`,
    level: 1,
    xp: 0,
    coins: 200,
    stolenToday: 0,
  })
  for (let i = 1; i <= 24; i++) {
    tx.createIfNotExists({
      _id: `${playerId}-plot-${i}`,
      _type: 'plot',
      index: i,
      unlockLevel: unlockLevel(i),
      owner: {_type: 'reference', _ref: playerId},
      status: 'empty',
    })
  }
  await tx.commit()
  return playerId
}

export default function AuthGate({children}: {children: (playerId: string) => React.ReactNode}) {
  return (
    <>
      <SignedOut>
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-logo">🌻</div>
            <h1>开心农场</h1>
            <p>种菜 · 浇水 · 偷好友的菜</p>
            <SignIn routing="hash" />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <Bootstrap>{children}</Bootstrap>
      </SignedIn>
    </>
  )
}

function Bootstrap({children}: {children: (playerId: string) => React.ReactNode}) {
  const {user, isLoaded} = useUser()
  const [playerId, setPlayerId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded || !user) return
    const nickname =
      user.fullName || user.primaryEmailAddress?.emailAddress.split('@')[0] || '新农夫'
    ensurePlayer(user.id, nickname)
      .then(setPlayerId)
      .catch((e) => setError(String(e?.message ?? e)))
  }, [isLoaded, user])

  if (error) return <div className="loading">😵 建档失败：{error}</div>
  if (!playerId) return <div className="loading">🌻 正在准备你的农场…</div>
  return <>{children(playerId)}</>
}
