import { LOG_MAX_LINES } from "./config.js";

export function createLogger(elLog){
  function log(msg){
    const time = new Date().toLocaleTimeString();
    const div = document.createElement("div");
    div.textContent = `[${time}] ${msg}`;
    elLog.appendChild(div);

    while(elLog.children.length > LOG_MAX_LINES){
      elLog.removeChild(elLog.firstChild);
    }
    elLog.scrollTop = elLog.scrollHeight;
  }

  function clear(){
    elLog.innerHTML = "";
  }

  return { log, clear };
}
