# 🏀 Bouncy Balls — IQ Arena

A full port of the hello-wrld game design, with IQ bouncy balls as the guys,
served by a tiny Flask app.

## Project structure

```
bouncy-balls/
├── app.py                 # Flask server (port 8000)
├── requirements.txt
├── index.html             # hello-wrld page + IQ Arena side menu
└── static/
    ├── style.css           # hello-wrld design, copied 1-1 (+ menu)
    └── js/
        ├── config.js       # every tuning knob in one place
        ├── utils.js        # rand/clamp, hpSpeed (1.08^(hp/30)), DOM helpers
        ├── entities.js      # green/blue balls, flyers, armor, walls,
        │                    # hazards, grenades, bunkers, bullets
        ├── ball.js         # IQ balls (guys): ghost AI, collisions, grenades
        ├── ui.js           # side menu, tooltip, selection, drag & fling
        └── main.js         # bootstrap + requestAnimationFrame loop
```

## Features (hello-wrld, 1-1)

- **IQ bouncy balls** replace the guys: draggable with fling, hp + IQ labels,
  speed = 1.08^(hp/30), hard hits (closing ≥ 7.5) deal 30 damage with a 650ms
  per-pair cooldown. Each wall bounce, an IQ-scaled **ghost** previews up to
  IQ bounces ahead and re-aims toward health with a small boost.
- **16 green health balls** drift around; +30 hp each; respawn when eaten.
- **Blue balls** appear when 3+ balls are below -100 hp: touching one grants
  a 3000hp rocket boost for 3 seconds (collected hp is banked and restored).
- **Armor squares** (~21% spawn chance, 10s cooldown): green soaks 5000,
  rare purple 10000; every hit splits half to armor, half to hp.
- **Grenades**: each ball throws one (2s global, 5s per-ball cooldown),
  200 damage on a 1.5s fuse, gravity-affected.
- **Bunkers** spawn when 2+ balls reach 2000hp: mini-gun (2 dmg, 200ms) and
  bounce-gun (30 dmg, 4 bounces, 12-dmg burst).
- **Striped walls** spawn every 5s; 14 fast hits (or timeout) breaks them
  into a burst of 200 collectible health balls.
- **Black hazards** hunt any 1500+ hp ball: 500 damage on contact.
- **14 flyers** shepherd the 3 weakest balls toward the nearest health.
- **Page design** copied 1-1 from hello-wrld, plus the IQ Arena side menu.

## Run in a GitHub Codespace

```bash
python -m pip install -r requirements.txt
python app.py
```

Then open the forwarded **port 8000** from the Codespace "Ports" tab.

## Tuning

Everything lives in `static/js/config.js`.
