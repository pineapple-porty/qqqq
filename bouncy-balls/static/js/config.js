// Global tuning knobs — every hello-wrld mechanic is configurable here.
'use strict';
const CONFIG = {
  GUY_SIZE: 30, NUM_GUYS: 14,

  // IQ ghost system (this project's own AI layer)
  IQ_MAX: 15, IQ_MIN: 1, IQ_CHECK_INTERVAL: 2.5,
  GHOST_CANDIDATES: 7, BOOST: 0.45, BOOST_DECAY: 1.6,

  // Reference hpSpeed = 1.08^(hp/30), capped so the 3000hp blue-ball
  // boost is a rocket but not a teleport.
  HP_SPEED_CAP: 60,

  MENU_REFRESH_MS: 250, MAX_DT: 0.05,

  // Green health balls (reference: 16 moving balls worth 30 HP)
  GREEN_BALLS: 16, GREEN_HP: 30,

  // Blue balls (reference: rescue boost when 3+ guys below -100 HP)
  BLUE_LOW_COUNT: 3, BLUE_LOW_HP: -100, BOOST_HP: 3000, BOOST_MS: 3000,

  // Flyers (reference: 14 seekers in 4 colors)
  FLYER_COUNT: 14, FLYER_COLORS: ['#fff4a8', '#ff9f74', '#d79bff', '#72e4de'],
  FLYER_MAX_SPEED: 3.8, FLYER_PUSH: 0.01,

  // Armor squares (reference: green 5000 / rare purple 10000, half-soak hits)
  ARMOR_SPAWN_CHANCE: 0.79, ARMOR_COOLDOWN: 10000,
  ARMOR_GREEN: 5000, ARMOR_PURPLE: 10000, ARMOR_PURPLE_CHANCE: 0.1, ARMOR_SIZE: 24,

  // Guy-vs-guy hard hits (reference numbers)
  HIT_DAMAGE: 30, HIT_COOLDOWN_MS: 650, HIT_CLOSING_SPEED: 7.5,

  // Grenades (reference numbers)
  GRENADE_GLOBAL_CD: 2000, GRENADE_CD: 5000, GRENADE_FUSE_MS: 1500,
  GRENADE_DMG: 200, GRENADE_GRAVITY: 0.1, GRENADE_SIZE: 16,

  // Bunkers (reference numbers)
  BUNKER_INTERVAL_MS: 30000, BUNKER_SIZE: 60, BUNKER_HIGH_HP: 2000, BUNKER_MIN_HIGH: 2,
  MINI_CD_MS: 200, MINI_SPEED: 15, MINI_DMG: 2,
  BOUNCE_CD_MS: 2000, BOUNCE_SPEED: 8, BOUNCE_DMG: 30, BOUNCE_MAX: 4,
  BOUNCE_BURST_DMG: 12, BOUNCE_BURST_RADIUS: 80,

  // Walls (reference numbers)
  WALL_INTERVAL_MS: 5000, WALL_MIN_LIFE: 3000, WALL_MAX_LIFE: 10000,
  WALL_HITS: 14, WALL_BURST: 200, WALL_MIN_LEN: 120, WALL_MAX_LEN: 260,

  // Black hazards (reference numbers)
  HAZARD_HP: 1500, HAZARD_DMG: 500, HAZARD_COUNT: 3, HAZARD_SIZE: 42,

  // Fling cap in reference velocity units (px/frame)
  FLING_MAX: 14,
};
