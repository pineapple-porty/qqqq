'use strict';

// --- Side menu, tooltip, selection ---------------------------------------

const ui = {
  tooltip: null, ballCard: null, worldCard: null,
  hovered: null, selected: null,
  _lastMenu: 0,

  init(canvas, state){
    this.tooltip  = document.getElementById('tooltip');
    this.ballCard = document.getElementById('ballCard');
    this.worldCard = document.getElementById('worldCard');

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.hovered = this.pick(e.clientX - r.left, e.clientY - r.top, state.balls);
      if (this.hovered){
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (e.clientX + 14) + 'px';
        this.tooltip.style.top  = (e.clientY + 14) + 'px';
        this.tooltip.textContent = 'Ball #' + this.hovered.id + ' — IQ: ' + this.hovered.iq;
      } else {
        this.tooltip.style.display = 'none';
      }
    });
    canvas.addEventListener('mouseleave', () => {
      this.hovered = null;
      this.tooltip.style.display = 'none';
    });
    canvas.addEventListener('click', () => {
      this.selected = this.hovered ? this.hovered : null;
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
      const f = speedFactor(b.hp);
      const hpPct = clamp((b.hp + 50) / 180 * 100, 0, 100);
      const hpColor = b.hp < 0 ? '#e5484d' : b.hp < 20 ? '#e8a33d' : '#4caf50';
      this.ballCard.innerHTML =
        '<div class="stat"><span>Ball</span><b>#' + b.id + '</b></div>' +
        '<div class="stat"><span>IQ (bounces seen ahead)</span><b>' + b.iq + ' / ' + CONFIG.IQ_MAX + '</b></div>' +
        '<div class="stat"><span>HP</span><b>' + b.hp.toFixed(0) + '</b></div>' +
        '<div class="hpbar"><i style="width:' + hpPct + '%;background:' + hpColor + '"></i></div>' +
        '<div class="stat"><span>Armor</span><b>' +
        (b.armor > 0 ? Math.round(b.armor * 100) + '% absorb' : 'none') + '</b></div>' +
        '<div class="stat"><span>Speed</span><b>' + Math.round(f * 100) + '%</b></div>';
    } else {
      this.ballCard.innerHTML =
        '<span class="dim">Click a ball to select it.<br/>Hover to see its IQ.</span>';
    }

    const s = state.stats;
    const iqs = state.balls.map((x) => x.iq);
    this.worldCard.innerHTML =
      '<div class="stat"><span>Balls alive</span><b>' + state.balls.length + '</b></div>' +
      '<div class="stat"><span>Green orbs eaten</span><b>' + s.green + '</b></div>' +
      '<div class="stat"><span>Blue orbs eaten</span><b>' + s.blue + '</b></div>' +
      '<div class="stat"><span>Armor grabbed</span><b>' + s.armor + '</b></div>' +
      '<div class="stat"><span>Painful collisions</span><b>' + s.hits + '</b></div>' +
      '<div class="stat"><span>Smarter ball</span><b>IQ ' + Math.max.apply(null, iqs) + '</b></div>' +
      '<div class="stat"><span>Dumbest ball</span><b>IQ ' + Math.min.apply(null, iqs) + '</b></div>';
  },
};
