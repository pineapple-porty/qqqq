'use strict';

// --- IQ ghost: fly straight, reflect off walls for exactly `iq` bounces ---
function simulateGhost(x, y, angle, iq){
  const r = CONFIG.GUY_SIZE / 2;
  let cx = x, cy = y, dx = Math.cos(angle), dy = Math.sin(angle);
  for (let b = 0; b < iq; b++){
    const tx = dx >  1e-9 ? (innerWidth  - r - cx) / dx : dx < -1e-9 ? (r - cx) / dx : Infinity;
    const ty = dy >  1e-9 ? (innerHeight - r - cy) / dy : dy < -1e-9 ? (r - cy) / dy : Infinity;
    const t = Math.min(tx, ty);
    cx += dx * t;
    cy += dy * t;
    if (t === tx) dx = -dx; else dy = -dy;
  }
  return { x: cx, y: cy };
}

function bestGreenFor(guy){
  let best = null, bestD = Infinity;
  for (const ball of greenBalls){
    const d = (ball.x - guy.x) ** 2 + (ball.y - guy.y) ** 2;
    if (d < bestD){ bestD = d; best = ball; }
  }
  return best;
}

// --- The guys: IQ bouncy balls -------------------------------------------
class Ball {
  constructor(id){
    const S = CONFIG.GUY_SIZE;
    this.id = id;
    this.width = this.height = S;
    this.radius = S / 2;
    this.x = rand(60, innerWidth - 60 - S);
    this.y = rand(60, innerHeight - 60 - S);
    this.vx = rand(1.0, 1.4) * (Math.random() < 0.5 ? -1 : 1);
    this.vy = rand(1.0, 1.35) * (Math.random() < 0.5 ? -1 : 1);
    this.hp = rand(30, 80);
    this.iq = Math.round(rand(9, CONFIG.IQ_MAX));   // ghost bounces foreseen
    this.boost = 0;
    this.armor = 0;
    this.armorType = null;
    this.dragging = false;
    this.dragVX = 0; this.dragVY = 0;
    this.moveAccum = 0; this.iqTimer = rand(0, 3);
    this.grenadeCooldown = 0;

    this.element = makeElement('guy-ball guy-ball-' + id);
    this.element.style.width = this.element.style.height = S + 'px';
    this.element.style.filter = 'hue-rotate(' + Math.round(id * (360 / CONFIG.NUM_GUYS)) + 'deg) saturate(0.8)';
    this.armorWrapper = document.createElement('div');
    this.armorWrapper.className = 'armor-wrapper';
    this.element.appendChild(this.armorWrapper);
    this.hpLabel = document.createElement('span');
    this.hpLabel.className = 'guy-hp';
    this.iqLabel = document.createElement('span');
    this.iqLabel.className = 'guy-iq';
    this.element.appendChild(this.hpLabel);
    this.element.appendChild(this.iqLabel);
    updateLabels(this);
    place(this);
  }

  get centerX(){ return this.x + this.width / 2; }
  get centerY(){ return this.y + this.height / 2; }

  // Arena-edge bounce: flip the component (reference style), then the ghost
  // tests candidate routes and re-aims with a small boost if one is better.
  bounceEdge(axis){
    if (axis === 'x') this.vx = -this.vx;
    else              this.vy = -this.vy;

    const ball = bestGreenFor(this);
    if (!ball || this.iq < 2) return;   // dumb balls just bounce

    const sp = Math.hypot(this.vx, this.vy) || 1;
    const natural = Math.atan2(this.vy, this.vx);
    const aim = Math.atan2(ball.y - this.centerY, ball.x - this.centerX);
    const spread = angleDelta(natural, aim);

    let bestAngle = natural, bestScore = Infinity;
    for (let i = 0; i < CONFIG.GHOST_CANDIDATES; i++){
      const f = (i / (CONFIG.GHOST_CANDIDATES - 1)) * 1.15;
      const angle = natural + spread * f;
      const end = simulateGhost(this.centerX, this.centerY, angle, this.iq);
      const score = (ball.x - end.x) ** 2 + (ball.y - end.y) ** 2;
      if (score < bestScore){ bestScore = score; bestAngle = angle; }
    }
    if (Math.abs(angleDelta(natural, bestAngle)) > 0.05){
      this.boost = CONFIG.BOOST;
      this.vx = Math.cos(bestAngle) * sp;
      this.vy = Math.sin(bestAngle) * sp;
    }
  }

