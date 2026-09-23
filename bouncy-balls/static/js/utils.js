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

// HP -> speed factor. 20..100 HP = normal (1x). -50 HP = stopped.
function speedFactor(hp){
  if (hp <= -50)  return 0;
  if (hp < 20)    return (hp + 50) / 70;
  if (hp <= 100)  return 1;
  return Math.min(1.6, 1 + (hp - 100) / 150);
}
