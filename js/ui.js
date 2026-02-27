// /js/ui.js
import { ENEMY_ATTACK_RADIUS } from "./config.js";
import {
  playerAttackRadius,
  playerAttackInterval,
  enemyAttackInterval
} from "./combat.js";

export function getUI(){
  const ui = {
    pBar: document.getElementById("pBar"),
    eBar: document.getElementById("eBar"),
    pStat: document.getElementById("pStat"),
    eStat: document.getElementById("eStat"),
    battleState: document.getElementById("battleState"),
    log: document.getElementById("log"),
    clearLogBtn: document.getElementById("clearLogBtn"),
    canvas: document.getElementById("c"),
  };

  const required = ["pBar","eBar","pStat","eStat","battleState","canvas"];
  for(const k of required){
    if(!ui[k]){
      throw new Error(`UI element not found: ${k}`);
    }
  }
  return ui;
}

function safePercent(n){
  if(!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function i(n){
  if(!Number.isFinite(n)) return 0;
  return Math.floor(n);
}

export function updateUI(ui, game){
  const { player, enemies, battle, expToNextLevel } = game;

  // ===== Player =====
  const need = expToNextLevel(player.lv);

  const pAtkMin = i(player.atkMin);
  const pAtkMax = i(player.atkMax);
  const pDef = i(player.def);
  const pRange = i(playerAttackRadius(player));
  const pInterval = playerAttackInterval(player);
  const pSpeedText = `${pInterval.toFixed(2)}s`;
  const pRateText = pInterval > 0 ? `${(1 / pInterval).toFixed(2)}/s` : "∞";

  const pHpText = player.dead ? "DEAD" : `HP ${i(player.hp)}/${i(player.maxHp)}`;

  ui.pStat.textContent =
    `Lv${i(player.lv)}  ${pHpText}  EXP ${i(player.exp)}/${i(need)}  💰${i(player.gold)}  ` +
    `攻撃 ${pAtkMin}-${pAtkMax}  防御 ${pDef}  速度 ${pSpeedText}(${pRateText})  射程 ${pRange}`;

  ui.pBar.style.width = `${safePercent((player.hp / player.maxHp) * 100)}%`;

  // ===== Enemy =====
  const eUi = (battle.target && battle.target.alive)
    ? battle.target
    : (enemies.find(x => x.alive) || null);

  if(eUi){
    const eAtkMin = i(eUi.atkMin);
    const eAtkMax = i(eUi.atkMax);
    const eDef = i(eUi.def);
    const eRange = i(ENEMY_ATTACK_RADIUS);
    const eInterval = enemyAttackInterval(eUi);
    const eSpeedText = `${eInterval.toFixed(2)}s`;
    const eRateText = eInterval > 0 ? `${(1 / eInterval).toFixed(2)}/s` : "∞";

    // 報酬（敵だけの情報）
    const expR = i(eUi.expReward ?? 0);
    const goldR = i(eUi.goldReward ?? 0);

    ui.eStat.textContent =
      `${eUi.name} Lv${i(eUi.lv)}  HP ${i(eUi.hp)}/${i(eUi.maxHp)}  ` +
      `攻撃 ${eAtkMin}-${eAtkMax}  防御 ${eDef}  速度 ${eSpeedText}(${eRateText})  射程 ${eRange}  ` +
      `報酬 EXP+${expR} 💰+${goldR}`;

    ui.eBar.style.width = `${safePercent((eUi.hp / eUi.maxHp) * 100)}%`;
  }else{
    ui.eStat.textContent = "-";
    ui.eBar.style.width = "0%";
  }

  // ===== 状態表示 =====
  if(player.dead){
    ui.battleState.textContent = "死亡中：Rで復活（所持金10%）";
  } else if(battle.inBattle && battle.target){
    ui.battleState.textContent = "戦闘中（緑=自分射程 / 赤=敵射程）";
  } else {
    ui.battleState.textContent = "探索中（緑円に敵が入ると攻撃開始）";
  }
}
