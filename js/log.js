export function createLogger(elLog){
  let lastMsg = "";
  let lastAt = 0;

  function log(msg){
    const now = performance.now();

    // 同じmsgが短時間に連続したら無視（例：300ms以内）
    if(msg === lastMsg && (now - lastAt) < 300) return;

    lastMsg = msg;
    lastAt = now;

    const time = new Date().toLocaleTimeString();
    const div = document.createElement("div");
    div.textContent = `[${time}] ${msg}`;
    elLog.appendChild(div);

    while(elLog.children.length > 200){
      elLog.removeChild(elLog.firstChild);
    }
    elLog.scrollTop = elLog.scrollHeight;
  }

  function clear(){ elLog.innerHTML = ""; }

  return { log, clear };
}
