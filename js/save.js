// /js/save.js
const KEY = "test-rpg1_save_v1";

export function hasSave(){
  return !!localStorage.getItem(KEY);
}

export function deleteSave(){
  localStorage.removeItem(KEY);
}

export function saveGame(game){
  const { player, enemies, items } = game;

  const data = {
    v: 1,
    savedAt: Date.now(),

    player: {
      x: player.x, y: player.y,
      hp: player.hp, maxHp: player.maxHp,
      def: player.def,
      lv: player.lv, exp: player.exp,
      gold: player.gold,
      baseAtkMin: player.baseAtkMin,
      baseAtkMax: player.baseAtkMax,
      atkMin: player.atkMin,
      atkMax: player.atkMax,
      dead: player.dead,
    },

    enemies: enemies.map(e => ({
      name: e.name,
      x: e.x, y: e.y,
      r: e.r,

      baseMaxHp: e.baseMaxHp,
      baseAtkMin: e.baseAtkMin,
      baseAtkMax: e.baseAtkMax,
      baseDef: e.baseDef,
      baseExpReward: e.baseExpReward,
      baseGoldReward: e.baseGoldReward,

      lv: e.lv,
      maxHp: e.maxHp,
      hp: e.hp,
      atkMin: e.atkMin,
      atkMax: e.atkMax,
      def: e.def,
      expReward: e.expReward,
      goldReward: e.goldReward,

      alive: e.alive,
      spawnX: e.spawnX,
      spawnY: e.spawnY,
      respawnTimer: e.respawnTimer,

      vx: e.vx ?? 0,
      vy: e.vy ?? 0,
      wanderTimer: e.wanderTimer ?? 0,

      spawnsMinions: e.spawnsMinions ?? true,
    })),

    items: (items ?? []).map(it => ({
      id: it.id,
      x: it.x, y: it.y,
      heal: it.heal,
      ttl: it.ttl,
    })),
  };

  localStorage.setItem(KEY, JSON.stringify(data));
  return true;
}

export function loadGame(){
  const raw = localStorage.getItem(KEY);
  if(!raw) return null;

  let data;
  try{
    data = JSON.parse(raw);
  }catch{
    return null;
  }
  if(!data || data.v !== 1) return null;
  return data;
}

function toInt(n){
  return Number.isFinite(n) ? Math.floor(n) : 0;
}

export function applyLoadedGame(game, data){
  if(!data) return false;

  // --- player ---
  Object.assign(game.player, {
    x: +data.player.x,
    y: +data.player.y,
    hp: toInt(data.player.hp),
    maxHp: toInt(data.player.maxHp),
    def: toInt(data.player.def),
    lv: toInt(data.player.lv),
    exp: toInt(data.player.exp),
    gold: toInt(data.player.gold),
    baseAtkMin: toInt(data.player.baseAtkMin),
    baseAtkMax: toInt(data.player.baseAtkMax),
    atkMin: toInt(data.player.atkMin),
    atkMax: toInt(data.player.atkMax),
    dead: !!data.player.dead,
  });

  // --- enemies（配列ごと置換。増援も復元） ---
  game.enemies.length = 0;
  for(const e of data.enemies){
    game.enemies.push({
      name: e.name,
      x: +e.x, y: +e.y,
      r: toInt(e.r ?? 12),

      baseMaxHp: toInt(e.baseMaxHp),
      baseAtkMin: toInt(e.baseAtkMin),
      baseAtkMax: toInt(e.baseAtkMax),
      baseDef: toInt(e.baseDef),
      baseExpReward: toInt(e.baseExpReward),
      baseGoldReward: toInt(e.baseGoldReward),

      lv: toInt(e.lv),
      maxHp: toInt(e.maxHp),
      hp: toInt(e.hp),
      atkMin: toInt(e.atkMin),
      atkMax: toInt(e.atkMax),
      def: toInt(e.def),
      expReward: toInt(e.expReward),
      goldReward: toInt(e.goldReward),

      alive: !!e.alive,
      spawnX: +e.spawnX,
      spawnY: +e.spawnY,
      respawnTimer: +e.respawnTimer || 0,

      vx: +e.vx || 0,
      vy: +e.vy || 0,
      wanderTimer: +e.wanderTimer || 0,

      spawnsMinions: !!e.spawnsMinions,
    });
  }

  // --- items ---
  game.items = (data.items ?? []).map(it => ({
    id: it.id,
    x: +it.x, y: +it.y,
    heal: toInt(it.heal),
    ttl: +it.ttl || 0,
  }));

  // --- reset volatile state ---
  game.battle.inBattle = false;
  game.battle.target = null;
  game.battle.pAttackTimer = 0;
  game.battle.eAttackTimer = 0;

  game.popups.length = 0;

  return true;
}
