'use strict';

// --- Bootstrap & main loop -------------------------------------------------
(function main(){
  for (let i = 0; i < CONFIG.GREEN_BALLS; i++){
    greenBalls.push({
      element: makeElement('game-object health-ball'),
      x: rand(0, innerWidth - 18), y: rand(0, innerHeight - 18),
      vx: rand(-2, 2), vy: rand(-2, 2),
      size: 18, width: 18, height: 18, radius: 9,
    });
  }
  initFlyers();
  for (let i = 0; i < CONFIG.NUM_GUYS; i++) guys.push(new Ball(i));
  initUI();

  setInterval(spawnWall, CONFIG.WALL_INTERVAL_MS);
  spawnBunker();
  setInterval(spawnBunker, CONFIG.BUNKER_INTERVAL_MS);

  let last = performance.now();
  function loop(now){
    const dt = Math.min((now - last) / 1000, CONFIG.MAX_DT);
    last = now;
    const elapsed = dt * 60;   // reference-style "frames"

    for (const guy of guys){
      guy.update(elapsed, dt, now);
      throwGrenade(guy, now);
      collideGuyWithWalls(guy);
    }
    separateGuys(now);
    collectGreenBalls(elapsed);
    spawnArmorSquare(now);
    collectArmorSquares();
    spawnBlueBallsIfNeeded(now);
    updateBunkers(now);
    updateGrenades(now, elapsed);
    updateMiniBullets(elapsed);
    updateBounceBalls(elapsed);
    moveFlyers(elapsed, now);
    moveHazards(elapsed);
    processWalls(now);
    refreshMenu(false);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