  update(elapsed, dt, now){
    if (this.dragging){ this.moveAccum = 0; place(this); return; }

    const speed = hpSpeed(this.hp) * (1 + this.boost);
    const mx = this.vx * speed * elapsed, my = this.vy * speed * elapsed;
    this.x += mx;
    this.y += my;
    this.moveAccum += Math.hypot(mx, my);
    this.boost *= Math.exp(-CONFIG.BOOST_DECAY * dt);

    if (this.x <= 0)                             { this.x = 0;                         this.bounceEdge('x'); }
    else if (this.x >= innerWidth - this.width)  { this.x = innerWidth - this.width;  this.bounceEdge('x'); }
    if (this.y <= 0)                             { this.y = 0;                         this.bounceEdge('y'); }
    else if (this.y >= innerHeight - this.height){ this.y = innerHeight - this.height; this.bounceEdge('y'); }

    // Blue-ball boost expiry.
    if (this.boostEnds && now >= this.boostEnds){
      this.hp = this.savedHp + (this.collectedHp || 0);
      delete this.savedHp; delete this.boostEnds; delete this.collectedHp;
      updateLabels(this);
    }

    // IQ drift: slow balls get dumber, active balls get smarter.
    this.iqTimer += dt;
    if (this.iqTimer >= CONFIG.IQ_CHECK_INTERVAL){
      const avg = this.moveAccum / this.iqTimer;   // px per second
      this.moveAccum = 0;
      this.iqTimer = 0;
      if (avg < 45){
        if (Math.random() < 0.6) this.iq = Math.max(CONFIG.IQ_MIN, this.iq - 1);
      } else if (avg > 90){
        if (Math.random() < 0.35) this.iq = Math.min(CONFIG.IQ_MAX, this.iq + 1);
      }
      updateLabels(this);
    }
    place(this);
  }
}

// --- Guy-vs-guy (reference separateGuys) ----------------------------------
function separateGuys(now){
  for (let i = 0; i < guys.length; i++){
    for (let j = i + 1; j < guys.length; j++){
      const a = guys[i], b = guys[j];
      if (a.dragging || b.dragging) continue;
      const dx = b.centerX - a.centerX, dy = b.centerY - a.centerY;
      const dist = Math.hypot(dx, dy) || 0.001;
      const min = a.radius + b.radius;
      if (dist >= min) continue;
      const nx = dx / dist, ny = dy / dist;
      const overlap = min - dist;
      a.x -= nx * overlap / 2; a.y -= ny * overlap / 2;
      b.x += nx * overlap / 2; b.y += ny * overlap / 2;
      const aS = hpSpeed(a.hp), bS = hpSpeed(b.hp);
      const closing = -((b.vx * bS - a.vx * aS) * nx + (b.vy * bS - a.vy * aS) * ny);
      const key = a.id + '-' + b.id;
      if (closing >= CONFIG.HIT_CLOSING_SPEED &&
          now - (hardHitTimes.get(key) || 0) > CONFIG.HIT_COOLDOWN_MS){
        damageGuy(a, CONFIG.HIT_DAMAGE);
        damageGuy(b, CONFIG.HIT_DAMAGE);
        hardHitTimes.set(key, now);
        stats.hits++;
      }
      const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rel < 0){
        a.vx += rel * nx; a.vy += rel * ny;
        b.vx -= rel * nx; b.vy -= rel * ny;
      }
    }
  }
}

// --- Grenades (reference throwGrenade) ------------------------------------
function throwGrenade(guy, now){
  if (now - lastGrenadeTime < CONFIG.GRENADE_GLOBAL_CD) return;
  if (guy.grenadeCooldown && now < guy.grenadeCooldown) return;
  lastGrenadeTime = now;
  guy.grenadeCooldown = now + CONFIG.GRENADE_CD;
  const size = CONFIG.GRENADE_SIZE;
  const grenade = {
    element: makeElement('grenade'),
    x: guy.centerX - size / 2,
    y: guy.centerY - size / 2,
    vx: guy.vx * 1.5 + (Math.random() - 0.5) * 4,
    vy: guy.vy * 1.5 + (Math.random() - 0.5) * 4,
    size, width: size, height: size, radius: size / 2,
    damage: CONFIG.GRENADE_DMG,
    exploding: false,
    fuseTime: now + CONFIG.GRENADE_FUSE_MS,
    thrower: guy,
  };
  grenade.element.style.width = grenade.element.style.height = size + 'px';
  grenades.push(grenade);
  stats.grenades++;
  place(grenade);
}

function updateGrenades(now, elapsed){
  grenades.slice().forEach((grenade) => {
    if (grenade.exploding) return;
    grenade.x += grenade.vx * elapsed;
    grenade.y += grenade.vy * elapsed;
    grenade.vy += CONFIG.GRENADE_GRAVITY * elapsed;
    keepOnScreen(grenade);
    place(grenade);
    if (now >= grenade.fuseTime){
      grenade.exploding = true;
      grenade.element.style.background = '#f59e0b';
      grenade.element.style.boxShadow = '0 0 20px #fbbf24';
      for (const target of guys){
        if (target === grenade.thrower) continue;
        const dist = Math.hypot(grenade.x + grenade.radius - target.centerX,
                                grenade.y + grenade.radius - target.centerY);
        if (dist < grenade.radius + target.radius) damageGuy(target, grenade.damage);
      }
      setTimeout(() => {
        grenade.element.remove();
        grenades.splice(grenades.indexOf(grenade), 1);
      }, 500);
    }
  });
}
