// /js/combat.js
import {
  // range
  PLAYER_BASE_ATTACK_RADIUS,
  PLAYER_ATTACK_RADIUS_PER_LV,
  ENEMY_ATTACK_RADIUS,

  // respawn
  RESPAWN_SECONDS,

  // speed
  PLAYER_ATTACK_INTERVAL_BASE,
  PLAYER_ATTACK_INTERVAL_MIN,
  ENEMY_ATTACK_INTERVAL_BASE,
  ENEMY_ATTACK_INTERVAL_MIN,
  ATTACK_INTERVAL_PER_LV,

  // enemy growth
  ENEMY_LV_UP_ON_RESPAWN,
  ENEMY_HP_PER_LV,
  ENEMY_ATK_PER_LV,
  ENEMY_DEF_PER_LV,
  ENEMY_EXP_PER_LV,
  ENEMY_GOLD_PER_LV,

  // heal item amount
  HEAL_AMOUNT_BASE,
  HEAL_AMOUNT_PER_LV,
} from "./config.js";

import { dist, randInt } from "./util.js";

// --------------------
// Player: EXP / Level
// --------------------
export function expToNextLevel(lv){
  return Math.floor(30 * Math.pow(1.25, lv - 1));
}

export function recalcPlayerStats(player){
  player.atkMin = player.baseAtkMin + Math.floor((player.lv - 1) * 1.2);
  player.atkMax = player.baseAtkMax + Math.floor((player.lv - 1) * 1.6);
}

// --------------------
// Range / Speed
// --------------------
export function playerAttackRadius(player){
  return PLAYER_BASE_ATTACK_RADIUS + (player.lv - 1) * PLAYER_ATTACK_RADIUS_PER_LV;
}

export function playerAttackInterval(player){
  const v = PLAYER_ATTACK_INTERVAL_BASE - (player.lv - 1) * ATTACK_INTERVAL_PER_LV;
  return Math.max(PLAYER_ATTACK_INTERVAL_MIN, v);
}

export function enemyAttackInterval(enemy){
  const v = ENEMY_ATTACK_INTERVAL_BASE - (enemy.lv - 1) * ATTACK_INTERVAL_PER_LV;
  return Math.max(ENEMY_ATTACK_INTERVAL_MIN, v);
}

// --------------------
// Heal item amount
// --------------------
export function healAmountForPlayer(player){
  return HEAL_AMOUNT_BASE + (player.lv - 1) * HEAL_AMOUNT_PER_LV;
}

// --------------------
// Enemy: stats scaling
// --------------------
export function recalcEnemyStats(enemy){
  // Lvで最大HP/攻撃/防御/報酬を伸ばす
  enemy.maxHp = enemy.baseMaxHp + (enemy.lv - 1) * ENEMY_HP_PER_LV;
  enemy.atkMin = enemy.baseAtkMin + (enemy.lv - 1) * ENEMY_ATK_PER_LV;
  enemy.atkMax = enemy.baseAtkMax + (enemy.lv - 1) * ENEMY_ATK_PER_LV;
  enemy.def    = enemy.baseDef    + (enemy.lv - 1) * ENEMY_DEF_PER_LV;

  enemy.expReward  = enemy.baseExpReward  + (enemy.lv - 1) * ENEMY_EXP_PER_LV;
  enemy.goldReward = enemy.baseGoldReward + (enemy.lv - 1) * ENEMY_GOLD_PER_LV;

  // HP整合
  enemy.hp = Math.min(enemy.hp, enemy.maxHp);
}

// --------------------
// Damage / Reward
// --------------------
export function calcDamage(atkMin, atkMax, def){
  return Math.max(1, randInt(atkMin, atkMax) - def);
}

export function gainExp(player, amount, log){
  player.exp += amount;
  log?.(`EXP +${amount}`);

  while(player.exp >= expToNextLevel(player.lv)){
    player.exp -= expToNextLevel(player.lv);
    player.lv += 1;
    recalcPlayerStats(player);
    log?.(
      `レベルアップ！ Lv${player.lv}（攻撃 ${player.atkMin}-${player.atkMax} / 射程 ${Math.floor(playerAttackRadius(player))} / 速度 ${playerAttackInterval(player).toFixed(2)}s）`
    );
  }
}

export function gainGold(player, amount, log){
  player.gold += amount;
  log?.(`お金 +${amount}（所持金 ${player.gold}）`);
}

// --------------------
// Battle control
// --------------------
export function startBattle(battle, enemy, log){
  battle.inBattle = true;
  battle.target = enemy;
  battle.pAttackTimer = 0.2;
  battle.eAttackTimer = 0.45;
  log?.(`⚔️ ${enemy.name} Lv${enemy.lv} と戦闘開始`);
}

