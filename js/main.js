import { DT, MOVE_SPEED, ENEMY_ATTACK_RADIUS } from "./config.js";
import { clamp, dist } from "./util.js";
import { getUI, updateUI } from "./ui.js";
import { createLogger } from "./log.js";
import { createInput } from "./input.js";
import { createPlayer, createEnemies, createBattle } from "./state.js";
import { expToNextLevel, recalcPlayerStats, respawnTick, startBattle, tickCombat } from "./combat.js";
import { render } from "./render.js";

const ui = getUI();
const ctx = ui.canvas.getContext("2d");
const world = { w: ui.canvas.width, h: ui.canvas.height };

const logger = createLogger(ui.log);
ui.clearLogBtn?.addEventListener("click", logger.clear);

const input = createInput();

const game = {
  player: createPlayer(),
  enemies: createEnemies(),
  battle: createBattle(),
  expToNextLevel
};

recalcPlayerStats(game.player);
logger.log("ゲーム開始");

let acc = 0;
let last = performance.now();

function frame(now){
  const dt = (now - last) / 1000;
  last = now;
  acc += dt;
  acc = Math.min(acc, 0.25);

  while(acc >= DT){
    update(DT);
    acc -= DT;
  }

  render(ctx, world, game);
  updateUI(ui, game);
  requestAnimationFrame(frame);
}

function update(dt){
  const { player, enemies, battle } = game;

  // 敵の復活
  for(const e of enemies) respawnTick(e, dt, logger.log);

  // 移動
  if(player.hp <= 0) return;

  const mv = input.getMoveVec();
  player.x = clamp(player.x + mv.vx * MOVE_SPEED * dt, 20, world.w - 20);
  player.y = clamp(player.y + mv.vy * MOVE_SPEED * dt, 20, world.h - 20);

  // 非戦闘なら赤円に入った敵で開始
  if(!battle.inBattle){
    const target = enemies.find(e => e.alive && dist(player, e) <= ENEMY_ATTACK_RADIUS);
    if(target) startBattle(battle, target, logger.log);
    return;
  }

  // 戦闘処理
  tickCombat(game, dt, logger.log);
}

requestAnimationFrame(frame);
