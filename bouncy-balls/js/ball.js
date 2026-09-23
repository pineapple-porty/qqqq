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
    this.iq = Math.round(rand(9, 15));  // IQ: bounces visible ahead (1..15)
    this.armor = 0;                     // damage absorption 0 / 0.30..0.40
    this.hue = rand(0, 360);
    this.moveAccum = 0;
    this.iqTimer = rand(0, 3);
  }

  speed(){ return CONFIG.BASE_SPEED * speedFactor(this.hp); }

  // Slight mid-flight course correction; scales with IQ.
  steer(dt, orbs){
    const orb = bestOrbFor(this, orbs);
    if (!orb) return;
    const cur  = Math.atan2(this.dy, this.dx);
    const want = Math.atan2(orb.y - this.y, orb.x - this.x);
    let d = want - cur;
    while (d >  Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    const maxTurn = 0.9 * (this.iq / CONFIG.IQ_MAX) * dt;  // smart balls turn tighter
    d = clamp(d, -maxTurn, maxTurn);
    this.dx = Math.cos(cur + d);
    this.dy = Math.sin(cur + d);
  }

  // Wall bounce with IQ lookahead: foresee up to iq future bounces and
  // aim at the best orb reachable within that horizon.
  bounceWall(nx, ny, orbs){
    const dot = this.dx * nx + this.dy * ny;
    this.dx -= 2 * dot * nx;
    this.dy -= 2 * dot * ny;

    const jitter = rand(-0.15, 0.15);  // small randomness so paths aren't sterile
    let a = Math.atan2(this.dy, this.dx) + jitter;

    if (this.iq >= 2){
      const orb = bestOrbFor(this, orbs);
      if (orb){
        const want = Math.atan2(orb.y - this.y, orb.x - this.x);
        let d = want - a;
        while (d >  Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        a += d * clamp(this.iq / CONFIG.IQ_MAX, 0, 1) * 0.5;  // up to ~30° of aim
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
    if (this.x < r)      { this.x = r;      this.bounceWall( 1, 0, orbs); }
    else if (this.x > W - r) { this.x = W - r; this.bounceWall(-1, 0, orbs); }
    if (this.y < r)      { this.y = r;      this.bounceWall(0,  1, orbs); }
    else if (this.y > H - r) { this.y = H - r; this.bounceWall(0, -1, orbs); }

    // IQ drift: the slower / less a ball moves, the more IQ it may lose.
    this.iqTimer += dt;
    if (this.iqTimer >= C.IQ_CHECK_INTERVAL){
      const avg = this.moveAccum / this.iqTimer;  // px/sec actually moved
      this.moveAccum = 0;
      this.iqTimer = 0;
      if (avg < C.BASE_SPEED * 0.45){
        if (Math.random() < 0.6) this.iq = Math.max(C.IQ_MIN, this.iq - 1);   // floor: 1
      } else if (avg > C.BASE_SPEED * 0.8){
        if (Math.random() < 0.35) this.iq = Math.min(C.IQ_MAX, this.iq + 1);  // ceiling: 15
      }
    }
  }
}
