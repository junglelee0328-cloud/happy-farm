# 🌻 开心农场 · 前端（QQ 农场风格）

用 Vite + React 19 写的农场游戏前端，所有玩法数据都来自 Sanity Content Lake。

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 产出 dist/
```

## 界面结构

| 区域 | 组件 | 说明 |
| --- | --- | --- |
| 顶部 HUD | `components/TopBar.tsx` | 头像 / 等级经验条 / 天气状态 / 金币与元宝 |
| 农场主场景 | `components/FarmScene.tsx` | 等距（2:1）投影的田地、篱笆、房子、风车、池塘等 |
| 底部工具栏 | `components/Toolbar.tsx` | 种子包（选种子 → 点空地播种）+ 一键收获 / 一键浇水 / 商店 |
| 种子商店 | `components/ShopModal.tsx` | 分类标签 + 种子卡片，选中即购买并播种 |

## 美术资源

全部是代码手绘的矢量资源（无位图依赖，任何分辨率都清晰）：

- `art/CropArt.tsx` — 5 种作物的 5 个生长阶段 + 枯萎残株；未知作物走通用画法，
  所以在 Sanity 里新增一个 `crop` 文档也能立刻长出东西来。
- `art/TileArt.tsx` — 等距菱形土地：犁沟土垄、侧面厚度、杂草、害虫、水渍、成熟星光、未解锁木牌。
- `art/Scenery.tsx` — 天空 / 远山 / 树丛地平线 / 篱笆 / 土路 / 池塘 / 木屋 / 风车 / 草垛 /
  狗窝小狗 / 小鸡 / 向日葵 / 木牌 / 邮箱。
- `lib/iso.ts` — 等距投影换算与自适应 viewBox（任何窗口比例下都铺满屏幕）。

打开 **http://localhost:5173/?sprites** 可以查看全部作物 / 土地美术资源对照表（开发用）。

## 数据来源（GROQ）

```
*[_type == "crop"] | order(minLevel asc)                 // 作物图鉴
*[_type == "player"]                                     // 玩家
*[_type == "gameRule"][0]                                // 游戏规则（浇水加速、枯萎时限……）
*[_type == "plot" && owner._ref == $pid] {..., crop->}    // 玩家自己的地
```

写操作（播种 / 浇水 / 收获 …）用 `lib/sanity.ts` 里的 token 直接 mutate Content Lake。

> ⚠️ 演示用 token 直接放在前端只适合比赛 demo，正式环境应改成 serverless 中转。
