import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import DevSprites from './DevSprites.tsx'

// 打开 http://localhost:5173/?sprites 可以查看全部作物美术资源（开发用）
const showSprites = new URLSearchParams(location.search).has('sprites')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {showSprites ? <DevSprites /> : <App />}
  </StrictMode>,
)
