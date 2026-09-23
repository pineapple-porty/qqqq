# 🏀 Bouncy Balls — IQ Arena

An HTML/CSS/JavaScript simulation served by a tiny Flask app.

## Project layout

```
bouncy-balls/
├── app.py              # Flask server (serves everything on port 8000)
├── requirements.txt
├── index.html          # page skeleton
├── css/
│   └── style.css       # all styling
└── js/
    ├── config.js       # tunable constants (speeds, IQ bounds, damage…)
    ├── utils.js        # rand/clamp + HP→speed curve
    ├── ball.js         # Ball class: movement, IQ lookahead, IQ drift
    ├── pickups.js      # orbs & armor: spawn, attraction, pickup, respawn
    ├── physics.js      # ball-vs-ball elastic collisions + damage
    ├── render.js       # canvas renderer (DPR-aware)
    ├── menu.js         # side menu + hover tooltip (throttled DOM updates)
    └── main.js         # world state + main loop
```

## Gameplay rules

- **Balls** bounce around the arena. Their **IQ (1–15)** is how many bounces
  ahead they can "see" — smarter balls steer toward orbs and aim their bounces.
- **IQ tooltip on hover**; click a ball to select it — full stats appear in the
  **side menu** (IQ, HP, armor, speed, world stats).
- **HP drives speed**: 20–100 HP = normal speed; below 20 they taper off and
  stop around **-50 HP**. Balls never die.
- **IQ drift**: slow, barely-moving balls lose IQ (down to 1); active balls
  slowly regain it (up to 15).
- **Green orbs** give 20–30 HP; rare **blue orbs** give 100–130 HP.
- **Armor pickups** negate 30–40% of collision damage.
- **Physics**: fast ball-vs-ball collisions deal damage proportional to impact
  speed; slow touches are harmless.

## Performance notes

- Single `<canvas>`, render capped at 2× device pixel ratio.
- Menu DOM writes throttled to 4×/sec instead of every frame.
- Delta-time capped so tab-switch spikes can't teleport balls.

## Run in a GitHub Codespace

```bash
python -m pip install -r requirements.txt
python app.py
```

Then open the forwarded **port 8000** from the Codespace "Ports" tab.

## Run locally

Same two commands — then open <http://localhost:8000>.
