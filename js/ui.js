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
  const hpText = player.dead ? `DEAD` : `HP ${player.hp}/${player.maxHp}`;
  ui.pStat.textContent = `Lv${player.lv}  ${hpText}  EXP ${player.exp}/${need}  💰${player.gold}`;
  // eUi がある時
  ui.eStat.textContent = `Lv${eUi.lv}  ${eUi.hp}/${eUi.maxHp} (${eUi.name})`;
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

  if(player.dead){
    ui.battleState.textContent = "死亡中：Rで復活（所持金10%）";
  } else {
    ui.battleState.textContent = battle.inBattle
      ? "戦闘中（緑=自分射程 / 赤=敵射程）"
      : "探索中（緑円に敵が入ると攻撃開始）";
  }
}
