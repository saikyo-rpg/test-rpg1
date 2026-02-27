// === 回復アイテム ===
export const HEAL_ITEM_COUNT = 3;        // フィールドに同時に存在できる最大数
export const HEAL_ITEM_SPAWN_SEC = 5.0;  // 湧き間隔（足りない時に湧く）
export const HEAL_ITEM_LIFETIME_SEC = 20.0; // 消えるまで
export const HEAL_ITEM_RADIUS = 10;      // 描画半径
export const HEAL_ITEM_PICKUP_RADIUS = 20; // 触れ判定
export const HEAL_AMOUNT_BASE = 25;      // 回復量（ベース）
export const HEAL_AMOUNT_PER_LV = 2;     // プレイヤーLvで回復量ちょい増える（任意）

// === 攻撃速度（秒）===
// Lvが上がると「攻撃間隔が短くなる」設計
export const PLAYER_ATTACK_INTERVAL_BASE = 0.65;
export const PLAYER_ATTACK_INTERVAL_MIN  = 0.22;
export const ENEMY_ATTACK_INTERVAL_BASE  = 0.80;
export const ENEMY_ATTACK_INTERVAL_MIN   = 0.28;
export const ATTACK_INTERVAL_PER_LV      = 0.015; // 1Lvごとにこれだけ短くする

// === 敵レベル成長 ===
export const ENEMY_LV_START = 1;
export const ENEMY_LV_UP_ON_RESPAWN = 1;
export const ENEMY_HP_PER_LV = 10;
export const ENEMY_ATK_PER_LV = 1;
export const ENEMY_DEF_PER_LV = 0.2;
export const ENEMY_EXP_PER_LV = 2;
export const ENEMY_GOLD_PER_LV = 1;
