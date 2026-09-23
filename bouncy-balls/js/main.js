'use strict';
// World state + main loop.
(function(){
  const canvas = document.getElementById('stage');
  const C = CONFIG;

  Renderer.init(canvas);
  Menu.init(canvas,
    document.getElementById('tooltip'),
    document.getElementById('ballCard'),
    document.getElementById('worldCard'));

  let W = 0, H = 0;
  let balls = [], orbs = [], armors = [];
  const stats = { green: 0, blue: 0, armor: 0, hits: 0 };

  function resize(){
    const r = canvas.parentElement.getBoundingClientRect();
    W = r.width; H = r.height;
    Renderer.resize(W, H);
  }

  function initWorld(){
    balls = [];
    for (let i = 0; i < C.NUM_BALLS; i++) balls.push(new Ball(i, W, H));
    orbs = []; armors = [];
    for (let i = 0; i < C.ORB_COUNT; i++){ const o = {}; spawnOrb(o, W, H); orbs.push(o); }
    for (let i = 0; i < C.ARMOR_COUNT; i++){ const a = {}; spawnArmor(a, W, H); armors.push(a); }
    Menu.balls = balls; Menu.stats = stats;
  }

  let last = performance.now();
  function loop(now){
    const dt = Math.min((now - last) / 1000, C.MAX_DT);
    last = now;

    for (const b of balls) b.update(dt, W, H, orbs);
    ballCollisions(balls, stats);
    pickupCollisions(balls, orbs, armors, stats);
    updateRespawns(orbs, armors, W, H, dt);

    Renderer.draw(balls, orbs, armors, Menu.hovered, Menu.selected);
    Menu.refresh(false);

    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  initWorld();
  requestAnimationFrame(loop);
})();
