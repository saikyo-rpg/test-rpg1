// /js/ui.js
import { playerAttackRadius, playerAttackInterval } from "./combat.js";

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
  // 整数表示（小数が来ても切り捨て）
  if(!Number.isFinite(n)) return 0;
  return Math.floor(n);
}

export function updateUI(ui, game){
  const { player, enemies, battle, expToNextLevel } = game;

  // ===== Player UI =====
  const need = expToNextLevel(player.lv);

  const atkMin = i(player.atkMin);
  const atkMax = i(player.atkMax);

  const range = i(playerAttackRadius(player));
  const interval = playerAttackInterval(player); // 秒（小さいほど速い）
  const speedText = `${interval.toFixed(2)}s`;    // 間隔を表示
  const dpsHint = interval > 0 ? (1 / interval).toFixed(2) : "∞"; // 参考: 回/秒

  const hpText = player.dead
    ? "DEAD"
    : `HP ${i(player.hp)}/${i(player.maxHp)}`;

  ui.pStat.textContent =
    `Lv${i(player.lv)}  ${hpText}  EXP ${i(player.exp)}/${i(need)}  💰${i(player.gold)}  ` +
    `攻撃 ${atkMin}-${atkMax}  速度 ${speedText}(${dpsHint}/s)  射程 ${range}`;

  ui.pBar.style.width = `${safePercent((player.hp / player.maxHp) * 100)}%`;

  // ===== Enemy UI =====
  const eUi = (battle.target && battle.target.alive)
    ? battle.target
    : (enemies.find(x => x.alive) || null);

  if(eUi){
    ui.eStat.textContent =
      `Lv${i(eUi.lv)}  ${i(eUi.hp)}/${i(eUi.maxHp)} (${eUi.name})`;
    ui.eBar.style.width = `${safePercent((eUi.hp / eUi.maxHp) * 100)}%`;
  } else {
    ui.eStat.textContent = "-";
    ui.eBar.style.width = "0%";
  }

  // ===== State Text =====
  if(player.dead){
    ui.battleState.textContent = "死亡中：Rで復活（所持金10%）";
  } else if(battle.inBattle && battle.target){
    ui.battleState.textContent = "戦闘中（緑=自分射程 / 赤=敵射程）";
  } else {
    ui.battleState.textContent = "探索中（緑円に敵が入ると攻撃開始）";
  }
}
