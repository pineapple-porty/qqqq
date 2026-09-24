'use strict';

// --- Side menu, tooltip, selection, guy-style dragging --------------------

const ui = {
  tooltip: null, ballCard: null, worldCard: null,
  hovered: null, selected: null, dragBall: null,
  lastMouse: { x: 0, y: 0, t: 0 },
  _lastMenu: 0,

  init(canvas, state){
    this.tooltip   = document.getElementById('tooltip');
    this.ballCard  = document.getElementById('ballCard');
    this.worldCard = document.getElementById('worldCard');

    // Guy-style drag: grab, carry, fling on release.
    canvas.addEventListener('mousedown', (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const b = this.pick(x, y, state.balls);
      if (b){
        this.dragBall = b;
        this.selected = b;
        b.dragging = true;
        b.dragVX = 0; b.dragVY = 0;
        this.lastMouse = { x, y, t: performance.now() };
        canvas.style.cursor = 'grabbing';
        this.refresh(state, true);
      }
    });

    window.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      this.hovered = this.pick(x, y, state.balls);

      if (this.hovered && !this.dragBall){
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (e.clientX + 14) + 'px';
        this.tooltip.style.top  = (e.clientY + 14) + 'px';
        this.tooltip.textContent = 'Ball #' + this.hovered.id +
          ' — IQ: ' + this.hovered.iq + '  hp:' + Math.round(this.hovered.hp);
      } else {
        this.tooltip.style.display = 'none';
      }

      if (this.dragBall){
        const now = performance.now();
        const dt = Math.max((now - this.lastMouse.t) / 1000, 0.001);
        this.dragBall.dragVX = (x - this.lastMouse.x) / dt;
        this.dragBall.dragVY = (y - this.lastMouse.y) / dt;
        const rad = CONFIG.BALL_R;
        this.dragBall.x = clamp(x, rad, renderer.W - rad);
        this.dragBall.y = clamp(y, rad, renderer.H - rad);
        this.lastMouse = { x, y, t: now };
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.dragBall){
        // Fling: convert cursor velocity into reference velocity units.
        // Big, fast flings send the ball rocketing across the screen —
        // capped only so it can't tunnel through walls in one frame.
        const ux = this.dragBall.dragVX / CONFIG.PX_PER_UNIT;
        const uy = this.dragBall.dragVY / CONFIG.PX_PER_UNIT;
        const sp = Math.hypot(ux, uy);
        if (sp > 0.05){
          const capped = Math.min(sp, CONFIG.FLING_MAX) / sp;
          this.dragBall.vx = ux * capped;
          this.dragBall.vy = uy * capped;
        }
        this.dragBall.dragging = false;
        this.dragBall = null;
        canvas.style.cursor = 'grab';
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (!this.dragBall){ this.hovered = null; this.tooltip.style.display = 'none'; }
    });
    canvas.addEventListener('click', () => {
      if (this.hovered) this.selected = this.hovered;
      this.refresh(state, true);
    });
  },

  pick(x, y, balls){
    const rr = CONFIG.BALL_R + 8, r2 = rr * rr;
    for (const b of balls){
      if ((x - b.x) ** 2 + (y - b.y) ** 2 < r2) return b;
    }
    return null;
  },

  // Throttled so we don't rebuild DOM every frame.
  refresh(state, force){
    const now = performance.now();
    if (!force && now - this._lastMenu < CONFIG.MENU_REFRESH_MS) return;
    this._lastMenu = now;

    const b = this.selected || this.hovered;
    if (b){
      const f = hpSpeed(b.hp);
      const hpPct = clamp((b.hp + 50) / 180 * 100, 0, 100);
      const hpColor = b.hp < 0 ? '#e5484d' : b.hp < 20 ? '#e8a33d' : '#4caf50';
      this.ballCard.innerHTML =
        '<div class="stat"><span>Ball</span><b>#' + b.id + '</b></div>' +
        '<div class="stat"><span>IQ (ghost bounces ahead)</span><b>' + b.iq + ' / ' + CONFIG.IQ_MAX + '</b></div>' +
        '<div class="stat"><span>HP</span><b>' + Math.round(b.hp) + '</b></div>' +
        '<div class="hpbar"><i style="width:' + hpPct + '%;background:' + hpColor + '"></i></div>' +
        '<div class="stat"><span>Armor</span><b>' +
        (b.armor > 0 ? Math.round(b.armor * 100) + '% absorb' : 'none') + '</b></div>' +
        '<div class="stat"><span>Speed (1.08^(hp/30))</span><b>' + Math.round(f * 100) + '%' +
        (b.boost > 0.05 ? ' ⚡' + Math.round(b.boost * 100) + '%' : '') + '</b></div>' +
        '<div class="dim">Drag to carry, flick to send it flying.</div>';
    } else {
      this.ballCard.innerHTML =
        '<span class="dim">Click a ball to select it.<br/>Hover to see its IQ. Flick to send it flying.</span>';
    }

    const s = state.stats;
    const iqs = state.balls.map((x) => x.iq);
    this.worldCard.innerHTML =
      '<div class="stat"><span>Balls alive</span><b>' + state.balls.length + '</b></div>' +
      '<div class="stat"><span>Green orbs eaten</span><b>' + s.green + '</b></div>' +
      '<div class="stat"><span>Blue orbs eaten</span><b>' + s.blue + '</b></div>' +
      '<div class="stat"><span>Armor grabbed</span><b>' + s.armor + '</b></div>' +
      '<div class="stat"><span>Hard hits (30 dmg)</span><b>' + s.hits + '</b></div>' +
      '<div class="stat"><span>Smarter ball</span><b>IQ ' + Math.max.apply(null, iqs) + '</b></div>' +
      '<div class="stat"><span>Dumbest ball</span><b>IQ ' + Math.min.apply(null, iqs) + '</b></div>';
  },
};
