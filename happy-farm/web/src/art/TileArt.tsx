import {round} from '../lib/iso'

/** 地块内缩量：留出缝隙，相邻土地之间能看到草地 */
const W = 83
const H = 41.5
/** 土块厚度（像素） */
export const SOIL_DEPTH = 16

function diamond(x: number, y: number, w = W, h = H) {
  return `${round(x)},${round(y - h)} ${round(x + w)},${round(y)} ${round(x)},${round(y + h)} ${round(x - w)},${round(y)}`
}

/** 一块土的「侧面」，让它看起来是有厚度的垄台 */
function SoilSides({x, y}: {x: number; y: number}) {
  return (
    <g>
      <polygon
        points={`${round(x - W)},${round(y)} ${round(x)},${round(y + H)} ${round(x)},${round(y + H + SOIL_DEPTH)} ${round(x - W)},${round(y + SOIL_DEPTH)}`}
        fill="#5f3a1d"
      />
      <polygon
        points={`${round(x)},${round(y + H)} ${round(x + W)},${round(y)} ${round(x + W)},${round(y + SOIL_DEPTH)} ${round(x)},${round(y + H + SOIL_DEPTH)}`}
        fill="#7a4c26"
      />
      <polygon
        points={`${round(x - W)},${round(y)} ${round(x)},${round(y + H)} ${round(x + W)},${round(y)} ${round(x + W - 3)},${round(y + 2.4)} ${round(x)},${round(y + H + 3)} ${round(x - W + 3)},${round(y + 2.4)}`}
        fill="#4a2c14"
        opacity=".55"
      />
    </g>
  )
}

interface RidgeProps {
  x: number
  y: number
  seed: number
}

/** 犁沟：沿 e1 方向的隆起土垄 */
function Ridges({x, y, seed}: RidgeProps) {
  const rows = [-0.62, -0.31, 0, 0.31, 0.62]
  return (
    <g>
      {rows.map((b, i) => {
        const half = (1 - Math.abs(b)) * 0.94
        const wob = ((seed * (i + 3)) % 5) * 0.01
        const a0 = -half + wob
        const a1 = half + wob
        const p0 = {x: x + (a0 + b) * W, y: y + (a0 - b) * H}
        const p1 = {x: x + (a1 + b) * W, y: y + (a1 - b) * H}
        const d = `M${round(p0.x)} ${round(p0.y)} L${round(p1.x)} ${round(p1.y)}`
        return (
          <g key={b}>
            <path d={d} stroke="#6b4223" strokeWidth={6.4} fill="none" strokeLinecap="round" opacity=".85" />
            <path d={d} stroke="#a06e3d" strokeWidth={4.6} fill="none" strokeLinecap="round" transform="translate(0 -2)" />
            <path
              d={d}
              stroke="#c08b52"
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
              transform="translate(0 -3.4)"
              opacity=".9"
            />
          </g>
        )
      })}
    </g>
  )
}

