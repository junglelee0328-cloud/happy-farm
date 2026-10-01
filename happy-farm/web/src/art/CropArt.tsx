import type {ReactElement} from 'react'
import {round} from '../lib/iso'

export type Stage = 0 | 1 | 2 | 3 | 4

interface LeafProps {
  len: number
  wide: number
  angle: number
  fill: string
  vein: string
  x?: number
  y?: number
  droop?: number
}

/** 一片带中脉的尖叶，从原点朝 +x 方向伸展，再整体旋转 angle 度 */
function Leaf({len, wide, angle, fill, vein, x = 0, y = 0, droop = 0}: LeafProps) {
  const l = round(len)
  const w = round(wide)
  return (
    <g transform={`translate(${round(x)} ${round(y)}) rotate(${round(angle)})`}>
      <path
        d={`M0 0 C ${l * 0.18} ${-w} ${l * 0.72} ${-w * 0.9} ${l} ${droop} C ${l * 0.72} ${w * 0.9} ${l * 0.18} ${w} 0 0 Z`}
        fill={fill}
      />
      <path
        d={`M${l * 0.08} 0 Q ${l * 0.5} ${droop * 0.35} ${l * 0.9} ${droop * 0.8}`}
        stroke={vein}
        strokeWidth={Math.max(0.7, l * 0.035)}
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
    </g>
  )
}

function Shadow({rx, ry, y = 2, opacity = 0.22}: {rx: number; ry: number; y?: number; opacity?: number}) {
  return <ellipse cx="0" cy={y} rx={round(rx)} ry={round(ry)} fill="#2c3a12" opacity={opacity} />
}

