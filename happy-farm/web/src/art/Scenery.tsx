import {isoPoint, round} from '../lib/iso'

type Pt = {x: number; y: number}

/* ------------------------------------------------------------------ */
/* 天空                                                                */
/* ------------------------------------------------------------------ */

export function SkyBand({horizon}: {horizon: number}) {
  return (
    <g>
      <rect x="-3000" y="-3000" width="8000" height={3000 + horizon} fill="url(#sky-grad)" />
      <ellipse cx="1392" cy="84" rx="86" ry="86" fill="#ffe9a3" opacity=".4" />
      <circle cx="1392" cy="84" r="48" fill="#ffdf6b" />
      <circle cx="1392" cy="84" r="48" fill="url(#sun-glow)" />
      <g className="sun-rays" opacity=".5">
        {Array.from({length: 12}).map((_, i) => (
          <rect
            key={i}
            x="1389"
            y="6"
            width="6"
            height="18"
            rx="3"
            fill="#ffe37a"
            transform={`rotate(${i * 30} 1392 84)`}
          />
        ))}
      </g>
    </g>
  )
}

export function Cloud({x, y, s = 1, speed = 90}: {x: number; y: number; s?: number; speed?: number}) {
  return (
    <g className="cloud" style={{animationDuration: `${speed}s`, animationDelay: `${-x / 30}s`}}>
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity=".95">
        <ellipse cx="0" cy="0" rx="52" ry="24" fill="#ffffff" />
        <ellipse cx="-34" cy="6" rx="30" ry="17" fill="#ffffff" />
        <ellipse cx="34" cy="7" rx="32" ry="16" fill="#ffffff" />
        <ellipse cx="-6" cy="-16" rx="32" ry="20" fill="#ffffff" />
        <ellipse cx="-4" cy="10" rx="52" ry="14" fill="#eef7ff" opacity=".85" />
      </g>
    </g>
  )
}

