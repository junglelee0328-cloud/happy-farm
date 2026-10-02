import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'
import AuthGate from './auth/AuthGate.tsx'
import DevSprites from './DevSprites.tsx'

// 打开 http://localhost:5173/?sprites 可以查看全部作物美术资源（开发用）
const showSprites = new URLSearchParams(location.search).has('sprites')

// 配置了 VITE_CLERK_PUBLISHABLE_KEY 就走邮箱验证码登录；否则保持演示模式（可切换内置玩家）
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

const tree = showSprites ? (
  <DevSprites />
) : clerkKey ? (
  <ClerkProvider publishableKey={clerkKey}>
    <AuthGate>{(playerId) => <App forcedPlayerId={playerId} />}</AuthGate>
  </ClerkProvider>
) : (
  <App />
)

createRoot(document.getElementById('root')!).render(<StrictMode>{tree}</StrictMode>)
