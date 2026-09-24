'use strict';

// --- World state (all hello-wrld entity pools) ---------------------------
const greenBalls = [], burstBalls = [], blueBalls = [], flyers = [];
const armorSquares = [], hazards = [], walls = [], grenades = [], bunkers = [];
const miniBullets = [], bounceBalls = [];
const hardHitTimes = new Map();                 // per-pair hard-hit cooldowns
const stats = { green: 0, blue: 0, armor: 0, hits: 0, grenades: 0, wallsBurst: 0, hazards: 0 };
let lastArmorSpawn = 0, lastGrenadeTime = 0, lastBunkerSpawn = 0;

function keepOnScreen(obj){
  const maxX = Math.max(0, innerWidth - (obj.width || obj.size));
  const maxY = Math.max(0, innerHeight - (obj.height || obj.size));
  if (obj.x <= 0 || obj.x >= maxX){ obj.x = clamp(obj.x, 0, maxX); obj.vx = -obj.vx; }
  if (obj.y <= 0 || obj.y >= maxY){ obj.y = clamp(obj.y, 0, maxY); obj.vy = -obj.vy; }
}

// Shared damage helper (reference armor split: half to armor, half to hp).
function damageGuy(guy, dmg){
  let actual = dmg;
  if (guy.armor > 0){
    const half = Math.ceil(dmg / 2);
    guy.armor -= half;
    actual = Math.floor(dmg / 2);
    if (guy.armor <= 0){ guy.armor = 0; guy.armorType = null; }
    updateArmorVisual(guy);
  }
  guy.hp -= actual;
  updateLabels(guy);
}

function updateLabels(guy){
  guy.hpLabel.textContent = 'hp:' + Math.round(guy.hp);
  guy.iqLabel.textContent = 'IQ:' + guy.iq;
}

function updateArmorVisual(guy){
  const wrap = guy.armorWrapper;
  if (guy.armor > 0){
    wrap.style.display = 'block';
    wrap.style.background = guy.armorType === 'purple' ? 'rgba(168,85,247,0.4)' : 'rgba(84,184,107,0.4)';
    wrap.style.border = '2px solid ' + (guy.armorType === 'purple' ? '#a855f7' : '#54b86b');
  } else {
    wrap.style.display = 'none';
  }
}

// --- Green health balls & burst balls ------------------------------------
function respawnBall(ball){
  ball.x = rand(0, Math.max(0, innerWidth - ball.size));
  ball.y = rand(0, Math.max(0, innerHeight - ball.size));
}

function collectGreenBalls(elapsed){
  [...greenBalls, ...burstBalls].forEach((ball) => {
    ball.x += ball.vx * elapsed;
    ball.y += ball.vy * elapsed;
    ball.width = ball.height = ball.size;
    keepOnScreen(ball);
    for (const guy of guys){
      if (Math.hypot(ball.x + ball.radius - guy.centerX, ball.y + ball.radius - guy.centerY) < guy.radius + ball.radius){
        if (guy.boostEnds){
          guy.collectedHp = (guy.collectedHp || 0) + CONFIG.GREEN_HP;
        } else {
          guy.hp += CONFIG.GREEN_HP;
          stats.green++;
        }
        updateLabels(guy);
        if (greenBalls.includes(ball)) respawnBall(ball);
        else {
          ball.element.remove();
          burstBalls.splice(burstBalls.indexOf(ball), 1);
        }
        break;
      }
    }
    place(ball);
  });
}

// --- Armor squares -------------------------------------------------------
function spawnArmorSquare(now){
  if (armorSquares.length > 0 || now - lastArmorSpawn < CONFIG.ARMOR_COOLDOWN) return;
  if (Math.random() < CONFIG.ARMOR_SPAWN_CHANCE) return;   // ~21% chance
  lastArmorSpawn = now;
  const isPurple = Math.random() < CONFIG.ARMOR_PURPLE_CHANCE;
  const size = CONFIG.ARMOR_SIZE;
  const armor = {
    element: makeElement(isPurple ? 'armor-square armor-purple' : 'armor-square armor-green'),
    x: rand(20, innerWidth - 44), y: rand(20, innerHeight - 44),
    size, width: size, height: size, radius: size / 2,
    armorType: isPurple ? 'purple' : 'green',
    armorHp: isPurple ? CONFIG.ARMOR_PURPLE : CONFIG.ARMOR_GREEN,
  };
  armor.element.style.width = armor.element.style.height = size + 'px';
  armorSquares.push(armor);
  place(armor);
}

function collectArmorSquares(){
  armorSquares.forEach((armor) => {
    for (const guy of guys){
      if (Math.hypot(armor.x + armor.radius - guy.centerX, armor.y + armor.radius - guy.centerY) < guy.radius + armor.radius){
        guy.armor = armor.armorHp;
        guy.armorType = armor.armorType;
        updateArmorVisual(guy);
        stats.armor++;
        armor.element.remove();
        armorSquares.splice(armorSquares.indexOf(armor), 1);
        break;
      }
    }
  });
}

