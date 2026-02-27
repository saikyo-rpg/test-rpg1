export function createInput(){
  const keys = new Set();
  let revivePressed = false;

  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    keys.add(k);
    if(k === "r") revivePressed = true;

    // 矢印キーでページがスクロールするのを防ぐ（任意だけどおすすめ）
    if(k.startsWith("arrow")) e.preventDefault();
  }, { passive: false });

  window.addEventListener("keyup", (e) => {
    keys.delete(e.key.toLowerCase());
  });

  function getMoveVec(){
    let vx = 0, vy = 0;

    // WASD
    if(keys.has("w")) vy -= 1;
    if(keys.has("s")) vy += 1;
    if(keys.has("a")) vx -= 1;
    if(keys.has("d")) vx += 1;

    // 方向キー
    if(keys.has("arrowup")) vy -= 1;
    if(keys.has("arrowdown")) vy += 1;
    if(keys.has("arrowleft")) vx -= 1;
    if(keys.has("arrowright")) vx += 1;

    const len = Math.hypot(vx, vy);
    if(len === 0) return { vx: 0, vy: 0 };
    return { vx: vx/len, vy: vy/len };
  }

  function consumeRevive(){
    const v = revivePressed;
    revivePressed = false;
    return v;
  }

  return { getMoveVec, consumeRevive };
}
