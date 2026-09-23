'use strict';
// Side menu + hover tooltip. DOM writes are throttled to MENU_REFRESH_MS.

const Menu = {
  init(canvas, tooltipEl, ballCardEl, worldCardEl){
    this.tooltip = tooltipEl;
    this.ballCard = ballCardEl;
    this.worldCard = worldCardEl;
    this.lastMenu = 0;
    this.hovered = null;
    this.selected = null;

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      const b = this.pick(e.clientX - r.left, e.clientY - r.top);
      this.hovered = b;
      if (b){
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = (e.clientX + 14) + 'px';
        this.tooltip.style.top  = (e.clientY + 14) + 'px';
        this.tooltip.textContent = 'Ball #' + b.id + ' — IQ: ' + b.iq;
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
      this.refresh(true);
    });
  },

  pick(x, y){
    const rr = (CONFIG.BALL_R + 8) ** 2;
    for (const b of this.balls){
      if ((x - b.x) ** 2 + (y - b.y) ** 2 < rr) return b;
    }
    return null;
  },

  refresh(force){
    const now = performance.now();
    if (!force && now - this.lastMenu < CONFIG.MENU_REFRESH_MS) return;
    this.lastMenu = now;

    const b = this.selected || this.hovered;
    if (b){
      const f = speedFactor(b.hp);
      this.ballCard.innerHTML =
        '<div class="stat"><span>Ball</span><b>#' + b.id + '</b></div>' +
        '<div class="stat"><span>IQ (bounces seen ahead)</span><b>' + b.iq + ' / ' + CONFIG.IQ_MAX + '</b></div>' +
        '<div class="stat"><span>HP</span><b>' + b.hp.toFixed(0) + '</b></div>' +
        '<div class="hpbar"><i style="width:' + clamp((b.hp - CONFIG.HP_STOP) / 180 * 100, 0, 100) + '%;background:' +
        (b.hp < 0 ? '#e5484d' : b.hp < CONFIG.HP_NORMAL_LOW ? '#e8a33d' : '#4caf50') + '"></i></div>' +
        '<div class="stat"><span>Armor</span><b>' + (b.armor > 0 ? Math.round(b.armor * 100) + '% absorb' : 'none') + '</b></div>' +
        '<div class="stat"><span>Speed</span><b>' + Math.round(f * 100) + '%</b></div>';
    } else if (force){
      this.ballCard.innerHTML = '<span class="dim">Click a ball to select it.<br/>Hover to see its IQ.</span>';
    }

    const iqs = this.balls.map(x => x.iq);
    this.worldCard.innerHTML =
      '<div class="stat"><span>Balls alive</span><b>' + this.balls.length + '</b></div>' +
      '<div class="stat"><span>Green orbs eaten</span><b>' + this.stats.green + '</b></div>' +
      '<div class="stat"><span>Blue orbs eaten</span><b>' + this.stats.blue + '</b></div>' +
      '<div class="stat"><span>Armor grabbed</span><b>' + this.stats.armor + '</b></div>' +
      '<div class="stat"><span>Painful collisions</span><b>' + this.stats.hits + '</b></div>' +
      '<div class="stat"><span>Smarter ball</span><b>IQ ' + Math.max.apply(null, iqs) + '</b></div>' +
      '<div class="stat"><span>Dumbest ball</span><b>IQ ' + Math.min.apply(null, iqs) + '</b></div>';
  },
};
