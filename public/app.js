// NeuroPlay : navigation, progression, leçons, actualités.
(function () {
  const app = document.getElementById("app");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- sauvegarde locale (dans ce navigateur) ---------- */
  const KEY = "neuroplay-v1";
  const blank = () => ({ xp: 0, lessons: {}, best: {}, played: {}, favs: [], reads: 0, lastNewsVisit: null, theme: null });
  let S = blank();
  try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* stockage indisponible */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

  const LEVELS = ["Neurone curieux", "Synapse active", "Dendrite déployée", "Réseau en éveil", "Cortex brillant", "Hippocampe d'or", "Neuroscientifique"];
  const levelInfo = () => {
    const lvl = Math.min(LEVELS.length - 1, Math.floor(S.xp / 100));
    const pct = lvl === LEVELS.length - 1 ? 100 : S.xp % 100;
    return { lvl, name: LEVELS[lvl], pct };
  };
  const renderLevel = () => {
    const l = levelInfo();
    document.getElementById("level-name").textContent = `Niv. ${l.lvl + 1} · ${l.name}`;
    document.getElementById("xpfill").style.width = l.pct + "%";
    document.getElementById("level").title = `${S.xp} points d'expérience`;
  };

  let toastTimer;
  const toast = (msg) => {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  };
  const addXP = (n, why) => {
    const before = levelInfo().lvl;
    S.xp += n; save(); renderLevel();
    const after = levelInfo().lvl;
    toast(after > before ? `🎉 Niveau ${after + 1} : ${LEVELS[after]} !` : `+${n} XP · ${why}`);
  };

  const ctx = {
    xp: addXP, toast,
    best(id, value, higher) {
      S.played[id] = (S.played[id] || 0) + 1;
      const old = S.best[id];
      const record = old === undefined || (higher ? value > old : value < old);
      if (record) S.best[id] = value;
      save();
      return { best: S.best[id], record: record && old !== undefined };
    }
  };

  const BADGES = [
    ["🎓", "Première leçon", () => Object.values(S.lessons).some(l => l.read)],
    ["📚", "Toutes les leçons", () => NEURO.lessons.every(l => S.lessons[l.id]?.read)],
    ["💯", "Quiz parfait", () => Object.values(S.lessons).some(l => l.quiz === 3)],
    ["🗺️", "Cartographe (8/8)", () => S.best.carte === 8],
    ["⚡", "Réflexe < 250 ms", () => S.best.reaction !== undefined && S.best.reaction < 250],
    ["🔢", "Empan de 7", () => (S.best.empan || 0) >= 7],
    ["🎮", "A essayé les 6 jeux", () => NEURO_GAMES.every(g => S.played[g.id])],
    ["📰", "5 articles lus", () => S.reads >= 5]
  ];

  /* ---------- actualités ---------- */
  let news = null, newsPromise = null, newsError = null, staticNews = false;
  const loadNews = (force) => {
    if (newsPromise && !force) return newsPromise;
    // En local : le serveur Python (api/news). En ligne : le fichier news.json, régénéré toutes les heures.
    const get = (url) => fetch(url, { cache: "no-store" }).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
    newsPromise = (staticNews ? Promise.reject() : get("api/news" + (force ? "?force=1" : "")))
      .catch(() => get("news.json?t=" + Date.now()).then(d => { staticNews = true; return d; }))
      .then(d => { news = d; newsError = null; updateNewBadge(); return d; })
      .catch(e => { newsError = e; throw e; });
    return newsPromise;
  };
  const isNew = (it) => {
    if (!it.date) return false;
    const ref = S.lastNewsVisit ? new Date(S.lastNewsVisit) : new Date(Date.now() - 24 * 3600e3);
    return new Date(it.date) > ref;
  };
  const updateNewBadge = () => {
    const pill = document.getElementById("nav-new");
    const n = news ? news.items.filter(isNew).length : 0;
    pill.hidden = !n || route().name === "actus";
    pill.textContent = n > 99 ? "99+" : n;
  };
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  const ago = (iso) => {
    if (!iso) return "";
    const s = (new Date(iso) - Date.now()) / 1000;
    const steps = [[60, "second"], [3600, "minute", 60], [86400, "hour", 3600], [604800, "day", 86400], [2629800, "week", 604800], [Infinity, "month", 2629800]];
    for (const [lim, unit, div] of steps) if (Math.abs(s) < lim) return rtf.format(Math.round(s / (div || 1)), unit);
  };
  const newsCard = (it) => {
    const fav = S.favs.some(f => f.link === it.link);
    return `<article class="card news-card">
      <div class="news-top"><span class="src">${esc(it.source)}</span><span>${esc(ago(it.date))}</span>
        <span class="lang">${it.lang === "en" ? "EN" : "FR"}</span>${isNew(it) ? '<span class="new">Nouveau</span>' : ""}</div>
      <h3><a href="${esc(it.link)}" target="_blank" rel="noopener" data-read>${esc(it.title)}</a></h3>
      ${it.summary ? `<p>${esc(it.summary)}</p>` : ""}
      <button class="star ${fav ? "on" : ""}" data-fav="${esc(it.link)}" aria-label="${fav ? "Retirer des favoris" : "Garder en favori"}" title="Lire plus tard">${fav ? "★" : "☆"}</button>
    </article>`;
  };
  const bindNewsCards = (root, items) => {
    root.querySelectorAll("[data-read]").forEach(a => a.addEventListener("click", () => { S.reads++; save(); }));
    root.querySelectorAll("[data-fav]").forEach(b => b.addEventListener("click", () => {
      const link = b.dataset.fav, i = S.favs.findIndex(f => f.link === link);
      if (i >= 0) { S.favs.splice(i, 1); toast("Retiré des favoris"); }
      else { const it = items.find(x => x.link === link); if (it) S.favs.unshift(it); toast("★ Gardé pour plus tard"); }
      save();
      const on = i < 0; b.classList.toggle("on", on); b.textContent = on ? "★" : "☆";
    }));
  };
  const newsUnavailable = () => `<div class="card empty">
      <p><b>Les actualités ne sont pas disponibles.</b></p>
      <p class="small">En ligne, réessayez dans quelques minutes. En local, le site doit être lancé avec le petit serveur : ouvrez un terminal dans le dossier <code>maman</code> et tapez <code>python3 server.py</code> (sur Windows : <code>python server.py</code>), puis allez sur <a href="http://localhost:8000">http://localhost:8000</a>. Vérifiez aussi la connexion Internet.</p></div>`;

  /* ---------- pages ---------- */
  const nextLesson = () => NEURO.lessons.find(l => !S.lessons[l.id]?.read) || NEURO.lessons[0];
  const wordOfDay = () => {
    const day = Math.floor(Date.now() / 86400e3);
    return NEURO.glossary[day % NEURO.glossary.length];
  };

  function pageHome() {
    const nl = nextLesson(), w = wordOfDay(), l = levelInfo();
    const doneLessons = NEURO.lessons.filter(x => S.lessons[x.id]?.read).length;
    const played = NEURO_GAMES.filter(g => S.played[g.id]).length;
    app.innerHTML = `
      <section class="hero">
        <div class="card hero-card">
          <h1>Bienvenue dans votre labo du cerveau 🧠</h1>
          <p class="lead">Apprenez les neurosciences pas à pas, testez votre propre cerveau avec des mini-jeux, et suivez les découvertes qui sortent chaque jour.</p>
          <div class="row">
            <a class="btn" href="#/lecon/${nl.id}">${doneLessons ? "Continuer" : "Commencer"} : ${esc(nl.title)}</a>
          </div>
        </div>
        <div class="card word">
          <div class="meta">📖 Le mot du jour</div>
          <div class="term">${esc(w[0])}</div>
          <p class="muted">${esc(w[1])}</p>
          <div class="stats">
            <div class="stat"><b>${doneLessons}/${NEURO.lessons.length}</b><span>leçons</span></div>
            <div class="stat"><b>${played}/${NEURO_GAMES.length}</b><span>jeux essayés</span></div>
            <div class="stat"><b>${S.xp}</b><span>XP · niv. ${l.lvl + 1}</span></div>
          </div>
          <div class="badges">${BADGES.map(([i, n, f]) => `<span class="badge ${f() ? "on" : ""}" title="${f() ? "Obtenu" : "À débloquer"}">${i} ${n}</span>`).join("")}</div>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>📰 Tout juste sorti</h2><a href="#/actus">Toutes les actus →</a></div>
        <div class="news" id="home-news">${'<div class="skeleton"></div>'.repeat(4)}</div>
      </section>

      <section class="section">
        <div class="section-head"><h2>🎮 Testez votre cerveau</h2><a href="#/jeux">Tous les jeux →</a></div>
        <div class="grid">${NEURO_GAMES.slice(0, 4).map(gameCard).join("")}</div>
      </section>`;
    loadNews().then(d => {
      const box = document.getElementById("home-news"); if (!box) return;
      const items = d.items.filter(i => i.lang === "fr").slice(0, 4);
      const list = items.length ? items : d.items.slice(0, 4);
      box.innerHTML = list.length ? list.map(newsCard).join("") : `<div class="card empty">Aucune actualité pour le moment.</div>`;
      bindNewsCards(box, list);
    }).catch(() => { const box = document.getElementById("home-news"); if (box) box.outerHTML = newsUnavailable(); });
  }

  const gameCard = (g) => `<a class="card" href="#/jeux/${g.id}">
      <span class="emoji">${g.icon}</span><h3>${esc(g.title)}</h3><p class="meta">${esc(g.desc)}</p>
      ${S.best[g.id] !== undefined ? `<span class="done-tag">Record : ${S.best[g.id]}${{ reaction: " ms", stroop: " ms d'écart", illusion: " % d'erreur" }[g.id] || ""}</span>` : ""}</a>`;

  function pageLearn() {
    app.innerHTML = `
      <h1>Apprendre</h1>
      <p class="lead">7 leçons courtes pour les grandes bases, de la cellule à la perception. Chacune se termine par un petit quiz et un jeu pour expérimenter.</p>
      <div class="grid" style="margin-top:20px">${NEURO.lessons.map((l, i) => {
        const st = S.lessons[l.id];
        return `<a class="card" href="#/lecon/${l.id}"><span class="emoji">${l.icon}</span>
          <div class="meta">Leçon ${i + 1} · ${l.minutes} min</div><h3>${esc(l.title)}</h3>
          ${st?.read ? `<span class="done-tag">✓ Lue${st.quiz !== undefined ? ` · quiz ${st.quiz}/3` : ""}</span>` : ""}</a>`;
      }).join("")}</div>
      <section class="section">
        <div class="section-head"><h2>📖 Glossaire</h2></div>
        <input class="search" id="g-search" type="search" placeholder="Chercher un mot (synapse, dopamine…)" aria-label="Chercher dans le glossaire">
        <div class="gloss" id="gloss" style="margin-top:14px"></div>
      </section>`;
    const box = document.getElementById("gloss"), input = document.getElementById("g-search");
    const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const draw = () => {
      const q = norm(input.value);
      const list = NEURO.glossary.filter(([t, d]) => norm(t + " " + d).includes(q)).sort((a, b) => a[0].localeCompare(b[0], "fr"));
      box.innerHTML = list.map(([t, d]) => `<div><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join("") || `<p class="muted">Aucun mot trouvé.</p>`;
    };
    input.oninput = draw; draw();
  }

  function pageLesson(id) {
    const idx = NEURO.lessons.findIndex(l => l.id === id);
    if (idx < 0) return pageNotFound();
    const l = NEURO.lessons[idx], prev = NEURO.lessons[idx - 1], next = NEURO.lessons[idx + 1];
    const game = NEURO_GAMES.find(g => g.id === l.game);
    app.innerHTML = `<article class="lesson">
      <a class="back" href="#/apprendre">← Toutes les leçons</a>
      <div class="meta muted">Leçon ${idx + 1}/${NEURO.lessons.length} · ${l.minutes} min de lecture</div>
      <h1>${l.icon} ${esc(l.title)}</h1>
      <div class="lesson-body">${l.body.map(p => `<p>${p}</p>`).join("")}</div>
      <div class="fact"><b>💡 Le saviez-vous ?</b> ${esc(l.fact)}</div>
      ${game ? `<a class="card" href="#/jeux/${game.id}" style="display:flex;gap:14px;align-items:center"><span class="emoji" style="margin:0">${game.icon}</span><div><b>Expérimentez : ${esc(game.title)}</b><div class="meta">${esc(game.desc)}</div></div></a>` : ""}
      <section class="quiz card">
        <h2>✏️ Petit quiz</h2>
        ${l.quiz.map((q, qi) => `<div class="q" data-q="${qi}">
          <div class="q-title">${qi + 1}. ${esc(q.q)}</div>
          <div class="choices">${q.a.map((a, ai) => `<button class="choice" data-a="${ai}">${esc(a)}</button>`).join("")}</div>
          <div class="why" hidden></div></div>`).join("")}
        <p id="quiz-res" class="score"></p>
      </section>
      <div class="lesson-nav">
        ${prev ? `<a class="btn ghost" href="#/lecon/${prev.id}">← ${esc(prev.title)}</a>` : "<span></span>"}
        ${next ? `<a class="btn" href="#/lecon/${next.id}">${esc(next.title)} →</a>` : `<a class="btn" href="#/jeux">Aller aux mini-jeux →</a>`}
      </div></article>`;
    const st = S.lessons[l.id] || (S.lessons[l.id] = {});
    if (!st.read) { st.read = true; save(); addXP(10, "Leçon lue"); }
    let answered = 0, right = 0;
    app.querySelectorAll(".q").forEach(qEl => {
      const q = l.quiz[+qEl.dataset.q];
      qEl.querySelectorAll(".choice").forEach(btn => btn.onclick = () => {
        const a = +btn.dataset.a, ok = a === q.ok;
        qEl.querySelectorAll(".choice").forEach((b, i) => { b.disabled = true; if (i === q.ok) b.classList.add("right"); });
        if (!ok) btn.classList.add("wrong");
        const why = qEl.querySelector(".why"); why.hidden = false; why.textContent = (ok ? "✅ " : "❌ ") + q.why;
        answered++; if (ok) right++;
        if (answered === l.quiz.length) {
          document.getElementById("quiz-res").textContent = `Résultat : ${right}/${l.quiz.length} ${right === 3 ? "🏆" : right === 2 ? "👏" : "💪 relisez et réessayez !"}`;
          const firstTime = st.quiz === undefined;
          st.quiz = Math.max(st.quiz || 0, right); save();
          if (firstTime) addXP(right * 5, "Quiz"); else toast(`Quiz : ${right}/3`);
        }
      });
    });
    window.scrollTo(0, 0);
  }

  let cleanup = null;
  function pageGames() {
    app.innerHTML = `<h1>Mini-jeux</h1>
      <p class="lead">Chaque jeu est une vraie expérience de neurosciences, en version simplifiée. Jouez, puis lisez ce qui s'est passé dans votre tête.</p>
      <div class="grid" style="margin-top:20px">${NEURO_GAMES.map(gameCard).join("")}</div>`;
  }
  function pageGame(id) {
    const g = NEURO_GAMES.find(x => x.id === id);
    if (!g) return pageNotFound();
    app.innerHTML = `<div class="game">
      <a class="back" href="#/jeux">← Tous les jeux</a>
      <h1>${g.icon} ${esc(g.title)}</h1>
      <div class="game-stage" id="stage"></div>
      <div class="explain">${g.explain}</div></div>`;
    cleanup = g.render(document.getElementById("stage"), ctx);
    window.scrollTo(0, 0);
  }

  let newsFilter = { lang: "all", q: "", shown: 30 };
  function pageNews() {
    app.innerHTML = `
      <div class="section-head"><h1 style="margin:0">Actualités du cerveau</h1>
        <button class="btn ghost" id="refresh">↻ Actualiser</button></div>
      <p class="lead">Les derniers articles de plusieurs sites, mis à jour automatiquement (toutes les 20 minutes en local, toutes les heures en ligne). Les articles parus depuis votre dernière visite sont marqués <span class="new">Nouveau</span>.</p>
      <div class="toolbar">
        <button class="chip" data-lang="all">Tout</button>
        <button class="chip" data-lang="fr">🇫🇷 Français</button>
        <button class="chip" data-lang="en">🇬🇧 English</button>
        <button class="chip" data-lang="fav">★ Mes favoris</button>
        <input class="search" id="n-search" type="search" placeholder="Filtrer : sommeil, mémoire, Alzheimer…" aria-label="Filtrer les actualités" value="${esc(newsFilter.q)}">
      </div>
      <div class="status" id="n-status">Chargement…</div>
      <div class="news" id="n-list" style="margin-top:14px">${'<div class="skeleton"></div>'.repeat(6)}</div>
      <div class="row" style="justify-content:center;margin-top:18px"><button class="btn ghost" id="n-more" hidden>Voir plus</button></div>`;
    const list = document.getElementById("n-list"), status = document.getElementById("n-status"), more = document.getElementById("n-more");
    const previousVisit = S.lastNewsVisit;
    const draw = () => {
      app.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.dataset.lang === newsFilter.lang));
      if (!news && newsFilter.lang !== "fav") return;
      const q = newsFilter.q.toLowerCase();
      let items = newsFilter.lang === "fav" ? S.favs : news.items.filter(i => newsFilter.lang === "all" || i.lang === newsFilter.lang);
      if (q) items = items.filter(i => (i.title + " " + i.summary + " " + i.source).toLowerCase().includes(q));
      const shown = items.slice(0, newsFilter.shown);
      list.innerHTML = shown.length ? shown.map(newsCard).join("") :
        `<div class="card empty">${newsFilter.lang === "fav" ? "Aucun favori pour l'instant : cliquez sur ☆ sur un article pour le garder." : "Aucun article ne correspond."}</div>`;
      more.hidden = items.length <= newsFilter.shown;
      bindNewsCards(list, shown);
    };
    const drawStatus = () => {
      if (!news) return;
      const ok = news.sources.filter(s => s.ok).length;
      const t = new Date(news.fetchedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      const fresh = news.items.filter(i => i.date && previousVisit && new Date(i.date) > new Date(previousVisit)).length;
      status.innerHTML = `${news.items.length} articles · ${ok}/${news.sources.length} sources disponibles · mis à jour à ${t}${previousVisit ? ` · ${fresh} nouveau(x) depuis votre dernière visite` : ""}
        <details><summary>Détail des sources</summary>${news.sources.map(s =>
          `<div><span class="dot ${s.ok ? "ok" : "ko"}"></span>${esc(s.name)} ${s.ok ? `(${s.count})` : `: <span class="muted">${esc(s.error)}</span>`}</div>`).join("")}
          <p class="small">Vous pouvez ajouter ou retirer des sources dans le fichier <code>feeds.json</code>.</p></details>`;
    };
    app.querySelectorAll(".chip").forEach(c => c.onclick = () => { newsFilter.lang = c.dataset.lang; newsFilter.shown = 30; draw(); });
    document.getElementById("n-search").oninput = (e) => { newsFilter.q = e.target.value; draw(); };
    more.onclick = () => { newsFilter.shown += 30; draw(); };
    const refreshBtn = document.getElementById("refresh");
    const load = (force) => {
      refreshBtn.disabled = true;
      return loadNews(force).then(() => { drawStatus(); draw(); })
        .catch(() => { status.textContent = ""; if (newsFilter.lang !== "fav") list.innerHTML = newsUnavailable(); })
        .finally(() => { refreshBtn.disabled = false; });
    };
    refreshBtn.onclick = () => load(true).then(() => news && toast("Actualités à jour"));
    draw();
    load(false).then(() => { S.lastNewsVisit = new Date().toISOString(); save(); updateNewBadge(); });
  }

  function pageResources() {
    app.innerHTML = `<h1>Pour aller plus loin</h1>
      <p class="lead">Des sites sérieux et accessibles pour continuer à apprendre et à suivre l'actualité.</p>
      ${NEURO.resources.map(c => `<section class="section"><h2>${esc(c.cat)}</h2><div class="grid">
        ${c.items.map(([n, u, d]) => `<a class="card" href="${esc(u)}" target="_blank" rel="noopener"><h3>${esc(n)} ↗</h3><p class="meta">${esc(d)}</p></a>`).join("")}
      </div></section>`).join("")}
      <section class="section card">
        <h2>📅 À noter</h2>
        <p>Chaque année en mars, la <b>Semaine du Cerveau</b> propose partout en France des conférences et animations gratuites, souvent pensées pour les débutants.</p>
        <p class="small muted" style="margin:0">Votre progression (XP, records, favoris) est enregistrée dans ce navigateur uniquement.
        <button class="btn ghost" id="reset" style="margin-left:8px;padding:4px 10px;font-size:.85rem">Remettre à zéro</button></p>
      </section>`;
    document.getElementById("reset").onclick = () => {
      if (confirm("Effacer toute la progression (XP, leçons, records, favoris) ?")) { const th = S.theme; S = blank(); S.theme = th; save(); renderLevel(); toast("Progression remise à zéro"); }
    };
  }

  function pageNotFound() {
    app.innerHTML = `<div class="card empty"><h2>Page introuvable</h2><p><a href="#/">Retour à l'accueil</a></p></div>`;
  }

  /* ---------- routeur ---------- */
  const route = () => {
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    return { name: parts[0] || "", arg: parts[1] };
  };
  const render = () => {
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    const r = route();
    document.querySelectorAll("#nav a").forEach(a => {
      const target = a.dataset.route;
      const active = target === r.name || (target === "apprendre" && r.name === "lecon");
      a.classList.toggle("active", active);
      if (active) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    ({ "": pageHome, apprendre: pageLearn, lecon: () => pageLesson(r.arg), jeux: () => r.arg ? pageGame(r.arg) : pageGames(),
       actus: pageNews, ressources: pageResources }[r.name] || pageNotFound)();
    updateNewBadge();
    app.focus({ preventScroll: true });
  };

  /* ---------- thème ---------- */
  const applyTheme = () => { if (S.theme) document.documentElement.dataset.theme = S.theme; else delete document.documentElement.dataset.theme; };
  document.getElementById("theme-btn").onclick = () => {
    const dark = S.theme ? S.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    S.theme = dark ? "light" : "dark"; save(); applyTheme();
  };

  applyTheme();
  renderLevel();
  window.addEventListener("hashchange", render);
  render();
  loadNews().catch(() => {});
  // relit les actus toutes les 15 minutes tant que la page est ouverte
  setInterval(() => loadNews(true).then(() => { if (route().name === "actus") render(); }).catch(() => {}), 15 * 60e3);
})();