export function Birds({x, y}: {x: number; y: number}) {
  return (
    <g className="bird">
      <path d={`M${x} ${y} q 9 -7 17 0 q 9 -7 17 0`} stroke="#5b5b66" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d={`M${x + 40} ${y + 16} q 6 -5 12 0 q 6 -5 12 0`} stroke="#5b5b66" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 地面                                                                */
/* ------------------------------------------------------------------ */

export function Ground({horizon}: {horizon: number}) {
  const h = horizon
  return (
    <g>
      {/* 远山：由浅到深三层，只露出地平线以上的部分 */}
      <path
        d={`M-3000 ${h - 18} C -2000 ${h - 32} -1100 ${h - 12} -100 ${h - 26} C 800 ${h - 40} 1600 ${h - 18} 2500 ${h - 30} L4200 ${h - 22} L4200 ${h + 40} L-3000 ${h + 40} Z`}
        fill="#8fc0c9"
        opacity=".72"
      />
      <path
        d={`M-3000 ${h - 8} C -2100 ${h - 20} -1200 ${h - 2} -200 ${h - 16} C 700 ${h - 28} 1500 ${h - 8} 2400 ${h - 20} L4200 ${h - 12} L4200 ${h + 50} L-3000 ${h + 50} Z`}
        fill="#79b86e"
      />
      <path
        d={`M-3000 ${h + 2} C -1900 ${h - 10} -900 ${h + 8} 100 ${h - 4} C 1000 ${h - 18} 1900 ${h + 2} 2800 ${h - 8} L4200 ${h} L4200 ${h + 60} L-3000 ${h + 60} Z`}
        fill="#5f9f52"
      />
      {/* 草地：盖住山脚 */}
      <rect x="-3000" y={h} width="8000" height="4000" fill="url(#grass-grad)" />
      <rect x="-3000" y={h} width="8000" height="4000" fill="url(#grass-noise)" opacity=".45" />
      <Treeline horizon={horizon} />
    </g>
  )
}

/** 地平线上的树丛剪影 */
function Treeline({horizon}: {horizon: number}) {
  const blobs: {x: number; r: number; c: string}[] = []
  let seed = 7
  for (let x = -1500; x < 3200; x += 46) {
    seed = (seed * 1103515245 + 12345) % 2147483647
    const r = 13 + (seed % 11)
    blobs.push({x: x + ((seed >> 5) % 9), r, c: seed % 3 === 0 ? '#3f7f39' : '#4e9243'})
  }
  return (
    <g>
      {blobs.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={horizon - 12} r={b.r} fill={b.c} />
          <circle cx={b.x + b.r * 0.5} cy={horizon - 3} r={b.r * 0.8} fill={b.c} />
        </g>
      ))}
      <rect x="-1500" y={horizon - 6} width="4800" height="22" fill="#4e9243" />
      <rect x="-1500" y={horizon + 4} width="4800" height="16" fill="#589c46" opacity=".85" />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 篱笆：沿等距矩形四条边铺木桩                                      */
/* ------------------------------------------------------------------ */

function FenceRun({
  a,
  b,
  gap,
}: {
  a: Pt
  b: Pt
  gap?: {from: number; to: number}
}) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  const step = 46
  const n = Math.max(2, Math.round(len / step))
  const posts: number[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    if (gap && t > gap.from && t < gap.to) continue
    posts.push(t)
  }
  const at = (t: number, up = 0): Pt => ({x: a.x + dx * t, y: a.y + dy * t + up})
  const railPath = (up: number, from: number, to: number) => {
    const p0 = at(from, up)
    const p1 = at(to, up)
    return `M${round(p0.x)} ${round(p0.y)} L${round(p1.x)} ${round(p1.y)}`
  }
  const spans: [number, number][] = []
  if (gap) {
    spans.push([0, gap.from], [gap.to, 1])
  } else {
    spans.push([0, 1])
  }
  return (
    <g>
      <path d={railPath(0, 0, 1)} stroke="#5b3d1e" strokeWidth="8" opacity=".28" transform="translate(0 3)" />
      {spans.map(([s0, s1], i) => (
        <g key={i}>
          <path d={railPath(-30, s0, s1)} stroke="#b98a52" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d={railPath(-30, s0, s1)} stroke="#d5a970" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8" />
          <path d={railPath(-16, s0, s1)} stroke="#a97b48" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d={railPath(-16, s0, s1)} stroke="#c99a63" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".75" />
        </g>
      ))}
      {posts.map((t, i) => {
        const p = at(t)
        const h = 40
        return (
          <g key={i}>
            <rect x={round(p.x - 5)} y={round(p.y - h)} width="10" height={h + 6} rx="2.5" fill="#8a6136" />
            <rect x={round(p.x - 5)} y={round(p.y - h)} width="4" height={h + 6} rx="2" fill="#b0813f" />
            <path
              d={`M${round(p.x - 5)} ${round(p.y - h)} L${round(p.x)} ${round(p.y - h - 8)} L${round(p.x + 5)} ${round(p.y - h)} Z`}
              fill="#c99a63"
            />
          </g>
        )
      })}
    </g>
  )
}

export function FenceRing() {
  const A = isoPoint(-0.78, -0.78)
  const B = isoPoint(5.78, -0.78)
  const C = isoPoint(5.78, 3.78)
  const D = isoPoint(-0.78, 3.78)
  const gap = {from: 0.62, to: 0.82}
  return (
    <g>
      {/* 后侧与左侧先画，前侧后画，保证遮挡关系 */}
      <FenceRun a={A} b={B} />
      <FenceRun a={D} b={A} />
      <FenceRun a={B} b={C} />
      <FenceRun a={C} b={D} gap={gap} />
      <Gate a={lerp(C, D, gap.from)} b={lerp(C, D, gap.to)} />
    </g>
  )
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t}
}

