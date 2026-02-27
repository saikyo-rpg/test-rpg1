// /js/popups.js

export function createPopups(){
  return []; // { x, y, text, ttl, vy, kind }
}

export function addPopup(popups, x, y, text, kind = "dmg"){
  // kind: "dmg" | "heal"
  popups.push({
    x,
    y,
    text: String(text),
    ttl: 0.85,   // 表示時間（秒）
    vy: -55,     // 上昇速度(px/sec)
    kind
  });
}

export function updatePopups(popups, dt){
  for(const p of popups){
    p.ttl -= dt;
    p.y += p.vy * dt;
  }
  // 消す
  for(let i = popups.length - 1; i >= 0; i--){
    if(popups[i].ttl <= 0) popups.splice(i, 1);
  }
}

export function renderPopups(ctx, popups){
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 14px system-ui";

  for(const p of popups){
    // フェードアウト
    const a = Math.max(0, Math.min(1, p.ttl / 0.85));
    ctx.globalAlpha = a;

    // 見やすい縁取り
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.75)";
    ctx.fillStyle = (p.kind === "heal") ? "#4aa3ff" : "#ffffff";

    ctx.strokeText(p.text, p.x, p.y);
    ctx.fillText(p.text, p.x, p.y);
  }

  ctx.restore();
}
