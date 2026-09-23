# 🏀 Bouncy Balls — IQ Arena

A self-contained HTML/JavaScript simulation served by a tiny Flask app.

## What's inside

- **Balls** bounce around the arena. Their **IQ** (1–15) is how many bounces
  ahead they can "see" — smarter balls steer toward orbs and aim their bounces.
- **IQ tooltip on hover**, click to select a ball; full stats appear in the
  **side menu** (IQ, HP, armor, speed, world stats).
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

## Run locally

Same two commands — then open <http://localhost:8000>.
