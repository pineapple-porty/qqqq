'use strict';

// --- Ghost simulation -----------------------------------------------------

// Fly a "ghost" straight from (x, y) at `angle`, reflecting off walls,
// for exactly `iq` bounces. Returns where it ends up.
function simulateGhost(x, y, angle, iq, W, H){
  const r = CONFIG.BALL_R;
  let cx = x, cy = y;
  let dx = Math.cos(angle), dy = Math.sin(angle);
  for (let b = 0; b < iq; b++){
    const tx = dx >  1e-9 ? (W - r - cx) / dx : dx < -1e-9 ? (r - cx) / dx : Infinity;
    const ty = dy >  1e-9 ? (H - r - cy) / dy : dy < -1e-9 ? (r - cy) / dy : Infinity;
    const t = Math.min(tx, ty);
    cx += dx * t;
    cy += dy * t;
    if (t === tx) dx = -dx; else dy = -dy;
  }
  return { x: cx, y: cy };
}

class Ball {
  constructor(id, W, H){
    this.id = id;
    this.x = rand(60, W - 60);
    this.y = rand(60, H - 60);
    const a = rand(0, Math.PI * 2);
    this.dx = Math.cos(a);
    this.dy = Math.sin(a);
    this.hp = rand(30, 80);
    // IQ: how many bounces ahead this ball's ghost can foresee.
    this.iq = Math.round(rand(9, CONFIG.IQ_MAX));
    this.armor = 0;              // damage absorbed (0 or 0.30..0.40)
    this.boost = 0;              // temporary speed boost after a smart re-aim
    this.hue = rand(0, 360);
    this.moveAccum = 0;
    this.iqTimer = rand(0, 3);
    // Guy-style dragging state
    this.dragging = false;
    this.dragVX = 0;
    this.dragVY = 0;
  }

  speed(){
    return CONFIG.BASE_SPEED * speedFactor(this.hp) * (1 + this.boost);
  }

  // Called when the ball hits a wall. Natural reflection first; then the
  // ghost tests candidate routes (each bounced up to `iq` times) and picks
  // whichever ends closest to the orb the ball wants. If the winner isn't
  // the natural reflection, re-aim with a small boost toward that point.
  bounceWall(nx, ny, W, H, orbs){
    const C = CONFIG;
    const dot = this.dx * nx + this.dy * ny;
    this.dx -= 2 * dot * nx;
    this.dy -= 2 * dot * ny;
    const natural = Math.atan2(this.dy, this.dx);

    const orb = bestOrbFor(this, orbs);
    if (!orb || this.iq < 2) return;

    const aim = Math.atan2(orb.y - this.y, orb.x - this.x);
    const spread = angleDelta(natural, aim);

    let bestAngle = natural, bestScore = Infinity;
    for (let i = 0; i < C.GHOST_CANDIDATES; i++){
      const f = (i / (C.GHOST_CANDIDATES - 1)) * 1.15;
      const angle = natural + spread * f;
      const end = simulateGhost(this.x, this.y, angle, this.iq, W, H);
      const score = (orb.x - end.x) ** 2 + (orb.y - end.y) ** 2
                  - (orb.type === 'blue' ? 40000 : 0);
      if (score < bestScore){ bestScore = score; bestAngle = angle; }
    }

    if (Math.abs(angleDelta(natural, bestAngle)) > 0.05){
      this.boost = C.BOOST;
      this.dx = Math.cos(bestAngle);
      this.dy = Math.sin(bestAngle);
    }
  }

  // Balls fly straight; nothing changes direction mid-flight (unless dragged).
  update(dt, W, H, orbs){
    const C = CONFIG;
    if (this.dragging){ this.moveAccum = 0; return; }  // carried by cursor

    const s = this.speed();
    const ox = this.x, oy = this.y;
    this.x += this.dx * s * dt;
    this.y += this.dy * s * dt;
    this.moveAccum += Math.hypot(this.x - ox, this.y - oy);
    this.boost *= Math.exp(-C.BOOST_DECAY * dt);

    const r = C.BALL_R;
    if (this.x < r)       { this.x = r;       this.bounceWall( 1, 0, W, H, orbs); }
    else if (this.x > W-r){ this.x = W - r;   this.bounceWall(-1, 0, W, H, orbs); }
    if (this.y < r)       { this.y = r;       this.bounceWall(0,  1, W, H, orbs); }
    else if (this.y > H-r){ this.y = H - r;   this.bounceWall(0, -1, W, H, orbs); }

    // IQ drift: the slower / less a ball moves, the more IQ it may lose.
    this.iqTimer += dt;
    if (this.iqTimer >= C.IQ_CHECK_INTERVAL){
      const avg = this.moveAccum / this.iqTimer;
      this.moveAccum = 0;
      this.iqTimer = 0;
      if (avg < C.BASE_SPEED * 0.45){
        if (Math.random() < 0.6) this.iq = Math.max(C.IQ_MIN, this.iq - 1);
      } else if (avg > C.BASE_SPEED * 0.8){
        if (Math.random() < 0.35) this.iq = Math.min(C.IQ_MAX, this.iq + 1);
      }
    }
  }

  // Guy-style damage: armor negates its 30-40% share.
  takeHit(dmg){
    this.hp -= dmg * (1 - this.armor);
  }
}

// The orb a ball "wants" most. Blue orbs get a virtual distance bonus.
function bestOrbFor(ball, orbs){
  let best = null, bestD = Infinity;
  for (const o of orbs){
    if (o.dead) continue;
    const d = (o.x - ball.x) ** 2 + (o.y - ball.y) ** 2
            - (o.type === 'blue' ? 40000 : 0);
    if (d < bestD){ bestD = d; best = o; }
  }
  return best;
}
