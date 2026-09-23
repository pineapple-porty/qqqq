'use strict';

// --- Canvas rendering ----------------------------------------------------

const renderer = {
  canvas: null, ctx: null, W: 0, H: 0, DPR: 1,

  init(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize(){
    const r = this.canvas.parentElement.getBoundingClientRect();
    this.DPR = Math.min(window.devicePixelRatio || 1, 2); // perf cap
    this.W = r.width; this.H = r.height;
    this.canvas.width  = this.W * this.DPR;
    this.canvas.height = this.H * this.DPR;
    this.ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
  },

  draw(state){
    const { ctx, W, H } = this;
    const { balls, pickups, hovered, selected } = state;
    const C = CONFIG;

    ctx.clearRect(0, 0, W, H);

    // Subtle grid.
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 40; x < W; x += 40){ ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 40; y < H; y += 40){ ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    // Orbs — styled after the hello-wrld reference: green #54b86b with a
    // #fff7cf border and #b9f29b glow; blue #1874df with #d8f0ff and glow.
    for (const o of pickups.orbs){
      if (o.dead) continue;
      const R = o.type === 'blue' ? 11 : 9;
      ctx.beginPath();
      ctx.arc(o.x, o.y, R, 0, Math.PI * 2);
      ctx.fillStyle = o.type === 'blue' ? '#1874df' : '#54b86b';
      ctx.shadowColor = o.type === 'blue' ? '#3f97ff' : '#b9f29b';
      ctx.shadowBlur = o.type === 'blue' ? 16 : 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = o.type === 'blue' ? '#d8f0ff' : '#fff7cf';
      ctx.stroke();
    }

    // Armor pickups (shield shapes).
    for (const a of pickups.armors){
      if (a.dead) continue;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.fillStyle = '#c8a24a';
      ctx.beginPath();
      ctx.moveTo(0, -9); ctx.lineTo(8, -4); ctx.lineTo(8, 4);
      ctx.lineTo(0, 10); ctx.lineTo(-8, 4); ctx.lineTo(-8, -4);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    // Balls.
    for (const b of balls){
      const f = speedFactor(b.hp);
      ctx.beginPath();
      ctx.arc(b.x, b.y, C.BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(' + b.hue + ',70%,' + clamp(45 + f * 15, 30, 70) + '%)';
      ctx.fill();

      if (b.boost > 0.05){
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,' + Math.min(b.boost, 0.5) + ')';
        ctx.beginPath();
        ctx.arc(b.x, b.y, C.BALL_R + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (b.armor > 0){
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(200,162,74,0.9)';
        ctx.beginPath();
        ctx.arc(b.x, b.y, C.BALL_R + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (b === selected || b === hovered){
        ctx.lineWidth = 2;
        ctx.strokeStyle = b === selected ? '#ffffff' : 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(b.x, b.y, C.BALL_R + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#0e1220';
        ctx.font = 'bold 10px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.iq, b.x, b.y);
      }
    }
  },
};
