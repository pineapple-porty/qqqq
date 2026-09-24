'use strict';

// --- Tooltip, side menu, selection, drag & fling ---------------------------
const tooltip = document.getElementById('tooltip');
const ballCard = document.getElementById('ballCard');
const worldCard = document.getElementById('worldCard');
let hovered = null, selected = null, dragBall = null;
let lastMouse = { x: 0, y: 0, t: 0 }, lastMenu = 0;

function initUI(){
  guys.forEach((guy) => {
    guy.element.addEventListener('mouseenter', () => {
      hovered = guy;
      tooltip.style.display = 'block';
      tooltip.textContent = 'Ball #' + guy.id + ' — IQ:' + guy.iq + ' hp:' + Math.round(guy.hp);
      refreshMenu(true);
    });
    guy.element.addEventListener('mouseleave', () => {
      hovered = null;
      tooltip.style.display = 'none';
      refreshMenu(true);
    });
    guy.element.addEventListener('click', () => {
      selected = guy;
      refreshMenu(true);
    });
    guy.element.addEventListener('mousedown', (e) => {
      e.preventDefault();
      dragBall = guy;
      selected = guy;
      guy.dragging = true;
      guy.dragVX = 0; guy.dragVY = 0;
      guy.element.classList.add('is-dragging');
      lastMouse = { x: e.clientX, y: e.clientY, t: performance.now() };
      tooltip.style.display = 'none';
      refreshMenu(true);
    });
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragBall) return;
    const now = performance.now();
    const dt = Math.max((now - lastMouse.t) / 1000, 0.001);
    dragBall.dragVX = (e.clientX - lastMouse.x) / dt;   // px/sec
    dragBall.dragVY = (e.clientY - lastMouse.y) / dt;
    dragBall.x = clamp(e.clientX - dragBall.width / 2, 0, innerWidth - dragBall.width);
    dragBall.y = clamp(e.clientY - dragBall.height / 2, 0, innerHeight - dragBall.height);
    lastMouse = { x: e.clientX, y: e.clientY, t: now };
    place(dragBall);
  });

  window.addEventListener('mouseup', () => {
    if (!dragBall) return;
    // Fling: cursor px/sec -> px/frame (reference velocity units), capped.
    const ux = dragBall.dragVX / 60, uy = dragBall.dragVY / 60;
    const sp = Math.hypot(ux, uy);
    if (sp > 0.05){
      const capped = Math.min(sp, CONFIG.FLING_MAX) / sp;
      dragBall.vx = ux * capped;
      dragBall.vy = uy * capped;
    }
    dragBall.dragging = false;
    dragBall.element.classList.remove('is-dragging');
    dragBall = null;
  });
}

// Throttled so we don't rebuild DOM every frame.
function refreshMenu(force){
  const now = performance.now();
  if (!force && now - lastMenu < CONFIG.MENU_REFRESH_MS) return;
  lastMenu = now;

  const b = selected || hovered;
  if (b){
    ballCard.innerHTML =
      '<div class="stat"><span>Ball</span><b>#' + b.id + '</b></div>' +
      '<div class="stat"><span>IQ (ghost bounces)</span><b>' + b.iq + ' / ' + CONFIG.IQ_MAX + '</b></div>' +
      '<div class="stat"><span>HP</span><b>' + Math.round(b.hp) + (b.boostEnds ? ' ⚡boost' : '') + '</b></div>' +
      '<div class="stat"><span>Armor</span><b>' + (b.armor > 0 ? Math.round(b.armor) + ' (' + b.armorType + ')' : 'none') + '</b></div>' +
      '<div class="stat"><span>Speed (1.08^(hp/30))</span><b>' + Math.round(hpSpeed(b.hp) * 100) + '%</b></div>';
  } else {
    ballCard.innerHTML =
      '<span class="dim">Click a ball to select it. Hover for IQ. Drag & flick to fling.</span>';
  }

  const iqs = guys.map((x) => x.iq);
  worldCard.innerHTML =
    '<div class="stat"><span>Balls</span><b>' + guys.length + '</b></div>' +
    '<div class="stat"><span>Green balls eaten</span><b>' + stats.green + '</b></div>' +
    '<div class="stat"><span>Blue boosts</span><b>' + stats.blue + '</b></div>' +
    '<div class="stat"><span>Armor grabbed</span><b>' + stats.armor + '</b></div>' +
    '<div class="stat"><span>Hard hits (30)</span><b>' + stats.hits + '</b></div>' +
    '<div class="stat"><span>Grenades thrown</span><b>' + stats.grenades + '</b></div>' +
    '<div class="stat"><span>Walls burst</span><b>' + stats.wallsBurst + '</b></div>' +
    '<div class="stat"><span>Hazard hits</span><b>' + stats.hazards + '</b></div>' +
    '<div class="stat"><span>Walls / hazards / bunkers</span><b>' + walls.length + ' / ' + hazards.length + ' / ' + bunkers.length + '</b></div>' +
    '<div class="stat"><span>Smarter / dumbest IQ</span><b>' + Math.max.apply(null, iqs) + ' / ' + Math.min.apply(null, iqs) + '</b></div>';
}
