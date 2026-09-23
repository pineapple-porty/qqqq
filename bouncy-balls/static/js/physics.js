'use strict';

// --- Collisions --------------------------------------------------------

// Per-pair hard-hit cooldowns (guy-style).
const hardHitTimes = new Map();

// Ball-vs-ball: separate overlap, then swap velocity along the collision
// normal exactly like the guys (relative normal component exchanged in
// reference units). Fast hits deal flat 30 damage with a 650ms per-pair
// cooldown, like the reference game.
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

      // Effective px/sec velocities (hpSpeed-scaled, like the reference).
      const avx = a.pxVX(), avy = a.pxVY();
      const bvx = b.pxVX(), bvy = b.pxVY();
      const rel = (avx - bvx) * nx + (avy - bvy) * ny;
      if (rel > 0) continue;   // already separating

      // Guy-style hard-hit check: closing speed in reference units.
      const closing = -rel / C.PX_PER_UNIT;
      const key = a.id + '-' + b.id;
      if (closing >= C.HIT_CLOSING_SPEED &&
          now - (hardHitTimes.get(key) || 0) > C.HIT_COOLDOWN_MS){
        a.takeHit(C.HIT_DAMAGE);
        b.takeHit(C.HIT_DAMAGE);
        hardHitTimes.set(key, now);
        stats.hits++;
      }

      // Reference velocity swap: exchange normal components in
      // reference units (exactly like the guys' relative swap).
      const relU = (b.vx * hpSpeed(b.hp) - a.vx * hpSpeed(a.hp)) * nx
                 + (b.vy * hpSpeed(b.hp) - a.vy * hpSpeed(a.hp)) * ny;
      if (relU < 0){
        a.vx += relU * nx; a.vy += relU * ny;
        b.vx -= relU * nx; b.vy -= relU * ny;
      }
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
