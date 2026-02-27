export function createPlayer(){
  return {
    x:120, y:240, r:12,
    maxHp:120, hp:120,
    def:2,

    lv:1,
    exp:0,

    baseAtkMin:8,
    baseAtkMax:14,
    atkMin:8,
    atkMax:14,
  };
}

export function makeEnemy(x,y,name,hp,atkMin,atkMax,def,expReward){
  return {
    x,y,r:12,name,
    maxHp:hp, hp,
    atkMin, atkMax,
    def,
    expReward,
    alive:true,
    spawnX:x, spawnY:y,
    respawnTimer:0
  };
}

export function createEnemies(){
  return [
    makeEnemy(520,160,"スライム",80,6,11,1,12),
    makeEnemy(560,320,"ゴブリン",110,8,14,2,20),
  ];
}

export function createBattle(){
  return { inBattle:false, target:null, pAttackTimer:0, eAttackTimer:0 };
}
