'use strict';
// Orb / armor spawn, attraction and pickup logic.

// Blue orbs are more attractive: effective distance reduced so smart
// balls prefer them when roughly reachable.
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
  a.absorb = rand(0.30, 0.40);
  a.dead = false;
  a.respawn = 0;
}

// Ball vs orbs / armor pickups. Mutates hp, armor, stats.
function pickupCollisions(balls, orbs, armors, stats){
  const rr = (CONFIG.BALL_R + CONFIG.PICKUP_RADIUS) ** 2;
  for (const b of balls){
    for (const o of orbs){
      if (o.dead) continue;
      if ((o.x - b.x) ** 2 + (o.y - b.y) ** 2 < rr){
        b.hp += o.type === 'blue' ? rand(100, 130) : rand(20, 30);
        stats[o.type === 'blue' ? 'blue' : 'green']++;
        o.dead = true;
        o.respawn = rand(CONFIG.ORB_RESPAWN[0], CONFIG.ORB_RESPAWN[1]);
      }
    }
    for (const a of armors){
      if (a.dead) continue;
      if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 < rr){
        if (a.absorb > b.armor) b.armor = a.absorb;
        stats.armor++;
        a.dead = true;
        a.respawn = rand(CONFIG.ARMOR_RESPAWN[0], CONFIG.ARMOR_RESPAWN[1]);
      }
    }
  }
}

function updateRespawns(orbs, armors, W, H, dt){
  for (const o of orbs){
    if (o.dead){ o.respawn -= dt; if (o.respawn <= 0) spawnOrb(o, W, H); }
  }
  for (const a of armors){
    if (a.dead){ a.respawn -= dt; if (a.respawn <= 0) spawnArmor(a, W, H); }
  }
}
