'use strict';
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

// HP -> speed factor. 20..100 HP = normal (1x). -50 HP = stopped.
function speedFactor(hp){
  const C = CONFIG;
  if (hp <= C.HP_STOP) return 0;
  if (hp < C.HP_NORMAL_LOW)  return (hp - C.HP_STOP) / (C.HP_NORMAL_LOW - C.HP_STOP);
  if (hp <= C.HP_NORMAL_HIGH) return 1;
  return Math.min(1.6, 1 + (hp - C.HP_NORMAL_HIGH) / 150);  // a bit faster above 100
}
