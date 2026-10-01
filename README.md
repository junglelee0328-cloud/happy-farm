# 🌾 Happy Farm（快乐农场）

用 Sanity Content Lake 驱动的 QQ 农场风小游戏 — DEV × Sanity Challenge (Path Two: Vibe-Code Something Strange) 参赛作品。

## 在线地址

- 🎮 游戏：https://sanity-completion.vercel.app
- 🧰 Sanity Project ID：`lha5ip1s`（dataset: `production`，公开可读）
- 🗄 Sanity Studio 后台：`happy-farm/` 目录，`npm run dev` 本地运行

## 技术栈

- **Sanity Content Lake**：所有游戏数据（作物图鉴 / 玩家 / 土地 / 游戏规则）都是 Content Lake 里的结构化文档，Studio 后台改规则参数，游戏行为实时变化
- **GROQ**：游戏前端查询土地、作物、规则
- **Sanity Transactions**：播种/收获等操作原子写回
- **React + Vite**：游戏前端（`happy-farm/web/`），SVG 手绘等距农场场景
- **Vercel**：托管 + CI/CD（push 到 `main` 自动构建部署）

## 目录结构

```
happy-farm/            # Sanity Studio（schema 定义 + 内容管理后台）
  schemaTypes/         # crop / player / plot / gameRule 四类文档 schema
  seed-data.ndjson     # 种子数据
happy-farm/web/        # 游戏前端（React + Vite）
  src/art/             # SVG 手绘美术：地块 / 作物 / 场景装饰
  src/lib/iso.ts       # 等距（2:1 菱形）投影引擎
vercel.json            # monorepo 构建配置（从根目录构建 happy-farm/web）
```

## 本地开发

```bash
# Studio 后台（localhost:3333）
cd happy-farm && npm install && npm run dev

# 游戏前端（localhost:5173）
cd happy-farm/web && npm install && npm run dev
```