// --- Blue balls (rescue boost) -------------------------------------------
function spawnBlueBallsIfNeeded(now){
  const lowCount = guys.filter((guy) => guy.hp < CONFIG.BLUE_LOW_HP).length;
  if (lowCount >= CONFIG.BLUE_LOW_COUNT && blueBalls.length === 0){
    for (let index = 0; index < 3; index++){
      const ball = {
        element: makeElement('game-object blue-ball'),
        x: rand(20, innerWidth - 48), y: rand(20, innerHeight - 48),
        size: 28, width: 28, height: 28, radius: 14,
      };
      blueBalls.push(ball);
      place(ball);
    }
  } else if (lowCount < CONFIG.BLUE_LOW_COUNT){
    blueBalls.splice(0).forEach((ball) => ball.element.remove());
  }
  for (const guy of guys){
    const hit = blueBalls.find((ball) =>
      Math.hypot(ball.x + 14 - guy.centerX, ball.y + 14 - guy.centerY) < guy.radius + 14);
    if (!hit) continue;
    if (guy.savedHp === undefined) guy.savedHp = guy.hp;
    guy.hp = CONFIG.BOOST_HP;
    guy.boostEnds = now + CONFIG.BOOST_MS;
    stats.blue++;
    updateLabels(guy);
    hit.element.remove();
    blueBalls.splice(blueBalls.indexOf(hit), 1);
    break;
  }
}

// --- Bunkers -------------------------------------------------------------
function spawnBunker(){
  if (bunkers.length > 0) return;
  const highHpGuys = guys.filter((g) => g.hp >= CONFIG.BUNKER_HIGH_HP);
  if (highHpGuys.length < CONFIG.BUNKER_MIN_HIGH) return;
  const size = CONFIG.BUNKER_SIZE;
  const bunker = {
    element: makeElement('bunker'),
    x: rand(size, innerWidth - size * 2), y: rand(size, innerHeight - size * 2),
    width: size, height: size, radius: size / 2,
    miniGunCooldown: 0, bounceGunCooldown: 0,
  };
  bunker.element.style.width = bunker.element.style.height = size + 'px';
  bunkers.push(bunker);
  place(bunker);
}

function updateBunkers(now){
  bunkers.forEach((bunker) => {
    if (now >= bunker.miniGunCooldown){
      bunker.miniGunCooldown = now + CONFIG.MINI_CD_MS;
      const target = guys[Math.floor(Math.random() * guys.length)];
      const angle = Math.atan2(target.centerY - (bunker.y + bunker.height / 2),
                                target.centerX - (bunker.x + bunker.width / 2));
      miniBullets.push({
        element: makeElement('mini-bullet'),
        x: bunker.centerX - 4, y: bunker.centerY - 4,
        vx: Math.cos(angle) * CONFIG.MINI_SPEED,
        vy: Math.sin(angle) * CONFIG.MINI_SPEED,
        size: 8, width: 8, height: 8, radius: 4, damage: CONFIG.MINI_DMG,
      });
    }
    if (now >= bunker.bounceGunCooldown){
      bunker.bounceGunCooldown = now + CONFIG.BOUNCE_CD_MS;
      const angle = Math.random() * Math.PI * 2;
      bounceBalls.push({
        element: makeElement('bounce-ball'),
        x: bunker.centerX - 6, y: bunker.centerY - 6,
        vx: Math.cos(angle) * CONFIG.BOUNCE_SPEED,
        vy: Math.sin(angle) * CONFIG.BOUNCE_SPEED,
        size: 12, width: 12, height: 12, radius: 6,
        damage: CONFIG.BOUNCE_DMG, bounces: 0, maxBounces: CONFIG.BOUNCE_MAX,
      });
    }
  });
}

function updateMiniBullets(elapsed){
  miniBullets.slice().forEach((bullet) => {
    bullet.x += bullet.vx * elapsed;
    bullet.y += bullet.vy * elapsed;
    place(bullet);
    for (const guy of guys){
      if (Math.hypot(bullet.x + bullet.radius - guy.centerX, bullet.y + bullet.radius - guy.centerY) < guy.radius + bullet.radius){
        damageGuy(guy, bullet.damage);
        bullet.element.remove();
        miniBullets.splice(miniBullets.indexOf(bullet), 1);
        break;
      }
    }
    if (bullet.x < 0 || bullet.x > innerWidth || bullet.y < 0 || bullet.y > innerHeight){
      bullet.element.remove();
      miniBullets.splice(miniBullets.indexOf(bullet), 1);
    }
  });
}