export function endBattle(battle, log, reason){
  battle.inBattle = false;
  battle.target = null;
  if(reason) log?.(reason);
}

// --------------------
// Enemy death / respawn
// --------------------
export function killEnemy(enemy, player, battle, log, spawn){
  enemy.alive = false;
  enemy.hp = 0;
  enemy.respawnTimer = RESPAWN_SECONDS;

  log?.(`${enemy.name} を倒した！（${RESPAWN_SECONDS}秒後に復活）`);
  spawn?.(enemy.x, enemy.y - 22, "KO", "dmg");

  gainExp(player, enemy.expReward, log);
  gainGold(player, enemy.goldReward ?? 0, log);

  endBattle(battle);
}

export function respawnTick(enemy, dt, log){
  if(enemy.alive) return false;

  enemy.respawnTimer -= dt;
  if(enemy.respawnTimer <= 0){
    enemy.lv += ENEMY_LV_UP_ON_RESPAWN;

    enemy.alive = true;
    enemy.x = enemy.spawnX;
    enemy.y = enemy.spawnY;

    enemy.hp = 999999;
    recalcEnemyStats(enemy);
    enemy.hp = enemy.maxHp;

    enemy.respawnTimer = 0;
    log?.(`${enemy.name} が復活！ Lv${enemy.lv}`);

    return true; // ★追加
  }
  return false;
}

// --------------------
// Player death / revive (gold 10%)
// --------------------
export function handlePlayerDeath(player, battle, log, spawn){
  if(player.dead) return;
  player.dead = true;
  player.hp = 0;
  endBattle(battle);
  log?.(`あなたは倒れた… Rで復活（所持金の10%）`);
  spawn?.(player.x, player.y - 22, "DEAD", "dmg");
}

export function revivePlayer(player, battle, log){
  if(!player.dead) return false;

  const cost = Math.ceil(player.gold * 0.10); // 10% 切り上げ
  if(cost <= 0 || player.gold < cost){
    log?.(`復活できない（復活費 ${cost} / 所持金 ${player.gold}）`);
    return false;
  }

  player.gold -= cost;
  player.hp = player.maxHp;
  player.dead = false;
  endBattle(battle);

  log?.(`復活！ 復活費 ${cost}（残り ${player.gold}）`);
  return true;
}

// --------------------
// Combat tick
// - spawn: (x,y,text,kind) => void  // ポップアップ用
// --------------------
export function tickCombat(game, dt, log, spawn){
  const { player, battle } = game;
  const e = battle.target;

  if(!e || !e.alive){
    endBattle(battle);
    return;
  }
  if(player.dead) return;

  // 敵の赤円から離れたら戦闘解除（逃げ）
  if(dist(player, e) > ENEMY_ATTACK_RADIUS * 1.35){
    endBattle(battle, log, "距離が離れた。戦闘解除");
    return;
  }

  battle.pAttackTimer -= dt;
  battle.eAttackTimer -= dt;

  // -------- Player attack (green range) --------
  if(battle.pAttackTimer <= 0){
    battle.pAttackTimer += playerAttackInterval(player);

    if(dist(player, e) <= playerAttackRadius(player)){
      const dmg = calcDamage(player.atkMin, player.atkMax, e.def);
      e.hp = Math.max(0, e.hp - dmg);
      log?.(`あなたの攻撃 → ${e.name}Lv${e.lv} に ${dmg}（残り ${e.hp}）`);
      spawn?.(e.x, e.y - 44, `-${dmg}`, "dmg");

      if(e.hp <= 0){
        killEnemy(e, player, battle, log, spawn);
        return;
      }
    } else {
      // 射程外なら何もしない（ログ出したければここ）
      // log?.("攻撃！…でも射程外");
    }
  }

  // -------- Enemy attack (red range only) --------
  if(battle.eAttackTimer <= 0){
    battle.eAttackTimer += enemyAttackInterval(e);

    if(dist(player, e) <= ENEMY_ATTACK_RADIUS){
      const dmg = calcDamage(e.atkMin, e.atkMax, player.def);
      player.hp = Math.max(0, player.hp - dmg);
      log?.(`${e.name}Lv${e.lv} の攻撃 → あなたに ${dmg}（残りHP ${player.hp}）`);
      spawn?.(player.x, player.y - 44, `-${dmg}`, "dmg");

      if(player.hp <= 0){
        handlePlayerDeath(player, battle, log, spawn);
        return;
      }
    }
  }
}
