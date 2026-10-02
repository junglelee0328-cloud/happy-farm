---
title: "I Vibe-Coded a Full Clone of China's Most Infamous Farm Game on Sanity — Stealing Included"
published: false
description: "A QQ Farm-style farming game where every rule, crop, plot and even the fertilizer economy lives in Sanity Content Lake — with real auth, land tiers up to Lv.100, and yes, you can steal from your friends."
tags: sanitychallenge, devchallenge, gamedev, webdev
---

## What I Built

**Happy Farm** — a loving clone of QQ农场 (QQ Farm), the 2009 Chinese social farming game that had hundreds of millions of people setting 3AM alarms to harvest virtual radishes and steal their colleagues' strawberries. Yes, *steal*. It was a whole thing.

- 🎮 **Play it:** https://sanity-completion.vercel.app
- 💾 **Code:** https://github.com/junglelee0328-cloud/happy-farm
- 🔑 **Sanity Project ID:** `lha5ip1s` (dataset `production`, public)
- 🗄️ **Query the live farm data yourself:** `https://lha5ip1s.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=="crop"]`

Sign up with just an email (code verification, no OAuth needed), and you get your own farm: 24 plots, 21 crops, fertilizers, weeds, bugs, and friends to rob.

![Farm screenshot](PASTE_SCREENSHOT_HERE)

## Why Sanity Is the Whole Game Engine

The strange idea: **there is no game server. Sanity Content Lake IS the game engine.**

Every mechanic is a document:

| Sanity document type | Game concept |
|---|---|
| `crop` | 21 crops, Lv.1 radish → Lv.100 "Millennium Ginseng" |
| `player` | level, XP, coins, backpack inventory |
| `plot` | 24 fields with 3-tier thresholds (normal → red soil → black soil) |
| `fertilizer` | 3 fertilizer tiers with speed/yield boosts |
| `gameRule` | **the entire game balance as content** |

The `gameRule` document is my favorite part. It holds the full 99-row XP curve (`40 × level^2.2`, tuned so max level takes ~a year), watering boost, wither time, weed/bug probability, daily steal limit, steal ratio, and land-tier bonuses. Open Sanity Studio, change `stealRatio` from `0.2` to `0.5`, and every player's stealing economics change **live**. Game balance is now a content editor's job.

```groq
// Load a farm with crops AND fertilizers resolved in one round trip
*[_type == "plot" && owner._ref == $pid] | order(index asc) {
  ..., crop->, fertilizer->
}
```

Writes use Sanity **transactions** so multi-document game actions stay atomic — e.g. stealing from a friend:

```ts
client.transaction()
  .patch(plotId, p => p.set({ stolenBy: [...thieves, me.nickname].join('、') }))
  .patch(myId, p => p.inc({ coins: amount, stolenToday: 1 }))
  .commit()
```

Land upgrades are pure data too: each plot has `unlockLevel` / `redLevel` / `blackLevel`, and the effective tier is derived from the player's level — all 24 plots are normal soil by Lv.25, red by Lv.60, black by Lv.100.

## The Vibe-Coding Story (honest version)

The UI went through a humbling arc. My first three rounds built the farm with DOM boxes, CSS gradients and emoji — and every round the feedback was "it looks bad". The fix that finally worked was switching medium entirely: **the farm scene is hand-drawn SVG** on a true isometric (2:1 diamond) coordinate system with painter's-algorithm depth sorting, per-plant deterministic jitter, and every animated prop (spinning windmill, pecking chickens, rippling pond) as its own SVG component. HUD and modals stay in DOM/CSS. Lesson logged: illustration belongs in SVG/canvas, chrome belongs in DOM.

Stack: React + Vite frontend, Clerk (free tier, email-code auth) for real accounts, Vercel for hosting with push-to-deploy CI/CD, Sanity Studio as the admin panel / balance-tweaking console.

## Battle Scars

- **CORS**: first production deploy failed with a cryptic `net::ERR_FAILED` — Sanity's CORS origin list only whitelists localhost by default. One `sanity cors add` later…
- **Demo shortcut I'm not proud of**: the write token is currently in the frontend bundle (fine for a hackathon demo on a public dataset, terrible for production). The real fix — moving writes behind serverless functions with session verification — is documented in the README as next step.
- Hover tooltips on isometric SVG plots needed a delayed-close + hoverable-card pattern to stay usable.

## What's Next

- Move all writes to Vercel serverless functions (JWT-verified) and rotate the token
- Daily tasks & leaderboards (both are one GROQ query away)
- Real-time sync via Sanity Listen instead of 5s polling

Built in 4 days with an AI pair programmer, way too much nostalgia, and one very patient Sanity dataset. 🌻
