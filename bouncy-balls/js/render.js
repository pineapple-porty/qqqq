'use strict';
// Canvas renderer: grid, orbs, armor, balls, selection ring, DPR-aware.

const Renderer = {
  init(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  },

  resize(W, H){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = W; this.H = H;
    this.canvas.width = W * dpr;
    this.canvas.height = H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  draw(balls, orbs, armors, hovered, selected){
    const ctx = this.ctx, W = this.W, H = this.H;
    const C = CONFIG;
    ctx.clearRect(0, 0, W, H);

    // subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.035)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 40; x < W; x += 40){ ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 40; y < H; y += 40){ ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    // orbs
    for (const o of orbs){
      if (o.dead) continue;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.type === 'blue' ? 9 : 7, 0, Math.PI * 2);
      ctx.fillStyle = o.type === 'blue' ? '#3b82f6' : '#4caf50';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = o.type === 'blue' ? 14 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // armor pickups (shield shapes)
    for (const a of armors){
      if (a.dead) continue;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.fillStyle = '#c8a24a';
      ctx.beginPath();
      ctx.moveTo(0, -9); ctx.lineTo(8, -4); ctx.lineTo(8, 4); ctx.lineTo(0, 10);
      ctx.lineTo(-8, 4); ctx.lineTo(-8, -4); ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // balls
    for (const b of balls){
      const f = speedFactor(b.hp);
      ctx.beginPath();
      ctx.arc(b.x, b.y, C.BALL_R, 0, Math.PI * 2);
      const light = 45 + f * 15;
      ctx.fillStyle = 'hsl(' + b.hue + ',70%,' + clamp(light, 30, 70) + '%)';
      ctx.fill();

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
