// /js/ui.js

export function getUI(){
  const ui = {
    // bars
    pBar: document.getElementById("pBar"),
    eBar: document.getElementById("eBar"),

    // texts
    pStat: document.getElementById("pStat"),
    eStat: document.getElementById("eStat"),
    battleState: document.getElementById("battleState"),

    // log
    log: document.getElementById("log"),
    clearLogBtn: document.getElementById("clearLogBtn"),

    // canvas
    canvas: document.getElementById("c"),
  };

  // 必須要素チェック（ある程度安全に）
  const required = ["pBar","eBar","pStat","eStat","battleState","canvas"];
  for(const k of required){
    if(!ui[k]){
      // ここで throw しておくと原因が分かりやすい
      throw new Error(`UI element not found: #${k === "canvas" ? "c" : k}`);
    }
  }

  return ui;
}

function safePercent(n){
  if(!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function updateUI(ui, game){
  const { player, enemies, battle, expToNextLevel } = game;

  // ===== Player UI =====
  const need = expToNextLevel(player.lv);

  const hpText = player.dead
    ? "DEAD"
    : `HP ${player.hp}/${player.maxHp}`;

  ui.pStat.textContent =
    `Lv${player.lv}  ${hpText}  EXP ${player.exp}/${need}  💰${player.gold}`;

  ui.pBar.style.width = `${safePercent((player.hp / player.maxHp) * 100)}%`;

  // ===== Enemy UI =====
  const eUi = (battle.target && battle.target.alive)
    ? battle.target
    : (enemies.find(x => x.alive) || null);

  if(eUi){
    // 敵のLvがある前提（state.js / combat.jsの仕様）
    const enemyLv = (typeof eUi.lv === "number") ? `Lv${eUi.lv} ` : "";
    ui.eStat.textContent = `${enemyLv}${eUi.hp}/${eUi.maxHp} (${eUi.name})`;
    ui.eBar.style.width = `${safePercent((eUi.hp / eUi.maxHp) * 100)}%`;
  } else {
    ui.eStat.textContent = "-";
    ui.eBar.style.width = "0%";
  }

  // ===== State Text =====
  if(player.dead){
    ui.battleState.textContent = "死亡中：Rで復活（所持金10%）";
  } else if(battle.inBattle && battle.target){
    // 一方的攻撃可・射程説明
    ui.battleState.textContent = "戦闘中（緑=自分射程 / 赤=敵射程）";
  } else {
    ui.battleState.textContent = "探索中（緑円に敵が入ると攻撃開始）";
  }
}
