export function createInput(){
  const keys = new Set();
  window.addEventListener("keydown", e=>keys.add(e.key.toLowerCase()));
  window.addEventListener("keyup", e=>keys.delete(e.key.toLowerCase()));

  function getMoveVec(){
    let vx=0, vy=0;
    if(keys.has("w")) vy-=1;
    if(keys.has("s")) vy+=1;
    if(keys.has("a")) vx-=1;
    if(keys.has("d")) vx+=1;
    const len = Math.hypot(vx,vy) || 1;
    return { vx: vx/len, vy: vy/len };
  }

  return { getMoveVec };
}
