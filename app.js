/* Ivrit Express — appli d'apprentissage de l'hébreu moderne */
(function () {
  "use strict";

  // ---------- Utilitaires ----------
  const $ = (sel, el = document) => el.querySelector(sel);
  const app = () => document.getElementById("app");
  const NIKUD_RE = /[֑-ֽֿ-ׇ]/g;
  const strip = (s) => s.replace(NIKUD_RE, "");
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const todayStr = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const yesterdayStr = () => { const d = new Date(); d.setDate(d.getDate() - 1); return todayStr(d); };
  const unitById = (id) => UNITS.find((u) => u.id === id);

  // ---------- Sauvegarde ----------
  const KEY = "ivrit-express-v1";
  const defaults = { name: "", xp: 0, streak: 0, lastDay: "", units: {}, mistakes: {}, alwaysNikud: false, remindHour: 18, remindOn: false, dailyDay: "" };
  let S;
  try { S = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { S = Object.assign({}, defaults); }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    shareStateWithWorker();
    cloudPush();
  }
  // Le service worker ne lit pas localStorage : on lui laisse un petit état dans le cache.
  function shareStateWithWorker() {
    if (!("caches" in window)) return;
    const body = JSON.stringify({ lastDay: S.lastDay, remindHour: S.remindHour, remindOn: S.remindOn, name: S.name, streak: S.streak });
    caches.open("ivrit-state").then((c) => c.put("./__state", new Response(body, { headers: { "Content-Type": "application/json" } }))).catch(() => {});
  }
  const U = (id) => (S.units[id] = S.units[id] || { step: 0, stars: 0, best: 0 });
  const isUnlocked = (id) => id === 1 || (S.units[id - 1] && S.units[id - 1].step >= 4);

  function markActivity(xp) {
    const t = todayStr();
    if (S.lastDay !== t) {
      S.streak = S.lastDay === yesterdayStr() ? S.streak + 1 : 1;
      S.lastDay = t;
    }
    S.xp += xp;
    save();
  }

  // ---------- Affichage de l'hébreu ----------
  // ctx : "learn" (apprentissage) ou "quiz"
  function showNikud(unit, ctx) {
    if (S.alwaysNikud) return true;
    if (unit.nikud === "full") return true;
    if (unit.nikud === "learn") return ctx === "learn";
    return false;
  }
  // Renvoie un span hébreu ; si les voyelles sont cachées, un tap les révèle.
  function he(text, unit, ctx, cls = "") {
    const withN = showNikud(unit, ctx);
    const shown = withN ? text : strip(text);
    const reveal = withN || strip(text) === text ? "" : ` data-full="${esc(text)}" data-bare="${esc(strip(text))}" title="Touchez pour voir les voyelles"`;
    return `<span class="he ${cls} ${reveal ? "revealable" : ""}" dir="rtl" lang="he"${reveal}>${esc(shown)}</span>`;
  }
  document.addEventListener("click", (e) => {
    const r = e.target.closest(".revealable");
    if (!r || r.closest("button.opt") || r.closest(".tile")) return;
    const showingFull = r.dataset.state === "full";
    r.textContent = showingFull ? r.dataset.bare : r.dataset.full;
    r.dataset.state = showingFull ? "bare" : "full";
    e.stopPropagation();
  });

  // ---------- Voix (synthèse vocale du téléphone) ----------
  let heVoice = null;
  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    const v = speechSynthesis.getVoices();
    heVoice = v.find((x) => /^he|^iw/i.test(x.lang)) || null;
  }
  if ("speechSynthesis" in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(strip(text).replace(/[?!.,]/g, " "));
    u.lang = "he-IL"; if (heVoice) u.voice = heVoice; u.rate = 0.85;
    speechSynthesis.speak(u);
  }
  const canSpeak = () => "speechSynthesis" in window && !!heVoice;
  const speakBtn = (text) => canSpeak() ? `<button class="icon-btn speak" data-say="${esc(text)}" aria-label="Écouter">🔊</button>` : "";
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-say]"); if (b) { e.stopPropagation(); speak(b.dataset.say); } });

  // ---------- Petits effets ----------
  function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
  function confetti() {
    const box = document.createElement("div"); box.className = "confetti";
    const colors = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#c77dff"];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.5 + "s";
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 2600);
  }

  // ---------- Écrans ----------
  function render(html) { app().innerHTML = html; window.scrollTo(0, 0); }
  function topbar(title, back) {
    return `<header class="topbar">
      ${back ? `<button class="icon-btn" data-go="${back}" aria-label="Retour">←</button>` : `<span class="logo">עִבְרִית<small>Express</small></span>`}
      <h1>${esc(title)}</h1>
      <div class="stats"><span title="Jours d'affilée">🔥 ${S.streak}</span><span title="Points">⭐ ${S.xp}</span></div>
    </header>`;
  }
  document.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]"); if (!g) return;
    const [screen, arg] = g.dataset.go.split(":");
    ROUTES[screen](arg ? Number(arg) : undefined);
  });

  function welcome() {
    render(`<div class="welcome">
      <div class="big-logo" dir="rtl">שָׁלוֹם!</div>
      <h2>Bienvenue dans Ivrit Express</h2>
      <p>Apprends l'hébreu moderne un peu chaque jour : des mots, puis des phrases, et un petit contrôle pour passer à l'étape suivante.</p>
      <label class="field">Ton prénom<input id="name" autocomplete="given-name" maxlength="20" placeholder="Ex : Noa"></label>
      <fieldset class="gender"><legend>Tu es…</legend>
        <label><input type="radio" name="g" value="m"> 👦 un garçon</label>
        <label><input type="radio" name="g" value="f"> 👧 une fille</label>
      </fieldset>
      <p class="small muted">En hébreu, on ne dit pas pareil « je mange » pour un garçon (אוֹכֵל) et pour une fille (אוֹכֶלֶת). L'appli s'adapte à toi.</p>
      <button class="btn primary" id="go">C'est parti !</button>
      <details class="restore-box"><summary>J'ai déjà un code de sauvegarde</summary>
        <textarea id="wcode" rows="3" placeholder="Colle ton code ici"></textarea>
        <button class="btn" id="wrestore">Retrouver ma progression</button><p class="small" id="winfo"></p></details>
    </div>`);
    $("#wrestore").onclick = () => { const r = readBackup($("#wcode").value); if (!r) { $("#winfo").textContent = "Ce code ne marche pas. Vérifie qu'il est complet."; return; } S = r; if (S.gender) applyGender(S.gender); save(); home(); };
    $("#go").onclick = () => {
      const n = $("#name").value.trim(), g = app().querySelector('input[name="g"]:checked');
      if (!n) { $("#name").focus(); return; }
      if (!g) { $(".gender").classList.add("need"); return; }
      S.name = n; S.gender = g.value; applyGender(S.gender); save(); home();
    };
  }

  function askGender() {
    render(`<div class="welcome"><h2>${esc(S.name)}, tu es…</h2>
      <p>En hébreu, les verbes et les adjectifs changent pour un garçon ou une fille.</p>
      <div class="col"><button class="btn primary" data-g="m">👦 un garçon</button><button class="btn primary" data-g="f">👧 une fille</button></div></div>`);
    app().querySelectorAll("[data-g]").forEach((b) => (b.onclick = () => { S.gender = b.dataset.g; applyGender(S.gender); save(); home(); }));
  }
  function home() {
    if (!S.name) return welcome();
    if (!S.gender) return askGender();
    const doneToday = S.dailyDay === todayStr();
    const learned = UNITS.filter((u) => U(u.id).step >= 1);
    const current = UNITS.find((u) => isUnlocked(u.id) && U(u.id).step < 4);
    const greet = new Date().getHours() < 12 ? "בֹּקֶר טוֹב" : new Date().getHours() < 18 ? "שָׁלוֹם" : "עֶרֶב טוֹב";
    let html = topbar("Mon parcours");
    html += `<main>
      <section class="hello"><span class="he" dir="rtl">${greet}</span>, ${esc(S.name)} !</section>
      <section class="card daily ${doneToday ? "done" : ""}">
        <div><h3>${doneToday ? "✅ Défi du jour réussi" : "🎯 Défi du jour"}</h3>
        <p>${learned.length ? (doneToday ? "Reviens demain pour garder ta série 🔥" : "8 questions pour réviser ce que tu as appris.") : "Commence l'étape 1 pour débloquer le défi."}</p></div>
        ${learned.length ? `<button class="btn ${doneToday ? "" : "primary"}" data-go="daily">${doneToday ? "Refaire" : "Jouer"}</button>` : ""}
      </section>
      ${current ? `<button class="btn primary wide" data-go="unit:${current.id}">Continuer : ${current.emoji} ${esc(current.title)}</button>` : ""}
      <ol class="path">`;
    UNITS.forEach((u) => {
      if (typeof WORLDS !== "undefined" && (u.id === 1 || unitById(u.id - 1).world !== u.world)) {
        const w = WORLDS[u.world], inW = UNITS.filter((x) => x.world === u.world), done = inW.filter((x) => U(x.id).step >= 4).length;
        html += `<li class="world-head"><span>${w.emoji} ${esc(w.title)}</span><small>${done}/${inW.length}</small></li>`;
      }
      const st = U(u.id), open = isUnlocked(u.id);
      const stars = st.step >= 4 ? "★".repeat(st.stars) + "☆".repeat(3 - st.stars) : "";
      const nik = u.nikud === "full" ? "avec voyelles" : u.nikud === "learn" ? "voyelles au début" : "sans voyelles";
      html += `<li><button class="unit ${open ? "" : "locked"} ${st.step >= 4 ? "passed" : ""}" ${open ? `data-go="unit:${u.id}"` : "disabled"}>
        <span class="emoji">${open ? u.emoji : "🔒"}</span>
        <span class="u-text"><b>Étape ${u.id} · ${esc(u.title)}</b><small>${nik}</small>
          <span class="bar"><i style="width:${(st.step / 4) * 100}%"></i></span></span>
        <span class="stars">${stars}</span></button></li>`;
    });
    html += `</ol>
      <button class="btn ghost wide" data-go="settings">⚙️ Réglages et rappels</button>
      <button class="btn ghost wide" data-go="parents">👨‍👩‍👧 Espace parents</button>
    </main>`;
    render(html);
  }

  const STEPS = [
    { key: "learn", icon: "🃏", title: "Découvrir les mots", desc: "Retourne les cartes et écoute." },
    { key: "words", icon: "🎮", title: "Jeu des mots", desc: "Trouve la bonne traduction." },
    { key: "sentences", icon: "💬", title: "Les mots en phrases", desc: "Lis et reconstruis des phrases." },
    { key: "test", icon: "🏁", title: "Petit contrôle", desc: "8/10 pour passer à l'étape suivante." }
  ];
  function unitScreen(id) {
    const u = unitById(id), st = U(id);
    let html = topbar(`${u.emoji} ${u.title}`, "home") + `<main><p class="muted center">Étape ${u.id} sur ${UNITS.length}</p><ol class="steps">`;
    STEPS.forEach((s, i) => {
      const open = st.step >= i, done = st.step > i;
      html += `<li><button class="step ${open ? "" : "locked"} ${done ? "done" : ""}" ${open ? `data-step="${s.key}"` : "disabled"}>
        <span class="emoji">${done ? "✅" : open ? s.icon : "🔒"}</span>
        <span class="u-text"><b>${s.title}</b><small>${s.key === "test" && st.best ? `Meilleur score : ${st.best}/10` : s.desc}</small></span></button></li>`;
    });
    html += `</ol></main>`;
    render(html);
    app().querySelectorAll("[data-step]").forEach((b) => (b.onclick = () => ({ learn: learnCards, words: wordGame, sentences: sentencesIntro, test: unitTest })[b.dataset.step](id)));
  }
  function advance(id, toStep) { const st = U(id); if (st.step < toStep) st.step = toStep; save(); }

  // --- Étape 1 : cartes ---
  function learnCards(id) {
    const u = unitById(id); let i = 0;
    const draw = () => {
      const [w, tr, fr, other, otherLabel] = u.words[i];
      render(topbar(`${u.emoji} Découvrir`, `unit:${id}`) + `<main>
        <p class="muted center">Carte ${i + 1} / ${u.words.length} — touche la carte pour la retourner</p>
        <div class="flip" id="card"><div class="face front">${he(w, u, "learn", "huge")}<small class="tr">${esc(tr)}</small></div>
        <div class="face back"><span class="fr">${esc(fr)}</span>${he(w, u, "learn", "mid")}${other ? `<small class="other">Pour un${otherLabel === "fille" ? "e" : ""} ${otherLabel} : <span class="he" dir="rtl">${esc(other)}</span></small>` : ""}</div></div>
        <div class="row center">${speakBtn(w)}</div>
        <div class="row"><button class="btn" id="prev" ${i === 0 ? "disabled" : ""}>←</button>
        <button class="btn primary grow" id="next">${i === u.words.length - 1 ? "J'ai tout vu !" : "Suivant →"}</button></div></main>`);
      $("#card").onclick = () => $("#card").classList.toggle("flipped");
      $("#prev").onclick = () => { i--; draw(); };
      $("#next").onclick = () => {
        if (i < u.words.length - 1) { i++; draw(); return; }
        advance(id, 1); markActivity(10); unitScreen(id);
      };
      if (canSpeak()) speak(w);
    };
    draw();
  }

  // --- Fabrique de questions ---
  function wordPool(exclude) {
    const pool = [];
    UNITS.forEach((u) => { if (isUnlocked(u.id) || u.id === exclude) u.words.forEach((w, i) => pool.push({ u, w, i })); });
    return pool;
  }
  function qWord(u, idx, dir) {
    const w = u.words[idx];
    const others = shuffle(u.words.filter((x, j) => j !== idx));
    let wrong = others.slice(0, 3);
    if (wrong.length < 3) wrong = wrong.concat(pick(wordPool(u.id).map((p) => p.w).filter((x) => x !== w), 3 - wrong.length));
    const opts = shuffle([w, ...wrong]);
    const key = `w:${u.id}:${idx}`;
    if (dir === "he-fr") return { type: "mcq", key, u, prompt: he(w[0], u, "quiz", "big"), say: w[0], q: "Que veut dire ce mot ?", options: opts.map((o) => esc(o[2])), answer: opts.indexOf(w), correct: esc(w[2]) };
    return { type: "mcq", key, u, prompt: `<span class="fr big">${esc(w[2])}</span>`, q: "Comment dit-on en hébreu ?", heOpts: true, options: opts.map((o) => he(o[0], u, "quiz")), answer: opts.indexOf(w), correct: he(w[0], u, "quiz") };
  }
  function qSentence(u, idx) {
    const s = u.sentences[idx];
    const opts = shuffle([s, ...pick(u.sentences.filter((x) => x !== s), 3)]);
    return { type: "mcq", key: `s:${u.id}:${idx}`, u, prompt: he(s[0], u, "quiz", "mid"), say: s[0], q: "Que veut dire cette phrase ?", options: opts.map((o) => esc(o[1])), answer: opts.indexOf(s), correct: esc(s[1]) };
  }
  function qOrder(u, idx) {
    const s = u.sentences[idx];
    return { type: "order", key: `s:${u.id}:${idx}`, u, sentence: s, tokens: s[0].replace(/[.,!?]/g, "").split(" ") };
  }

  // --- Moteur de quiz ---
  function runQuiz(title, back, questions, onDone) {
    let n = 0, score = 0;
    const next = () => { if (n >= questions.length) return onDone(score, questions.length); ask(questions[n]); };
    const head = () => topbar(title, back) + `<div class="progress"><i style="width:${(n / questions.length) * 100}%"></i></div>`;
    const feedback = (ok, q, correctHtml) => {
      if (ok) { score++; buzz(30); delete S.mistakes[q.key]; }
      else { buzz([80, 60, 80]); S.mistakes[q.key] = (S.mistakes[q.key] || 0) + 1; }
      save();
      const fb = document.createElement("div");
      fb.className = "feedback " + (ok ? "ok" : "ko");
      fb.innerHTML = `<b>${ok ? pickOne(["Bravo !", "Excellent !", "כָּל הַכָּבוֹד!", "Super !", "יוֹפִי!"]) : "Presque…"}</b>${ok ? "" : `<span>Bonne réponse : ${correctHtml}</span>`}<button class="btn primary" id="cont">Continuer</button>`;
      app().appendChild(fb);
      $("#cont").onclick = () => { n++; next(); };
      $("#cont").focus();
    };
    const ask = (q) => {
      if (q.type === "mcq") {
        render(head() + `<main class="quiz"><p class="q">${q.q}</p><div class="prompt">${q.prompt}${q.say ? speakBtn(q.say) : ""}</div>
          <div class="opts ${q.heOpts ? "he-opts" : ""}">${q.options.map((o, i) => `<button class="opt" data-i="${i}">${o}</button>`).join("")}</div>
          ${hintNote(q.u)}</main>`);
        app().querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
          const i = Number(b.dataset.i), ok = i === q.answer;
          app().querySelectorAll(".opt").forEach((x) => (x.disabled = true));
          b.classList.add(ok ? "right" : "wrong");
          app().querySelectorAll(".opt")[q.answer].classList.add("right");
          if (q.heOpts) app().querySelectorAll(".opt").forEach((x) => { const r = x.querySelector(".revealable"); if (r) r.textContent = r.dataset.full; });
          feedback(ok, q, q.correct);
        }));
      } else {
        const bank = shuffle(q.tokens.map((t, i) => ({ t, i })));
        const built = [];
        const withN = showNikud(q.u, "quiz");
        const shownTok = (t) => (withN ? t : strip(t));
        const draw = () => {
          render(head() + `<main class="quiz"><p class="q">Remets les mots dans l'ordre (de droite à gauche)</p>
            <div class="prompt"><span class="fr mid">${esc(q.sentence[1])}</span></div>
            <div class="answer-line" dir="rtl">${built.map((b, k) => `<button class="tile he" data-k="${k}">${esc(shownTok(b.t))}</button>`).join("") || `<span class="muted">Touche les mots ci-dessous</span>`}</div>
            <div class="bank" dir="rtl">${bank.map((b, k) => `<button class="tile he" data-b="${k}" ${b.used ? "disabled" : ""}>${esc(shownTok(b.t))}</button>`).join("")}</div>
            <button class="btn primary wide" id="check" ${built.length === q.tokens.length ? "" : "disabled"}>Vérifier</button></main>`);
          app().querySelectorAll("[data-b]").forEach((el) => (el.onclick = () => { const b = bank[el.dataset.b]; b.used = true; built.push(b); draw(); }));
          app().querySelectorAll("[data-k]").forEach((el) => (el.onclick = () => { const [b] = built.splice(Number(el.dataset.k), 1); b.used = false; draw(); }));
          $("#check").onclick = () => {
            const ok = built.map((b) => b.t).join(" ") === q.tokens.join(" ");
            app().querySelectorAll(".tile").forEach((x) => (x.disabled = true));
            if (canSpeak()) speak(q.sentence[0]);
            feedback(ok, q, `<span class="he" dir="rtl">${esc(q.sentence[0])}</span>`);
          };
        };
        draw();
      }
    };
    next();
  }
  const pickOne = (a) => a[Math.floor(Math.random() * a.length)];
  const hintNote = (u) => !showNikud(u, "quiz") ? `<p class="hint">👁️ Touche un mot en hébreu pour voir ses voyelles.</p>` : "";

  function resultScreen(title, back, score, total, extraHtml, againFn) {
    const pct = score / total;
    if (pct >= 0.8) confetti();
    render(topbar(title, back) + `<main class="result">
      <div class="score">${score}<small>/${total}</small></div>
      <p class="big-msg">${pct === 1 ? "Parfait ! 🤩" : pct >= 0.8 ? "Très bien ! 🎉" : pct >= 0.5 ? "Pas mal, continue ! 💪" : "On réessaie ? 🙂"}</p>
      ${extraHtml || ""}
      <div class="col">${againFn ? `<button class="btn" id="again">Recommencer</button>` : ""}<button class="btn primary" data-go="${back}">Continuer</button></div></main>`);
    if (againFn) $("#again").onclick = againFn;
  }

  // --- Étape 2 : jeu des mots ---
  function wordGame(id) {
    const u = unitById(id);
    const qs = shuffle(u.words.map((w, i) => qWord(u, i, Math.random() < 0.5 ? "he-fr" : "fr-he")));
    runQuiz(`${u.emoji} Jeu des mots`, `unit:${id}`, qs, (sc, tot) => {
      advance(id, 2); markActivity(sc * 2);
      resultScreen("Jeu des mots", `unit:${id}`, sc, tot, `<p class="center">+${sc * 2} ⭐</p>`, () => wordGame(id));
    });
  }

  // --- Étape 3 : phrases ---
  function sentencesIntro(id) {
    const u = unitById(id);
    render(topbar(`${u.emoji} Les phrases`, `unit:${id}`) + `<main>
      <p class="muted center">Lis chaque phrase à voix haute. Touche-la pour voir la traduction.</p>
      <ul class="sentences">${u.sentences.map((s) => `<li class="sent"><div class="row">${he(s[0], u, "learn", "mid")}${speakBtn(s[0])}</div><span class="fr hidden-fr">${esc(s[1])}</span></li>`).join("")}</ul>
      <button class="btn primary wide" id="practice">Je m'entraîne →</button></main>`);
    app().querySelectorAll(".sent").forEach((li) => (li.onclick = () => li.classList.toggle("open")));
    $("#practice").onclick = () => {
      const qs = [];
      u.sentences.forEach((s, i) => { qs.push(qOrder(u, i)); });
      pick(u.sentences.map((s, i) => i), 3).forEach((i) => qs.push(qSentence(u, i)));
      runQuiz(`${u.emoji} Phrases`, `unit:${id}`, shuffle(qs), (sc, tot) => {
        advance(id, 3); markActivity(sc * 2);
        resultScreen("Phrases", `unit:${id}`, sc, tot, `<p class="center">+${sc * 2} ⭐</p>`, () => sentencesIntro(id));
      });
    };
  }

  // --- Étape 4 : contrôle ---
  function unitTest(id) {
    const u = unitById(id);
    const qs = [];
    pick(u.words.map((w, i) => i), 6).forEach((i, k) => qs.push(qWord(u, i, k % 2 ? "fr-he" : "he-fr")));
    const sIdx = pick(u.sentences.map((s, i) => i), 4);
    qs.push(qOrder(u, sIdx[0]), qOrder(u, sIdx[1]), qSentence(u, sIdx[2]), qSentence(u, sIdx[3]));
    runQuiz(`🏁 Contrôle · ${u.title}`, `unit:${id}`, shuffle(qs), (sc, tot) => {
      const st = U(id);
      st.best = Math.max(st.best, sc);
      const passed = sc >= 8;
      let extra;
      if (passed) {
        const stars = sc === 10 ? 3 : sc === 9 ? 2 : 1;
        st.stars = Math.max(st.stars, stars);
        advance(id, 4); markActivity(30 + sc * 3);
        const nextU = unitById(id + 1);
        extra = `<p class="center big-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</p><p class="center">Étape validée ! +${30 + sc * 3} ⭐<br>${nextU ? `Tu débloques : ${nextU.emoji} <b>${esc(nextU.title)}</b>` : "Tu as terminé tout le parcours, כָּל הַכָּבוֹד !"}</p>`;
      } else {
        save(); markActivity(sc);
        extra = `<p class="center">Il faut 8/10 pour passer. Revois les mots et les phrases, puis retente ta chance !</p>`;
      }
      resultScreen("Contrôle", passed ? "home" : `unit:${id}`, sc, tot, extra, () => unitTest(id));
    });
  }

  // --- Défi du jour (révision espacée simple) ---
  function daily() {
    const units = UNITS.filter((u) => U(u.id).step >= 1);
    if (!units.length) return home();
    const items = [];
    units.forEach((u) => {
      u.words.forEach((w, i) => items.push({ u, kind: "w", i, weight: 1 + (S.mistakes[`w:${u.id}:${i}`] || 0) * 3 + (u.id === units[units.length - 1].id ? 1 : 0) }));
      if (U(u.id).step >= 3) u.sentences.forEach((s, i) => items.push({ u, kind: "s", i, weight: 1 + (S.mistakes[`s:${u.id}:${i}`] || 0) * 3 }));
    });
    const chosen = [];
    const bag = items.slice();
    while (chosen.length < 8 && bag.length) {
      const total = bag.reduce((a, b) => a + b.weight, 0);
      let r = Math.random() * total, k = 0;
      while (r > bag[k].weight) { r -= bag[k].weight; k++; }
      chosen.push(bag.splice(k, 1)[0]);
    }
    const qs = chosen.map((it) => it.kind === "w" ? qWord(it.u, it.i, Math.random() < 0.5 ? "he-fr" : "fr-he") : Math.random() < 0.5 ? qOrder(it.u, it.i) : qSentence(it.u, it.i));
    runQuiz("🎯 Défi du jour", "home", qs, (sc, tot) => {
      const first = S.dailyDay !== todayStr();
      S.dailyDay = todayStr();
      markActivity(first ? 20 + sc * 2 : sc);
      resultScreen("Défi du jour", "home", sc, tot, `<p class="center">🔥 Série : ${S.streak} jour${S.streak > 1 ? "s" : ""}</p>`, null);
    });
  }

  // --- Réglages et rappels ---
  function settings() {
    const notifSupported = "Notification" in window && "serviceWorker" in navigator;
    const perm = notifSupported ? Notification.permission : "unsupported";
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    render(topbar("Réglages", "home") + `<main class="settings">
      <section class="card">
        <h3>📲 Installer sur le téléphone</h3>
        ${standalone ? `<p>✅ L'appli est installée.</p>` : iOS
          ? `<p>Dans Safari, touche <b>Partager</b> <span aria-hidden="true">⬆️</span> puis <b>« Sur l'écran d'accueil »</b>.</p>`
          : `<p>Dans Chrome, touche le menu <b>⋮</b> puis <b>« Installer l'application »</b> (ou « Ajouter à l'écran d'accueil »).</p><button class="btn" id="install" hidden>Installer maintenant</button>`}
      </section>
      <section class="card">
        <h3>🔔 Rappel quotidien</h3>
        <label class="switch"><input type="checkbox" id="remind" ${S.remindOn && perm === "granted" ? "checked" : ""} ${notifSupported ? "" : "disabled"}> Me rappeler de faire mon défi</label>
        <label class="field">Vers quelle heure ?
          <select id="hour">${[7, 8, 12, 13, 16, 17, 18, 19, 20, 21].map((h) => `<option value="${h}" ${S.remindHour === h ? "selected" : ""}>${h} h</option>`).join("")}</select></label>
        <p class="muted small" id="notif-info">${!notifSupported ? "Ce navigateur ne permet pas les notifications." : iOS ? "Sur iPhone, installe d'abord l'appli sur l'écran d'accueil. Si le rappel n'arrive pas, crée une alarme « Hébreu » dans l'app Horloge." : "Le rappel arrive une fois par jour si le défi n'est pas fait (appli installée avec Chrome). Le téléphone choisit le moment exact."}</p>
        <button class="btn" id="test-notif" ${perm === "granted" ? "" : "hidden"}>Tester une notification</button>
      </section>
      <section class="card">
        <h3>אָ Voyelles (nikoud)</h3>
        <label class="switch"><input type="checkbox" id="nik" ${S.alwaysNikud ? "checked" : ""}> Toujours afficher les voyelles</label>
        <p class="muted small">Par défaut, les voyelles sont partout dans les étapes 1 à 6, seulement pendant l'apprentissage des étapes 7 à 36, puis disparaissent. On peut toujours toucher un mot pour les voir.</p>
      </section>
      <section class="card">
        <h3>☁️ Sauvegarde en ligne</h3>
        <p class="small">Entre le code famille donné par tes parents. Ta progression sera sauvegardée et ils pourront la suivre.</p>
        <label class="field">Code famille<input id="family" value="${esc(S.family || "")}" autocapitalize="characters" placeholder="Ex : K7PQ2MZA"></label>
        <button class="btn primary" id="save-family">Enregistrer</button>
        ${S.cloudId ? `<p class="small">Ton code perso : <b class="code">${S.cloudId.replace(/(.{4})(?=.)/g, "$1-")}</b><br>Note-le : il te permet de retrouver ta progression sur un autre téléphone.</p>` : ""}
        <label class="field">Retrouver ma progression avec mon code perso<input id="perso" autocapitalize="characters" placeholder="XXXX-XXXX-XXXX"></label>
        <button class="btn" id="load-perso">Retrouver</button>
        <p class="small" id="cloud-info" aria-live="polite">${S.lastSync ? "Dernière sauvegarde : " + new Date(S.lastSync).toLocaleString("fr-FR") : ""}</p>
      </section>
      <section class="card">
        <h3>💾 Sauvegarde sans internet</h3>
        <p class="small">Garde ce code (par exemple en te l'envoyant sur WhatsApp). Sur un nouveau téléphone, colle-le ici pour retrouver toute ta progression.</p>
        <button class="btn primary" id="copy-code">Copier mon code de sauvegarde</button>
        <label class="field">Retrouver ma progression<textarea id="restore-code" rows="3" placeholder="Colle ton code ici"></textarea></label>
        <button class="btn" id="restore">Restaurer</button>
        <p class="small" id="backup-info" aria-live="polite"></p>
      </section>
      <section class="card">
        <h3>👤 Profil</h3>
        <label class="field">Prénom<input id="pname" value="${esc(S.name)}" maxlength="20"></label>
        <label class="field">Je suis<select id="pgender"><option value="m" ${S.gender !== "f" ? "selected" : ""}>👦 un garçon</option><option value="f" ${S.gender === "f" ? "selected" : ""}>👧 une fille</option></select></label>
        <button class="btn danger" id="reset">Tout recommencer à zéro</button>
      </section>
      <p class="muted small center">Ivrit Express · ${UNITS.length} étapes · ${UNITS.reduce((a, u) => a + u.words.length, 0)} mots · ${UNITS.reduce((a, u) => a + u.sentences.length, 0)} phrases</p>
    </main>`);
    $("#nik").onchange = (e) => { S.alwaysNikud = e.target.checked; save(); };
    $("#pgender").onchange = (e) => { S.gender = e.target.value; applyGender(S.gender); save(); };
    $("#pname").onchange = (e) => { if (e.target.value.trim()) { S.name = e.target.value.trim(); save(); } };
    $("#hour").onchange = (e) => { S.remindHour = Number(e.target.value); save(); };
    $("#save-family").onclick = () => {
      const f = cleanCode($("#family").value), info = $("#cloud-info");
      if (f && f.length < 6) { info.textContent = "Le code famille doit faire au moins 6 caractères."; return; }
      S.family = f; save(); info.textContent = f ? "✅ Code enregistré. Ta progression est sauvegardée en ligne." : "Sauvegarde en ligne désactivée.";
      setTimeout(settings, 1800);
    };
    $("#load-perso").onclick = async () => {
      const info = $("#cloud-info"); info.textContent = "Recherche…";
      try { const r = await cloudRestore($("#perso").value); if (!r) { info.textContent = "Code introuvable. Vérifie-le."; return; } S = r; if (S.gender) applyGender(S.gender); save(); info.textContent = `✅ Progression de ${S.name} retrouvée !`; setTimeout(home, 900); }
      catch (e) { info.textContent = "Pas de connexion internet pour l'instant."; }
    };
    $("#copy-code").onclick = async () => {
      const code = makeBackup(), info = $("#backup-info");
      try {
        if (navigator.share) await navigator.share({ title: "Ivrit Express", text: code });
        else { await navigator.clipboard.writeText(code); info.textContent = "✅ Code copié. Colle-le dans un message pour le garder."; }
      } catch (e) {
        const t = $("#restore-code"); t.value = code; t.select();
        info.textContent = "Ton code est dans la case ci-dessus : copie-le.";
      }
    };
    $("#restore").onclick = () => {
      const info = $("#backup-info");
      const r = readBackup($("#restore-code").value);
      if (!r) { info.textContent = "Ce code ne marche pas. Vérifie qu'il est complet (il commence par IVRIT1)."; return; }
      S = r; if (S.gender) applyGender(S.gender); save(); info.textContent = `✅ Progression de ${S.name} retrouvée !`;
      setTimeout(home, 900);
    };
    $("#reset").onclick = () => { if (confirm("Effacer toute la progression ?")) { S = Object.assign({}, defaults); save(); welcome(); } };
    const inst = $("#install");
    if (inst && deferredInstall) { inst.hidden = false; inst.onclick = () => { deferredInstall.prompt(); deferredInstall = null; inst.hidden = true; }; }
    $("#remind").onchange = async (e) => {
      if (!e.target.checked) { S.remindOn = false; save(); return; }
      const p = await Notification.requestPermission();
      if (p !== "granted") { e.target.checked = false; $("#notif-info").textContent = "Les notifications ont été refusées. Autorise-les dans les réglages du téléphone pour ce site."; return; }
      S.remindOn = true; save();
      $("#test-notif").hidden = false;
      await registerDailySync();
    };
    $("#test-notif").onclick = async () => {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification("Ivrit Express", { body: `${S.name}, ton défi d'hébreu t'attend ! 🔥 ${S.streak}`, icon: "icon-192.png", badge: "icon-192.png", tag: "daily" });
    };
  }
  // ---------- Code de sauvegarde ----------
  const B36 = "0123456789abcdefghijklmnopqrstuvwxyz";
  function makeBackup() {
    let last = 0; UNITS.forEach((u) => { if (S.units[u.id] && S.units[u.id].step > 0) last = u.id; });
    let u = "";
    for (let id = 1; id <= last; id++) { const x = S.units[id] || {}; u += B36[(x.step || 0) * 4 + (x.stars || 0)] + B36[x.best || 0]; }
    const o = { n: S.name, x: S.xp, s: S.streak, l: S.lastDay, d: S.dailyDay, h: S.remindHour, v: S.alwaysNikud ? 1 : 0, g: S.gender || "", u };
    return "IVRIT1-" + btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=+$/, "");
  }
  function readBackup(code) {
    try {
      const m = String(code).replace(/\s+/g, "").match(/IVRIT1-([A-Za-z0-9+/]+)/);
      if (!m) return null;
      const o = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
      if (typeof o.n !== "string" || typeof o.u !== "string") return null;
      const st = Object.assign({}, defaults, { name: o.n, xp: o.x | 0, streak: o.s | 0, lastDay: o.l || "", dailyDay: o.d || "", remindHour: o.h || 18, alwaysNikud: !!o.v, gender: o.g || "", units: {}, mistakes: {} });
      for (let i = 0; i * 2 + 1 < o.u.length; i++) {
        const a = B36.indexOf(o.u[i * 2]), b = B36.indexOf(o.u[i * 2 + 1]);
        st.units[i + 1] = { step: Math.floor(a / 4), stars: a % 4, best: b };
      }
      return st;
    } catch (e) { return null; }
  }

  async function registerDailySync() {
    try {
      const reg = await navigator.serviceWorker.ready;
      if ("periodicSync" in reg) {
        const st = await navigator.permissions.query({ name: "periodic-background-sync" });
        if (st.state === "granted") await reg.periodicSync.register("daily-reminder", { minInterval: 6 * 60 * 60 * 1000 });
      }
    } catch (e) {}
  }

  // ---------- Installation (PWA) ----------
  let deferredInstall = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e; });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").then(() => { shareStateWithWorker(); if (S.remindOn) registerDailySync(); }).catch(() => {});
  }

  // ---------- Sauvegarde en ligne + espace parents ----------
  const CLOUD = { url: "https://qddkzkqhzbbwrfledovv.supabase.co/rest/v1/rpc/", key: "sb_publishable_nPMIwWtnns93yIvKOQpkUg_6NZsyNCJ" };
  const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randCode = (n) => { const a = new Uint32Array(n); crypto.getRandomValues(a); return Array.from(a, (x) => CODE_CHARS[x % CODE_CHARS.length]).join(""); };
  const cleanCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  async function rpc(fn, args) {
    const r = await fetch(CLOUD.url + fn, { method: "POST", headers: { apikey: CLOUD.key, "Content-Type": "application/json" }, body: JSON.stringify(args) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const t = await r.text(); return t ? JSON.parse(t) : null;
  }
  let pushTimer = null;
  function cloudPush() {
    if (!S.family || !S.name) return;
    if (!S.cloudId) { S.cloudId = randCode(12); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      const data = Object.assign({}, S); delete data.cloudId; delete data.parentFamily;
      rpc("ivrit_save", { p_id: S.cloudId, p_family: S.family, p_name: S.name, p_data: data })
        .then(() => { S.lastSync = new Date().toISOString(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} })
        .catch(() => {});
    }, 1500);
  }
  window.addEventListener("online", cloudPush);
  async function cloudRestore(code) {
    const id = cleanCode(code);
    if (id.length < 12) return null;
    const r = await rpc("ivrit_load", { p_id: id });
    if (!r || !r.data) return null;
    return Object.assign({}, defaults, r.data, { cloudId: id, family: r.family });
  }

  function parents() {
    render(topbar("Espace parents", "home") + `<main>
      <section class="card">
        <h3>👨‍👩‍👧 Suivre mes enfants</h3>
        <p class="small">Chaque enfant entre le même <b>code famille</b> dans ses Réglages. Sa progression apparaît ici automatiquement.</p>
        <label class="field">Code famille<input id="fam" value="${esc(S.parentFamily || S.family || "")}" autocapitalize="characters" placeholder="Ex : K7PQ2MZA"></label>
        <div class="row"><button class="btn primary grow" id="see">Voir la progression</button><button class="btn" id="newfam">Créer un code</button></div>
        <p class="small" id="pinfo" aria-live="polite"></p>
      </section>
      <div id="kids"></div></main>`);
    const show = async () => {
      const fam = cleanCode($("#fam").value);
      if (fam.length < 6) { $("#pinfo").textContent = "Le code famille doit faire au moins 6 caractères."; return; }
      S.parentFamily = fam; save();
      $("#pinfo").textContent = "Chargement…";
      try {
        const rows = await rpc("ivrit_family", { p_family: fam });
        $("#pinfo").textContent = rows.length ? "" : "Aucun enfant n'utilise encore ce code. Entrez-le dans les Réglages de leur appli.";
        $("#kids").innerHTML = rows.map(kidCard).join("");
      } catch (e) { $("#pinfo").textContent = "Pas de connexion internet pour l'instant. Réessayez plus tard."; }
    };
    $("#see").onclick = show;
    $("#newfam").onclick = () => { $("#fam").value = randCode(8); $("#pinfo").innerHTML = "Nouveau code créé. Notez-le et entrez-le sur le téléphone de chaque enfant (Réglages → Sauvegarde en ligne)."; };
    if (S.parentFamily) show();
  }
  function kidCard(k) {
    const units = k.units || {};
    const passed = UNITS.filter((u) => units[u.id] && units[u.id].step >= 4);
    const stars = passed.reduce((a, u) => a + (units[u.id].stars || 0), 0);
    const cur = UNITS.find((u) => !(units[u.id] && units[u.id].step >= 4));
    const alive = k.last_day === todayStr() || k.last_day === yesterdayStr();
    const last = k.updated_at ? new Date(k.updated_at).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "jamais";
    const pct = Math.round((passed.length / UNITS.length) * 100);
    return `<section class="card kid">
      <div class="row" style="margin:0"><h3 class="grow">${esc(k.name)}</h3><span class="stats-pill">🔥 ${alive ? k.streak : 0}</span><span class="stats-pill">⭐ ${k.xp}</span></div>
      <p>${passed.length} étape${passed.length > 1 ? "s" : ""} validée${passed.length > 1 ? "s" : ""} sur ${UNITS.length} · ${stars} ★</p>
      <span class="bar"><i style="width:${pct}%"></i></span>
      <p class="small">${cur ? `En cours : étape ${cur.id}, ${cur.emoji} ${esc(cur.title)} (${WORLDS[cur.world].title})` : "Parcours terminé ! 🎉"}</p>
      <p class="small muted">Dernière activité : ${esc(last)}${k.last_day === todayStr() ? " · ✅ a travaillé aujourd'hui" : ""}</p>
    </section>`;
  }

  const ROUTES = { home, unit: unitScreen, daily, settings, welcome, parents };
  applyGender(S.gender || "m");
  home();
})();