function updateBounceBalls(elapsed){
  bounceBalls.slice().forEach((ball) => {
    ball.x += ball.vx * elapsed;
    ball.y += ball.vy * elapsed;
    place(ball);
    for (const guy of guys){
      if (Math.hypot(ball.x + ball.radius - guy.centerX, ball.y + ball.radius - guy.centerY) < guy.radius + ball.radius){
        damageGuy(guy, ball.damage);
        ball.element.remove();
        bounceBalls.splice(bounceBalls.indexOf(ball), 1);
        return;
      }
    }
    if (ball.x <= 0 || ball.x >= innerWidth - ball.size || ball.y <= 0 || ball.y >= innerHeight - ball.size){
      ball.bounces += 1;
      if (ball.bounces >= ball.maxBounces){
        for (const guy of guys){
          const dist = Math.hypot(ball.x + ball.radius - guy.centerX, ball.y + ball.radius - guy.centerY);
          if (dist < CONFIG.BOUNCE_BURST_RADIUS) damageGuy(guy, CONFIG.BOUNCE_BURST_DMG);
        }
        ball.element.remove();
        bounceBalls.splice(bounceBalls.indexOf(ball), 1);
        return;
      }
      ball.vx *= -1;
      ball.vy *= -1;
    }
  });
}

// --- Flyers ---------------------------------------------------------------
function initFlyers(){
  for (let index = 0; index < CONFIG.FLYER_COUNT; index++){
    const size = 7 + index % 4 * 2;
    const element = makeElement('game-object flyer');
    element.style.cssText += 'width:' + size + 'px;height:' + size + 'px;color:' +
      CONFIG.FLYER_COLORS[index % 4] + ';background:currentColor';
    flyers.push({
      element, size, width: size, height: size,
      x: rand(0, innerWidth), y: rand(0, innerHeight),
      vx: rand(-2, 2), vy: rand(-2, 2), phase: rand(0, Math.PI * 2),
    });
  }
}

function moveFlyers(elapsed, now){
  const slowest = guys.map((guy, index) => ({ guy, index }))
    .sort((a, b) => a.guy.hp - b.guy.hp).slice(0, 3);
  const guyToBall = new Map();
  if (greenBalls.length > 0){
    slowest.forEach(({ guy }) => {
      const nearest = greenBalls.reduce((nearest, ball) => {
        const dist = Math.hypot(ball.x + ball.radius - guy.centerX, ball.y + ball.radius - guy.centerY);
        const nearestDist = Math.hypot(nearest.x + nearest.radius - guy.centerX, nearest.y + nearest.radius - guy.centerY);
        return dist < nearestDist ? ball : nearest;
      }, greenBalls[0]);
      guyToBall.set(guy, nearest);
    });
  }
  flyers.forEach((flyer, index) => {
    const target = slowest[index % slowest.length].guy;
    const dx = target.centerX - flyer.x;
    const dy = target.centerY - flyer.y;
    const distance = Math.hypot(dx, dy) || 1;
    const wobble = Math.sin(now / 260 + flyer.phase) * 0.08;
    flyer.vx += (dx / distance - dy / distance * wobble) * 0.045 * elapsed;
    flyer.vy += (dy / distance + dx / distance * wobble) * 0.045 * elapsed;
    const speed = Math.hypot(flyer.vx, flyer.vy);
    if (speed > CONFIG.FLYER_MAX_SPEED){ flyer.vx *= CONFIG.FLYER_MAX_SPEED / speed; flyer.vy *= CONFIG.FLYER_MAX_SPEED / speed; }
    flyer.x += flyer.vx * elapsed;
    flyer.y += flyer.vy * elapsed;
    flyer.width = flyer.height = flyer.size;
    keepOnScreen(flyer);
    flyer.element.style.transform = 'translate3d(' + flyer.x + 'px,' + flyer.y + 'px,0) rotate(' + Math.atan2(flyer.vy, flyer.vx) + 'rad)';
    // Flyers nudge their target toward the nearest green ball.
    if (!target.dragging){
      const nearestBall = guyToBall.get(target);
      if (nearestBall){
        const dxToBall = nearestBall.x + nearestBall.radius - target.centerX;
        const dyToBall = nearestBall.y + nearestBall.radius - target.centerY;
        const distToBall = Math.hypot(dxToBall, dyToBall) || 1;
        const pushStrength = CONFIG.FLYER_PUSH * elapsed;
        target.vx += (dxToBall / distToBall) * pushStrength;
        target.vy += (dyToBall / distToBall) * pushStrength;
      }
    }
  });
}

