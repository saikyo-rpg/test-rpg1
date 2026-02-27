import { ENEMY_LV_START } from "./config.js";

export function createPlayer(){
  return {
    x:120, y:240, r:12,
    maxHp:120, hp:120,
    def:2,

    dead:false,

    lv:1,
    exp:0,
    gold:0,

    baseAtkMin:8,
    baseAtkMax:14,
    atkMin:8,
    atkMax:14,
  };
}

export function makeEnemy(x,y,name,hp,atkMin,atkMax,def, expReward, goldReward){
  return {
    x,y,r:12,name,

    // ベース値（Lvで伸ばす）
    baseMaxHp: hp,
    baseAtkMin: atkMin,
    baseAtkMax: atkMax,
    baseDef: def,
    baseExpReward: expReward,
    baseGoldReward: goldReward,

    // 現在値（recalcEnemyStatsで更新）
    lv: ENEMY_LV_START,
    maxHp: hp, hp,
    atkMin, atkMax,
    def,
    expReward,
    goldReward,

    alive:true,
    spawnX:x, spawnY:y,
    respawnTimer:0
  };
}

export function createEnemies(){
  return [
    makeEnemy(520,160,"スライム",80,6,11,1, 12, 5),
    makeEnemy(560,320,"ゴブリン",110,8,14,2, 20, 9),
  ];
}

export function createBattle(){
  return { inBattle:false, target:null, pAttackTimer:0, eAttackTimer:0 };
}

// 回復アイテムの配列（mainで湧かせる）
export function createItems(){
  return []; // {id,x,y,r,heal,ttl}
}
