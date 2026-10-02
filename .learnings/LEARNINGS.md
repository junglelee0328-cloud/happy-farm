# Learnings

## [LRN-20261001-001] best_practice

**Logged**: 2026-10-01T12:00:00+08:00
**Priority**: high
**Status**: promoted_to_skill
**Area**: frontend

### Summary
复刻游戏/卡通视觉风格时，"DOM+CSS 盒子堆场景"是媒介级错误，迭代再多轮也会"丑"；正确做法是插画用 SVG 手绘（等距坐标系 + 分层描边 + 实例抖动），界面用 DOM。

### Details
快乐农场项目里，我先后三轮用 CSS（圆角矩形当土地、emoji 当作物、rotateX 假透视）复刻 QQ 农场风格，用户三次反馈"特别丑"。DeepSeek 一次性重写为 SVG 手绘场景后用户满意。根本差异：
1. 媒介：插画 → SVG，界面 → DOM，不要混用
2. 先建投影坐标系（2:1 等距、画家算法、viewBox cover 适配），不从 grid 布局出发
3. emoji 只是占位符，跨系统不一致且无法分件动画；简单几何形状手绘即可
4. 分层描边（暗底+中间+高光）制造绘制感；确定性 jitter 消灭复制粘贴感
5. 设计 token + 统一材质语言先行，不逐元素零散调色
6. 静态布景 memo 一次、动态区独立 memo + 原始类型 props；热区层与显示层分离
7. 截图与参考图并排对比，先诊断媒介级问题再调样式级问题

### Suggested Action
抽取为通用 skill：`~/.agents/skills/game-scene-svg-art/SKILL.md`。本项目素材沉淀在 `happy-farm/web/src/art/`（TileArt/CropArt/Scenery）和 `src/lib/iso.ts`，骨架可复用于其他主题。

### Metadata
- Source: user_feedback
- Related Files: happy-farm/web/src/art/, happy-farm/web/src/lib/iso.ts, happy-farm/web/src/components/FarmScene.tsx
- Tags: frontend, ui, svg, game-ui, isometric, design-system
- Skill-Path: ~/.agents/skills/game-scene-svg-art/SKILL.md

---

## [LRN-20261002-001] knowledge_gap

**Logged**: 2026-10-02T00:30:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
Sanity 项目部署到线上域名后浏览器报 `net::ERR_FAILED`（Failed to fetch），原因是 Sanity 的 CORS 白名单默认只含 localhost，需为线上域名添加 origin。

### Details
前端从 `https://xxx.vercel.app` 直接调 `*.api.sanity.io`，Chrome 表现为 `net::ERR_FAILED`（控制台没有明显的 CORS 字样，容易误判为网络问题）。检查方法：`npx sanity cors list`。

### Suggested Action
部署前端后立即执行：
```bash
npx sanity cors add https://<线上域名> --credentials
npx sanity cors add "https://*.vercel.app" --credentials --yes  # 覆盖 Vercel 预览部署
```
验证：`curl -D - -H "Origin: <域名>" <api-url>` 应返回匹配的 `access-control-allow-origin`。

### Metadata
- Source: error
- Related Files: happy-farm/web/src/lib/sanity.ts
- Tags: sanity, cors, vercel, deploy

---
