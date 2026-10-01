import CropArt, {WitheredArt} from './art/CropArt'
import type {Stage} from './art/CropArt'
import {LockedTile, SoilTile, WeedOverlay, BugOverlay} from './art/TileArt'

const CROPS: [string, string, string][] = [
  ['crop-radish', '白萝卜', '🥬'],
  ['crop-carrot', '胡萝卜', '🥕'],
  ['crop-corn', '玉米', '🌽'],
  ['crop-strawberry', '草莓', '🍓'],
  ['crop-watermelon', '西瓜', '🍉'],
  ['crop-unknown', '神秘作物', '🌰'],
]

export default function DevSprites() {
  return (
    <div style={{background: 'linear-gradient(180deg,#9ad861,#4f9a3c)', padding: 20, minHeight: '100vh'}}>
      <svg viewBox="0 0 1280 1000" style={{width: 1280, height: 1000, background: 'transparent'}}>
        <defs>
          <linearGradient id="soil-shade" x1="0.2" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity=".24" />
            <stop offset="55%" stopColor="#fff" stopOpacity="0" />
            <stop offset="100%" stopColor="#3b2210" stopOpacity=".3" />
          </linearGradient>
          <linearGradient id="grass-shade" x1="0.2" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity=".22" />
            <stop offset="100%" stopColor="#2f5a1c" stopOpacity=".3" />
          </linearGradient>
          <clipPath id="wm-clip">
            <ellipse cx="0" cy="0" rx="30" ry="24" />
          </clipPath>
        </defs>
        {CROPS.map(([id, name, emoji], r) =>
          ([0, 1, 2, 3, 4] as Stage[]).map((st, c) => (
            <g key={`${id}-${st}`} transform={`translate(${150 + c * 200} ${110 + r * 150})`}>
              <SoilTile x={0} y={0} seed={r * 5 + c} state={st === 4 ? 'ready' : 'growing'} />
              <CropArt cropId={id} cropName={name} emoji={emoji} stage={st} x={0} y={0} />
            </g>
          )),
        )}
        <g transform="translate(150 1000)">
          <LockedTile level={7} />
        </g>
        <g transform="translate(400 1000)">
          <SoilTile x={0} y={0} seed={3} state="withered" />
          <WitheredArt />
        </g>
        <g transform="translate(650 1000)">
          <SoilTile x={0} y={0} seed={9} state="growing" watered />
          <CropArt cropId="crop-corn" cropName="玉米" stage={4} x={0} y={0} />
          <WeedOverlay x={0} y={0} />
          <BugOverlay x={0} y={0} />
        </g>
      </svg>
    </div>
  )
}
