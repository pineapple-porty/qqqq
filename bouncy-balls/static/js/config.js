// Global tuning knobs for the whole simulation.
'use strict';
const CONFIG = {
  PX_PER_UNIT: 60,         // 1.0 reference velocity ~= 60 px/sec (hello-wrld scale)
  BALL_R: 12,               // ball radius, px
  NUM_BALLS: 14,
  ORB_COUNT: 6,
  ARMOR_COUNT: 3,
  BLUE_CHANCE: 0.12,        // blue orbs are uncommon
  PICKUP_RADIUS: 8,         // extra pickup reach around a ball
  IQ_MAX: 15,
  IQ_MIN: 1,
  IQ_CHECK_INTERVAL: 2.5,    // seconds between IQ drift checks
  MENU_REFRESH_MS: 250,     // side-menu update throttle
  MAX_DT: 0.05,             // clamp for tab-switch spikes

  // Ghost bounce evaluation
  GHOST_CANDIDATES: 7,      // directions sampled at each wall bounce
  BOOST: 0.45,              // speed boost after a smart re-aim
  BOOST_DECAY: 1.6,         // per-second exponential decay of the boost

  // Orbs drift around the arena like the reference game.
  ORB_SPEED: 40,
  ORB_BLUE_SPEED_RATIO: 0.5,

  // Guy-style hard-hit collisions
  HIT_DAMAGE: 30,           // flat damage per hard hit (like the guys)
  HIT_COOLDOWN_MS: 650,     // per-pair cooldown, like the guys
  HIT_CLOSING_SPEED: 7.5,   // closing speed in reference velocity units
  FLING_MAX: 1.6,           // cap on fling velocity, reference units
};
