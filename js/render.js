import { ENEMY_ATTACK_RADIUS, HEAL_ITEM_RADIUS } from "./config.js";
import { playerAttackRadius } from "./combat.js";

export function render(ctx, world, game){
  const { player, enemies, items } = game;

  ctx.clearRect(0,0,world.w,world.h);

  // 敵
  for(const e of enemies){
    if(!e.alive) continue;

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

    // Lv表示（小さく）
    ctx.fillStyle = "#fff";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`Lv${e.lv}`, e.x, e.y - 18);
  }

  // 回復アイテム
  for(const it of items){
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(it.x, it.y, HEAL_ITEM_RADIUS, 0, Math.PI*2);
    ctx.fillStyle = "#4aa3ff"; // 回復っぽい色
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // 自分の緑円（攻撃範囲）
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
