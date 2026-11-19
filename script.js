(() => {
  const USER = "LuxCaspian", EMAIL = "luxcaspian@gmail.com";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const store = { get(k){ try{return localStorage.getItem(k)}catch{return null} }, set(k,v){ try{localStorage.setItem(k,v)}catch{} } };
  $("#yr").textContent = new Date().getFullYear();

  /* ---------- Preloader ---------- */
  let lp = 0; const lb = $("#lbar");
  const li = setInterval(() => { lp = Math.min(90, lp + Math.random()*18); lb.style.width = lp + "%"; }, 120);
  function ready(){ clearInterval(li); lb.style.width = "100%"; setTimeout(() => { $("#loader").classList.add("done"); document.body.classList.add("ready"); observeAll(); }, reduce ? 0 : 350); }
  if (document.readyState === "complete") ready(); else addEventListener("load", ready);
  setTimeout(() => { if (!document.body.classList.contains("ready")) ready(); }, 3000);

  /* ---------- Cursor ---------- */
  const cd = $("#cd"), cr = $("#cr"); let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
  addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; cd.style.transform = `translate(${mx-3}px,${my-3}px)`; });
  if (fine && !reduce){
    cd.style.transform = "translate(-50px,-50px)";
    (function loop(){ rx += (mx-rx)*.18; ry += (my-ry)*.18; cr.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    cr.style.left = cr.style.top = "0"; cd.style.left = cd.style.top = "0";
    document.addEventListener("pointerover", e => cr.classList.toggle("big", !!e.target.closest("a,button,.srow,.stackcloud span")));
  } else { cd.style.display = cr.style.display = "none"; }

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduce) $$(".mag").forEach(b => {
    b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`; });
    b.addEventListener("pointerleave", () => { b.style.transition = "transform .5s cubic-bezier(.3,1.6,.5,1)"; b.style.transform = ""; setTimeout(() => b.style.transition = "", 500); });
  });

  /* ---------- Tile spotlight ---------- */
  $$(".tile").forEach(t => t.addEventListener("pointermove", e => { const r = t.getBoundingClientRect(); t.style.setProperty("--x", (e.clientX-r.left)+"px"); t.style.setProperty("--y", (e.clientY-r.top)+"px"); }));

  /* ---------- Marquee duplicate ---------- */
  const tr = $("#track"); tr.innerHTML += tr.innerHTML;

  /* ---------- Nav sliding pill ---------- */
  const pill = $("#pillbg"), navLinks = $$("#links a");
  function movePill(a){ if (!a){ pill.style.opacity = 0; return; } pill.style.opacity = 1; pill.style.left = a.offsetLeft + "px"; pill.style.width = a.offsetWidth + "px"; }
  const secIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ const a = navLinks.find(x => x.getAttribute("href") === "#" + e.target.id); navLinks.forEach(x => x.classList.toggle("on", x === a)); movePill(a); } }), {rootMargin:"-45% 0px -50% 0px"});
  ["top","about","work","services","contact"].forEach(id => secIO.observe(document.getElementById(id)));

  /* ---------- Reveal + triggers ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const el = e.target; el.classList.add("shown"); io.unobserve(el);
    el.querySelectorAll("[data-count]").forEach(countUp);
  }), {threshold:.12});
  function observeAll(){ $$(".reveal:not(.shown)").forEach((el,i) => { el.style.transitionDelay = (el.closest(".bento") ? (i%4)*80 : 0) + "ms"; io.observe(el); }); }

  function countUp(el){
    const end = +el.dataset.count; if (reduce){ el.textContent = end; return; }
    const t0 = performance.now(); (function f(t){ const k = Math.min(1,(t-t0)/1500); el.textContent = Math.round(end*(1-Math.pow(1-k,3))); if (k<1) requestAnimationFrame(f); })(t0);
  }

  /* ---------- Stacking cards scale ---------- */
  const cards = $$(".pcard");
  function stackFx(){
    cards.forEach((c,i) => {
      const next = cards[i+1]; if (!next || reduce){ c.style.transform = ""; c.style.filter = ""; return; }
      const r = c.getBoundingClientRect(), n = next.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, 1 - (n.top - r.top) / r.height));
      c.style.transform = `scale(${1 - p*.06})`; c.style.filter = `brightness(${1 - p*.45})`;
    });
  }

  /* ---------- Scroll ---------- */
  function onScroll(){
    const h = document.documentElement; $("#progress").style.width = (h.scrollTop/(h.scrollHeight-h.clientHeight)*100) + "%";
    stackFx();
  }
  addEventListener("scroll", onScroll, {passive:true}); onScroll();

  /* ---------- Hero neural network ---------- */
  const net = $("#net"), nx = net.getContext("2d"); let NW, NH, nodes = [];
  const DPR = Math.min(devicePixelRatio||1, 2);
  function nsize(){ const r = net.parentElement.getBoundingClientRect(); NW = r.width; NH = r.height; net.width = NW*DPR; net.height = NH*DPR; net.style.width = NW+"px"; net.style.height = NH+"px"; nx.setTransform(DPR,0,0,DPR,0,0);
    const count = Math.round(Math.min(110, NW*NH/14000)); nodes = Array.from({length:count}, () => ({x:Math.random()*NW, y:Math.random()*NH, vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35, r:Math.random()*1.6+.6})); }
  let hx = -999, hy = -999;
  net.parentElement.addEventListener("pointermove", e => { const r = net.getBoundingClientRect(); hx = e.clientX - r.left; hy = e.clientY - r.top; });
  net.parentElement.addEventListener("pointerleave", () => { hx = hy = -999; });
  function ndraw(){
    nx.clearRect(0,0,NW,NH);
    for (const p of nodes){
      if (!reduce){ p.x += p.vx; p.y += p.vy; if (p.x<0||p.x>NW) p.vx*=-1; if (p.y<0||p.y>NH) p.vy*=-1; }
      const dx = p.x-hx, dy = p.y-hy, d = Math.hypot(dx,dy);
      if (d < 140 && d > 0){ p.x += dx/d*.8; p.y += dy/d*.8; }
    }
    for (let i=0;i<nodes.length;i++){ const a = nodes[i];
      for (let j=i+1;j<nodes.length;j++){ const b = nodes[j], d = Math.hypot(a.x-b.x,a.y-b.y);
        if (d < 130){ nx.strokeStyle = `rgba(96,165,250,${(1-d/130)*.28})`; nx.lineWidth = 1; nx.beginPath(); nx.moveTo(a.x,a.y); nx.lineTo(b.x,b.y); nx.stroke(); } }
      const dm = Math.hypot(a.x-hx,a.y-hy);
      if (dm < 200){ nx.strokeStyle = `rgba(147,197,253,${(1-dm/200)*.5})`; nx.beginPath(); nx.moveTo(a.x,a.y); nx.lineTo(hx,hy); nx.stroke(); }
      nx.fillStyle = dm < 200 ? "#93c5fd" : "rgba(96,165,250,.7)"; nx.beginPath(); nx.arc(a.x,a.y,a.r,0,7); nx.fill();
    }
    if (!reduce) requestAnimationFrame(ndraw);
  }
  nsize(); ndraw(); addEventListener("resize", nsize);

  /* ---------- Project visuals ---------- */
  // tokens
  const toks = ["I'm","gonna","be","King","of","the","Pirates","!"], row = $("#tokRow"); let ti = 0;
  function tokTick(){ if (ti === 0) row.innerHTML = ""; if (ti < toks.length){ const s = document.createElement("span"); s.textContent = toks[ti++]; row.appendChild(s); setTimeout(tokTick, 380); } else { ti = 0; setTimeout(tokTick, 2200); } }
  const visIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; visIO.unobserve(e.target);
    if (e.target.id === "tok"){ reduce ? toks.forEach(t => row.insertAdjacentHTML("beforeend", `<span>${t}</span>`)) : tokTick(); $$("#prob i").forEach(i => i.style.width = i.dataset.w + "%"); }
    if (e.target.id === "scatter") scatter();
  }), {threshold:.3});
  visIO.observe($("#tok")); visIO.observe($("#scatter"));
  // clusters
  function scatter(){
    const svg = $("#scatter"), NS = "http://www.w3.org/2000/svg", centers = [[90,95],[210,110],[150,215]], cols = ["#3b82f6","#60a5fa","#93c5fd"];
    centers.forEach(([cx,cy],k) => {
      const ring = document.createElementNS(NS,"circle"); Object.entries({cx,cy,r:52,fill:"none",stroke:cols[k],"stroke-opacity":.3,"stroke-dasharray":"4 5"}).forEach(([a,v]) => ring.setAttribute(a,v)); svg.appendChild(ring);
      for (let i=0;i<22;i++){
        const a = Math.random()*6.28, d = Math.random()*42, c = document.createElementNS(NS,"circle");
        c.setAttribute("cx", 150); c.setAttribute("cy", 150); c.setAttribute("r", 3.2); c.setAttribute("fill", cols[k]); c.setAttribute("fill-opacity", .85);
        c.style.transition = `cx 1.2s cubic-bezier(.2,.8,.2,1) ${i*25}ms, cy 1.2s cubic-bezier(.2,.8,.2,1) ${i*25}ms`;
        svg.appendChild(c); requestAnimationFrame(() => requestAnimationFrame(() => { c.setAttribute("cx", cx + Math.cos(a)*d); c.setAttribute("cy", cy + Math.sin(a)*d); }));
      }
      const t = document.createElementNS(NS,"text"); t.setAttribute("x",cx); t.setAttribute("y",cy-60); t.setAttribute("text-anchor","middle"); t.setAttribute("fill","#a1a1aa"); t.setAttribute("font-size","11"); t.setAttribute("font-family","JetBrains Mono, monospace"); t.textContent = "cluster " + (k+1); svg.appendChild(t);
    });
  }

  /* ---------- Copy email ---------- */
  $("#mail").onclick = async () => { try { await navigator.clipboard.writeText(EMAIL); } catch {} const c = $("#copied"); c.classList.add("on"); setTimeout(() => c.classList.remove("on"), 2000); };

  /* ---------- Live GitHub (no contribution count) ---------- */
  const SKIP = ["croissantpage", "luxcaspian.github.io", "luxcaspian", "personal-web"];
  fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`).then(r => r.ok ? r.json() : Promise.reject()).then(rs => {
    $("#ghRepos").textContent = rs.length;
    const langs = {}; rs.filter(r => !r.fork && !SKIP.includes(r.name.toLowerCase())).forEach(r => {
      const l = r.language || (/notebook|jupyter/i.test(r.name) ? "Python" : null);
      const k = l === "Jupyter Notebook" ? "Python" : l; if (k) langs[k] = (langs[k]||0) + 1; });
    const top = Object.entries(langs).sort((a,b) => b[1]-a[1])[0];
    $("#ghLang").textContent = top ? top[0] : "Python";
    if (rs[0]) $("#ghLast").textContent = new Date(rs[0].pushed_at).toLocaleDateString("en-US",{month:"short",day:"numeric"});
  }).catch(() => { $("#ghRepos").textContent = "8"; $("#ghLang").textContent = "Python"; $("#ghLast").textContent = "—"; });

  /* ---------- Croissant rain (off by default) ---------- */
  const cv = $("#rain"), ctx = cv.getContext("2d"), btn = $("#rainBtn");
  let on = store.get("croissantRain2") === "on" && !reduce, items = [], raf, W, H;
  function size(){ W = innerWidth; H = innerHeight; cv.width = W*DPR; cv.height = H*DPR; cv.style.width = W+"px"; cv.style.height = H+"px"; ctx.setTransform(DPR,0,0,DPR,0,0); }
  const spawn = init => ({ x:Math.random()*W, y:init ? Math.random()*H : -40, s:14+Math.random()*16, v:.4+Math.random()*.8, r:Math.random()*6.28, vr:(Math.random()-.5)*.02, sw:Math.random()*6.28, a:.14+Math.random()*.18 });
  function frame(){ ctx.clearRect(0,0,W,H); items.forEach((p,i) => { p.y += p.v; p.sw += .01; p.x += Math.sin(p.sw)*.3; p.r += p.vr; if (p.y > H+40) items[i] = spawn(false);
      ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.font = p.s+"px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("🥐",0,0); ctx.restore(); });
    raf = requestAnimationFrame(frame); }
  function apply(){ btn.classList.toggle("off", !on); cancelAnimationFrame(raf); if (on){ size(); items = Array.from({length: W<600 ? 14 : 24}, () => spawn(true)); frame(); } else if (W) ctx.clearRect(0,0,W,H); }
  btn.onclick = () => { on = !on; store.set("croissantRain2", on ? "on" : "off"); apply(); };
  addEventListener("resize", () => { if (on) size(); });
  apply();
})();
