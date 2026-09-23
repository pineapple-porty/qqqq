// Tunable game constants — everything you may want to tweak lives here.
'use strict';
const CONFIG = {
  BASE_SPEED: 95,          // px/sec at "normal" speed
  NUM_BALLS: 14,
  ORB_COUNT: 6,
  ARMOR_COUNT: 3,
  BLUE_CHANCE: 0.12,       // blue orbs are uncommon
  COLLISION_THRESHOLD: 5,  // relative speed (in normal-speed units) needed to hurt
  DAMAGE_SCALE: 9,         // HP lost per unit of impact above the threshold
  BALL_R: 12,
  HP_STOP: -50,            // at/below this HP a ball is stopped
  HP_NORMAL_LOW: 20,
  HP_NORMAL_HIGH: 100,
  IQ_MIN: 1,
  IQ_MAX: 15,
  IQ_CHECK_INTERVAL: 2.5,  // seconds between IQ drift evaluations
  ORB_RESPAWN: [4, 9],
  ARMOR_RESPAWN: [6, 12],
  PICKUP_RADIUS: 8,        // extra radius around a ball for pickups
  MENU_REFRESH_MS: 250,
  MAX_DT: 0.05,
};
