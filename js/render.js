// /js/render.js
import { ENEMY_ATTACK_RADIUS, HEAL_ITEM_RADIUS } from "./config.js";
import { playerAttackRadius } from "./combat.js";
import { renderPopups } from "./popups.js";

function i(n){
  if(!Number.isFinite(n)) return 0;
  return Math.floor(n);
}

export function render(ctx, world, game){
  const { player, enemies, items, popups } = game;

  ctx.clearRect(0, 0, world.w, world.h);

  // ===== 背景（薄いグリッド：任意）=====
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.strokeStyle = "#fff";
  for(let x=0; x<world.w; x+=50){
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, world.h);
    ctx.stroke();
  }
  for(let y=0; y<world.h; y+=50){
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(world.w, y);
    ctx.stroke();
  }
  ctx.restore();

  // ===== 敵 =====
  for(const e of enemies){
    if(!e.alive) continue;

    // 敵射程（赤円）
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(e.x, e.y, ENEMY_ATTACK_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();
    ctx.globalAlpha = 1;

    // 本体
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();

    // 名前 + Lv（頭上）
    ctx.fillStyle = "#fff";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    const lvText = (typeof e.lv === "number") ? `Lv${i(e.lv)}` : "";
    const nameText = e.name ?? "";
    const label = lvText ? `${nameText} ${lvText}` : nameText;
    if(label) ctx.fillText(label, e.x, e.y - 18);
  }

  // ===== 回復アイテム =====
  if(Array.isArray(items)){
    for(const it of items){
      // 光る感じ
      ctx.save();
      ctx.globalAlpha = 0.95;

      ctx.beginPath();
      ctx.arc(it.x, it.y, HEAL_ITEM_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#4aa3ff";
      ctx.fill();

      // 外枠（ちょい見やすく）
      ctx.globalAlpha = 0.75;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.stroke();

      ctx.restore();
    }
  }

  // ===== プレイヤー攻撃範囲（緑円）=====
  const pr = playerAttackRadius(player);
  ctx.globalAlpha = 0.14;
  ctx.beginPath();
  ctx.arc(player.x, player.y, pr, 0, Math.PI * 2);
  ctx.fillStyle = "#5fd38d";
  ctx.fill();
  ctx.globalAlpha = 1;

  // ===== プレイヤー本体 =====
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fillStyle = player.dead ? "#666" : "#5fd38d";
  ctx.fill();

  // ===== ポップアップ（ダメージ/回復）=====
  if(Array.isArray(popups) && popups.length){
    renderPopups(ctx, popups);
  }
}
