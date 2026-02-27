// /js/main.js
import {
  DT,
  MOVE_SPEED,
  HEAL_ITEM_COUNT,
  HEAL_ITEM_SPAWN_SEC,
  HEAL_ITEM_LIFETIME_SEC,
  HEAL_ITEM_PICKUP_RADIUS
} from "./config.js";

import { clamp, dist } from "./util.js";
import { getUI, updateUI } from "./ui.js";
import { createLogger } from "./log.js";
import { createInput } from "./input.js";
import { createPlayer, createEnemies, createBattle, createItems } from "./state.js";

import {
  expToNextLevel,
  recalcPlayerStats,
  recalcEnemyStats,
  respawnTick,
  startBattle,
  tickCombat,
  playerAttackRadius,
  revivePlayer,
  healAmountForPlayer
} from "./combat.js";

import { render } from "./render.js";
import { createPopups, updatePopups, addPopup } from "./popups.js";

// ====== setup ======
const ui = getUI();
const ctx = ui.canvas.getContext("2d");

const world = {
  w: ui.canvas.width,
  h: ui.canvas.height
};

const logger = createLogger(ui.log);
ui.clearLogBtn?.addEventListener("click", logger.clear);

const input = createInput();

// ====== game state ======
const game = {
  player: createPlayer(),
  enemies: createEnemies(),
  battle: createBattle(),
  items: createItems(),
  popups: createPopups(),
  expToNextLevel
};

// 初期ステータス計算（敵/味方）
recalcPlayerStats(game.player);
for (const e of game.enemies) recalcEnemyStats(e);

logger.log("ゲーム開始");

// ====== time loop ======
let acc = 0;
let last = performance.now();

// 回復アイテム湧きタイマー
let healSpawnTimer = HEAL_ITEM_SPAWN_SEC;

// ====== helper ======
function spawnHealItem() {
  const pad = 30;
  const x = pad + Math.random() * (world.w - pad * 2);
  const y = pad + Math.random() * (world.h - pad * 2);

  const heal = healAmountForPlayer(game.player);

  game.items.push({
    id: Math.random().toString(16).slice(2),
    x,
    y,
    heal,
    ttl: HEAL_ITEM_LIFETIME_SEC
  });

  logger.log(`回復アイテム出現（+${Math.floor(heal)}）`);
}

function updateItems(dt) {
  // 湧き制御：一定間隔でチェック、足りなければ追加
  healSpawnTimer -= dt;
  if (healSpawnTimer <= 0) {
    healSpawnTimer = HEAL_ITEM_SPAWN_SEC;
    if (game.items.length < HEAL_ITEM_COUNT) {
      spawnHealItem();
    }
  }

  // TTL減らす＆消える
  for (const it of game.items) it.ttl -= dt;
  game.items = game.items.filter((it) => it.ttl > 0);

  // 拾う（生存中のみ）
  const p = game.player;
  if (p.dead) return;

  const idx = game.items.findIndex((it) => dist(p, it) <= HEAL_ITEM_PICKUP_RADIUS);
  if (idx >= 0) {
    const it = game.items[idx];

    const before = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + it.heal);

    game.items.splice(idx, 1);

    // ポップアップ
    addPopup(game.popups, p.x, p.y - 22, `+${Math.floor(p.hp - before)}`, "heal");

    logger.log(`回復！ ${Math.floor(before)}→${Math.floor(p.hp)}`);
  }
}

function update(dt) {
  const { player, enemies, battle } = game;

  // ポップアップ更新
  updatePopups(game.popups, dt);

  // 回復アイテム更新
  updateItems(dt);

  // 敵の復活タイマー（復活時にLvUP＆recalcEnemyStatsが呼ばれる想定）
  for (const e of enemies) respawnTick(e, dt, logger.log);

  // 死亡中：移動せず R復活のみ
  if (player.dead) {
    if (input.consumeRevive()) {
      const ok = revivePlayer(player, battle, logger.log);
      if (ok) addPopup(game.popups, player.x, player.y - 22, "REVIVE", "heal");
    }
    return;
  }

  // ===== 移動 =====
  const mv = input.getMoveVec();
  player.x = clamp(player.x + mv.vx * MOVE_SPEED * dt, 20, world.w - 20);
  player.y = clamp(player.y + mv.vy * MOVE_SPEED * dt, 20, world.h - 20);

  // ===== 非戦闘：自分射程（緑円）に入った敵をターゲットにする =====
  if (!battle.inBattle) {
    const pr = playerAttackRadius(player);
    const target = enemies.find((e) => e.alive && dist(player, e) <= pr);
    if (target) startBattle(battle, target, logger.log);
    return;
  }

  // ===== 戦闘 =====
  tickCombat(
    game,
    dt,
    logger.log,
    (x, y, text, kind) => addPopup(game.popups, x, y, text, kind) // ダメージ表示コールバック
  );
}

function frame(now) {
  const dt = (now - last) / 1000;
  last = now;
  acc += dt;
  acc = Math.min(acc, 0.25);

  while (acc >= DT) {
    update(DT);
    acc -= DT;
  }

  render(ctx, world, game);
  updateUI(ui, game);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