function Gate({a, b}: {a: Pt; b: Pt}) {
  return (
    <g>
      <path
        d={`M${round(a.x)} ${round(a.y)} L${round(b.x)} ${round(b.y)}`}
        stroke="#5b3d1e"
        strokeWidth="7"
        opacity=".25"
        transform="translate(0 3)"
      />
      <path d={`M${round(a.x)} ${round(a.y - 24)} L${round(b.x)} ${round(b.y - 24)}`} stroke="#a97b48" strokeWidth="4" fill="none" />
      {[0, 0.34, 0.67, 1].map((t, i) => {
        const p = lerp(a, b, t)
        return <rect key={i} x={round(p.x - 3)} y={round(p.y - 44)} width="6" height="46" rx="2" fill="#8a6136" />
      })}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 泥土小路                                                            */
/* ------------------------------------------------------------------ */

export function Path() {
  const g = lerp(isoPoint(5.78, 3.78), isoPoint(-0.78, 3.78), 0.72)
  const d = `M${round(g.x)} ${round(g.y + 8)} C ${round(g.x + 52)} ${round(g.y + 128)} ${round(g.x - 12)} ${round(g.y + 238)} ${round(g.x - 52)} ${round(g.y + 380)}`
  return (
    <g>
      <path d={d} stroke="#6f5a3c" strokeWidth="92" fill="none" strokeLinecap="round" opacity=".28" />
      <path d={d} stroke="#c6a877" strokeWidth="72" fill="none" strokeLinecap="round" />
      <path d={d} stroke="#dcbf90" strokeWidth="52" fill="none" strokeLinecap="round" opacity=".92" />
      <path d={d} stroke="#c2a271" strokeWidth="22" fill="none" strokeLinecap="round" opacity=".4" strokeDasharray="4 30" />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 池塘                                                                */
/* ------------------------------------------------------------------ */

export function Pond({x, y, rx = 190, ry = 76}: {x: number; y: number; rx?: number; ry?: number}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx={rx + 14} ry={ry + 10} fill="#6ba94a" />
      <ellipse cx="0" cy="0" rx={rx + 6} ry={ry + 4} fill="#c9b98d" opacity=".55" />
      <ellipse cx="0" cy="0" rx={rx} ry={ry} fill="url(#water-grad)" />
      <ellipse cx="0" cy="0" rx={rx} ry={ry} fill="none" stroke="#3f7f9c" strokeWidth="2" opacity=".4" />
      {[
        {cx: -70, cy: -14, r: 40},
        {cx: 40, cy: 16, r: 52},
        {cx: -10, cy: -34, r: 26},
        {cx: 108, cy: -6, r: 30},
      ].map((r, i) => (
        <ellipse
          key={i}
          cx={r.cx}
          cy={r.cy}
          rx={r.r}
          ry={r.r * 0.28}
          fill="#eaf8ff"
          opacity=".5"
          className="ripple"
          style={{animationDelay: `${i * 0.9}s`}}
        />
      ))}
      <ellipse cx="-96" cy="-18" rx="26" ry="11" fill="#5ba83f" />
      <ellipse cx="-96" cy="-20" rx="26" ry="11" fill="#74c251" opacity=".8" />
      <ellipse cx="-104" cy="-22" rx="7" ry="3" fill="#ff9ec4" />
      <ellipse cx="74" cy="24" rx="22" ry="9" fill="#5ba83f" />
      <ellipse cx="74" cy="22" rx="22" ry="9" fill="#74c251" opacity=".8" />
      <g stroke="#4f9a35" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M-176 -34 Q -180 -70 -190 -84" />
        <path d="M-168 -32 Q -166 -74 -158 -92" />
        <path d="M168 -30 Q 174 -66 184 -80" />
      </g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 房子                                                                */
/* ------------------------------------------------------------------ */

export function House({x, y, scale = 1}: {x: number; y: number; scale?: number}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* 影子 */}
      <ellipse cx="6" cy="4" rx="168" ry="30" fill="#3f6b24" opacity=".28" />
      {/* 院墙 */}
      <g>
        <rect x="-176" y="-46" width="352" height="46" rx="6" fill="#e7d5b4" />
        <rect x="-176" y="-46" width="352" height="10" rx="5" fill="#f6ead1" opacity=".7" />
        {[-150, -100, -50, 0, 50, 100, 150].map((bx) => (
          <rect key={bx} x={bx - 2} y="-44" width="4" height="42" fill="#cdb894" opacity=".8" />
        ))}
      </g>
      {/* 房子主体 */}
      <rect x="-116" y="-176" width="232" height="132" rx="6" fill="#f6e8cd" />
      <rect x="-116" y="-176" width="232" height="132" rx="6" fill="url(#wall-shade)" />
      <rect x="-116" y="-56" width="232" height="14" fill="#d9c39b" opacity=".8" />
      {/* 屋顶 */}
      <path d="M-150 -168 L0 -252 L150 -168 Q 0 -190 -150 -168 Z" fill="#c9623c" />
      <path d="M0 -252 L150 -168 Q 0 -190 -150 -168 Z" fill="#a94b2b" opacity=".55" />
      <path d="M-158 -164 Q 0 -188 158 -164 L150 -168 Q 0 -190 -150 -168 Z" fill="#8f3d22" opacity=".55" />
      <path d="M-158 -164 Q 0 -188 158 -164 L154 -156 Q 0 -180 -154 -156 Z" fill="#e0815a" />
      <path d="M0 -252 L0 -188" stroke="#8f3d22" strokeWidth="2" opacity=".4" />
      {[-104, -52, 52, 104].map((rx, i) => (
        <path key={i} d={`M${rx} -170 L${rx + 8} -186`} stroke="#e0815a" strokeWidth="3" opacity=".5" />
      ))}
      {/* 烟囱 */}
      <rect x="58" y="-238" width="30" height="56" rx="4" fill="#b0553a" />
      <rect x="58" y="-238" width="12" height="56" rx="4" fill="#cf6c4a" />
      <rect x="53" y="-244" width="40" height="12" rx="4" fill="#8f3d22" />
      <g className="smoke" opacity=".7">
        <circle cx="73" cy="-262" r="9" fill="#ffffff" />
        <circle cx="82" cy="-284" r="12" fill="#ffffff" opacity=".8" />
        <circle cx="70" cy="-308" r="15" fill="#ffffff" opacity=".55" />
      </g>
      {/* 门 */}
      <path d="M-26 -44 L-26 -108 Q 0 -124 26 -108 L26 -44 Z" fill="#8a5a30" />
      <path d="M-26 -44 L-26 -108 Q -6 -120 0 -121 L0 -44 Z" fill="#a9713f" />
      <circle cx="16" cy="-74" r="3.4" fill="#ffd97a" />
      <path d="M-32 -44 L32 -44" stroke="#6d4520" strokeWidth="3" />
      {/* 窗 */}
      {[-84, 52].map((wx) => (
        <g key={wx}>
          <rect x={wx} y="-152" width="56" height="46" rx="4" fill="#6d4520" />
          <rect x={wx + 3} y="-149" width="50" height="40" rx="3" fill="url(#glass-grad)" />
          <path d={`M${wx + 28} -149 L${wx + 28} -109`} stroke="#f6e8cd" strokeWidth="3" />
          <path d={`M${wx + 3} -129 L${wx + 53} -129`} stroke="#f6e8cd" strokeWidth="3" />
          <path d={`M${wx + 3} -149 L${wx + 18} -136 L${wx + 3} -120 Z`} fill="#ffffff" opacity=".35" />
          <rect x={wx - 6} y="-108" width="68" height="8" rx="3" fill="#c9a878" />
        </g>
      ))}
      {/* 门口台阶 */}
      <ellipse cx="0" cy="-40" rx="52" ry="12" fill="#d9c39b" opacity=".85" />
      {/* 小灯笼 */}
      <g>
        <path d="M-34 -100 L-34 -86" stroke="#6d4520" strokeWidth="3" />
        <ellipse cx="-34" cy="-78" rx="9" ry="11" fill="#e0433a" />
        <ellipse cx="-37" cy="-81" rx="4" ry="5" fill="#ff8f7a" opacity=".7" />
      </g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 风车                                                                */
/* ------------------------------------------------------------------ */

export function Windmill({x, y, scale = 1}: {x: number; y: number; scale?: number}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="4" cy="2" rx="56" ry="16" fill="#3f6b24" opacity=".3" />
      <path d="M-34 0 L-17 -168 L17 -168 L34 0 Z" fill="#e9dcc0" />
      <path d="M0 0 L0 -168 L17 -168 L34 0 Z" fill="#cdbb98" />
      {[-140, -100, -60, -20].map((yy, i) => (
        <path key={i} d={`M${-30 - (yy + 168) * 0.1} ${yy} L${30 + (yy + 168) * 0.1} ${yy}`} stroke="#c4b18d" strokeWidth="2" opacity=".6" />
      ))}
      <rect x="-26" y="-20" width="20" height="20" rx="3" fill="#8a5a30" />
      <circle cx="0" cy="-186" r="22" fill="#b0553a" />
      <circle cx="0" cy="-186" r="22" fill="url(#wall-shade)" />
      <path d="M-22 -186 Q 0 -212 22 -186 Z" fill="#8f3d22" />
      <g transform="translate(0 -186)">
        <g className="spin" style={{animationDuration: '16s'}}>
          {[0, 90, 180, 270].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <rect x="0" y="-4" width="74" height="8" rx="2" fill="#f4ead4" />
              <rect x="6" y="-3" width="60" height="6" rx="2" fill="#d8c9a6" />
              {[16, 30, 44, 58].map((t) => (
                <rect key={t} x={t} y="-9" width="3" height="18" rx="1" fill="#bda882" />
              ))}
            </g>
          ))}
        </g>
        <circle cx="0" cy="0" r="8" fill="#8f3d22" />
        <circle cx="-2" cy="-2" r="3" fill="#c9623c" />
      </g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 树                                                                  */
/* ------------------------------------------------------------------ */

export function Tree({x, y, scale = 1, kind = 'round'}: {x: number; y: number; scale?: number; kind?: 'round' | 'pine'}) {
  if (kind === 'pine') {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <ellipse cx="4" cy="2" rx="46" ry="14" fill="#3f6b24" opacity=".3" />
        <rect x="-8" y="-46" width="16" height="48" rx="4" fill="#7d5330" />
        <path d="M0 -190 L46 -96 Q 0 -108 -46 -96 Z" fill="#3f7f39" />
        <path d="M0 -164 L56 -62 Q 0 -76 -56 -62 Z" fill="#3f7f39" />
        <path d="M0 -136 L64 -30 Q 0 -44 -64 -30 Z" fill="#3f7f39" />
        <path d="M0 -190 L46 -96 Q 0 -108 -46 -96 Z" fill="#4f9a45" opacity=".55" />
        <path d="M0 -164 L56 -62 Q 0 -76 -56 -62 Z" fill="#4f9a45" opacity=".55" />
        <path d="M0 -136 L64 -30 Q 0 -44 -64 -30 Z" fill="#4f9a45" opacity=".55" />
      </g>
    )
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="6" cy="2" rx="56" ry="17" fill="#3f6b24" opacity=".3" />
      <path d="M-11 0 Q -6 -40 -8 -62 L8 -62 Q 6 -40 11 0 Z" fill="#7d5330" />
      <path d="M-2 -30 Q -22 -44 -30 -60" stroke="#7d5330" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M2 -40 Q 22 -54 30 -70" stroke="#7d5330" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="-34" cy="-92" r="40" fill="#3f7f39" />
      <circle cx="34" cy="-88" r="38" fill="#3f7f39" />
      <circle cx="0" cy="-136" r="46" fill="#3f7f39" />
      <circle cx="-30" cy="-118" r="36" fill="#4f9a45" />
      <circle cx="26" cy="-124" r="32" fill="#4f9a45" />
      <circle cx="-8" cy="-152" r="30" fill="#5fae52" />
      <circle cx="-22" cy="-150" r="14" fill="#79c463" opacity=".85" />
      <circle cx="26" cy="-104" r="7" fill="#e0433a" />
      <circle cx="-44" cy="-96" r="6" fill="#e0433a" />
      <circle cx="6" cy="-166" r="6" fill="#e0433a" />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 草垛                                                                */
/* ------------------------------------------------------------------ */

export function Haystack({x, y, scale = 1}: {x: number; y: number; scale?: number}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="4" cy="2" rx="62" ry="18" fill="#3f6b24" opacity=".3" />
      <path d="M-62 0 Q -62 -74 0 -96 Q 62 -74 62 0 Z" fill="#e0b455" />
      <path d="M0 0 L0 -96 Q 62 -74 62 0 Z" fill="#c99a3d" opacity=".75" />
      <path d="M-52 -20 Q 0 -46 52 -20" stroke="#b98a34" strokeWidth="3" fill="none" />
      <path d="M-58 -8 Q 0 -34 58 -8" stroke="#b98a34" strokeWidth="3" fill="none" />
      <path d="M-30 -74 Q 0 -88 30 -74" stroke="#b98a34" strokeWidth="3" fill="none" />
      <path d="M-34 0 Q -30 -30 -12 -52" stroke="#f0cd7d" strokeWidth="3" fill="none" opacity=".8" />
      <path d="M30 0 Q 28 -30 12 -56" stroke="#f0cd7d" strokeWidth="3" fill="none" opacity=".6" />
      <path d="M-62 0 L62 0 L62 8 Q 0 18 -62 8 Z" fill="#c99a3d" opacity=".6" />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 狗窝 + 小狗                                                         */
/* ------------------------------------------------------------------ */

export function DogHouse({x, y, scale = 1}: {x: number; y: number; scale?: number}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="4" cy="2" rx="62" ry="18" fill="#3f6b24" opacity=".3" />
      <rect x="-46" y="-70" width="92" height="70" rx="6" fill="#c9824a" />
      <rect x="-46" y="-70" width="40" height="70" rx="6" fill="#e0a367" />
      {[-62, -54, -46].map((yy) => (
        <path key={yy} d={`M-46 ${yy} L46 ${yy}`} stroke="#a86a37" strokeWidth="2" opacity=".5" />
      ))}
      <path d="M-62 -66 L0 -118 L62 -66 Z" fill="#8f4a26" />
      <path d="M0 -118 L62 -66 L54 -62 L0 -112 Z" fill="#a95c33" opacity=".7" />
      <path d="M-22 -70 L-22 -12 Q 0 -2 22 -12 L22 -70 Q 0 -82 -22 -70 Z" fill="#5b3418" />
      <path d="M-16 -66 L-16 -14 Q 0 -7 16 -14 L16 -66 Q 0 -74 -16 -66 Z" fill="#3d2210" />
      <rect x="-50" y="-4" width="100" height="8" rx="4" fill="#a86a37" opacity=".7" />
      {/* 小狗 */}
      <g className="dog">
        <ellipse cx="4" cy="0" rx="30" ry="10" fill="#3f6b24" opacity=".22" />
        <ellipse cx="4" cy="-22" rx="26" ry="20" fill="#e8a95c" />
        <ellipse cx="4" cy="-20" rx="20" ry="15" fill="#f6cd96" />
        <circle cx="4" cy="-50" r="19" fill="#e8a95c" />
        <circle cx="4" cy="-46" r="14" fill="#f6cd96" />
        <path d="M-12 -62 Q -22 -70 -14 -76 Q -6 -72 -6 -60 Z" fill="#c9813c" />
        <path d="M20 -62 Q 30 -70 22 -76 Q 14 -72 14 -60 Z" fill="#c9813c" />
        <ellipse cx="-3" cy="-50" rx="3" ry="3.6" fill="#3d2a15" />
        <ellipse cx="11" cy="-50" rx="3" ry="3.6" fill="#3d2a15" />
        <circle cx="-4" cy="-52" r="1.2" fill="#ffffff" />
        <circle cx="10" cy="-52" r="1.2" fill="#ffffff" />
        <ellipse cx="4" cy="-41" rx="6" ry="4.6" fill="#3d2a15" />
        <path d="M4 -36 Q 4 -32 9 -32" stroke="#3d2a15" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M4 -41 Q -2 -44 -4 -39 Q -2 -35 4 -37 Z" fill="#f08c8c" />
        <path d="M-22 -26 Q -34 -30 -30 -16 Q -24 -18 -20 -22 Z" fill="#c9813c" />
        <rect x="-16" y="-8" width="9" height="10" rx="4" fill="#e8a95c" />
        <rect x="12" y="-8" width="9" height="10" rx="4" fill="#e8a95c" />
      </g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 小鸡                                                                */
/* ------------------------------------------------------------------ */

export function Chicken({x, y, scale = 1, delay = 0}: {x: number; y: number; scale?: number; delay?: number}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="chicken" style={{animationDelay: `${delay}s`}}>
        <ellipse cx="0" cy="1" rx="20" ry="6" fill="#3f6b24" opacity=".25" />
        <ellipse cx="0" cy="-18" rx="20" ry="16" fill="#fdf6e6" />
        <ellipse cx="0" cy="-16" rx="15" ry="12" fill="#ffffff" />
        <path d="M-14 -24 Q -4 -34 8 -28 Q 2 -22 -6 -20 Z" fill="#f2e6cd" />
        <circle cx="14" cy="-32" r="11" fill="#fdf6e6" />
        <path d="M10 -42 Q 12 -50 17 -44 Q 20 -48 23 -42 Z" fill="#e0433a" />
        <circle cx="17" cy="-34" r="2.4" fill="#3d2a15" />
        <path d="M24 -32 L33 -29 L24 -26 Z" fill="#f0a93a" />
        <path d="M8 -22 Q 14 -20 20 -24" stroke="#e8d9b8" strokeWidth="2" fill="none" />
        <path d="M-6 -3 L-6 0 M6 -3 L6 0" stroke="#f0a93a" strokeWidth="2.6" strokeLinecap="round" />
      </g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 向日葵                                                              */
/* ------------------------------------------------------------------ */

export function Sunflower({x, y, scale = 1, flip = false}: {x: number; y: number; scale?: number; flip?: boolean}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <ellipse cx="0" cy="2" rx="18" ry="6" fill="#3f6b24" opacity=".25" />
      <path d="M0 0 Q -4 -50 0 -96" stroke="#4f9a35" strokeWidth="7" fill="none" />
      <path d="M0 0 Q -4 -50 0 -96" stroke="#66b24a" strokeWidth="3.4" fill="none" />
      <path d="M-2 -34 Q -26 -42 -34 -56 Q -12 -60 -1 -44 Z" fill="#4f9a35" />
      <path d="M1 -58 Q 26 -64 34 -78 Q 12 -84 0 -66 Z" fill="#5fae4a" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse key={a} cx="0" cy="-20" rx="7.5" ry="20" fill={a % 90 === 0 ? '#ffd23f' : '#ffc21f'} transform={`rotate(${a})`} />
      ))}
      <circle cx="0" cy="0" r="17" fill="#7a5223" />
      <circle cx="0" cy="0" r="17" fill="url(#seed-grad)" />
      {Array.from({length: 26}).map((_, i) => {
        const a = i * 2.4
        const rr = 3 + (i % 5) * 2.6
        return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r="1.5" fill="#5b3a15" opacity=".7" />
      })}
      <g transform="translate(0 -96)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse key={a} cx="0" cy="-20" rx="7.5" ry="20" fill={a % 90 === 0 ? '#ffd23f' : '#ffc21f'} transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="17" fill="#7a5223" />
        {Array.from({length: 26}).map((_, i) => {
          const a = i * 2.4
          const rr = 3 + (i % 5) * 2.6
          return <circle key={i} cx={Math.cos(a) * rr} cy={Math.sin(a) * rr} r="1.5" fill="#5b3a15" opacity=".7" />
        })}
      </g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 木牌（农场名）                                                      */
/* ------------------------------------------------------------------ */

export function Signboard({x, y, text, scale = 1}: {x: number; y: number; text: string; scale?: number}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="2" rx="72" ry="16" fill="#3f6b24" opacity=".3" />
      <rect x="-56" y="-8" width="16" height="70" rx="4" fill="#8a6136" />
      <rect x="40" y="-8" width="16" height="70" rx="4" fill="#8a6136" />
      <rect x="-56" y="-8" width="6" height="70" rx="3" fill="#a97c47" />
      <rect x="40" y="-8" width="6" height="70" rx="3" fill="#a97c47" />
      <rect x="-88" y="-62" width="176" height="62" rx="8" fill="#d9b071" stroke="#7a4f22" strokeWidth="3" />
      <rect x="-80" y="-55" width="160" height="30" rx="4" fill="#f4e0b4" opacity=".6" />
      {[[-76, -52], [76, -52], [-76, -10], [76, -10]].map(([sx, sy], i) => (
        <circle key={i} cx={sx} cy={sy} r="3" fill="#8a6136" />
      ))}
      <text
        x="0"
        y="-32"
        textAnchor="middle"
        fontSize="21"
        fontWeight="800"
        fill="#5b3a17"
        style={{fontFamily: 'inherit'}}
      >
        {text}
      </text>
      <text x="0" y="-13" textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a6a3a" style={{fontFamily: 'inherit'}}>
        ⭐ 我的开心农场 ⭐
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 邮箱                                                                */
/* ------------------------------------------------------------------ */

export function Mailbox({x, y, scale = 1, unread = false}: {x: number; y: number; scale?: number; unread?: boolean}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="2" rx="20" ry="7" fill="#3f6b24" opacity=".28" />
      <rect x="-6" y="-46" width="12" height="50" rx="4" fill="#8a6136" />
      <rect x="-6" y="-46" width="4" height="50" rx="3" fill="#a97c47" />
      <rect x="-28" y="-84" width="56" height="40" rx="8" fill="#d8543c" />
      <path d="M-28 -60 Q 0 -46 28 -60 L28 -84 Q 28 -92 20 -92 L-20 -92 Q -28 -92 -28 -84 Z" fill="#e2694f" />
      <rect x="-16" y="-74" width="32" height="8" rx="3" fill="#8f2f1e" opacity=".7" />
      <g className={unread ? 'flag' : undefined}>
        {unread && <rect x="26" y="-104" width="6" height="30" rx="3" fill="#f0d9a8" />}
        {unread && <path d="M28 -104 L48 -98 L28 -92 Z" fill="#ffcf3f" />}
      </g>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* 场景装饰总装                                                        */
/* ------------------------------------------------------------------ */

export function Backdrop({horizon}: {horizon: number}) {
  return (
    <g>
      <SkyBand horizon={horizon} />
      {/* 云层铺得比可视区宽得多，竖屏（上下会有很多留白）也能填满天空 */}
      <Cloud x={330} y={118} s={1} speed={120} />
      <Cloud x={700} y={74} s={0.72} speed={150} />
      <Cloud x={1080} y={128} s={0.84} speed={135} />
      <Cloud x={1620} y={58} s={1.1} speed={105} />
      <Cloud x={-260} y={26} s={0.86} speed={165} />
      <Cloud x={2100} y={104} s={0.94} speed={140} />
      <Cloud x={640} y={-46} s={1.2} speed={180} />
      <Cloud x={1560} y={-24} s={0.7} speed={200} />
      <Cloud x={-700} y={-90} s={1} speed={210} />
      <Birds x={880} y={106} />
    </g>
  )
}

/** 画面最下方的暗角，竖屏时把大片前景草地收住 */
export function BottomVignette() {
  return (
    <g pointerEvents="none">
      <rect x="-3000" y="830" width="8000" height="1400" fill="url(#ground-fade)" />
      <rect x="-3000" y="-3000" width="8000" height="2900" fill="url(#sky-fade)" />
    </g>
  )
}
