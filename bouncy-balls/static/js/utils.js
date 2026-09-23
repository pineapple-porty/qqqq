'use strict';
const rand  = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

// Smallest signed angle difference between two angles.
function angleDelta(a, b){
  let d = b - a;
  while (d >  Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Guy-style HP -> speed: 1.08^(hp/30) normalized so 60 HP = 1.0x, then our
// low-HP taper so 20-100 HP feels normal and the ball stops around -50 HP.
function speedFactor(hp){
  if (hp <= -50) return 0;
  const guyCurve = Math.pow(1.08, hp / 30) / Math.pow(1.08, 60 / 30);
  const taper = hp < 20 ? (hp + 50) / 70 : 1;
  return clamp(guyCurve * taper, 0, 1.6);
}
