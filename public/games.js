// Mini-jeux de NeuroPlay. Chaque jeu a render(el, ctx) et renvoie une fonction de nettoyage.
// ctx : xp(points, raison), best(id, valeur, plusHautMeilleur) -> {best, record}, toast(texte)
(function () {
  const $ = (sel, root) => root.querySelector(sel);
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const avg = (a) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const games = [];

  /* ---------------- 1. Carte du cerveau ---------------- */
  const REGIONS = {
    frontal:   { name: "Lobe frontal", color: "#7c5cff", label: [170, 150],
                 d: "M70,230 C50,160 90,80 180,55 C230,42 270,42 300,45 L290,200 C240,215 180,240 150,260 C110,262 80,252 70,230 Z",
                 info: "Planifier, décider, se contrôler, parler (aire de Broca) et commander les mouvements volontaires." },
    parietal:  { name: "Lobe pariétal", color: "#19b3a6", label: [380, 120],
                 d: "M300,45 C370,45 440,70 480,120 L400,200 C360,195 320,195 290,200 Z",
                 info: "Le toucher, la douleur, la position du corps et l'orientation dans l'espace." },
    occipital: { name: "Lobe occipital", color: "#f29e4c", label: [472, 205],
                 d: "M480,120 C520,160 535,210 520,250 C500,265 470,268 445,262 L400,200 Z",
                 info: "La vision : formes, couleurs, mouvements. Tout à l'arrière de la tête." },
    tronc:     { name: "Tronc cérébral", color: "#8a8fa3", label: [362, 372],
                 d: "M335,300 C350,312 368,312 384,302 L390,405 L345,405 Z",
                 info: "Les fonctions vitales automatiques : respiration, rythme cardiaque, éveil, déglutition." },
    temporal:  { name: "Lobe temporal", color: "#e8668b", label: [285, 268],
                 d: "M150,260 C180,240 240,215 290,200 L400,200 L445,262 C420,290 370,310 310,312 C250,315 190,300 150,260 Z",
                 info: "L'audition, la compréhension du langage (aire de Wernicke) et, en profondeur, l'hippocampe pour la mémoire." },
    cervelet:  { name: "Cervelet", color: "#4c9be8", label: [462, 308],
                 d: "M445,262 C470,268 500,265 520,250 C535,290 510,330 460,335 C420,338 395,322 392,306 C412,296 430,282 445,262 Z",
                 info: "La coordination des mouvements, l'équilibre et les automatismes (il contient plus de la moitié des neurones !)." }
  };
  const BRAIN_QUESTIONS = [
    ["Où est traitée la vision ?", "occipital"],
    ["Quelle zone vous aide à garder l'équilibre sur un vélo ?", "cervelet"],
    ["Quelle zone gère la respiration, même quand vous dormez ?", "tronc"],
    ["Où se trouve l'aire de Broca, qui sert à produire la parole ?", "frontal"],
    ["Quelle zone traite les sons que vous entendez ?", "temporal"],
    ["Où sentez-vous qu'on vous touche la main ?", "parietal"],
    ["Quelle zone vous aide à résister à l'envie de manger un 3e gâteau ?", "frontal"],
    ["Quelle zone cache l'hippocampe, clé de la mémoire ?", "temporal"],
    ["Quelle zone vous permet de savoir où est votre bras les yeux fermés ?", "parietal"],
    ["Quelle zone règle le rythme cardiaque ?", "tronc"],
    ["Où sont reconnues les couleurs ?", "occipital"],
    ["Quelle zone rend fluides les gestes appris, comme taper au clavier ?", "cervelet"]
  ];

  games.push({
    id: "carte", icon: "🗺️", title: "Carte du cerveau",
    desc: "Explorez les régions, puis retrouvez-les dans un quiz.",
    render(el, ctx) {
      const paths = Object.entries(REGIONS).map(([k, r]) =>
        `<path class="region" data-r="${k}" d="${r.d}" fill="${r.color}" tabindex="0" role="button" aria-label="${r.name}"></path>`).join("");
      const labels = Object.entries(REGIONS).map(([k, r]) =>
        `<text class="brain-label" x="${r.label[0]}" y="${r.label[1]}" text-anchor="middle" data-l="${k}" ${k === "cervelet" || k === "tronc" ? 'style="font-size:12px"' : ""}>${r.name.replace("Lobe ", "")}</text>`).join("");
      el.innerHTML = `
        <div class="brain-wrap">
          <div class="brain"><svg viewBox="40 30 520 385" role="img" aria-label="Cerveau vu de côté, l'avant à gauche">
            ${paths}<g id="labels">${labels}</g>
            <text x="60" y="400" font-size="12" fill="currentColor" opacity=".6">← avant (visage)</text>
          </svg></div>
          <div>
            <div class="prompt" id="b-prompt">Mode exploration : cliquez sur une région pour découvrir son rôle.</div>
            <p class="muted" id="b-info">Le cerveau est vu de côté, le visage serait à gauche.</p>
            <div class="row"><button class="btn" id="b-start">Lancer le défi (8 questions)</button>
            <button class="btn ghost" id="b-labels">Masquer les noms</button></div>
            <p id="b-score" class="score" style="margin-top:12px"></p>
          </div>
        </div>`;
      let mode = "explore", qs = [], qi = 0, score = 0, locked = false;
      const prompt = $("#b-prompt", el), info = $("#b-info", el), scoreEl = $("#b-score", el);
      const labelsG = $("#labels", el);
      const showQ = () => {
        prompt.textContent = `Question ${qi + 1}/8 : ${qs[qi][0]}`;
        info.textContent = "Cliquez sur la bonne région.";
        scoreEl.textContent = `Score : ${score}`;
      };
      const pick = (k, node) => {
        const r = REGIONS[k];
        if (mode === "explore") {
          el.querySelectorAll(".region").forEach(p => p.classList.toggle("dim", p !== node));
          prompt.textContent = r.name;
          info.textContent = r.info;
          return;
        }
        if (locked) return;
        locked = true;
        const good = qs[qi][1];
        const ok = k === good;
        if (ok) score++;
        node.classList.add(ok ? "flash-ok" : "flash-ko");
        info.innerHTML = ok ? `✅ Bravo ! ${REGIONS[good].info}` : `❌ C'était le <b>${REGIONS[good].name.toLowerCase()}</b>. ${REGIONS[good].info}`;
        scoreEl.textContent = `Score : ${score}`;
        setTimeout(() => {
          node.classList.remove("flash-ok", "flash-ko");
          locked = false;
          qi++;
          if (qi < qs.length) return showQ();
          mode = "explore";
          const b = ctx.best("carte", score, true);
          prompt.textContent = `Terminé : ${score}/8 ${score === 8 ? "🏆" : score >= 6 ? "👏" : "💪"}`;
          info.textContent = b.record ? "Nouveau record personnel !" : `Votre record : ${b.best}/8. Cliquez sur les régions pour réviser.`;
          $("#b-start", el).textContent = "Rejouer";
          labelsG.style.display = "";
          ctx.xp(10 + score * 2, "Carte du cerveau");
        }, 1700);
      };
      el.querySelectorAll(".region").forEach(p => {
        p.addEventListener("click", () => pick(p.dataset.r, p));
        p.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(p.dataset.r, p); } });
      });
      $("#b-start", el).onclick = () => {
        mode = "quiz"; qs = shuffle(BRAIN_QUESTIONS).slice(0, 8); qi = 0; score = 0;
        el.querySelectorAll(".region").forEach(p => p.classList.remove("dim"));
        labelsG.style.display = "none";
        $("#b-labels", el).textContent = "Afficher les noms";
        showQ();
      };
      $("#b-labels", el).onclick = (e) => {
        const hidden = labelsG.style.display === "none";
        labelsG.style.display = hidden ? "" : "none";
        e.target.textContent = hidden ? "Masquer les noms" : "Afficher les noms";
      };
      return () => {};
    },
    explain: `<h3>Ce qu'il faut retenir</h3>Chaque région a des spécialités, mais elles travaillent toujours en réseau. Les neurologues ont d'abord dressé cette carte en observant ce que perdaient des patients blessés à un endroit précis ; aujourd'hui, l'IRM fonctionnelle permet de voir les régions s'activer.`
  });

  /* ---------------- 2. Fais tirer le neurone ---------------- */
  games.push({
    id: "neurone", icon: "⚡", title: "Fais tirer le neurone",
    desc: "Envoyez des signaux pour franchir le seuil et déclencher des potentiels d'action.",
    render(el, ctx) {
      el.innerHTML = `
        <p>Le neurone est au repos à <b>−70 mV</b>. Chaque signal excitateur le rapproche du <b>seuil (−55 mV)</b>, mais la tension retombe vite toute seule. Envoyez des signaux <b>assez rapprochés</b> pour qu'il « tire ». Défi : un maximum de potentiels d'action en 20 secondes.</p>
        <div class="neuron-hud"><span id="n-v">−70 mV</span><span>⚡ <span id="n-spikes">0</span> potentiels d'action</span><span id="n-time">20,0 s</span></div>
        <canvas id="neuron-canvas" width="760" height="220" aria-label="Tension du neurone au cours du temps"></canvas>
        <div class="row" style="margin-top:14px">
          <button class="btn" id="n-exc">➕ Exciter (glutamate) <span class="small">[espace]</span></button>
          <button class="btn ghost" id="n-inh">➖ Inhiber (GABA)</button>
          <button class="btn ghost" id="n-start">▶ Lancer le défi</button>
        </div>
        <p id="n-msg" class="muted" style="margin-top:12px">Entraînez-vous librement, puis lancez le défi.</p>`;
      const cv = $("#neuron-canvas", el), g = cv.getContext("2d");
      const REST = -70, THRESH = -55, PEAK = 40, TAU = 0.45;
      let V = REST, refractory = 0, spikes = 0, trace = [], challenge = false, left = 20, raf, last = performance.now(), spikeFlash = 0;
      const vEl = $("#n-v", el), sEl = $("#n-spikes", el), tEl = $("#n-time", el), msg = $("#n-msg", el);
      const input = (dv) => {
        if (refractory > 0) { msg.textContent = "Période réfractaire : le neurone ne peut pas tirer pendant un court instant."; return; }
        V += dv;
        if (V >= THRESH) {
          trace.push(PEAK);
          V = -80; refractory = 0.25; spikeFlash = 1;
          if (challenge) { spikes++; sEl.textContent = spikes; }
          msg.textContent = "⚡ Potentiel d'action ! Le signal part le long de l'axone.";
        }
      };
      const exc = () => input(6.5), inh = () => input(-6.5);
      $("#n-exc", el).onclick = exc;
      $("#n-inh", el).onclick = inh;
      const onKey = (e) => { if (e.code === "Space" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); exc(); } };
      document.addEventListener("keydown", onKey);
      $("#n-start", el).onclick = () => {
        challenge = true; spikes = 0; left = 20; sEl.textContent = 0; V = REST;
        msg.textContent = "C'est parti ! Cliquez vite (ou appuyez sur espace).";
        $("#n-start", el).disabled = true;
      };
      const draw = () => {
        const w = cv.width, h = cv.height;
        const y = (v) => h - ((v + 90) / 140) * h;
        g.clearRect(0, 0, w, h);
        g.strokeStyle = css("--muted"); g.globalAlpha = .5; g.setLineDash([6, 6]); g.lineWidth = 1;
        g.beginPath(); g.moveTo(0, y(THRESH)); g.lineTo(w, y(THRESH)); g.stroke();
        g.beginPath(); g.moveTo(0, y(REST)); g.lineTo(w, y(REST)); g.stroke();
        g.setLineDash([]); g.globalAlpha = 1;
        g.fillStyle = css("--muted"); g.font = "12px system-ui";
        g.fillText("seuil −55 mV", 8, y(THRESH) - 5); g.fillText("repos −70 mV", 8, y(REST) + 14);
        g.strokeStyle = css("--accent"); g.lineWidth = 2.5; g.beginPath();
        trace.forEach((v, i) => { const x = w - (trace.length - i) * 2; i ? g.lineTo(x, y(v)) : g.moveTo(x, y(v)); });
        g.stroke();
        if (spikeFlash > 0) { g.fillStyle = css("--accent-2"); g.globalAlpha = spikeFlash * .25; g.fillRect(0, 0, w, h); g.globalAlpha = 1; }
      };
      const loop = (now) => {
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        if (refractory > 0) { refractory -= dt; }
        V += (REST - V) * (dt / TAU);
        spikeFlash = Math.max(0, spikeFlash - dt * 3);
        trace.push(V); if (trace.length > 400) trace.shift();
        vEl.textContent = `${Math.round(V)} mV`.replace("-", "−");
        if (challenge) {
          left -= dt;
          tEl.textContent = `${Math.max(0, left).toFixed(1).replace(".", ",")} s`;
          if (left <= 0) {
            challenge = false; $("#n-start", el).disabled = false; $("#n-start", el).textContent = "▶ Rejouer";
            const b = ctx.best("neurone", spikes, true);
            msg.innerHTML = `Terminé : <b>${spikes} potentiels d'action</b> en 20 s. ${b.record ? "🏆 Nouveau record !" : `Record : ${b.best}.`} Une vraie cellule peut en produire des centaines par seconde !`;
            ctx.xp(10 + Math.min(spikes, 20), "Neurone");
          }
        }
        draw();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => { cancelAnimationFrame(raf); document.removeEventListener("keydown", onKey); };
    },
    explain: `<h3>Ce que vous venez de faire</h3>C'est la <b>sommation temporelle</b> : un seul signal ne suffit pas, mais plusieurs signaux rapprochés s'additionnent avant que la tension ne retombe. Les signaux inhibiteurs (GABA) éloignent du seuil. Après chaque potentiel d'action, il y a une courte <b>période réfractaire</b> où le neurone ne peut pas tirer de nouveau.`
  });

  /* ---------------- 3. Temps de réaction ---------------- */
  games.push({
    id: "reaction", icon: "⏱️", title: "Temps de réaction",
    desc: "Cliquez dès que l'écran passe au vert. 5 essais.",
    render(el, ctx) {
      el.innerHTML = `<div class="react-zone idle" id="r-zone" tabindex="0" role="button">Cliquez ici pour commencer</div>
        <p id="r-res" style="margin-top:14px" class="muted">Cliquez (ou appuyez sur Entrée) dès que la zone devient verte.</p>`;
      const zone = $("#r-zone", el), res = $("#r-res", el);
      let state = "idle", timer, t0, times = [];
      const startTrial = () => {
        state = "wait"; zone.className = "react-zone wait"; zone.textContent = "Attendez le vert…";
        timer = setTimeout(() => { state = "go"; zone.className = "react-zone go"; zone.textContent = "MAINTENANT !"; t0 = performance.now(); }, 1200 + Math.random() * 2500);
      };
      const hit = () => {
        if (state === "idle" || state === "pause") { if (state === "idle") times = []; return startTrial(); }
        if (state === "wait") {
          clearTimeout(timer); state = "pause"; zone.className = "react-zone idle";
          zone.textContent = "Trop tôt ! Cliquez pour réessayer."; return;
        }
        if (state === "go") {
          const t = Math.round(performance.now() - t0); times.push(t);
          if (times.length < 5) {
            state = "pause"; zone.className = "react-zone idle";
            zone.textContent = `${t} ms. Essai ${times.length}/5 : cliquez pour continuer`;
            res.textContent = `Essais : ${times.join(" · ")} ms`;
          } else {
            state = "idle"; zone.className = "react-zone idle";
            const m = Math.round(avg(times));
            const b = ctx.best("reaction", m, false);
            zone.textContent = `Moyenne : ${m} ms. Cliquez pour rejouer`;
            res.innerHTML = `Essais : ${times.join(" · ")} ms. <b>Moyenne ${m} ms</b> ${b.record ? "🏆 record !" : `(record : ${b.best} ms)`}. La moyenne humaine tourne autour de 250 ms.`;
            ctx.xp(15, "Temps de réaction");
          }
        }
      };
      zone.addEventListener("pointerdown", hit);
      zone.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hit(); } });
      return () => clearTimeout(timer);
    },
    explain: `<h3>Pourquoi 250 millisecondes ?</h3>Le signal doit être capté par la rétine, voyager jusqu'au cortex visuel à l'arrière du crâne, être reconnu, déclencher une décision dans le lobe frontal, puis descendre jusqu'aux muscles du doigt. Chaque synapse franchie ajoute un peu de délai. La fatigue et le manque de sommeil allongent nettement ce temps.`
  });

  /* ---------------- 4. Effet Stroop ---------------- */
  const COLORS = [["ROUGE", "#e03131"], ["BLEU", "#1c7ed6"], ["VERT", "#2f9e44"], ["JAUNE", "#f0b400"]];
  games.push({
    id: "stroop", icon: "🎨", title: "Effet Stroop",
    desc: "Nommez la couleur de l'encre, pas le mot. Plus dur qu'il n'y paraît !",
    render(el, ctx) {
      el.innerHTML = `<p>Cliquez sur la <b>couleur de l'encre</b> dans laquelle le mot est écrit, en ignorant ce que dit le mot. 16 mots, le plus vite possible.</p>
        <div class="stroop-word" id="s-word">PRÊT ?</div>
        <div class="stroop-btns" id="s-btns">${COLORS.map((c, i) => `<button data-i="${i}">${c[0].toLowerCase()} <span class="small muted">[${i + 1}]</span></button>`).join("")}</div>
        <div class="row" style="margin-top:16px"><button class="btn" id="s-start">Commencer</button></div>
        <p id="s-res" class="muted" style="margin-top:12px"></p>`;
      const word = $("#s-word", el), res = $("#s-res", el);
      let trials = [], i = 0, t0 = 0, running = false, data = [];
      const show = () => {
        const t = trials[i];
        word.textContent = COLORS[t.word][0]; word.style.color = COLORS[t.ink][1];
        res.textContent = `${i + 1}/16`;
        t0 = performance.now();
      };
      const answer = (k) => {
        if (!running) return;
        const t = trials[i];
        data.push({ congruent: t.word === t.ink, ok: k === t.ink, rt: performance.now() - t0 });
        i++;
        if (i < trials.length) return show();
        running = false;
        word.textContent = "FINI !"; word.style.color = "";
        const ok = data.filter(d => d.ok);
        const c = Math.round(avg(ok.filter(d => d.congruent).map(d => d.rt)));
        const n = Math.round(avg(ok.filter(d => !d.congruent).map(d => d.rt)));
        const errors = data.length - ok.length;
        const diff = n - c;
        $("#s-start", el).textContent = "Rejouer";
        if (!c || !n || errors > 6) {
          res.innerHTML = `${errors} erreurs sur 16 : trop pour mesurer l'effet. Prenez votre temps, la justesse compte avant la vitesse. Rejouez !`;
          return;
        }
        ctx.best("stroop", diff, false);
        res.innerHTML = `Mot et encre <b>identiques</b> : ${c} ms en moyenne · mot et encre <b>différents</b> : ${n} ms · ${errors} erreur(s).<br>` +
          (diff > 0 ? `Votre cerveau a mis <b>${diff} ms de plus</b> quand le mot contredisait la couleur : c'est l'effet Stroop !` : `Impressionnant, presque pas d'effet Stroop cette fois. Réessayez pour voir si ça se confirme !`);
        $("#s-start", el).textContent = "Rejouer";
        ctx.xp(15, "Effet Stroop");
      };
      el.querySelectorAll("#s-btns button").forEach(b => b.onclick = () => answer(+b.dataset.i));
      const onKey = (e) => { const k = +e.key; if (k >= 1 && k <= 4) answer(k - 1); };
      document.addEventListener("keydown", onKey);
      $("#s-start", el).onclick = () => {
        trials = shuffle([...Array(8)].map((_, j) => ({ word: j % 4, ink: j % 4 }))
          .concat([...Array(8)].map(() => { const w = Math.floor(Math.random() * 4); let k; do { k = Math.floor(Math.random() * 4); } while (k === w); return { word: w, ink: k }; })));
        i = 0; data = []; running = true; show();
      };
      return () => document.removeEventListener("keydown", onKey);
    },
    explain: `<h3>Pourquoi c'est difficile ?</h3>Pour un adulte, lire est devenu un <b>automatisme</b> : le sens du mot arrive avant même qu'on le veuille. Quand il contredit la couleur, une zone du lobe frontal (le cortex cingulaire antérieur) détecte le conflit et doit freiner la mauvaise réponse, ce qui prend du temps. Ce test, inventé en 1935, est encore utilisé pour étudier l'attention.`
  });

  /* ---------------- 5. Mémoire des chiffres ---------------- */
  games.push({
    id: "empan", icon: "🔢", title: "Mémoire des chiffres",
    desc: "Retenez une suite de chiffres de plus en plus longue.",
    render(el, ctx) {
      el.innerHTML = `<p>Des chiffres vont s'afficher un par un. Retenez-les, puis tapez-les dans l'ordre. La suite s'allonge à chaque réussite ; vous avez droit à une erreur.</p>
        <div class="big" id="e-show" aria-live="polite">—</div>
        <div class="row" style="justify-content:center;margin:16px 0" id="e-form" hidden>
          <input class="digit-input" id="e-in" inputmode="numeric" autocomplete="off" aria-label="Votre réponse">
          <button class="btn" id="e-ok">Valider</button>
        </div>
        <div class="row" style="justify-content:center"><button class="btn" id="e-start">Commencer</button></div>
        <p id="e-res" class="muted" style="margin-top:12px;text-align:center"></p>`;
      const show = $("#e-show", el), form = $("#e-form", el), inp = $("#e-in", el), res = $("#e-res", el), start = $("#e-start", el);
      let len = 3, seq = "", lives = 2, best = 0, timers = [];
      const clear = () => { timers.forEach(clearTimeout); timers = []; };
      const play = () => {
        seq = Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
        form.hidden = true; start.hidden = true; res.textContent = `${len} chiffres`;
        [...seq].forEach((d, k) => {
          timers.push(setTimeout(() => { show.textContent = d; }, k * 1000 + 300));
          timers.push(setTimeout(() => { show.textContent = " "; }, k * 1000 + 1100));
        });
        timers.push(setTimeout(() => { show.textContent = "?"; form.hidden = false; inp.value = ""; inp.focus(); }, len * 1000 + 400));
      };
      const check = () => {
        if (form.hidden) return;
        const ok = inp.value.replace(/\D/g, "") === seq;
        form.hidden = true;
        if (ok) { best = len; len++; show.textContent = "✅"; timers.push(setTimeout(play, 900)); return; }
        lives--;
        show.textContent = seq;
        if (lives > 0) { res.textContent = `Raté, c'était ${seq}. Dernière chance à ${len} chiffres…`; timers.push(setTimeout(play, 2200)); return; }
        const b = ctx.best("empan", best, true);
        res.innerHTML = `Votre empan : <b>${best} chiffres</b>. ${b.record ? "🏆 Nouveau record !" : `Record : ${b.best}.`} La plupart des adultes retiennent entre 5 et 9 chiffres.`;
        start.hidden = false; start.textContent = "Rejouer";
        ctx.xp(10 + best * 2, "Mémoire des chiffres");
      };
      $("#e-ok", el).onclick = check;
      inp.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
      start.onclick = () => { len = 3; lives = 2; best = 0; play(); };
      return clear;
    },
    explain: `<h3>Votre mémoire de travail</h3>Ce test mesure l'<b>empan mnésique</b>, la quantité d'informations que la mémoire de travail garde « en tête ». Elle s'appuie surtout sur le cortex préfrontal. L'astuce des champions : <b>regrouper</b> les chiffres par paquets (comme un numéro de téléphone 06 12 34…), ou se les <b>répéter</b> mentalement en boucle.`
  });

  /* ---------------- 6. Illusion de Müller-Lyer ---------------- */
  games.push({
    id: "illusion", icon: "📏", title: "L'illusion des flèches",
    desc: "Rendez deux lignes égales… si votre cerveau vous laisse faire.",
    render(el, ctx) {
      el.innerHTML = `<p>Déplacez le curseur jusqu'à ce que la ligne du <b>bas</b> vous semble exactement de la même longueur que celle du <b>haut</b>. Ne mesurez pas avec vos doigts !</p>
        <svg id="illusion-svg" viewBox="0 0 400 210" aria-label="Deux lignes horizontales avec des flèches"></svg>
        <input type="range" id="i-range" min="120" max="300" step="1" aria-label="Longueur de la ligne du bas">
        <div class="row" style="margin-top:12px"><button class="btn" id="i-ok">Je pense qu'elles sont égales</button><button class="btn ghost" id="i-again" hidden>Recommencer</button></div>
        <p id="i-res" class="muted" style="margin-top:12px"></p>`;
      const svg = $("#illusion-svg", el), range = $("#i-range", el), res = $("#i-res", el);
      const REF = 200; let revealed = false;
      const line = (cx, y, L, inward) => {
        const a = cx - L / 2, b = cx + L / 2, f = 22, s = inward ? 1 : -1;
        return `<g stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none">
          <line x1="${a}" y1="${y}" x2="${b}" y2="${y}"/>
          <polyline points="${a + s * f},${y - 16} ${a},${y} ${a + s * f},${y + 16}"/>
          <polyline points="${b - s * f},${y - 16} ${b},${y} ${b - s * f},${y + 16}"/></g>`;
      };
      const draw = () => {
        const L = +range.value;
        let extra = "";
        if (revealed) {
          extra = `<g stroke="var(--accent-2)" stroke-width="1.5" stroke-dasharray="4 4">
            <line x1="${200 - REF / 2}" y1="20" x2="${200 - REF / 2}" y2="195"/><line x1="${200 + REF / 2}" y1="20" x2="${200 + REF / 2}" y2="195"/></g>`;
        }
        svg.innerHTML = line(200, 55, REF, true) + line(200, 155, L, false) + extra;
      };
      const reset = () => { revealed = false; range.disabled = false; range.value = Math.random() < .5 ? 140 + Math.random() * 30 : 240 + Math.random() * 40; res.textContent = ""; $("#i-ok", el).hidden = false; $("#i-again", el).hidden = true; draw(); };
      range.oninput = draw;
      $("#i-ok", el).onclick = () => {
        revealed = true; range.disabled = true; draw();
        const L = +range.value, err = Math.round((L - REF) / REF * 100);
        res.innerHTML = `Ligne du haut : <b>${REF} px</b>, votre ligne du bas : <b>${L} px</b> (${err > 0 ? "+" : ""}${err} %). ` +
          (err < -3 ? "Comme la plupart des gens, vous avez fait la ligne du bas <b>trop courte</b> : les flèches ouvertes la font paraître plus longue qu'elle n'est." :
           Math.abs(err) <= 3 ? "Excellent œil ! Les pointillés montrent que vous êtes tombé(e) presque pile." :
           "Vous avez fait la ligne du bas plus longue : intéressant, l'effet joue d'habitude dans l'autre sens !");
        ctx.best("illusion", Math.abs(err), false);
        $("#i-ok", el).hidden = true; $("#i-again", el).hidden = false;
        ctx.xp(10, "Illusion");
      };
      $("#i-again", el).onclick = reset;
      reset();
      return () => {};
    },
    explain: `<h3>Même en sachant, on se fait avoir</h3>Découverte en 1889, l'illusion de Müller-Lyer marche même quand on connaît le truc. Une hypothèse : notre cerveau interprète les flèches comme des indices de profondeur, comme les coins d'un mur proche ou lointain, et corrige automatiquement la taille. Fait intéressant : l'effet est plus faible dans certaines cultures où l'on vit entouré de moins d'angles droits.`
  });

  window.NEURO_GAMES = games;
})();
