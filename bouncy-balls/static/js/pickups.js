'use strict';

// --- Orbs (HP pickups) & armor pickups -------------------------------

function spawnOrb(o, W, H){
  o.x = rand(30, W - 30);
  o.y = rand(30, H - 30);
  o.type = Math.random() < CONFIG.BLUE_CHANCE ? 'blue' : 'green';
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

// Tick respawn timers and bring dead pickups back.
function updatePickups(pickups, dt, W, H){
  for (const o of pickups.orbs)
    if (o.dead){ o.respawn -= dt; if (o.respawn <= 0) spawnOrb(o, W, H); }
  for (const a of pickups.armors)
    if (a.dead){ a.respawn -= dt; if (a.respawn <= 0) spawnArmor(a, W, H); }
}
