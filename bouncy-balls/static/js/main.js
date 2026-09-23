'use strict';

// --- Bootstrap & main loop ------------------------------------------------

(function main(){
  const canvas = document.getElementById('stage');
  canvas.style.cursor = 'grab';
  renderer.init(canvas);

  const state = {
    balls: [],
    pickups: initPickups(renderer.W, renderer.H),
    stats: { green: 0, blue: 0, armor: 0, hits: 0 },
  };
  for (let i = 0; i < CONFIG.NUM_BALLS; i++){
    state.balls.push(new Ball(i, renderer.W, renderer.H));
  }

  ui.init(canvas, state);

  let last = performance.now();
  function loop(now){
    const dt = Math.min((now - last) / 1000, CONFIG.MAX_DT);
    last = now;

    for (const b of state.balls){
      b.update(dt, renderer.W, renderer.H, state.pickups.orbs);
    }
    moveOrbs(state.pickups, dt, renderer.W, renderer.H);
    collideBalls(state.balls, state.stats, now);
    collidePickups(state.balls, state.pickups, state.stats);
    updatePickups(state.pickups, dt, renderer.W, renderer.H);

    renderer.draw({
      balls: state.balls,
      pickups: state.pickups,
      hovered: ui.hovered,
      selected: ui.selected,
    });
    ui.refresh(state, false);

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
