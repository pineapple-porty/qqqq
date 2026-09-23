'use strict';

// --- Orbs (HP pickups) & armor pickups -------------------------------

function spawnOrb(o, W, H){
  o.x = rand(30, W - 30);
  o.y = rand(30, H - 30);
  o.type = Math.random() < CONFIG.BLUE_CHANCE ? 'blue' : 'green';
  // Orbs drift around the arena and bounce off walls (reference style).
  const a = rand(0, Math.PI * 2);
  const s = CONFIG.ORB_SPEED * (o.type === 'blue' ? CONFIG.ORB_BLUE_SPEED_RATIO : 1);
  o.vx = Math.cos(a) * s;
  o.vy = Math.sin(a) * s;
  o.dead = false;
  o.respawn = 0;
}

function spawnArmor(a, W, H){
  a.x = rand(30, W - 30);
  a.y = rand(30, H - 30);
  a.absorb = rand(0.30, 0.40);   // negates 30-40% of hit damage
  a.dead = false;
  a.respawn = 0;
}

function initPickups(W, H){
  const orbs = [], armors = [];
  for (let i = 0; i < CONFIG.ORB_COUNT; i++){ const o = {}; spawnOrb(o, W, H); orbs.push(o); }
  for (let i = 0; i < CONFIG.ARMOR_COUNT; i++){ const a = {}; spawnArmor(a, W, H); armors.push(a); }
  return { orbs, armors };
}

// Orbs move each frame and bounce off the arena walls.
function moveOrbs(pickups, dt, W, H){
  const r = 9;   // orb radius
  for (const o of pickups.orbs){
    if (o.dead) continue;
    o.x += o.vx * dt;
    o.y += o.vy * dt;
    if (o.x < r)       { o.x = r;      o.vx =  Math.abs(o.vx); }
    else if (o.x > W-r){ o.x = W - r;  o.vx = -Math.abs(o.vx); }
    if (o.y < r)       { o.y = r;      o.vy =  Math.abs(o.vy); }
    else if (o.y > H-r){ o.y = H - r;  o.vy = -Math.abs(o.vy); }
  }
}

// Tick respawn timers and bring dead pickups back.
function updatePickups(pickups, dt, W, H){
  for (const o of pickups.orbs)
    if (o.dead){ o.respawn -= dt; if (o.respawn <= 0) spawnOrb(o, W, H); }
  for (const a of pickups.armors)
    if (a.dead){ a.respawn -= dt; if (a.respawn <= 0) spawnArmor(a, W, H); }
}