// --- Walls ----------------------------------------------------------------
function spawnWall(){
  const horizontal = Math.random() < 0.5;
  const wall = {
    element: makeElement('wall'),
    x: rand(30, Math.max(31, innerWidth - 250)),
    y: rand(30, Math.max(31, innerHeight - 250)),
    width: horizontal ? rand(CONFIG.WALL_MIN_LEN, CONFIG.WALL_MAX_LEN) : 10,
    height: horizontal ? 10 : rand(CONFIG.WALL_MIN_LEN, CONFIG.WALL_MAX_LEN),
    expires: performance.now() + rand(CONFIG.WALL_MIN_LIFE, CONFIG.WALL_MAX_LIFE),
    hits: 0,
  };
  wall.element.style.cssText += 'left:' + wall.x + 'px;top:' + wall.y + 'px;width:' +
    wall.width + 'px;height:' + wall.height + 'px';
  walls.push(wall);
}

function collideGuyWithWalls(guy){
  walls.forEach((wall) => {
    const overlaps = guy.x < wall.x + wall.width && guy.x + guy.width > wall.x &&
                    guy.y < wall.y + wall.height && guy.y + guy.height > wall.y;
    if (!overlaps) return;
    const moveLeft = guy.x + guy.width - wall.x;
    const moveRight = wall.x + wall.width - guy.x;
    const moveUp = guy.y + guy.height - wall.y;
    const moveDown = wall.y + wall.height - guy.y;
    const smallestMove = Math.min(moveLeft, moveRight, moveUp, moveDown);
    const impactSpeed = Math.hypot(guy.vx * hpSpeed(guy.hp), guy.vy * hpSpeed(guy.hp));
    if (smallestMove === moveLeft)       { guy.x -= moveLeft;  guy.vx = -Math.abs(guy.vx); }
    else if (smallestMove === moveRight) { guy.x += moveRight; guy.vx =  Math.abs(guy.vx); }
    else if (smallestMove === moveUp)    { guy.y -= moveUp;    guy.vy = -Math.abs(guy.vy); }
    else                                 { guy.y += moveDown;  guy.vy =  Math.abs(guy.vy); }
    if (impactSpeed >= CONFIG.HIT_CLOSING_SPEED) wall.hits += 1;
  });
}

function processWalls(now){
  walls.slice().forEach((wall) => {
    if (now < wall.expires && wall.hits < CONFIG.WALL_HITS) return;
    if (wall.hits >= CONFIG.WALL_HITS){
      stats.wallsBurst++;
      for (let index = 0; index < CONFIG.WALL_BURST; index++){
        const size = 8;
        const ball = {
          element: makeElement('game-object health-ball'),
          x: wall.x, y: wall.y,
          vx: rand(-4, 4), vy: rand(-4, 4),
          size, width: size, height: size, radius: 4,
        };
        ball.element.style.width = ball.element.style.height = size + 'px';
        burstBalls.push(ball);
      }
    }
    wall.element.remove();
    walls.splice(walls.indexOf(wall), 1);
  });
}

// --- Black hazards ---------------------------------------------------------
function activateHazards(){
  if (!guys.some((guy) => guy.hp > CONFIG.HAZARD_HP && !guy.boostEnds) || hazards.length) return;
  const highest = guys.reduce((a, b) => (a.hp > b.hp ? a : b));
  const corners = [
    { x: 0, y: 0 }, { x: innerWidth - 42, y: 0 },
    { x: 0, y: innerHeight - 42 }, { x: innerWidth - 42, y: innerHeight - 42 },
  ];
  const closest = corners.reduce((a, b) =>
    Math.hypot(a.x - highest.centerX, a.y - highest.centerY) <
    Math.hypot(b.x - highest.centerX, b.y - highest.centerY) ? a : b);
  for (let index = 0; index < CONFIG.HAZARD_COUNT; index++){
    const size = CONFIG.HAZARD_SIZE;
    const hazard = {
      element: makeElement('game-object black-hazard'),
      x: closest.x, y: closest.y,
      vx: rand(-2, 2), vy: rand(-2, 2),
      size, width: size, height: size, radius: size / 2, damage: CONFIG.HAZARD_DMG,
    };
    hazard.element.style.width = hazard.element.style.height = size + 'px';
    hazards.push(hazard);
  }
}

function moveHazards(elapsed){
  activateHazards();
  if (!guys.some((guy) => guy.hp > CONFIG.HAZARD_HP)){
    hazards.splice(0).forEach((h) => h.element.remove());
    return;
  }
  hazards.slice().forEach((hazard) => {
    hazard.x += hazard.vx * elapsed;
    hazard.y += hazard.vy * elapsed;
    hazard.width = hazard.height = hazard.size;
    keepOnScreen(hazard);
    place(hazard);
    for (const guy of guys){
      if (Math.hypot(hazard.x + hazard.radius - guy.centerX, hazard.y + hazard.radius - guy.centerY)
          >= guy.radius + hazard.radius) continue;
      damageGuy(guy, hazard.damage);
      stats.hazards++;
      hazard.element.remove();
      hazards.splice(hazards.indexOf(hazard), 1);
      break;
    }
  });
}
