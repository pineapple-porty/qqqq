'use strict';

// --- Collisions --------------------------------------------------------

// Per-pair hard-hit cooldowns (guy-style).
const hardHitTimes = new Map();

// Ball-vs-ball: separate overlap, swap velocities along the normal, and deal
// flat 30 damage when the closing speed exceeds the threshold — with a
// 650ms per-pair cooldown, exactly like the guys in the reference game.
function collideBalls(balls, stats, now){
  const C = CONFIG;
  for (let i = 0; i < balls.length; i++){
    for (let j = i + 1; j < balls.length; j++){
      const a = balls[i], b = balls[j];
      if (a.dragging || b.dragging) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const min = C.BALL_R * 2;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 === 0) continue;

      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      const push = (min - d) / 2;
      a.x -= nx * push; a.y -= ny * push;
      b.x += nx * push; b.y += ny * push;

      const sa = a.speed(), sb = b.speed();
      const avx = a.dx * sa, avy = a.dy * sa;
      const bvx = b.dx * sb, bvy = b.dy * sb;

      const rel = (avx - bvx) * nx + (avy - bvy) * ny;
      if (rel > 0) continue;   // already separating

      // Guy-style hard-hit check.
      const closing = -rel / C.REFERENCE_UNIT;
      const key = a.id + '-' + b.id;
      if (closing >= C.HIT_CLOSING_SPEED &&
          now - (hardHitTimes.get(key) || 0) > C.HIT_COOLDOWN_MS){
        a.takeHit(C.HIT_DAMAGE);
        b.takeHit(C.HIT_DAMAGE);
        hardHitTimes.set(key, now);
        stats.hits++;
      }

      // Equal-mass elastic swap of normal components.
      const ma = avx * nx + avy * ny;
      const mb = bvx * nx + bvy * ny;
      const dxA = nx * (mb - ma), dyA = ny * (mb - ma);
      const na = Math.hypot(avx + dxA, avy + dyA) || 1;
      const nb = Math.hypot(bvx - dxA, bvy - dyA) || 1;
      a.dx = (avx + dxA) / na; a.dy = (avy + dyA) / na;
      b.dx = (bvx - dxA) / nb; b.dy = (bvy - dyA) / nb;
    }
  }
}

// Balls eating orbs and grabbing armor.
function collidePickups(balls, pickups, stats){
  const reach = CONFIG.BALL_R + CONFIG.PICKUP_RADIUS;
  const r2 = reach * reach;
  for (const b of balls){
    for (const o of pickups.orbs){
      if (o.dead) continue;
      if ((o.x - b.x) ** 2 + (o.y - b.y) ** 2 < r2){
        b.hp += o.type === 'blue' ? rand(100, 130) : rand(20, 30);
        stats[o.type]++;
        o.dead = true;
        o.respawn = rand(4, 9);
      }
    }
    for (const a of pickups.armors){
      if (a.dead) continue;
      if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 < r2){
        if (a.absorb > b.armor) b.armor = a.absorb;
        stats.armor++;
        a.dead = true;
        a.respawn = rand(6, 12);
      }
    }
  }
}
