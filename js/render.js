import { ENEMY_ATTACK_RADIUS } from "./config.js";
import { playerAttackRadius } from "./combat.js";

export function render(ctx, world, game){
  const { player, enemies } = game;

  ctx.clearRect(0,0,world.w,world.h);

  // 敵
  for(const e of enemies){
    if(!e.alive) continue;

    // 赤円
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(e.x, e.y, ENEMY_ATTACK_RADIUS, 0, Math.PI*2);
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();
  }

  // 自分の緑円
  ctx.globalAlpha = 0.14;
  ctx.beginPath();
  ctx.arc(player.x, player.y, playerAttackRadius(player), 0, Math.PI*2);
  ctx.fillStyle = "#5fd38d";
  ctx.fill();
  ctx.globalAlpha = 1;

  // プレイヤー
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
  ctx.fillStyle = "#5fd38d";
  ctx.fill();
}
