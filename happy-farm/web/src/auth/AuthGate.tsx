import {useEffect, useState} from 'react'
import {SignedIn, SignedOut, SignIn, useUser} from '@clerk/clerk-react'
import {client} from '../lib/sanity'
import {useT} from '../i18n'

const AVATARS = ['🧑‍🌾', '👨‍🌾', '👩‍🌾', '🧑‍🌻', '🐮', '🐰', '🐥', '🦊']

/** 土地三级阈值：普通 Lv.25 开满 → 红土 Lv.60 → 黑土 Lv.100 */
const plotLevels = (i: number) => ({
  unlockLevel: 1 + Math.round(((i - 1) * 24) / 23),
  redLevel: 26 + Math.round(((i - 1) * 34) / 23),
  blackLevel: 61 + Math.round(((i - 1) * 39) / 23),
})

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
      ...plotLevels(i),
      owner: {_type: 'reference', _ref: playerId},
      status: 'empty',
    })
  }
  await tx.commit()
  return playerId
}

export default function AuthGate({children}: {children: (playerId: string) => React.ReactNode}) {
  const {t} = useT()
  return (
    <>
      <SignedOut>
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-logo">🌻</div>
            <h1>{t('auth.title')}</h1>
            <p>{t('auth.slogan')}</p>
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
  const {t} = useT()
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

  if (error) return <div className="loading">{t('loading.bootstrapFail', {msg: error})}</div>
  if (!playerId) return <div className="loading">{t('loading.prepare')}</div>
  return <>{children(playerId)}</>
}
