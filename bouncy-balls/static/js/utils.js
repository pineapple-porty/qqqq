'use strict';
const rand  = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

function angleDelta(a, b){
  let d = b - a;
  while (d >  Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Reference hpSpeed, capped so boosted guys stay on screen.
function hpSpeed(hp){
  return Math.min(Math.pow(1.08, hp / 30), CONFIG.HP_SPEED_CAP);
}

function makeElement(className, parent){
  const el = document.createElement('div');
  el.className = className;
  (parent || document.body).appendChild(el);
  return el;
}

function place(obj){
  obj.element.style.transform = 'translate3d(' + obj.x + 'px,' + obj.y + 'px,0)';
}
