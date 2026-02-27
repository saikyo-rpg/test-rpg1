(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");

  // ====== ゲーム定数 ======
  const WORLD = { w: canvas.width, h: canvas.height };
  const DT = 1 / 60;
  const MOVE_SPEED = 180;
  const AGGRO_RADIUS = 70;
  const ATTACK_INTERVAL = 0.65;

  const PLAYER = {
    x: 120, y: 240, r: 12,
    maxHp: 120, hp: 120,
    atkMin: 8, atkMax: 14,
    def: 2,
  };

  const ENEMIES = [
    makeEnemy(520, 160, "スライム", 80, 6, 11, 1),
    makeEnemy(560, 320, "ゴブリン", 110, 8, 14, 2),
  ];

  function makeEnemy(x, y, name, hp, atkMin, atkMax, def) {
    return { x, y, r: 12, name, maxHp: hp, hp, atkMin, atkMax, def, alive: true };
  }

  // ====== 入力 ======
  const keys = new Set();
  window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));

  // ====== 戦闘ステート ======
  let battle = {
    inBattle: false,
    target: null,
    pAttackTimer: 0,
    eAttackTimer: 0,
  };

  // ====== UI ======
  const elPBar = document.getElementById("pBar");
  const elEBar = document.getElementById("eBar");
  const elPStat = document.getElementById("pStat");
  const elEStat = document.getElementById("eStat");
  const elBattleState = document.getElementById("battleState");

  // ログ不要（呼ばれても何もしない）
  function log(_msg) {}

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function calcDamage(atkMin, atkMax, def) {
    const raw = randInt(atkMin, atkMax);
    return Math.max(1, raw - def);
  }

  // ====== ループ ======
  let acc = 0;
  let last = performance.now();

  function frame(now) {
    const dt = (now - last) / 1000;
    last = now;
    acc += dt;
    acc = Math.min(acc, 0.25);

    while (acc >= DT) {
      update(DT);
      acc -= DT;
    }
    render();
    requestAnimationFrame(frame);
  }

  function update(dt) {
    if (PLAYER.hp <= 0) {
      PLAYER.hp = 0;
      battle.inBattle = false;
      battle.target = null;
      return;
    }

    // ===== 移動（戦闘中でもOK）=====
    let vx = 0, vy = 0;
    if (keys.has("w")) vy -= 1;
    if (keys.has("s")) vy += 1;
    if (keys.has("a")) vx -= 1;
    if (keys.has("d")) vx += 1;

    const len = Math.hypot(vx, vy) || 1;
    vx /= len; vy /= len;

    PLAYER.x = clamp(PLAYER.x + vx * MOVE_SPEED * dt, 20, WORLD.w - 20);
    PLAYER.y = clamp(PLAYER.y + vy * MOVE_SPEED * dt, 20, WORLD.h - 20);

    // 非戦闘時だけ：近づいたら戦闘開始
    if (!battle.inBattle) {
      const target = ENEMIES.find(e => e.alive && dist(PLAYER, e) <= AGGRO_RADIUS);
      if (target) startBattle(target);
      return;
    }

    // ===== 戦闘処理 =====
    const e = battle.target;
    if (!e || !e.alive) {
      endBattle();
      return;
    }

    // 離れたら戦闘解除（逃げられる）
    if (dist(PLAYER, e) > AGGRO_RADIUS * 1.35) {
      log("距離が離れた！戦闘解除");
      endBattle();
      return;
    }

    battle.pAttackTimer -= dt;
    battle.eAttackTimer -= dt;

    if (battle.pAttackTimer <= 0) {
      battle.pAttackTimer += ATTACK_INTERVAL;
      const dmg = calcDamage(PLAYER.atkMin, PLAYER.atkMax, e.def);
      e.hp = Math.max(0, e.hp - dmg);
      log(`あなたの攻撃！ ${e.name} に ${dmg} ダメージ`);
      if (e.hp <= 0) {
        e.alive = false;
        log(`${e.name} を倒した！`);
        endBattle();
        return;
      }
    }

    if (battle.eAttackTimer <= 0) {
      battle.eAttackTimer += ATTACK_INTERVAL + 0.15;
      const dmg = calcDamage(e.atkMin, e.atkMax, PLAYER.def);
      PLAYER.hp = Math.max(0, PLAYER.hp - dmg);
      log(`${e.name} の攻撃！ あなたに ${dmg} ダメージ`);
      if (PLAYER.hp <= 0) {
        log("あなたは倒れた…");
        return;
      }
    }
  }

  function startBattle(enemy) {
    battle.inBattle = true;
    battle.target = enemy;
    battle.pAttackTimer = 0.2;
    battle.eAttackTimer = 0.45;
    log(`⚔️ ${enemy.name} と戦闘開始！`);
  }

  function endBattle() {
    battle.inBattle = false;
    battle.target = null;
    battle.pAttackTimer = 0;
    battle.eAttackTimer = 0;
  }

  function render() {
    ctx.clearRect(0, 0, WORLD.w, WORLD.h);

    // 背景グリッド
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#fff";
    for (let x = 0; x < WORLD.w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.h); ctx.stroke();
    }
    for (let y = 0; y < WORLD.h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.w, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 敵
    for (const e of ENEMIES) {
      if (!e.alive) continue;

      // アグロ範囲
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(e.x, e.y, AGGRO_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#ff6b6b";
      ctx.fill();
      ctx.globalAlpha = 1;

      // 本体
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = "#ff6b6b";
      ctx.fill();

      // 名前
      ctx.fillStyle = "#fff";
      ctx.font = "12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(e.name, e.x, e.y - 18);
    }

    // プレイヤー
    ctx.beginPath();
    ctx.arc(PLAYER.x, PLAYER.y, PLAYER.r, 0, Math.PI * 2);
    ctx.fillStyle = "#5fd38d";
    ctx.fill();

    // ターゲット線
    if (battle.inBattle && battle.target) {
      const e = battle.target;
      ctx.strokeStyle = "#fff";
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(PLAYER.x, PLAYER.y);
      ctx.lineTo(e.x, e.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // UI更新
    elPStat.textContent = `${PLAYER.hp}/${PLAYER.maxHp}`;
    elPBar.style.width = `${(PLAYER.hp / PLAYER.maxHp) * 100}%`;

    const eUi = (battle.target && battle.target.alive)
      ? battle.target
      : (ENEMIES.find(x => x.alive) || null);

    if (eUi) {
      elEStat.textContent = `${eUi.hp}/${eUi.maxHp} (${eUi.name})`;
      elEBar.style.width = `${(eUi.hp / eUi.maxHp) * 100}%`;
    } else {
      elEStat.textContent = "-";
      elEBar.style.width = "0%";
    }

    if (battle.inBattle && battle.target) {
      elBattleState.textContent = `戦闘中：${battle.target.name}（範囲外に出ると解除）`;
    } else {
      elBattleState.textContent = "探索中：敵の赤い円に入ると自動戦闘";
    }
  }

  requestAnimationFrame(frame);
})();
