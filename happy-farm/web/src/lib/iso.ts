/**
 * 等距（2:1 菱形）投影工具。
 * 所有农场美术都在这套坐标系里手工绘制，屏幕坐标 = 逻辑坐标，
 * 这样每一块土地 / 每一株作物落在哪个像素上都是确定的。
 */

/** 单块地的菱形半宽（像素） */
export const TILE_W = 88
/** 单块地的菱形半高，TILE_W / 2 即经典 2:1 等距比例 */
export const TILE_H = 44

export const COLS = 6
export const ROWS = 4
export const PLOT_COUNT = COLS * ROWS

/** 第 1 号地（网格左上角）的中心点 */
export const ORIGIN_X = 620
export const ORIGIN_Y = 250

/** 场景的基础可视区域（viewBox），实际会按容器比例自适应扩展 */
export const BASE_VIEW = {x: -12, y: 40, w: 1440, h: 730}

export interface PlotAnchor {
  /** 屏幕坐标（逻辑像素） */
  x: number
  y: number
  col: number
  row: number
  /** 画家算法排序用：越大越靠近镜头 */
  depth: number
}

/** 土地编号（1 起）→ 菱形中心点 */
export function plotAnchor(index: number): PlotAnchor {
  const i = Math.max(0, index - 1)
  const col = i % COLS
  const row = Math.floor(i / COLS)
  return {
    x: ORIGIN_X + (col - row) * TILE_W,
    y: ORIGIN_Y + (col + row) * TILE_H,
    col,
    row,
    depth: col + row,
  }
}

/** 网格坐标 → 屏幕坐标（可以为小数，用于篱笆、道路等） */
export function isoPoint(col: number, row: number) {
  return {
    x: ORIGIN_X + (col - row) * TILE_W,
    y: ORIGIN_Y + (col + row) * TILE_H,
  }
}

/** 菱形（土地/草地）的四个顶点，中心为 (x, y) */
export function diamondPoints(x: number, y: number, w = TILE_W, h = TILE_H) {
  return `${x},${y - h} ${x + w},${y} ${x},${y + h} ${x - w},${y}`
}

export function pointsAttr(pts: {x: number; y: number}[]) {
  return pts.map((p) => `${round(p.x)},${round(p.y)}`).join(' ')
}

export function round(n: number, digits = 2) {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

/**
 * 在菱形内部按「沿 e1 / e2 两个等距方向」的参数画一条线。
 * a、b ∈ [-0.5, 0.5]，中心为 0；b 固定即得到与 e1 平行的犁沟。
 */
export function isoLine(x: number, y: number, a0: number, a1: number, b: number) {
  const p0 = {x: x + (a0 + b) * TILE_W, y: y + (a0 - b) * TILE_H}
  const p1 = {x: x + (a1 + b) * TILE_W, y: y + (a1 - b) * TILE_H}
  return `M${round(p0.x)} ${round(p0.y)} L${round(p1.x)} ${round(p1.y)}`
}

/** 把场景逻辑坐标换算成容器里的百分比，用于叠在上面的一层 HTML（提示框 / 飘字） */
export function toPercent(
  pt: {x: number; y: number},
  view: {x: number; y: number; w: number; h: number},
) {
  return {
    left: ((pt.x - view.x) / view.w) * 100,
    top: ((pt.y - view.y) / view.h) * 100,
  }
}

/**
 * 根据容器宽高比，求出刚好铺满容器的 viewBox（cover 逻辑）。
 * 保证 SVG 永远填满屏幕，同时百分比叠加层仍然精确对位。
 *
 * 竖屏（窄高）时如果一味按宽度铺满，画面会被推得极远、上下留下大片空白，
 * 所以这里给高度设了上限：宁可裁掉左右两侧的远景装饰，也要让农场够大。
 * 下限则保证整片田地始终完整可见。
 */
export function coverView(aspect: number, base = BASE_VIEW) {
  const baseAspect = base.w / base.h
  if (!isFinite(aspect) || aspect <= 0) return {...base}
  if (aspect >= baseAspect) {
    const w = base.h * aspect
    return {x: base.x + base.w / 2 - w / 2, y: base.y, w, h: base.h}
  }
  /** 画面最高放大到基础高度的 1.9 倍 */
  const MAX_H = base.h * 1.9
  /** 至少要让整片田地（含边缘）留在画面里 */
  const MIN_W = TILE_W * (COLS + ROWS) + TILE_W * 0.6
  let h = base.w / aspect
  let w = base.w
  if (h > MAX_H) {
    h = MAX_H
    w = h * aspect
  }
  if (w < MIN_W) {
    w = MIN_W
    h = w / aspect
  }
  const cx = base.x + base.w / 2
  const cy = base.y + base.h / 2
  return {x: cx - w / 2, y: cy - h / 2, w, h}
}
