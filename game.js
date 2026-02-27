(() => {

const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const WORLD = { w: canvas.width, h: canvas.height };
const DT = 1/60;
const MOVE_SPEED = 180;

// 範囲を分離
const ENEMY_ATTACK_RADIUS = 70; // 敵の攻撃/反応範囲（赤円）
const PLAYER_BASE_ATTACK_RADIUS = 95; // 自分の攻撃範囲の基礎（緑円）※敵より広く
const PLAYER_ATTACK_RADIUS_PER_LV = 2; // レベルごとに攻撃範囲が増える

const ATTACK_INTERVAL = 0.65;
const RESPAWN_SECONDS = 3.0;

const PLAYER = {
  x:120, y:240, r:12,
  maxHp:120, hp:120,
  def:2,

  // レベル/経験値
  lv: 1,
  exp: 0,

  // 攻撃（レベルで上がる）
  baseAtkMin: 8,
  baseAtkMax: 14,
  atkMin: 8,
  atkMax: 14,
};

function expToNextLevel(lv){
  // ほどよく増える経験値テーブル（好みで調整）
  // Lv1->2: 30, Lv2->3: 45, Lv3->4: 63...
  return Math.floor(30 * Math.pow(1.25, lv-1));
}

function recalcPlayerStats(){
  // 攻撃力：レベルごとに+1〜+2くらいの体感
  PLAYER.atkMin = PLAYER.baseAtkMin + Math.floor((PLAYER.lv-1) * 1.2);
  PLAYER.atkMax = PLAYER.baseAtkMax + Math.floor((PLAYER.lv-1) * 1.6);
}

function playerAttackRadius(){
  return PLAYER_BASE_ATTACK_RADIUS + (PLAYER.lv - 1) * PLAYER_ATTACK_RADIUS_PER_LV;
}

function makeEnemy(x,y,name,hp,atkMin,atkMax,def, expReward){
  return {
    x,y,r:12,name,
    maxHp:hp, hp,
    atkMin, atkMax,
    def,
    expReward,

    alive:true,

    // 復活用に初期位置を保存
    spawnX: x,
    spawnY: y,

    // 復活タイマー
    respawnTimer: 0
  };
}

const ENEMIES = [
  makeEnemy(520,160,"スライム",80,6,11,1, 12),
  makeEnemy(560,320,"ゴブリン",110,8,14,2, 20)
];

const keys = new Set();
window.addEventListener("keydown", e=>keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", e=>keys.delete(e.key.toLowerCase()));

let battle = {
  inBattle:false,
  target:null,
  pAttackTimer:0,
  eAttackTimer:0
};

const elPBar = document.getElementById("pBar");
const elEBar = document.getElementById("eBar");
const elPStat = document.getElementById("pStat");
const elEStat = document.getElementById("eStat");
const elBattleState = document.getElementById("battleState");

function clamp(n,a,b){ return Math.max(a,Math.min(b,n)); }
function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

function calcDamage(atkMin,atkMax,def){
  return Math.max(1, randInt(atkMin,atkMax)-def);
}

function gainExp(amount){
  PLAYER.exp += amount;
  // 複数レベルアップも対応
  while(PLAYER.exp >= expToNextLevel(PLAYER.lv)){
    PLAYER.exp -= expToNextLevel(PLAYER.lv);
    PLAYER.lv += 1;
    recalcPlayerStats();
    // ついでにレベルアップ時に回復したいなら:
    // PLAYER.hp = Math.min(PLAYER.maxHp, PLAYER.hp + 20);
  }
}

function killEnemy(enemy){
  enemy.alive = false;
  enemy.hp = 0;
  enemy.respawnTimer = RESPAWN_SECONDS;

  // 経験値ゲット
  gainExp(enemy.expReward);

  // 戦闘終了
  endBattle();
}

function respawnTick(enemy, dt){
  if(enemy.alive) return;

  enemy.respawnTimer -= dt;
  if(enemy.respawnTimer <= 0){
    enemy.alive = true;
    enemy.hp = enemy.maxHp;
    enemy.x = enemy.spawnX;
    enemy.y = enemy.spawnY;
    enemy.respawnTimer = 0;
  }
}

let acc=0;
let last=performance.now();

recalcPlayerStats();

function frame(now){
  const dt=(now-last)/1000;
  last=now;
  acc+=dt;
  acc=Math.min(acc,0.25);
  while(acc>=DT){
    update(DT);
    acc-=DT;
  }
  render();
  requestAnimationFrame(frame);
}

function update(dt){

  // 敵の復活タイマー更新（戦闘してなくても進む）
  for(const e of ENEMIES) respawnTick(e, dt);

  if(PLAYER.hp<=0){
    PLAYER.hp=0;
    battle.inBattle=false;
    battle.target=null;
    return;
  }

  // 移動（戦闘中でもOK）
  let vx=0,vy=0;
  if(keys.has("w")) vy-=1;
  if(keys.has("s")) vy+=1;
  if(keys.has("a")) vx-=1;
  if(keys.has("d")) vx+=1;

  const len=Math.hypot(vx,vy)||1;
  vx/=len; vy/=len;

  PLAYER.x=clamp(PLAYER.x+vx*MOVE_SPEED*dt,20,WORLD.w-20);
  PLAYER.y=clamp(PLAYER.y+vy*MOVE_SPEED*dt,20,WORLD.h-20);

  // 戦闘してないなら、敵の反応範囲（赤円）に入った敵をターゲットにする
  if(!battle.inBattle){
    const target=ENEMIES.find(e=>e.alive && dist(PLAYER,e)<=ENEMY_ATTACK_RADIUS);
    if(target) startBattle(target);
    return;
  }

  const e=battle.target;
  if(!e || !e.alive){
    endBattle();
    return;
  }

  // 反応範囲から離れたら戦闘解除（逃げられる）
  if(dist(PLAYER,e) > ENEMY_ATTACK_RADIUS * 1.35){
    endBattle();
    return;
  }

  battle.pAttackTimer-=dt;
  battle.eAttackTimer-=dt;

  // 自分の攻撃：自分の攻撃範囲（緑円）内に敵がいる時だけ当たる
  if(battle.pAttackTimer<=0){
    battle.pAttackTimer+=ATTACK_INTERVAL;

    if(dist(PLAYER,e) <= playerAttackRadius()){
      const dmg=calcDamage(PLAYER.atkMin,PLAYER.atkMax,e.def);
      e.hp=Math.max(0,e.hp-dmg);
      if(e.hp<=0){
        killEnemy(e);
        return;
      }
    }
  }

  // 敵の攻撃：敵の攻撃範囲（赤円）内に自分がいる時だけ当たる
  if(battle.eAttackTimer<=0){
    battle.eAttackTimer+=ATTACK_INTERVAL+0.15;

    if(dist(PLAYER,e) <= ENEMY_ATTACK_RADIUS){
      const dmg=calcDamage(e.atkMin,e.atkMax,PLAYER.def);
      PLAYER.hp=Math.max(0,PLAYER.hp-dmg);
    }
  }
}

function startBattle(enemy){
  battle.inBattle=true;
  battle.target=enemy;
  battle.pAttackTimer=0.2;
  battle.eAttackTimer=0.45;
}

function endBattle(){
  battle.inBattle=false;
  battle.target=null;
}

function render(){

  ctx.clearRect(0,0,WORLD.w,WORLD.h);

  // 敵
  for(const e of ENEMIES){

    // 死んでる間は「復活まで」を薄く表示したいならここ
    // いらなければ if(!e.alive) continue; のままでOK
    if(!e.alive) continue;

    // 敵の攻撃/反応範囲（赤円）
    ctx.globalAlpha=0.18;
    ctx.beginPath();
    ctx.arc(e.x,e.y,ENEMY_ATTACK_RADIUS,0,Math.PI*2);
    ctx.fillStyle="#ff6b6b";
    ctx.fill();
    ctx.globalAlpha=1;

    // 本体
    ctx.beginPath();
    ctx.arc(e.x,e.y,e.r,0,Math.PI*2);
    ctx.fillStyle="#ff6b6b";
    ctx.fill();
  }

  // 自分の攻撃範囲（緑円）※レベルで広がる
  ctx.globalAlpha=0.14;
  ctx.beginPath();
  ctx.arc(PLAYER.x,PLAYER.y,playerAttackRadius(),0,Math.PI*2);
  ctx.fillStyle="#5fd38d";
  ctx.fill();
  ctx.globalAlpha=1;

  // 自分本体
  ctx.beginPath();
  ctx.arc(PLAYER.x,PLAYER.y,PLAYER.r,0,Math.PI*2);
  ctx.fillStyle="#5fd38d";
  ctx.fill();

  // UI更新：プレイヤー HP + レベル + 経験値
  const need = expToNextLevel(PLAYER.lv);
  elPStat.textContent=`Lv${PLAYER.lv}  HP ${PLAYER.hp}/${PLAYER.maxHp}  EXP ${PLAYER.exp}/${need}`;
  elPBar.style.width=`${(PLAYER.hp/PLAYER.maxHp)*100}%`;

  // UI更新：敵
  const eUi=battle.target&&battle.target.alive?battle.target:ENEMIES.find(x=>x.alive)||null;

  if(eUi){
    elEStat.textContent=`${eUi.hp}/${eUi.maxHp} (${eUi.name})`;
    elEBar.style.width=`${(eUi.hp/eUi.maxHp)*100}%`;
  }else{
    elEStat.textContent="-";
    elEBar.style.width="0%";
  }

  // 戦闘状態
  if(battle.inBattle && battle.target){
    elBattleState.textContent = `戦闘中（緑=自分射程 / 赤=敵射程）`;
  } else {
    elBattleState.textContent = `探索中（赤円に入ると戦闘開始）`;
  }
}

requestAnimationFrame(frame);

})();
