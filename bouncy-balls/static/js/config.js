// Global tuning knobs for the whole simulation.
'use strict';
const CONFIG = {
  BASE_SPEED: 95,           // px/sec at "normal" speed
  BALL_R: 12,               // ball radius, px
  NUM_BALLS: 14,
  ORB_COUNT: 6,
  ARMOR_COUNT: 3,
  BLUE_CHANCE: 0.12,        // blue orbs are uncommon
  COLLISION_THRESHOLD: 5,   // relative speed (in BASE_SPEED units) needed to hurt
  PICKUP_RADIUS: 8,         // extra pickup reach around a ball
  IQ_MAX: 15,
  IQ_MIN: 1,
  IQ_CHECK_INTERVAL: 2.5,    // seconds between IQ drift checks
  MENU_REFRESH_MS: 250,     // side-menu update throttle
  MAX_DT: 0.05,             // clamp for tab-switch spikes
};
