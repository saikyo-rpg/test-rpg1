// /js/render.js
import { ENEMY_ATTACK_RADIUS, HEAL_ITEM_RADIUS } from "./config.js";
import { playerAttackRadius } from "./combat.js";
import { renderPopups } from "./popups.js";

function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function i(n){ return Number.isFinite(n) ? Math.floor(n) : 0; }

// 頭上HPバー描画（共通）
function drawHpBar(ctx, x, y, w, h, hp, maxHp, fillColor){
  const t = maxHp > 0 ? clamp01(hp / maxHp) : 0;

  // 背景
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(x - w/2, y, w, h);

  // 枠
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - w/2, y, w, h);

  // 中身
  ctx.globalAlpha = 1;
  ctx.fillStyle = fillColor;
  ctx.fillRect(x - w/2, y, w * t, h);

  ctx.restore();
}

export function render(ctx, world, game){
  const { player, enemies, items, popups } = game;

  ctx.clearRect(0, 0, world.w, world.h);

  // ===== 背景グリッド（任意）=====
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "#fff";
  for(let x=0; x<world.w; x+=50){
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,world.h); ctx.stroke();
  }
  for(let y=0; y<world.h; y+=50){
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(world.w,y); ctx.stroke();
  }
  ctx.restore();

  // ===== 敵 =====
  for(const e of enemies){
    if(!e.alive) continue;

    // 敵射程（赤円）
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(e.x, e.y, ENEMY_ATTACK_RADIUS, 0, Math.PI*2);
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();
    ctx.globalAlpha = 1;

    // 本体
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
    ctx.fillStyle = "#ff6b6b";
    ctx.fill();

    // 名前+Lv
    ctx.fillStyle = "#fff";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    const label = `${e.name} Lv${i(e.lv)}`;
    ctx.fillText(label, e.x, e.y - 22);

    // 頭上HPバー（敵）
    // 位置：文字の下あたり
    drawHpBar(ctx, e.x, e.y - 18, 46, 6, i(e.hp), i(e.maxHp), "#ff6b6b");
  }

  // ===== 回復アイテム =====
  if(Array.isArray(items)){
    for(const it of items){
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.beginPath();
      ctx.arc(it.x, it.y, HEAL_ITEM_RADIUS, 0, Math.PI*2);
      ctx.fillStyle = "#4aa3ff";
      ctx.fill();

      ctx.globalAlpha = 0.75;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.stroke();
      ctx.restore();
    }
  }

  // ===== 自分射程（緑円）=====
  const pr = playerAttackRadius(player);
  ctx.globalAlpha = 0.14;
  ctx.beginPath();
  ctx.arc(player.x, player.y, pr, 0, Math.PI*2);
  ctx.fillStyle = "#5fd38d";
  ctx.fill();
  ctx.globalAlpha = 1;

  // ===== プレイヤー本体 =====
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
  ctx.fillStyle = player.dead ? "#666" : "#5fd38d";
  ctx.fill();

  // 頭上HPバー（プレイヤー）
  // プレイヤーは名前ないのでバーだけ
  drawHpBar(ctx, player.x, player.y - 26, 56, 7, i(player.hp), i(player.maxHp), "#5fd38d");

  // ===== ポップアップ（HPバーより上に出る想定）=====
  if(Array.isArray(popups) && popups.length){
    renderPopups(ctx, popups);
  }
}
