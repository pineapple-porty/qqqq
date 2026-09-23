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

// Guy-style HP -> speed: exactly hello-wrld's hpSpeed = 1.08^(hp/30),
// with a low-HP taper so the ball stops around -50 HP (never dies).
function hpSpeed(hp){
  if (hp <= -50) return 0;
  const guyCurve = Math.pow(1.08, hp / 30);
  const taper = hp < 20 ? (hp + 50) / 70 : 1;
  return clamp(guyCurve * taper, 0, 2.6);
}
