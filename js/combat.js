import {
  PLAYER_BASE_ATTACK_RADIUS,
  PLAYER_ATTACK_RADIUS_PER_LV,
  ENEMY_ATTACK_RADIUS,
  ATTACK_INTERVAL,
  RESPAWN_SECONDS
} from "./config.js";
import { dist, randInt } from "./util.js";

export function expToNextLevel(lv){
  return Math.floor(30 * Math.pow(1.25, lv-1));
}

export function recalcPlayerStats(player){
  player.atkMin = player.baseAtkMin + Math.floor((player.lv-1) * 1.2);
  player.atkMax = player.baseAtkMax + Math.floor((player.lv-1) * 1.6);
}

export function playerAttackRadius(player){
  return PLAYER_BASE_ATTACK_RADIUS + (player.lv-1) * PLAYER_ATTACK_RADIUS_PER_LV;
}

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
    log?.(`レベルアップ！ Lv${player.lv}（攻撃 ${player.atkMin}-${player.atkMax} / 射程 ${Math.floor(playerAttackRadius(player))}）`);
  }
}

export function killEnemy(enemy, player, battle, log){
  enemy.alive = false;
  enemy.hp = 0;
  enemy.respawnTimer = RESPAWN_SECONDS;

  log?.(`${enemy.name} を倒した！（${RESPAWN_SECONDS}秒後に復活）`);
  gainExp(player, enemy.expReward, log);

  battle.inBattle = false;
  battle.target = null;
}

export function respawnTick(enemy, dt, log){
  if(enemy.alive) return;
  enemy.respawnTimer -= dt;
  if(enemy.respawnTimer <= 0){
    enemy.alive = true;
    enemy.hp = enemy.maxHp;
    enemy.x = enemy.spawnX;
    enemy.y = enemy.spawnY;
    enemy.respawnTimer = 0;
    log?.(`${enemy.name} が復活した！`);
  }
}

export function startBattle(battle, enemy, log){
  battle.inBattle = true;
  battle.target = enemy;
  battle.pAttackTimer = 0.2;
  battle.eAttackTimer = 0.45;
  log?.(`⚔️ ${enemy.name} と戦闘開始`);
}

export function endBattle(battle, log, reason){
  battle.inBattle = false;
  battle.target = null;
  if(reason) log?.(reason);
}

export function tickCombat(game, dt, log){
  const { player, battle } = game;
  const e = battle.target;
  if(!e || !e.alive){
    endBattle(battle);
    return;
  }

  // 離脱
  if(dist(player, e) > ENEMY_ATTACK_RADIUS * 1.35){
    endBattle(battle, log, "距離が離れた。戦闘解除");
    return;
  }

  battle.pAttackTimer -= dt;
  battle.eAttackTimer -= dt;

  // 自分攻撃（緑円内）
  if(battle.pAttackTimer <= 0){
    battle.pAttackTimer += ATTACK_INTERVAL;

    if(dist(player, e) <= playerAttackRadius(player)){
      const dmg = calcDamage(player.atkMin, player.atkMax, e.def);
      e.hp = Math.max(0, e.hp - dmg);
      log?.(`あなたの攻撃 → ${e.name} に ${dmg}（残り ${e.hp}）`);
      if(e.hp <= 0){
        killEnemy(e, player, battle, log);
        return;
      }
    } else {
      log?.("攻撃！…でも射程外");
    }
  }

  // 敵攻撃（赤円内）
  if(battle.eAttackTimer <= 0){
    battle.eAttackTimer += ATTACK_INTERVAL + 0.15;

    if(dist(player, e) <= ENEMY_ATTACK_RADIUS){
      const dmg = calcDamage(e.atkMin, e.atkMax, player.def);
      player.hp = Math.max(0, player.hp - dmg);
      log?.(`${e.name} の攻撃 → あなたに ${dmg}（残りHP ${player.hp}）`);
    }
  }
}
