// ===============================
// ゲーム全体設定
// ===============================

export const DT = 1 / 60;
export const MOVE_SPEED = 180;

// ===============================
// 射程関連
// ===============================

// 敵の攻撃 / 反応範囲（赤円）
export const ENEMY_ATTACK_RADIUS = 70;

// プレイヤー攻撃範囲（緑円）
// 敵より広く
export const PLAYER_BASE_ATTACK_RADIUS = 95;
export const PLAYER_ATTACK_RADIUS_PER_LV = 2;

// ===============================
// 攻撃速度関連
// ===============================

// プレイヤー攻撃間隔（秒）
export const PLAYER_ATTACK_INTERVAL_BASE = 0.65;
export const PLAYER_ATTACK_INTERVAL_MIN  = 0.22;

// 敵攻撃間隔（秒）
export const ENEMY_ATTACK_INTERVAL_BASE  = 0.80;
export const ENEMY_ATTACK_INTERVAL_MIN   = 0.28;

// レベルごとに短縮される量
export const ATTACK_INTERVAL_PER_LV = 0.015;

// ===============================
// 敵レベル成長関連
// ===============================

export const ENEMY_LV_START = 1;
export const ENEMY_LV_UP_ON_RESPAWN = 1;

// レベルごとの成長量
export const ENEMY_HP_PER_LV   = 10;
export const ENEMY_ATK_PER_LV  = 1;
export const ENEMY_DEF_PER_LV  = 0.2;
export const ENEMY_EXP_PER_LV  = 2;
export const ENEMY_GOLD_PER_LV = 1;

// ===============================
// 復活関連
// ===============================

export const RESPAWN_SECONDS = 3.0;

// ===============================
// 回復アイテム関連
// ===============================

// 同時存在数
export const HEAL_ITEM_COUNT = 3;

// 湧き間隔
export const HEAL_ITEM_SPAWN_SEC = 5.0;

// 消えるまでの時間
export const HEAL_ITEM_LIFETIME_SEC = 20.0;

// 見た目サイズ
export const HEAL_ITEM_RADIUS = 10;

// 拾える距離
export const HEAL_ITEM_PICKUP_RADIUS = 20;

// 回復量
export const HEAL_AMOUNT_BASE = 25;
export const HEAL_AMOUNT_PER_LV = 2;

// ===============================
// ログ関連
// ===============================

export const LOG_MAX_LINES = 200;
