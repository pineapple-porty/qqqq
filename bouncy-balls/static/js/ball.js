'use strict';

class Ball {
  constructor(id, W, H){
    const C = CONFIG;
    this.id = id;
    this.x = rand(60, W - 60);
    this.y = rand(60, H - 60);
    const a = rand(0, Math.PI * 2);
    this.dx = Math.cos(a);
    this.dy = Math.sin(a);
    this.hp = rand(30, 80);
    // IQ: how many bounces ahead this ball can "see".
    this.iq = Math.round(rand(9, C.IQ_MAX));
    this.armor = 0;                 // damage absorbed (0 or 0.30..0.40)
    this.hue = rand(0, 360);
    this.moveAccum = 0;
    this.iqTimer = rand(0, 3);
  }

  speed(){ return CONFIG.BASE_SPEED * speedFactor(this.hp); }

  // Slight mid-flight course correction toward the best orb; scales with IQ.
  steer(dt, orbs){
    const orb = bestOrbFor(this, orbs);
    if (!orb) return;
    const cur  = Math.atan2(this.dy, this.dx);
    const want = Math.atan2(orb.y - this.y, orb.x - this.x);
    const maxTurn = 0.9 * (this.iq / CONFIG.IQ_MAX) * dt;
    const na = cur + clamp(angleDelta(cur, want), -maxTurn, maxTurn);
    this.dx = Math.cos(na);
    this.dy = Math.sin(na);
  }

  // Called when the ball hits a wall. nx/ny is the wall's inward normal.
  bounceWall(nx, ny, orbs){
    // Reflect the direction vector off the wall.
    const dot = this.dx * nx + this.dy * ny;
    this.dx -= 2 * dot * nx;
    this.dy -= 2 * dot * ny;

    // A dash of randomness so paths aren't sterile.
    let a = Math.atan2(this.dy, this.dx) + rand(-0.15, 0.15);

    // IQ lookahead: foresee up to iq future bounces and bias the outgoing
    // angle toward the best orb reachable within that horizon.
    if (this.iq >= 2){
      const orb = bestOrbFor(this, orbs);
      if (orb){
        const want = Math.atan2(orb.y - this.y, orb.x - this.x);
        a += angleDelta(a, want) * clamp(this.iq / CONFIG.IQ_MAX, 0, 1) * 0.5;
      }
    }
    this.dx = Math.cos(a);
    this.dy = Math.sin(a);
  }

  update(dt, W, H, orbs){
    const C = CONFIG;
    this.steer(dt, orbs);
    const s = this.speed();
    const ox = this.x, oy = this.y;
    this.x += this.dx * s * dt;
    this.y += this.dy * s * dt;
    this.moveAccum += Math.hypot(this.x - ox, this.y - oy);

    const r = C.BALL_R;
    if (this.x < r)       { this.x = r;       this.bounceWall( 1, 0, orbs); }
    else if (this.x > W-r){ this.x = W - r;   this.bounceWall(-1, 0, orbs); }
    if (this.y < r)       { this.y = r;       this.bounceWall(0,  1, orbs); }
    else if (this.y > H-r){ this.y = H - r;   this.bounceWall(0, -1, orbs); }

    // IQ drift: the slower / less a ball moves, the more IQ it may lose.
    this.iqTimer += dt;
    if (this.iqTimer >= C.IQ_CHECK_INTERVAL){
      const avg = this.moveAccum / this.iqTimer; // px/sec actually moved
      this.moveAccum = 0;
      this.iqTimer = 0;
      if (avg < C.BASE_SPEED * 0.45){
        if (Math.random() < 0.6) this.iq = Math.max(C.IQ_MIN, this.iq - 1);
      } else if (avg > C.BASE_SPEED * 0.8){
        if (Math.random() < 0.35) this.iq = Math.min(C.IQ_MAX, this.iq + 1);
      }
    }
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