/** 杂草丛 */
export function WeedTuft({x, y, scale = 1}: {x: number; y: number; scale?: number}) {
  const blades = [
    {a: -32, l: 17},
    {a: -11, l: 22},
    {a: 9, l: 20},
    {a: 30, l: 16},
    {a: 52, l: 12},
  ]
  return (
    <g transform={`translate(${round(x)} ${round(y)}) scale(${round(scale)})`}>
      <ellipse cx="0" cy="1" rx="13" ry="4.6" fill="#2f4a12" opacity=".28" />
      {blades.map((b, i) => (
        <g key={i} transform={`rotate(${b.a})`}>
          <path
            d={`M0 0 Q ${b.l * 0.32} ${-b.l * 0.6} ${b.l * 0.42} ${-b.l}`}
            stroke={i % 2 ? '#7cc23a' : '#5da42c'}
            strokeWidth={4.2}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M0 0 Q ${b.l * 0.32} ${-b.l * 0.6} ${b.l * 0.42} ${-b.l}`}
            stroke="#a8e06b"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
            opacity=".7"
          />
        </g>
      ))}
    </g>
  )
}

/** 小青虫 */
function Bug({x, y}: {x: number; y: number}) {
  return (
    <g transform={`translate(${round(x)} ${round(y)})`}>
      <ellipse cx="0" cy="4" rx="11" ry="3.4" fill="#2f4a12" opacity=".25" />
      {[
        {cx: -7, cy: 0, r: 3.6},
        {cx: -2.4, cy: -2, r: 4},
        {cx: 2.6, cy: -2.4, r: 4},
        {cx: 7.4, cy: -1, r: 3.6},
        {cx: 11.2, cy: 1, r: 3.2},
      ].map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={i % 2 ? '#8ed04a' : '#79bf38'} stroke="#4f8a24" strokeWidth=".8" />
      ))}
      <circle cx="-10.4" cy="-2.4" r="1.5" fill="#1e2a10" />
      <circle cx="-9.6" cy="-3.4" r="1.3" fill="#1e2a10" />
    </g>
  )
}

/** 成熟时的金色星星 */
function Sparkles({x, y, seed}: {x: number; y: number; seed: number}) {
  const pts = [
    {dx: -58, dy: -30, s: 6},
    {dx: 54, dy: -22, s: 5},
    {dx: -30, dy: -62, s: 4.5},
    {dx: 34, dy: -66, s: 5.5},
  ]
  return (
    <g className="sparkle">
      {pts.map((p, i) => (
        <g key={i} transform={`translate(${round(x + p.dx + ((seed + i) % 3) * 3)} ${round(y + p.dy)}) scale(${round(p.s)})`}>
          <path
            className="twinkle"
            d="M0 -1 L1.6 -0.4 L0 0.6 L-1.6 -0.4 Z"
            fill="#ffe98a"
            style={{animationDelay: `${(i * 0.4 + (seed % 5) * 0.17).toFixed(2)}s`}}
          />
        </g>
      ))}
    </g>
  )
}

function Pebbles({x, y, seed}: {x: number; y: number; seed: number}) {
  const list = [
    {a: -0.42, b: 0.1, r: 3.2},
    {a: 0.28, b: -0.24, r: 2.6},
    {a: 0.05, b: 0.44, r: 2.2},
  ]
  return (
    <g>
      {list.map((p, i) => {
        const cx = x + (p.a + p.b) * W
        const cy = y + (p.a - p.b) * H
        return (
          <ellipse
            key={i}
            cx={round(cx)}
            cy={round(cy)}
            rx={p.r + ((seed + i) % 3) * 0.3}
            ry={(p.r + ((seed + i) % 3) * 0.3) * 0.62}
            fill="#b7a184"
            opacity=".75"
          />
        )
      })}
    </g>
  )
}

export function SoilTile({
  x,
  y,
  seed,
  state,
  watered,
  tier = 'normal',
}: {
  x: number
  y: number
  seed: number
  state: 'empty' | 'growing' | 'ready' | 'withered'
  watered?: boolean
  tier?: 'normal' | 'red' | 'black'
}) {
  const dry = state === 'withered'
  const palettes = {
    normal: {top: '#96653a', rim: '#b1804e'},
    red: {top: '#a04a30', rim: '#c4714e'},
    black: {top: '#453a30', rim: '#6e5f4e'},
  } as const
  const pal = palettes[tier]
  const top = watered ? '#7a5530' : dry ? '#8b7a63' : pal.top
  const rimLight = watered ? '#8f6a41' : dry ? '#a49a86' : pal.rim
  return (
    <g>
      <SoilSides x={x} y={y} />
      <polygon points={diamond(x, y)} fill={top} />
      <polygon points={diamond(x, y)} fill="url(#soil-shade)" opacity={dry ? 0.5 : 0.85} />
      <Ridges x={x} y={y} seed={seed} />
      {state === 'empty' && <Pebbles x={x} y={y} seed={seed} />}
      {watered && (
        <g opacity=".5">
          {[
            {a: -0.3, b: 0.16},
            {a: 0.2, b: -0.1},
            {a: 0.44, b: 0.3},
          ].map((p, i) => (
            <ellipse
              key={i}
              cx={round(x + (p.a + p.b) * W)}
              cy={round(y + (p.a - p.b) * H)}
              rx="8"
              ry="3"
              fill="#bfe6ff"
            />
          ))}
        </g>
      )}
      <polygon
        points={diamond(x, y)}
        fill="none"
        stroke={rimLight}
        strokeWidth="1.4"
        opacity=".55"
      />
      <polygon
        points={`${round(x)},${round(y - H + 1.5)} ${round(x + W - 1.5)},${round(y)} ${round(x)},${round(y + H - 1.5)} ${round(x - W + 1.5)},${round(y)}`}
        fill="none"
        stroke="#5a3517"
        strokeWidth="1.6"
        opacity=".45"
      />
      {state === 'ready' && <Sparkles x={x} y={y} seed={seed} />}
    </g>
  )
}

/** 未解锁的土地：长满草的土包 + 木牌 */
export function LockedTile({level, tier = 'normal'}: {level: number; tier?: 'normal' | 'red' | 'black'}) {
  const tierMark = tier === 'red' ? '红土 ' : tier === 'black' ? '黑土 ' : ''
  return (
    <g>
      <polygon
        points={`${round(-W)},0 ${round(0)},${round(H)} ${round(0)},${round(H + 10)} ${round(-W)},10`}
        fill="#4c7434"
      />
      <polygon
        points={`${round(0)},${round(H)} ${round(W)},0 ${round(W)},10 ${round(0)},${round(H + 10)}`}
        fill="#5d8a41"
      />
      <polygon points={diamond(0, 0)} fill="#79ab55" />
      <polygon points={diamond(0, 0)} fill="url(#grass-shade)" opacity=".7" />
      {[
        {a: -0.34, b: 0.2, s: 0.9},
        {a: 0.16, b: -0.3, s: 1.0},
        {a: 0.34, b: 0.34, s: 0.8},
        {a: -0.1, b: -0.05, s: 1.1},
      ].map((p, i) => (
        <WeedTuft
          key={i}
          x={(p.a + p.b) * W}
          y={(p.a - p.b) * H - 3}
          scale={p.s * 0.9}
        />
      ))}
      <g transform="translate(0 -30)">
        <rect x="-3" y="-6" width="6" height="34" fill="#8a6234" />
        <rect x="-3" y="-6" width="2" height="34" fill="#a97c47" />
        <rect x="-30" y="-30" width="60" height="27" rx="4" fill="#d9b071" stroke="#7a4f22" strokeWidth="2" />
        <rect x="-26" y="-26" width="52" height="19" rx="2" fill="#f0d9a8" opacity=".55" />
        <text
          x="0"
          y="-12"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#5b3a17"
          style={{fontFamily: 'inherit'}}
        >
          🔒 {tierMark}Lv.{level}
        </text>
      </g>
    </g>
  )
}

export function WeedOverlay({x, y}: {x: number; y: number}) {
  return (
    <g>
      <WeedTuft x={x - 24} y={y + 6} scale={1.1} />
      <WeedTuft x={x + 26} y={y + 2} scale={0.95} />
      <WeedTuft x={x + 4} y={y + 20} scale={0.85} />
    </g>
  )
}

export function BugOverlay({x, y}: {x: number; y: number}) {
  return <Bug x={x + 6} y={y + 14} />
}
