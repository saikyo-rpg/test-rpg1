export function getUI(){
  return {
    pBar: document.getElementById("pBar"),
    eBar: document.getElementById("eBar"),
    pStat: document.getElementById("pStat"),
    eStat: document.getElementById("eStat"),
    battleState: document.getElementById("battleState"),
    log: document.getElementById("log"),
    clearLogBtn: document.getElementById("clearLogBtn"),
    canvas: document.getElementById("c"),
  };
}

export function updateUI(ui, game){
  const { player, enemies, battle, expToNextLevel } = game;

  const need = expToNextLevel(player.lv);
  ui.pStat.textContent = `Lv${player.lv}  HP ${player.hp}/${player.maxHp}  EXP ${player.exp}/${need}`;
  ui.pBar.style.width = `${(player.hp/player.maxHp)*100}%`;

  const eUi = (battle.target && battle.target.alive)
    ? battle.target
    : (enemies.find(x=>x.alive) || null);

  if(eUi){
    ui.eStat.textContent = `${eUi.hp}/${eUi.maxHp} (${eUi.name})`;
    ui.eBar.style.width = `${(eUi.hp/eUi.maxHp)*100}%`;
  }else{
    ui.eStat.textContent = "-";
    ui.eBar.style.width = "0%";
  }

  ui.battleState.textContent = battle.inBattle
    ? "戦闘中（緑=自分射程 / 赤=敵射程）"
    : "探索中（赤円に入ると戦闘開始）";
}
