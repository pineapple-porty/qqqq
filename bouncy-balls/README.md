# 🏀 Bouncy Balls — IQ Arena

A canvas-based HTML/JavaScript simulation served by a tiny Flask app.

## Project structure

```
bouncy-balls/
├── app.py                 # Flask server (port 8000)
├── requirements.txt
├── index.html             # page skeleton
└── static/
    ├── style.css           # all styling (side menu, tooltip)
    └── js/
        ├── config.js       # all tuning knobs in one place
        ├── utils.js        # rand/clamp, angle math, HP->speed curve
        ├── ball.js         # Ball class: steering, IQ lookahead, IQ drift
        ├── pickups.js      # orb/armor spawning & respawns
        ├── physics.js      # ball-vs-ball & ball-vs-pickup collisions
        ├── render.js       # canvas drawing
        ├── ui.js           # side menu, tooltip, selection
        └── main.js         # bootstrap + requestAnimationFrame loop
```

## The rules

- **Balls** bounce around the arena. Their **IQ** (1–15) is how many bounces
  ahead they can "see" — smarter balls steer toward orbs and aim their bounces.
- **IQ tooltip on hover**; click a ball to select it, and full stats appear in
  the **side menu** (IQ, HP, armor, speed, world stats).
- **HP drives speed**: 20–100 HP = normal speed; below 20 they taper off and
  stop around **-50 HP**. Balls never die.
- **IQ drift**: slow, barely-moving balls lose IQ (down to 1); active balls
  slowly regain it (up to 15).
- **Green orbs** give 20–30 HP; rare **blue orbs** give 100–130 HP.
- **Armor pickups** negate 30–40% of collision damage.
- **Physics**: fast ball-vs-ball collisions deal damage proportional to impact
  speed; slow touches are harmless.

## Run in a GitHub Codespace

```bash
python -m pip install -r requirements.txt
python app.py
```

Then open the forwarded **port 8000** from the Codespace "Ports" tab.

## Tuning

Everything lives in `static/js/config.js` — ball count, orb counts, blue-orb
rarity, collision threshold, IQ bounds, speed curve, etc.
