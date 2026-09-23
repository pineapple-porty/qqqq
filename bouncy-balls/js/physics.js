'use strict';
// Ball vs ball: equal-mass elastic reflection along the collision normal.
// Only fast impacts (above CONFIG.COLLISION_THRESHOLD) deal damage;
// armor absorbs 30–40% of it.

function ballCollisions(balls, stats){
  const C = CONFIG;
  const min = C.BALL_R * 2;
  for (let i = 0; i < balls.length; i++){
    for (let j = i + 1; j < balls.length; j++){
      const a = balls[i], b = balls[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 === 0) continue;

      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      // separate overlap
      const push = (min - d) / 2;
      a.x -= nx * push; a.y -= ny * push;
      b.x += nx * push; b.y += ny * push;

      // velocities (px/s)
      const sa = a.speed(), sb = b.speed();
      const avx = a.dx * sa, avy = a.dy * sa;
      const bvx = b.dx * sb, bvy = b.dy * sb;

      // relative normal speed; skip if already separating
      const rel = (avx - bvx) * nx + (avy - bvy) * ny;
      if (rel > 0) continue;

      const impact = -rel / C.BASE_SPEED;  // in "normal speed" units
      // swap normal components (equal mass elastic)
      const ma = avx * nx + avy * ny;
      const mb = bvx * nx + bvy * ny;
      const dxA = nx * (mb - ma), dyA = ny * (mb - ma);
      const na = Math.hypot(avx + dxA, avy + dyA) || 1;
      const nb = Math.hypot(bvx - dxA, bvy - dyA) || 1;
      a.dx = (avx + dxA) / na; a.dy = (avy + dyA) / na;
      b.dx = (bvx - dxA) / nb; b.dy = (bvy - dyA) / nb;

      if (impact > C.COLLISION_THRESHOLD){
        const dmg = (impact - C.COLLISION_THRESHOLD) * C.DAMAGE_SCALE;
        a.hp -= dmg * (1 - a.armor);
        b.hp -= dmg * (1 - b.armor);
        stats.hits++;
      }
    }
  }
}