function Seedling({scale, green, dark}: {scale: number; green: string; dark: string}) {
  const k = scale
  return (
    <g transform={`scale(${round(k)})`}>
      <path d="M0 2 C 0 -4 0 -9 0 -13" stroke={dark} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Leaf len={13} wide={7.5} angle={-150} fill={green} vein={dark} y={-11} />
      <Leaf len={13} wide={7.5} angle={-30} fill={green} vein={dark} y={-11} />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 白萝卜：贴地的圆叶丛 + 露头的白色萝卜                              */
/* ------------------------------------------------------------------ */
function Radish({stage}: {stage: Stage}) {
  const size = [0, 0.34, 0.6, 0.84, 1][stage]
  if (stage === 0) return <Seedling scale={0.55} green="#8fd45f" dark="#4e8f2f" />
  const leafGrad = {fill: '#7cc94b', vein: '#3f7f27'}
  const leaves = [
    {a: -78, l: 40},
    {a: -46, l: 47},
    {a: -8, l: 50},
    {a: 34, l: 47},
    {a: 74, l: 40},
  ]
  return (
    <g transform={`scale(${round(size)})`}>
      <Shadow rx={26} ry={9} />
      {leaves.map((lf, i) => (
        <Leaf
          key={i}
          len={lf.l}
          wide={14}
          angle={lf.a}
          fill={i % 2 ? '#6fbf41' : leafGrad.fill}
          vein={leafGrad.vein}
          y={-5}
        />
      ))}
      <Leaf len={26} wide={10} angle={-120} fill="#5fae37" vein="#3f7f27" y={-6} />
      <Leaf len={26} wide={10} angle={-55} fill="#5fae37" vein="#3f7f27" y={-7} />
      {/* 白萝卜：露出半截白白的萝卜肩，是这一作物的标志 */}
      {stage >= 3 && (
        <g>
          <path d="M-19 -3 Q 0 -19 19 -3 Q 15 11 0 12 Q -15 11 -19 -3 Z" fill="#f7faf0" />
          <path d="M-19 -3 Q 0 -19 19 -3 Q 11 -6 0 -6.5 Q -11 -6 -19 -3 Z" fill="#dbe7bd" opacity=".95" />
          <path d="M-6 -4 Q 0 -9 6 -4" stroke="#c6d6a6" strokeWidth="1.2" fill="none" />
          <path d="M-13 6 Q 0 10 13 6" stroke="#d5e0bd" strokeWidth="1.1" fill="none" opacity=".8" />
          <ellipse cx="-7" cy="-1" rx="4.5" ry="3" fill="#ffffff" opacity=".75" />
          <g stroke="#e6eccf" strokeWidth="1.4" fill="none" strokeLinecap="round">
            <path d="M-8 12 Q -10 18 -14 21" />
            <path d="M8 12 Q 11 18 15 20" />
          </g>
        </g>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 胡萝卜：羽状细叶 + 露肩的橙色根                                    */
/* ------------------------------------------------------------------ */
function Carrot({stage}: {stage: Stage}) {
  const size = [0, 0.34, 0.6, 0.85, 1][stage]
  if (stage === 0) return <Seedling scale={0.5} green="#95d968" dark="#4e8f2f" />
  const fronds = [
    {a: -84, l: 44},
    {a: -58, l: 54},
    {a: -30, l: 58},
    {a: -2, l: 60},
    {a: 26, l: 58},
    {a: 54, l: 54},
    {a: 82, l: 44},
  ]
  return (
    <g transform={`scale(${round(size)})`}>
      <Shadow rx={25} ry={9} />
      {fronds.map((f, i) => (
        <g key={i}>
          <Leaf len={f.l} wide={4.6} angle={f.a} fill={i % 2 ? '#5fae3c' : '#77c452'} vein="#3f8a2a" y={-4} />
          <Leaf len={f.l * 0.7} wide={3.6} angle={f.a + 16} fill="#6cbb46" vein="#3f8a2a" y={-4} />
          <Leaf len={f.l * 0.7} wide={3.6} angle={f.a - 16} fill="#6cbb46" vein="#3f8a2a" y={-4} />
        </g>
      ))}
      {/* 胡萝卜：露出一对橙色萝卜肩 */}
      {stage >= 3 && (
        <g>
          <ellipse cx="-12" cy="-1" rx="10" ry="7" fill="#f98d1e" />
          <ellipse cx="12" cy="-1" rx="10" ry="7" fill="#f98d1e" />
          <ellipse cx="-12" cy="-1" rx="10" ry="7" fill="none" stroke="#d9700c" strokeWidth="1.1" />
          <ellipse cx="12" cy="-1" rx="10" ry="7" fill="none" stroke="#d9700c" strokeWidth="1.1" />
          <ellipse cx="-14" cy="-3.5" rx="5.6" ry="3.4" fill="#ffc978" opacity=".9" />
          <ellipse cx="10" cy="-3.5" rx="5.6" ry="3.4" fill="#ffc978" opacity=".9" />
          <g stroke="#e07d10" strokeWidth="1.1" fill="none" opacity=".7">
            <path d="M-17 3 Q -14 6 -16 9" />
            <path d="M7 3 Q 10 6 8 9" />
          </g>
        </g>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 玉米：高秆 + 长披叶 + 金棒子                                      */
/* ------------------------------------------------------------------ */
function Corn({stage}: {stage: Stage}) {
  const size = [0, 0.28, 0.52, 0.8, 1][stage]
  const h = 100 * size + (stage === 0 ? 0 : 14)
  if (stage === 0) return <Seedling scale={0.6} green="#8ed05c" dark="#47852b" />
  const tier = (n: number) => [
    {y: -h * 0.34, a: -52, l: 58},
    {y: -h * 0.46, a: 48, l: 56},
    {y: -h * 0.58, a: -46, l: 52},
    {y: -h * 0.7, a: 42, l: 48},
    {y: -h * 0.82, a: -40, l: 42},
  ].slice(0, n)
  const leaves = tier(stage === 1 ? 2 : stage === 2 ? 3 : 5)
  return (
    <g transform={`scale(${round(size * 0.55 + 0.45)})`}>
      <Shadow rx={22} ry={8} />
      <path
        d={`M0 4 C -3 ${-h * 0.4} -1 ${-h * 0.75} 2 ${-h}`}
        stroke="#4d9430"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M0 4 C -3 ${-h * 0.4} -1 ${-h * 0.75} 2 ${-h}`}
        stroke="#6cb843"
        strokeWidth="4.4"
        fill="none"
        strokeLinecap="round"
      />
      {leaves.map((lf, i) => (
        <Leaf
          key={i}
          len={lf.l}
          wide={10}
          angle={lf.a}
          fill={i % 2 ? '#5aa834' : '#6fc247'}
          vein="#37701f"
          y={lf.y}
          droop={lf.a < 0 ? -12 : 12}
        />
      ))}
      {stage >= 3 && (
        <g transform="translate(9 -44)">
          <path d="M-9 6 Q -18 -12 -6 -26 Q 4 -20 2 -2 Q -2 8 -9 6 Z" fill="#7cc84a" />
          <path d="M9 4 Q 20 -10 8 -24 Q -2 -16 -1 0 Q 2 8 9 4 Z" fill="#6bbb3d" />
          <ellipse cx="0" cy="-10" rx="9" ry="17" fill="#f7cf45" />
          <ellipse cx="0" cy="-10" rx="9" ry="17" fill="none" stroke="#d9a71f" strokeWidth="1" />
          {[-18, -12, -6, 0, 6].map((ky) => (
            <path
              key={ky}
              d={`M-7 ${ky} L7 ${ky - 4}`}
              stroke="#e0b02a"
              strokeWidth="1.1"
              opacity=".8"
            />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M-6 ${-22 + i * 7} Q 0 ${-26 + i * 7} 6 ${-22 + i * 7}`}
              stroke="#d9a71f"
              strokeWidth="1"
              fill="none"
              opacity=".7"
            />
          ))}
          {stage >= 4 && (
            <g opacity=".95">
              {[-5, 0, 5].map((tx, i) => (
                <path
                  key={tx}
                  d={`M${tx} -26 Q ${tx - 5 + i * 4} -40 ${tx - 9 + i * 7} -46`}
                  stroke="#eccb63"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            </g>
          )}
        </g>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 草莓：贴地圆叶丛 + 白花 + 红果                                     */
/* ------------------------------------------------------------------ */
function Strawberry({stage}: {stage: Stage}) {
  const size = [0, 0.36, 0.62, 0.86, 1][stage]
  if (stage === 0) return <Seedling scale={0.5} green="#8ed05c" dark="#47852b" />
  const rosette = [
    {a: -96, l: 26},
    {a: -62, l: 32},
    {a: -28, l: 35},
    {a: 4, l: 36},
    {a: 38, l: 35},
    {a: 72, l: 32},
    {a: 104, l: 26},
  ]
  const berries = [
    {x: -17, y: -12, r: 7.6},
    {x: 15, y: -10, r: 7},
    {x: -2, y: -20, r: 6.4},
    {x: 27, y: -19, r: 5.6},
  ]
  return (
    <g transform={`scale(${round(size)})`}>
      <Shadow rx={24} ry={9} />
      {rosette.map((lf, i) => (
        <Leaf
          key={i}
          len={lf.l}
          wide={14}
          angle={lf.a}
          fill={i % 2 ? '#4f9e33' : '#5fb03c'}
          vein="#2f6b1d"
          y={-4}
          droop={4}
        />
      ))}
      {stage === 3 &&
        [
          {x: -14, y: -14},
          {x: 10, y: -17},
          {x: 22, y: -6},
        ].map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="0" cy="-4" rx="2.6" ry="4" fill="#fffdf6" transform={`rotate(${a})`} />
            ))}
            <circle cx="0" cy="0" r="2" fill="#ffd95e" />
          </g>
        ))}
      {stage >= 4 &&
        berries.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y})`}>
            <path
              d={`M0 ${b.r} C ${-b.r} ${b.r * 0.45} ${-b.r * 0.95} ${-b.r * 0.7} 0 ${-b.r} C ${b.r * 0.95} ${-b.r * 0.7} ${b.r} ${b.r * 0.45} 0 ${b.r} Z`}
              fill={i % 2 ? '#e3343c' : '#cf2731'}
            />
            <path d={`M0 ${-b.r} L-4 ${-b.r - 3} L0 ${-b.r - 1.5} L4 ${-b.r - 3} Z`} fill="#4f9e33" />
            {[-0.35, 0.1, 0.5].map((t) => (
              <circle key={t} cx={(t - 0.1) * b.r} cy={t * b.r} r="0.9" fill="#ffd9a8" opacity=".85" />
            ))}
            <circle cx={-b.r * 0.35} cy={-b.r * 0.35} r={b.r * 0.28} fill="#ff8d8d" opacity=".55" />
          </g>
        ))}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 西瓜：藤蔓大叶 + 条纹大瓜                                          */
/* ------------------------------------------------------------------ */
function Watermelon({stage}: {stage: Stage}) {
  const size = [0, 0.34, 0.6, 0.85, 1][stage]
  if (stage === 0) return <Seedling scale={0.5} green="#8ed05c" dark="#47852b" />
  const leaves = [
    {a: -104, l: 34},
    {a: -66, l: 42},
    {a: -26, l: 46},
    {a: 16, l: 46},
    {a: 58, l: 42},
    {a: 98, l: 34},
  ]
  return (
    <g transform={`scale(${round(size)})`}>
      <Shadow rx={30} ry={11} />
      <path d="M-30 0 Q -6 -10 22 -4" stroke="#3f8a30" strokeWidth="3" fill="none" strokeLinecap="round" />
      {leaves.map((lf, i) => (
        <g key={i}>
          <Leaf len={lf.l} wide={20} angle={lf.a} fill={i % 2 ? '#3f8b34' : '#4c9c3d'} vein="#255e1c" y={-4} droop={5} />
        </g>
      ))}
      {stage === 3 &&
        [
          {x: -20, y: -14},
          {x: 16, y: -18},
        ].map((f, i) => (
          <g key={i} transform={`translate(${f.x} ${f.y})`}>
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="0" cy="-4.4" rx="3.2" ry="4.6" fill="#ffdc5c" transform={`rotate(${a})`} />
            ))}
            <circle cx="0" cy="0" r="2.4" fill="#f7b52c" />
          </g>
        ))}
      {stage >= 4 && (
        <g transform="translate(6 -26)">
          <ellipse cx="0" cy="0" rx="30" ry="24" fill="#3f9b3c" />
          <ellipse cx="0" cy="0" rx="30" ry="24" fill="none" stroke="#2b6f2a" strokeWidth="1.4" />
          <g clipPath="url(#wm-clip)">
            {[-22, -12, -2, 8, 18].map((sx, i) => (
              <path
                key={sx}
                d={`M${sx} -26 Q ${sx + (i % 2 ? 7 : -7)} 0 ${sx} 26`}
                stroke="#22631f"
                strokeWidth={4.6}
                fill="none"
                strokeLinecap="round"
                opacity=".85"
              />
            ))}
          </g>
          <ellipse cx="-11" cy="-11" rx="9" ry="6" fill="#8ed07a" opacity=".5" transform="rotate(-22 -11 -11)" />
          <path d="M0 -24 Q -3 -30 -8 -32" stroke="#6fbf4a" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 兜底：Sanity 里新加的作物也能长出东西来                            */
/* ------------------------------------------------------------------ */
const FALLBACK_COLORS = ['#7cc94b', '#f0a03a', '#e05c5c', '#c07de0', '#63c7d8', '#f4d35e']

export function cropAccent(cropId: string) {
  let h = 0
  for (let i = 0; i < cropId.length; i++) h = (h * 31 + cropId.charCodeAt(i)) % 9973
  return {
    leaf: FALLBACK_COLORS[h % FALLBACK_COLORS.length],
    fruit: FALLBACK_COLORS[(h * 7 + 3) % FALLBACK_COLORS.length],
  }
}

function Generic({stage, cropId, emoji}: {stage: Stage; cropId: string; emoji?: string}) {
  const {leaf, fruit} = cropAccent(cropId)
  const size = [0, 0.36, 0.64, 0.88, 1][stage]
  if (stage === 0) return <Seedling scale={0.55} green={leaf} dark="#3f7f27" />
  const leaves = [
    {a: -96, l: 30, y: -6},
    {a: -58, l: 38, y: -14},
    {a: -20, l: 42, y: -22},
    {a: 20, l: 42, y: -22},
    {a: 58, l: 38, y: -14},
    {a: 96, l: 30, y: -6},
  ]
  return (
    <g transform={`scale(${round(size)})`}>
      <Shadow rx={26} ry={9} />
      {leaves.map((lf, i) => (
        <Leaf key={i} len={lf.l} wide={15} angle={lf.a} fill={i % 2 ? leaf : '#5fae37'} vein="#2f6b1d" y={lf.y} />
      ))}
      {stage >= 3 && (
        <g>
          <circle cx="-10" cy="-34" r="8" fill={fruit} />
          <circle cx="11" cy="-30" r="7" fill={fruit} opacity=".92" />
        </g>
      )}
      {stage >= 4 && emoji && (
        <text x="0" y="-46" textAnchor="middle" fontSize="26" style={{userSelect: 'none'}}>
          {emoji}
        </text>
      )}
    </g>
  )
}

const KNOWN: Record<string, (p: {stage: Stage}) => ReactElement> = {
  'crop-radish': Radish,
  'crop-carrot': Carrot,
  'crop-corn': Corn,
  'crop-strawberry': Strawberry,
  'crop-watermelon': Watermelon,
}

/** 把 Sanity 里的作物名/ID 映射到美术资源 */
function resolveKey(cropId: string, name: string) {
  if (KNOWN[cropId]) return KNOWN[cropId]
  const table: [string, string[]][] = [
    ['crop-radish', ['萝卜', 'radish', 'turnip']],
    ['crop-carrot', ['胡萝卜', '萝卜', 'carrot']],
    ['crop-corn', ['玉米', 'corn', 'maize']],
    ['crop-strawberry', ['草莓', 'strawberry']],
    ['crop-watermelon', ['西瓜', 'watermelon', 'melon']],
  ]
  const lower = name.toLowerCase()
  for (const [key, words] of table) {
    if (words.some((w) => (w.charCodeAt(0) > 255 ? name.includes(w) : lower.includes(w)))) {
      return KNOWN[key]
    }
  }
  return null
}

/** 枯萎的残株 */
export function WitheredArt() {
  return (
    <g>
      <Shadow rx={24} ry={8} />
      <path d="M-14 0 Q -18 -14 -26 -20" stroke="#8b7a52" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M0 0 Q 2 -16 -2 -26" stroke="#8b7a52" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M13 0 Q 20 -12 26 -16" stroke="#8b7a52" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M-26 -20 Q -30 -26 -22 -28 Q -16 -26 -20 -21 Z" fill="#a8946a" />
      <path d="M-2 -26 Q -8 -34 2 -34 Q 8 -32 4 -26 Z" fill="#b9a271" />
      <path d="M26 -16 Q 32 -22 34 -14 Q 30 -9 25 -13 Z" fill="#a8946a" />
    </g>
  )
}

export const WM_CLIP_ID = 'wm-clip'

interface Props {
  cropId: string
  cropName: string
  emoji?: string
  stage: Stage
  /** 像素坐标：土地菱形的中心点 */
  x: number
  y: number
  scale?: number
  rotate?: number
  sway?: boolean
  swayDelay?: number
}

/** 一株作物：根部锚定在土地中心，向屏幕上方生长 */
export default function CropArt({
  cropId,
  cropName,
  emoji,
  stage,
  x,
  y,
  scale = 1,
  rotate = 0,
  sway = false,
  swayDelay = 0,
}: Props) {
  const Art = resolveKey(cropId, cropName)
  return (
    <g transform={`translate(${round(x)} ${round(y + 10)}) rotate(${round(rotate)}) scale(${round(scale)})`}>
      <g
        className={sway ? 'sway' : undefined}
        style={sway ? {animationDelay: `${swayDelay.toFixed(2)}s`} : undefined}
      >
        {Art ? <Art stage={stage} /> : <Generic stage={stage} cropId={cropId} emoji={emoji} />}
      </g>
    </g>
  )
}
