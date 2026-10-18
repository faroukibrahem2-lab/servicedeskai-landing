/* Rental Desk AI landing page, Landing 3.0.1 */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var hasG = !!(window.gsap && window.ScrollTrigger);
  /* Farouk, 18/10/2026: the same animated page on every device, also when a phone asks for reduced motion.
     The still version is kept only for browsers where the motion library does not load. */
  var reduce = false;
  var NS = "http://www.w3.org/2000/svg";
  if (!hasG || reduce) document.documentElement.classList.add("static");
  function mk(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }

  /* ---------- language ---------- */
  var langBtn = $("#lang"), lang = "en";
  $$("[data-ar]").forEach(function (el) { el.setAttribute("data-en", el.innerHTML); });
  langBtn.addEventListener("click", function () {
    lang = lang === "ar" ? "en" : "ar";
    document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $$("[data-ar]").forEach(function (el) { el.innerHTML = el.getAttribute(lang === "ar" ? "data-ar" : "data-en"); });
    langBtn.textContent = lang === "ar" ? "English" : "عربي";
    if (window.__relabel) window.__relabel();
    if (window.__dial) window.__dial();
    if (window.__tangle) window.__tangle();
    if (hasG) ScrollTrigger.refresh();
  });

  /* ---------- the team lattice: the company's path, with the product's agents on its nodes ---------- */
  var NODES = [
    { x: 80, y: 20, n: "Mail Desk", s: "Reads and files", an: "مكتب البريد", as: "يقرأ ويحفظ", pos: "up" },
    { x: 50, y: 20, n: "Case Records", s: "Facts with sources", an: "سجلات القضايا", as: "وقائع بمصادرها", pos: "up" },
    { x: 20, y: 20, n: "Claim check", s: "Figures by code", an: "فحص المطالبة", as: "أرقام بالبرمجة", pos: "up", code: 1 },
    { x: 20, y: 50, n: "Drafting", s: "Legal notice", an: "الصياغة", as: "إنذار قانوني", rs: "Statement of claim", ras: "لائحة دعوى", pos: "dn" },
    { x: 50, y: 50, n: "Chief of Staff", s: "Routes the work", an: "رئيس الفريق", as: "يوجّه العمل", pos: "dn", big: 1 },
    { x: 80, y: 50, n: "Quality Review", s: "Reads it again", an: "مراجعة الجودة", as: "يقرأ مرة ثانية", pos: "up" },
    { x: 80, y: 80, n: "Deadlines", s: "Day 31 counted", an: "المواعيد", as: "اليوم 31 محسوب", rs: "No day 31 to count", ras: "لا يوم 31 للحساب", pos: "dn", code: 1 },
    { x: 50, y: 80, n: "RDC Desk", s: "Follows the case", an: "مكتب المركز", as: "يتابع القضية", pos: "dn" },
    { x: 20, y: 80, n: "You", s: "Approve or change", an: "أنت", as: "توافق أو تعدّل", pos: "dn", you: 1 }
  ];
  var lat = $("#lat"), latPath = $("#latPath"), PL = latPath.getTotalLength();
  for (var gy = 5; gy <= 95; gy += 15) for (var gx = 5; gx <= 95; gx += 15) mk("circle", { "class": "dot", cx: gx, cy: gy, r: .45 }, $("#latDots"));
  var nodeEls = NODES.map(function (nd) {
    var c = nd.you ? null : mk("circle", { "class": "nd", cx: nd.x, cy: nd.y, r: nd.big ? 2.3 : 1.6 }, $("#latNodes"));
    if (c && nd.code) c.classList.add("code");
    var l = document.createElement("div");
    l.className = "nl " + nd.pos + (nd.code ? " code" : "") + (nd.you ? " you" : "");
    l.style.left = nd.x + "%";
    l.style.top = (nd.pos === "up" ? nd.y - 4 : nd.y + (nd.big ? 4.5 : 4)) + "%";
    l.innerHTML = '<span class="nli"><b>' + nd.n + "</b><small>" + nd.s + "</small></span>";
    lat.appendChild(l);
    /* where the path reaches this node */
    var best = 0, bd = 1e9;
    for (var i = 0; i <= 240; i++) { var L = PL * i / 240, p = latPath.getPointAtLength(L), d = Math.hypot(p.x - nd.x, p.y - nd.y); if (d < bd) { bd = d; best = L; } }
    nd.at = nd.you ? PL : best;
    return { c: c, l: l, nd: nd };
  });
  function lightTo(len) {
    nodeEls.forEach(function (o) { if (o.c) o.c.classList.toggle("lit", o.nd.at <= len + 0.5); });
    lat.classList.toggle("done", len >= PL - 0.5);
  }
  latPath.style.strokeDasharray = PL; latPath.style.strokeDashoffset = 0; lightTo(PL);

  /* ---------- the Chief of Staff re-routes a matter ---------- */
  var msgs = $("#msgs"), draftEl = nodeEls[3], deadEl = nodeEls[6], chatTl = null;
  var routed = false;
  function relabel() {
    var ar = lang === "ar";
    nodeEls.forEach(function (o) {
      var nd = o.nd, alt = routed && nd.rs;
      $("b", o.l).textContent = ar ? nd.an : nd.n;
      $("small", o.l).textContent = alt ? (ar ? nd.ras : nd.rs) : (ar ? nd.as : nd.s);
    });
  }
  function setRoute(sharjah) {
    routed = sharjah;
    deadEl.l.classList.toggle("skip", sharjah);
    if (deadEl.c) deadEl.c.classList.toggle("skip", sharjah);
    relabel();
  }
  function bubble(cls, html) { var d = document.createElement("div"); d.className = "bub " + cls; d.innerHTML = html; msgs.appendChild(d); return d; }
  var TXT = {
    en: { me: "This matter is in Sharjah. No notice: file the claim directly.", cs: "<small>Chief of Staff</small>Re-routed for this matter: the notice steps come out, Drafting prepares the statement of claim, and there is no day 31 to count.", apply: "Apply to this matter", done: "Applied on your tap" },
    ar: { me: "هذه القضية في الشارقة. لا إنذار: قدّم الدعوى مباشرة.", cs: "<small>رئيس الفريق</small>تغيّر مسار هذه القضية: خرجت خطوات الإنذار، وتُعدّ الصياغة لائحة الدعوى، ولا يوم 31 للحساب.", apply: "طبّق على هذه القضية", done: "طُبِّق بلمستك" }
  };
  function tx() { return TXT[lang === "ar" ? "ar" : "en"]; }
  function chatStill() {
    msgs.innerHTML = ""; bubble("me", tx().me);
    var b = bubble("cs", tx().cs + '<br><span class="apply pressed">' + tx().done + '</span>');
    setRoute(true);
    return b;
  }
  function playChat() {
    if (!hasG || reduce) { chatStill(); return; }
    if (chatTl) chatTl.kill();
    msgs.innerHTML = ""; setRoute(false);
    var me = bubble("me", tx().me), typing = bubble("cs typing", "<i></i><i></i><i></i>");
    var cs = bubble("cs", tx().cs + '<br><span class="apply" id="applyBtn">' + tx().apply + '</span>');
    gsap.set([me, typing, cs], { autoAlpha: 0, y: 16 });
    chatTl = gsap.timeline({ defaults: { duration: .6, ease: "power3.out" } });
    chatTl.to(me, { autoAlpha: 1, y: 0 }, .2)
      .to(typing, { autoAlpha: 1, y: 0, duration: .35 }, 1)
      .to($$("i", typing), { opacity: 1, y: -3, duration: .3, stagger: .12, yoyo: true, repeat: 3, ease: "sine.inOut" }, 1.1)
      .to(typing, { autoAlpha: 0, duration: .2, onComplete: function () { typing.remove(); } }, 2.4)
      .to(cs, { autoAlpha: 1, y: 0 }, 2.5)
      .call(function () { var a = $("#applyBtn"); if (a) { a.classList.add("pressed"); a.textContent = tx().done; } }, null, 3.8)
      .call(function () { setRoute(true); }, null, 4)
      .fromTo(latPath, { strokeDashoffset: PL }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", onUpdate: function () { lightTo(PL - parseFloat(getComputedStyle(latPath).strokeDashoffset)); } }, 4);
  }
  $("#replay").addEventListener("click", playChat);
  window.__relabel = function () { if (chatTl) chatTl.progress(1).kill(); chatTl = null; chatStill(); relabel(); latPath.style.strokeDashoffset = 0; lightTo(PL); };
  chatStill();

  /* ---------- Service Desk AI field: solved paths through the lattice (from the identity's bundle) ---------- */
  var fieldPaths = (function (svg) {
    var W = 1200, H = 360, S = 40, n = 9, bright = 3, sw = 2.2, s = 20261017;
    function rnd() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
    var cols = Math.floor(W / S), rows = Math.floor(H / S), ox = (W - (cols - 1) * S) / 2, oy = (H - (rows - 1) * S) / 2, taken = [], out = [];
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) mk("circle", { cx: ox + x * S, cy: oy + y * S, r: 1.6, fill: "#2b3036" }, svg);
    for (var i = 0; i < n; i++) {
      var bw, bh = 2, bx, by, tries = 0;
      do { bw = 2 + Math.floor(rnd() * 3); bx = Math.floor(rnd() * (cols - bw)); by = Math.floor(rnd() * (rows - bh)); tries++; }
      while (tries < 60 && taken.some(function (t) { return bx <= t[0] + t[2] + 1 && t[0] <= bx + bw + 1 && by <= t[1] + t[3] + 1 && t[1] <= by + bh + 1; }));
      if (tries >= 60) continue;
      taken.push([bx, by, bw, bh]);
      var pts = [];
      for (var j = 0; j <= bh; j++) { var row = j % 2 === 0 ? [bx + bw, bx] : [bx, bx + bw]; pts.push([row[0], by + j], [row[1], by + j]); }
      pts = pts.map(function (p) { return [ox + p[0] * S, oy + p[1] * S]; });
      var last = pts[pts.length - 1], prev = pts[pts.length - 2], dir = Math.sign(last[0] - prev[0]);
      var d = "M" + pts[0][0] + " " + pts[0][1];
      for (var q = 1; q < pts.length - 1; q++) d += " L" + pts[q][0] + " " + pts[q][1];
      d += " L" + (last[0] - dir * S * .45) + " " + last[1];
      var lit = out.length < bright, col = lit ? "#f3f4f5" : "#8d959e";
      var g = mk("g", { opacity: lit ? 1 : .5 }, svg);
      var p = mk("path", { d: d, fill: "none", stroke: col, "stroke-width": sw, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
      pts.slice(0, -1).forEach(function (pt) { mk("circle", { cx: pt[0], cy: pt[1], r: sw * 1.5, fill: col }, g); });
      var amb = null;
      if (lit && out.length === 0) { amb = mk("g", {}, g); mk("circle", { cx: last[0], cy: last[1], r: sw * 3, fill: "none", stroke: "#ffb23e", "stroke-width": 1.6 }, amb); mk("circle", { cx: last[0], cy: last[1], r: sw * 1.4, fill: "#ffb23e" }, amb); }
      out.push({ p: p, amb: amb });
    }
    return out;
  })($("#fieldSvg"));

  /* ---------- deadlines dial: thirty day ticks, a moving head, rolling digits ---------- */
  var dial = $("#dial"), dhead = $("#dhead"), ticks = [], odoT = $("#odoT"), odoO = $("#odoO"), odoTc = $("#odoTc"), rlEl = $("#rl");
  function polar(a, r) { var rad = a * Math.PI / 180; return [60 + r * Math.sin(rad), 60 - r * Math.cos(rad)]; }
  for (var k = 1; k <= 29; k++) { var a = k * 12, p1 = polar(a, 42), p2 = polar(a, 51); ticks.push(mk("line", { "class": "tk", x1: p1[0].toFixed(2), y1: p1[1].toFixed(2), x2: p2[0].toFixed(2), y2: p2[1].toFixed(2) }, $("#ticks"))); }
  function renderDial(e) {
    dialE = e;
    var left = 30 - e, ones = left % 10, tens = Math.floor(left / 10) + Math.max(0, ones - 9);
    odoO.style.transform = "translateY(" + (-ones) + "em)"; odoT.style.transform = "translateY(" + (-tens) + "em)";
    var tv = Math.max(0, Math.min(1, left - 9)); odoTc.style.opacity = tv; odoTc.style.width = (tv * .6).toFixed(3) + "em";
    ticks.forEach(function (tk, i) { var d = e - (i + 1); tk.classList.toggle("on", d >= 0); tk.style.opacity = d >= 0 ? Math.max(.5, 1 - d / 14).toFixed(2) : 1; });
    var hp = polar(e * 12, 46.5); dhead.setAttribute("cx", hp[0].toFixed(2)); dhead.setAttribute("cy", hp[1].toFixed(2));
    dhead.style.opacity = e >= 29.6 ? 0 : 1;
    var n = Math.round(left), ar = lang === "ar";
    dial.classList.toggle("reached", n <= 0);
    rlEl.textContent = n > 0 ? (ar ? "يوماً حتى اليوم 31" : n === 1 ? "day to day 31" : "days to day 31") : (ar ? "بلغنا اليوم 31" : "Day 31 reached");
  }
  var dialE = 30; window.__dial = function () { renderDial(dialE); };
  renderDial(30);

  /* ---------- the tangle: nine pieces of a rental desk, scattered, then in order ---------- */
  var TK = [
    { t: "Cheque returned", a: "شيك مرتجع", i: "@", mx: 20, my: 64, r: -14 },
    { t: "Ejari.pdf", a: "Ejari.pdf", i: "PDF", mx: 72, my: 30, r: 9 },
    { t: "Cheque 000214", a: "شيك 000214", i: "#", mx: 42, my: 90, r: -6 },
    { t: "AED 21,250.00", a: "21,250.00 درهم", i: "∑", mx: 84, my: 70, r: 12 },
    { t: "إنذار قانوني", a: "إنذار قانوني", i: "ع", mx: 54, my: 46, r: -18, ar: 1 },
    { t: "Client: update?", a: "العميل: جديد؟", i: "?", mx: 30, my: 18, r: 7 },
    { t: "Day 31", a: "اليوم 31", i: "31", mx: 86, my: 44, r: -9 },
    { t: "Memo due", a: "موعد المذكرة", i: "M", mx: 14, my: 38, r: 16 },
    { t: "Hearing 11/11", a: "جلسة 11/11", i: "H", mx: 62, my: 80, r: -11 }
  ];
  var tgPhone = window.innerWidth <= 980;
  var CP = tgPhone ? TK.map(function (k, i) { return [50, 7 + i * 10.75]; }) : [[80, 15.4], [50, 15.4], [20, 15.4], [20, 50], [50, 50], [80, 50], [80, 84.6], [50, 84.6], [20, 84.6]];
  if (tgPhone) TK.forEach(function (k) { k.mx = 28 + (k.mx - 12) / 76 * 44; });
  var tgStage = $("#tgstage"), tkEls = TK.map(function (k, i) {
    var w = document.createElement("div"); w.className = "tkc"; w.style.left = CP[i][0] + "%"; w.style.top = CP[i][1] + "%";
    w.innerHTML = '<div class="tkin"><span class="tki">' + k.i + '</span><span class="tkl"' + (k.ar ? ' lang="ar"' : "") + '></span><span class="tkb"></span></div>';
    tgStage.appendChild(w); return w;
  });
  function tkLabels() { tkEls.forEach(function (w, i) { var l = $(".tkl", w), ar = lang === "ar" || TK[i].ar; l.textContent = lang === "ar" ? TK[i].a : TK[i].t; if (ar) l.setAttribute("lang", "ar"); else l.removeAttribute("lang"); }); }
  tkLabels(); window.__tangle = tkLabels;
  (function () {
    var s = 7, pts = [], d;
    function r() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }
    for (var i = 0; i < 11; i++) pts.push([40 + r() * 520, 40 + r() * 440]);
    d = "M" + pts[0][0].toFixed(0) + " " + pts[0][1].toFixed(0);
    for (i = 1; i < pts.length; i++) d += " S" + (40 + r() * 520).toFixed(0) + " " + (40 + r() * 440).toFixed(0) + " " + pts[i][0].toFixed(0) + " " + pts[i][1].toFixed(0);
    $("#tgMess").setAttribute("d", d);
    if (tgPhone) $("#tgCalm").setAttribute("d", "M300 34V486");
  })();

  /* ---------- "You are": an animated list with a gliding highlight ---------- */
  var who = $("#who"), glide = $(".glide", who), opts = $$("button", who), ftype = $("#ftype");
  function placeGlide() { var b = $('[aria-checked="true"]', who); if (!b) return; glide.style.height = b.offsetHeight + "px"; glide.style.transform = "translateY(" + b.offsetTop + "px)"; }
  function choose(b, focus) {
    opts.forEach(function (o) { var on = o === b; o.setAttribute("aria-checked", on ? "true" : "false"); o.tabIndex = on ? 0 : -1; });
    ftype.value = b.getAttribute("data-v"); placeGlide(); if (focus) b.focus();
  }
  opts.forEach(function (b, i) {
    b.addEventListener("click", function () { choose(b, false); });
    b.addEventListener("keydown", function (e) {
      var n = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key], j = null;
      if (n) j = (i + n + opts.length) % opts.length; else if (e.key === "Home") j = 0; else if (e.key === "End") j = opts.length - 1;
      if (j !== null) { e.preventDefault(); choose(opts[j], true); }
    });
  });
  placeGlide();
  if (window.ResizeObserver) new ResizeObserver(placeGlide).observe(who);
  window.addEventListener("load", placeGlide);

  /* ---------- demo request: opens the visitor's own email app with the request filled in ---------- */
  $("#form").addEventListener("submit", function (e) {
    e.preventDefault();
    var o = $("#fout"), ar = lang === "ar", nm = $("#fname").value.trim(), fm = $("#ffirm").value.trim();
    var who = $('#who [aria-checked="true"] span'), kind = who ? who.textContent.trim() : "";
    o.hidden = false;
    if (!nm || !fm) { o.textContent = ar ? "يرجى إضافة الاسم والمكتب." : "Please add your name and firm."; return; }
    var subject = "Rental Desk AI: demonstration request", body = "Name: " + nm + "\nFirm or company: " + fm + "\nWe are: " + kind + "\n\nHow we handle rental disputes today:\n";
    window.location.href = "mailto:farouk@erlaw.ae?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    o.textContent = ar ? "يُفتح برنامج البريد لديك والطلب جاهز للإرسال. إن لم يُفتح، راسلنا على farouk@erlaw.ae." : "Your email app opens with the request ready to send. If it doesn't, write to farouk@erlaw.ae.";
  });

  if (!hasG || reduce) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll on GSAP's ticker ---------- */
  try {
    if (window.Lenis) {
      var lenis = new Lenis({ lerp: .085, anchors: { offset: -70 }, stopInertiaOnNavigate: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  } catch (e) {}

  /* split text into word spans (words only, so Arabic letters stay joined) */
  function splitWords(root) {
    if (root.getAttribute("data-split") === lang) return $$(".w", root);
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
    while (tw.nextNode()) nodes.push(tw.currentNode);
    nodes.forEach(function (n) {
      var f = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) f.appendChild(document.createTextNode(p));
        else { var s = document.createElement("span"); s.className = "w"; s.textContent = p; f.appendChild(s); }
      });
      n.parentNode.replaceChild(f, n);
    });
    root.setAttribute("data-split", lang);
    return $$(".w", root);
  }
  /* letters resolve from random glyphs, left to right */
  function decrypt(el, dur, delay) {
    var final = el.textContent, glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789", o = { p: 0 };
    return gsap.to(o, { p: 1, duration: dur, delay: delay || 0, ease: "none", onUpdate: function () {
      var n = Math.floor(o.p * final.length), s = final.slice(0, n);
      for (var i = n; i < final.length; i++) s += final[i] === " " || final[i] === "·" ? final[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
      el.textContent = s;
    }, onComplete: function () { el.textContent = final; } });
  }

  ScrollTrigger.config({ ignoreMobileResize: true });
  var mm = gsap.matchMedia();
  mm.add({ desk: "(min-width: 981px)", phone: "(max-width: 980px)", fine: "(hover: hover) and (pointer: fine)", wide: "(min-width: 1320px)" }, function (ctx) {
    var c = ctx.conditions, clean = [];
    try {

    /* Hero: the statement rises line by line; the desk swings in; the three chips follow in order */
    var hw = splitWords($("#h1")), shineEm = $("#h1 em"), label = $(".hcopy > .code");
    var c1Arc = $("#c1Arc"), c1Ck = $("#c1Ck"), c1T = $("#c1T"), c1S = $("#c1S"), c2N = $("#c2N"), c2 = { v: 0 };
    var heroTl = gsap.timeline({ defaults: { ease: "expo.out" } });
    heroTl.fromTo(hw, { autoAlpha: 0, yPercent: 40, filter: "blur(12px)" }, { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", duration: 1.1, stagger: .09, clearProps: "filter,transform" })
      .add(function () { if (label) decrypt(label, .9); }, .1)
      .from(".h-in", { y: 16, autoAlpha: 0, filter: "blur(6px)", duration: 1, stagger: .08, clearProps: "filter" }, .45)
      .from("#frame", { rotationY: -34, rotationX: 16, y: 50, autoAlpha: 0, duration: 1.6 }, .2)
      /* the Mail Desk reads the screen once, top to bottom */
      .fromTo("#scan", { top: "0%", yPercent: -100, autoAlpha: 1 }, { top: "100%", yPercent: 0, duration: 1.5, ease: "power1.inOut" }, 1.1)
      .to("#scan", { autoAlpha: 0, duration: .3 }, 2.5)
      /* chip 1: the agent works, then files */
      .add(function () { if (lang === "en") { c1T.textContent = "Reading a new email…"; c1S.textContent = "Mail Desk"; } gsap.set(c1Ck, { strokeDashoffset: 1 }); gsap.set(c1Arc, { strokeDasharray: ".28 1", rotation: 0 }); }, 1.1)
      .from(".chip.c1", { y: 16, autoAlpha: 0, duration: .8 }, 1.15)
      .to(c1Arc, { rotation: 720, duration: 1.4, ease: "none" }, 1.15)
      .add(function () { gsap.set(c1Arc, { strokeDasharray: "1 1", rotation: 0 }); if (lang === "en") { c1T.textContent = "Email filed to Unit 1204"; c1S.textContent = "Mail Desk · 3 documents"; } }, 2.55)
      .fromTo(c1Ck, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .35, ease: "power2.out", immediateRender: false }, 2.6)
      /* chip 2: the figure counts up, checked by code */
      .from(".chip.c2", { y: 16, autoAlpha: 0, duration: .8 }, 2.3)
      .fromTo(c2, { v: 0 }, { v: 21250, duration: 1.1, ease: "power2.out", immediateRender: false, onUpdate: function () { c2N.textContent = "AED " + c2.v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } }, 2.4)
      /* chip 3: the one decision, amber, rings once */
      .from(".chip.c3", { y: 16, autoAlpha: 0, duration: .8 }, 3.3)
      .fromTo(".chip.c3 .ic", { boxShadow: "0 0 0 0 rgba(255,178,62,.65)" }, { boxShadow: "0 0 0 14px rgba(255,178,62,0)", duration: 1.3, ease: "power2.out" }, 3.5)
      /* a single sheen across "Decided by you." */
      .add(function () { if (shineEm && lang === "en") { shineEm.textContent = shineEm.textContent; shineEm.classList.add("shine"); gsap.fromTo(shineEm, { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0", duration: 1.6, ease: "power2.inOut", onComplete: function () { shineEm.classList.remove("shine"); } }); } }, 2.1);
    gsap.to("#frame", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .6 } });
    gsap.to(".chip", { yPercent: function (i) { return -30 - i * 20; }, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .6 } });
    if (c.fine) {
      var rx = gsap.quickTo("#frame", "rotationX", { duration: .9, ease: "power3" }), ry = gsap.quickTo("#frame", "rotationY", { duration: .9, ease: "power3" }), sc = $("#scene");
      var fr = $("#frame"), glare = $("#glare");
      var mv = function (e) {
        var r = sc.getBoundingClientRect(); rx(6 - ((e.clientY - r.top) / r.height - .5) * 6); ry(-12 + ((e.clientX - r.left) / r.width - .5) * 10);
        var fb = fr.getBoundingClientRect(); glare.style.setProperty("--gx", ((e.clientX - fb.left) / fb.width * 100).toFixed(1) + "%"); glare.style.setProperty("--gy", ((e.clientY - fb.top) / fb.height * 100).toFixed(1) + "%");
      };
      window.addEventListener("pointermove", mv, { passive: true }); clean.push(function () { window.removeEventListener("pointermove", mv); });
      /* the main button leans toward the pointer */
      var cta = $(".hcta .btn.pri"), mx = gsap.quickTo(cta, "x", { duration: .5, ease: "power3" }), my = gsap.quickTo(cta, "y", { duration: .5, ease: "power3" });
      var mg = function (e) { var b = cta.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2), d = Math.hypot(dx, dy); if (d < 120) { mx(dx * .18); my(dy * .25); } else { mx(0); my(0); } };
      window.addEventListener("pointermove", mg, { passive: true }); clean.push(function () { window.removeEventListener("pointermove", mg); });
    }

    /* Before: the scattered desk falls into one path as you scroll */
    var mess = $("#tgMess"), calm = $("#tgCalm"), mL = mess.getTotalLength(), cL = calm.getTotalLength();
    tgStage.classList.add("mess");
    gsap.set("#tg2", { autoAlpha: 0, y: 14 });
    var tgl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tgl.fromTo(tkEls, {
        x: function (i) { return (TK[i].mx - CP[i][0]) / 100 * tgStage.offsetWidth; },
        y: function (i) { return (TK[i].my - CP[i][1]) / 100 * tgStage.offsetHeight; },
        rotation: function (i) { return TK[i].r; }
      }, { x: 0, y: 0, rotation: 0, duration: 1, stagger: .06 }, .35)
      .fromTo(mess, { strokeDasharray: mL, strokeDashoffset: 0, opacity: 1 }, { strokeDashoffset: mL, opacity: 0, duration: .9 }, .3)
      .fromTo(calm, { strokeDasharray: cL, strokeDashoffset: cL }, { strokeDashoffset: 0, duration: 1.1, ease: "none" }, .7)
      .to("#tg1", { autoAlpha: 0, y: -14, duration: .35 }, .6)
      .fromTo("#tg2", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .45, immediateRender: false }, .85)
      .to({}, { duration: .35 }, 1.85);
    tgl.eventCallback("onUpdate", function () { tgStage.classList.toggle("mess", tgl.time() < 1.55); });
    ScrollTrigger.create({ trigger: "#tangle", start: "top top", end: function () { return "+=" + Math.round(window.innerHeight * 1.7); }, pin: true, scrub: .8, animation: tgl, invalidateOnRefresh: true });

    /* Story: one pinned stage, five scenes, scrubbed by scroll */
    var caps = $$(".cap"), scs = $$(".sc"), bars = $$(".meter b");
    gsap.set(caps.slice(1), { autoAlpha: 0, y: 16 }); gsap.set(scs.slice(1), { autoAlpha: 0, y: 16 });
    gsap.set(".s1 mark", { backgroundSize: "0% 100%" }); gsap.set(".s1 .filed", { autoAlpha: 0, y: 12 });
    var tot = { v: 0 }, totEl = $("#tot"), dst = { e: 0 };
    gsap.set(".s2 .row", { autoAlpha: 0, x: -12 }); gsap.set(".s2 .total", { autoAlpha: 0, y: 12 });
    gsap.set(".s3 .l", { clipPath: "inset(0 0 0 100%)" }); gsap.set(".s3 .pins span", { autoAlpha: 0, y: 8 });
    gsap.set(".s4 .dl div", { autoAlpha: 0, x: 12 }); gsap.set(".s5 li", { autoAlpha: 0, x: -10 }); gsap.set("#apFill", { yPercent: 100 }); gsap.set("#mkArc", { strokeDashoffset: 1 }); gsap.set("#mkCk", { strokeDashoffset: 1 }); gsap.set("#rcTxt", { autoAlpha: 0, x: -8 });
    var apLbl = $("#apLbl"), apHint = $("#apHint"), DONE_AT = 11.25;
    function apText(done) { var ar = lang === "ar"; apLbl.textContent = done ? (ar ? "تمت الموافقة" : "Approved") : (ar ? "اضغط مطوّلاً للموافقة" : "Hold to approve"); apHint.hidden = true; }
    apText(false);
    totEl.textContent = "AED 0.00"; renderDial(0);
    var T = [0, 2.2, 4.4, 6.6, 8.8, 11.9];
    var capWords = caps.map(function (cp) { return splitWords($("h3", cp)); });
    capWords.slice(1).forEach(function (ws) { gsap.set(ws, { autoAlpha: 0, y: 14, filter: "blur(8px)" }); });
    function swap(i, at) {
      tl.to([caps[i - 1], scs[i - 1]], { autoAlpha: 0, y: -16, duration: .45, ease: "power2.in" }, at)
        .to([caps[i], scs[i]], { autoAlpha: 1, y: 0, duration: .6, ease: "power3.out" }, at + .5)
        .fromTo(capWords[i], { autoAlpha: 0, y: 14, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: .45, stagger: .06, ease: "power3.out", immediateRender: false }, at + .55)
        .fromTo($$("p, .code", caps[i]), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .45, stagger: .08, ease: "power3.out", immediateRender: false }, at + .7);
    }
    var tl = gsap.timeline({ paused: true });
    tl.to(".s1 mark", { backgroundSize: "100% 100%", duration: .5, stagger: .35, ease: "power1.inOut" }, .2)
      .to(".s1 .filed", { autoAlpha: 1, y: 0, duration: .6, ease: "power3.out" }, 1.3);
    swap(1, T[1]);
    tl.to(".s2 .row", { autoAlpha: 1, x: 0, duration: .45, stagger: .18, ease: "power3.out" }, T[1] + .7)
      .to(".s2 .total", { autoAlpha: 1, y: 0, duration: .5, ease: "power3.out" }, T[1] + 1.3)
      .to(tot, { v: 21250, duration: .6, ease: "power2.out", onUpdate: function () { totEl.textContent = "AED " + tot.v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); } }, T[1] + 1.4);
    swap(2, T[2]);
    tl.to(".s3 .l", { clipPath: "inset(0 0 0 0%)", duration: .5, stagger: .22, ease: "power1.inOut" }, T[2] + .7)
      .to(".s3 .pins span", { autoAlpha: 1, y: 0, duration: .4, stagger: .12, ease: "power3.out" }, T[2] + 1.5);
    swap(3, T[3]);
    tl.fromTo(dst, { e: 0 }, { e: 30, duration: 1.4, ease: "power1.inOut", immediateRender: false, onUpdate: function () { renderDial(dst.e); } }, T[3] + .6)
      .fromTo(".s4 .dl div", { autoAlpha: 0, x: 12 }, { autoAlpha: 1, x: 0, duration: .4, stagger: .14, ease: "power3.out", immediateRender: false }, T[3] + .7);
    swap(4, T[4]);
    tl.to(".s5 li", { autoAlpha: 1, x: 0, duration: .4, stagger: .16, ease: "power3.out" }, T[4] + .7)
      .to("#approve", { scale: .97, duration: .15, ease: "power2.out" }, T[4] + 1.3)
      .to("#apFill", { yPercent: 0, duration: 1, ease: "none" }, T[4] + 1.35)
      .to("#mkArc", { strokeDashoffset: 0, duration: 1, ease: "none" }, T[4] + 1.35)
      .to("#approve", { scale: 1, duration: .2, ease: "power2.out" }, T[4] + 2.35)
      .to("#mkCk", { strokeDashoffset: 0, duration: .35, ease: "power2.out" }, T[4] + 2.45)
      .to("#rcTxt", { autoAlpha: 1, x: 0, duration: .45, ease: "power3.out" }, T[4] + 2.55)
      .to({}, { duration: .1 }, T[5] - .1);
    ScrollTrigger.create({ trigger: "#what", start: "top top", end: function () { return "+=" + Math.round(window.innerHeight * (c.phone ? 4.5 : 5.1)); }, pin: true, scrub: .8, animation: tl, invalidateOnRefresh: true,
 });
    var bns = $("#bns");
    tl.eventCallback("onUpdate", function () { var t = tl.time(); if (!holding) apText(t >= DONE_AT);
      var bv = 0; for (var q = 1; q <= 4; q++) bv += Math.max(0, Math.min(1, (t - T[q] - .3) / .8)); if (bns) bns.style.transform = "translateY(" + (-bv) + "em)"; bars.forEach(function (b, i) { gsap.set(b, { scaleX: Math.max(0, Math.min(1, (t - T[i]) / (T[i + 1] - T[i]))) }); }); });

    /* Hold to approve, for the visitor: press and hold (pointer, Space or Enter); letting go early drains it */
    var ap = $("#approve"), holding = false, holdTw = null, hp = { v: 0 };
    function paint() { gsap.set("#apFill", { yPercent: 100 - hp.v * 100 }); gsap.set("#mkArc", { strokeDashoffset: 1 - hp.v }); }
    function startHold(e) {
      if (e && e.type === "pointerdown") { try { ap.setPointerCapture(e.pointerId); } catch (x) {} }
      if (holding) return; holding = true;
      hp.v = 0; paint(); gsap.set("#mkCk", { strokeDashoffset: 1 }); gsap.set("#rcTxt", { autoAlpha: 0, x: -8 }); apText(false);
      if (holdTw) holdTw.kill();
      holdTw = gsap.to(hp, { v: 1, duration: 1.1, ease: "none", onUpdate: paint, onComplete: function () {
        holding = false; apText(true);
        gsap.to("#mkCk", { strokeDashoffset: 0, duration: .35, ease: "power2.out" });
        gsap.to("#rcTxt", { autoAlpha: 1, x: 0, duration: .45, ease: "power3.out", delay: .1 });
      } });
    }
    function endHold() {
      if (!holding) return; holding = false;
      if (holdTw) holdTw.kill();
      holdTw = gsap.to(hp, { v: 0, duration: .45, ease: "power2.out", onUpdate: paint });
    }
    var kd = function (e) { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); startHold(); } };
    var ku = function (e) { if (e.key === " " || e.key === "Enter") endHold(); };
    ap.addEventListener("pointerdown", startHold); ap.addEventListener("pointerup", endHold); ap.addEventListener("pointercancel", endHold);
    ap.addEventListener("keydown", kd); ap.addEventListener("keyup", ku); ap.addEventListener("blur", endHold);
    ap.addEventListener("click", function (e) { e.preventDefault(); });
    clean.push(function () { ap.removeEventListener("pointerdown", startHold); ap.removeEventListener("pointerup", endHold); ap.removeEventListener("pointercancel", endHold); ap.removeEventListener("keydown", kd); ap.removeEventListener("keyup", ku); ap.removeEventListener("blur", endHold); });

    /* Team: the path draws with the scroll and lights each agent; the amber node waits one step away */
    gsap.fromTo(latPath, { strokeDashoffset: PL }, { strokeDashoffset: 0, ease: "none",
      scrollTrigger: { trigger: "#lat", start: "top 75%", end: "center 45%", scrub: .6, onUpdate: function () { lightTo(PL - parseFloat(getComputedStyle(latPath).strokeDashoffset)); } } });
    gsap.fromTo(".nl .nli", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .06, ease: "power3.out", scrollTrigger: { trigger: "#lat", start: "top 75%" } });
    ScrollTrigger.create({ trigger: ".chief", start: "top 70%", once: true, onEnter: playChat });

    /* Founder: the note brightens word by word as you read down */
    var fw = splitWords($("#fq p"));
    gsap.fromTo(fw, { opacity: .14 }, { opacity: 1, ease: "none", stagger: .1, scrollTrigger: { trigger: "#fq", start: "top 78%", end: "bottom 42%", scrub: .5 } });
    gsap.fromTo("#sigRule", { scaleX: 0 }, { scaleX: 1, duration: .8, ease: "power3.out", scrollTrigger: { trigger: ".sign", start: "top 85%" } });
    gsap.fromTo(".sign > div", { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: .6, delay: .25, ease: "power3.out", scrollTrigger: { trigger: ".sign", start: "top 85%" } });

    /* Trust: the cards rise, each check draws itself */
    var tcards = $$(".tcard");
    gsap.set(".tcard .ok path", { strokeDashoffset: 1 });
    gsap.fromTo(tcards, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: "#tgrid", start: "top 80%" },
      onComplete: function () {} });
    tcards.forEach(function (cd, i) {
      gsap.to($(".ok path", cd), { strokeDashoffset: 0, duration: .4, delay: .35 + i * .1, ease: "power2.out", scrollTrigger: { trigger: "#tgrid", start: "top 80%" } });
      if (c.fine) {
        var sp = function (e) { var b = cd.getBoundingClientRect(); cd.style.setProperty("--mx", (e.clientX - b.left) + "px"); cd.style.setProperty("--my", (e.clientY - b.top) + "px"); };
        cd.addEventListener("pointermove", sp); clean.push(function () { cd.removeEventListener("pointermove", sp); });
      }
    });

    /* Roadmap: the line draws across, then each column's items rise */
    var cols = $$(".col");
    if (c.desk) {
      /* desktop: the section holds still and presents Now, then Next, then Later */
      var heads = cols.map(function (cl) { return [$(".tag", cl), $("h3", cl)]; }), items = cols.map(function (cl) { return $$("li", cl); }), flat = function (a) { return [].concat.apply([], a); };
      var rtl = gsap.timeline({ defaults: { ease: "power3.out" } });
      rtl.set(cols, { backgroundColor: "#f8f4ec" }).set(flat(heads), { opacity: .28 }).set(flat(items), { autoAlpha: 0, x: -10, filter: "blur(4px)" }).set("#railFill", { scaleX: 0 });
      cols.forEach(function (cl, i) {
        var at = i * 1.2;
        rtl.to(heads[i], { opacity: 1, duration: .4 }, at)
          .to(cl, { backgroundColor: "#ffffff", duration: .45 }, at)
          .to("#railFill", { scaleX: (i + 1) / 3, duration: .8, ease: "none" }, at)
          .to(items[i], { autoAlpha: 1, x: 0, filter: "blur(0px)", duration: .45, stagger: .1 }, at + .2);
        if (i) rtl.to(heads[i - 1], { opacity: .6, duration: .4 }, at).to(items[i - 1], { opacity: .55, duration: .4 }, at).to(cols[i - 1], { backgroundColor: "#f8f4ec", duration: .4 }, at);
      });
      rtl.to(flat(heads), { opacity: 1, duration: .4 }, 3.7).to(flat(items), { opacity: 1, duration: .4 }, 3.7)
        .to(cols, { backgroundColor: "#ffffff", duration: .4 }, 3.7).to({}, { duration: .3 }, 4.1);
      ScrollTrigger.create({ trigger: "#roadmap", start: "top top", end: function () { return "+=" + Math.round(window.innerHeight * 2.2); }, pin: true, scrub: .8, animation: rtl, invalidateOnRefresh: true });
    } else {
      /* phone and tablet: the same three slides, side by side, moved across as you scroll */
      var road = $("#roadmap"), track = $(".cols", road), pitems = cols.map(function (cl) { return $$("li", cl); });
      road.classList.add("rh");
      var step = function () { return (cols[0].offsetWidth + 12) * (document.documentElement.dir === "rtl" ? 1 : -1); };
      var ptl = gsap.timeline({ defaults: { ease: "power3.out" } });
      ptl.set([].concat.apply([], pitems), { autoAlpha: 0, x: -10 });
      cols.forEach(function (cl, i) {
        var at = i * 1.2;
        if (i) ptl.to(track, { x: function () { return step() * i; }, duration: .8, ease: "power2.inOut" }, at - .6);
        ptl.to(pitems[i], { autoAlpha: 1, x: 0, duration: .4, stagger: .1 }, at + .1);
      });
      ptl.to({}, { duration: .4 }, 3.2);
      ScrollTrigger.create({ trigger: road, start: "top top", end: function () { return "+=" + Math.round(window.innerHeight * 2); }, pin: true, scrub: .8, animation: ptl, invalidateOnRefresh: true });
      clean.push(function () { road.classList.remove("rh"); });
    }

    /* Service Desk AI: solved paths draw through the field, then their amber nodes appear */
    var ftl = gsap.timeline({ scrollTrigger: { trigger: ".field", start: "top 85%", end: "bottom 50%", scrub: .8 } });
    fieldPaths.forEach(function (f, i) {
      var L = f.p.getTotalLength();
      ftl.fromTo(f.p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1, ease: "none" }, i * .18);
      if (f.amb) ftl.fromTo(f.amb, { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }, i * .18 + 1);
    });
    gsap.fromTo(".sda .in > *:not(.field)", { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .08, ease: "power3.out", scrollTrigger: { trigger: ".sda", start: "top 70%" } });
    gsap.fromTo("#invite .head > *:not(.steps), #form", { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .08, ease: "power3.out", scrollTrigger: { trigger: "#invite", start: "top 75%" } });
    var stepLis = $$("#steps li");
    gsap.fromTo(stepLis, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .12, ease: "power3.out", scrollTrigger: { trigger: "#steps", start: "top 80%" } });
    gsap.fromTo("#sfill", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#steps", start: "top 70%", end: "bottom 50%", scrub: .6,
      onUpdate: function (s) { stepLis.forEach(function (li, i) { li.classList.toggle("off", s.progress < i / (stepLis.length - 1) - .02); }); } } });
    stepLis.forEach(function (li, i) { if (i) li.classList.add("off"); });
    gsap.fromTo("#who button", { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .5, stagger: .07, ease: "back.out(1.4)", scrollTrigger: { trigger: "#who", start: "top 85%" }, onComplete: placeGlide });

    /* One thread: a brass path down the left margin, through every section, ending at the one amber decision */
    if (c.wide) {
      var th = document.createElementNS(NS, "svg"); th.setAttribute("class", "thread"); th.setAttribute("aria-hidden", "true"); document.body.appendChild(th);
      var thPath, thBase, thNodes = [], samples = [], thL = 0;
      var SECS = ["#top", "#tangle", "#what", "#team", "#founder", "#trust", "#roadmap", "#sda", "#invite"];
      var buildThread = function () {
        th.innerHTML = ""; thNodes = []; samples = [];
        var W = document.documentElement.scrollWidth, H = document.documentElement.scrollHeight, inn = $(".hero .in").getBoundingClientRect();
        th.setAttribute("width", W); th.setAttribute("height", H); th.setAttribute("viewBox", "0 0 " + W + " " + H);
        var gx = [inn.left + scrollX - 30, inn.left + scrollX - 62], R = 12, pts = [];
        SECS.forEach(function (sel, i) {
          var el = $(sel); if (!el) return;
          var box = el.parentNode && el.parentNode.classList && el.parentNode.classList.contains("pin-spacer") ? el.parentNode : el;
          var y = box.getBoundingClientRect().top + scrollY + (i === 0 ? 190 : 120);
          pts.push([gx[i % 2], y]);
        });
        var d = "M" + pts[0][0] + " " + pts[0][1];
        for (var i = 1; i < pts.length; i++) {
          var p = pts[i - 1], q = pts[i], turn = q[1] - 44, dir = q[0] > p[0] ? 1 : -1;
          d += " V" + (turn - R) + " Q" + p[0] + " " + turn + " " + (p[0] + dir * R) + " " + turn + " H" + (q[0] - dir * R) + " Q" + q[0] + " " + turn + " " + q[0] + " " + (turn + R) + " V" + q[1];
        }
        thBase = mk("path", { "class": "tb", d: d }, th);
        thPath = mk("path", { "class": "tp", d: d }, th);
        thL = thPath.getTotalLength(); thPath.style.strokeDasharray = thL;
        for (var s = 0; s <= 400; s++) { var L = thL * s / 400; samples.push([L, thPath.getPointAtLength(L).y]); }
        pts.forEach(function (p, k) {
          if (k === pts.length - 1) { mk("circle", { "class": "ta", cx: p[0], cy: p[1], r: 7 }, th); thNodes.push([p[1], mk("circle", { "class": "tad", cx: p[0], cy: p[1], r: 3.4 }, th)]); }
          else thNodes.push([p[1], mk("circle", { "class": "tn", cx: p[0], cy: p[1], r: 4 }, th)]);
        });
        drawThread();
      };
      var drawThread = function () {
        if (!thPath) return;
        var head = scrollY + innerHeight * .6, len = 0;
        for (var s = 0; s < samples.length; s++) { if (samples[s][1] <= head) len = samples[s][0]; else break; }
        thPath.style.strokeDashoffset = thL - len;
        thNodes.forEach(function (n) { n[1].classList.toggle("lit", n[0] <= head); });
      };
      var thST = ScrollTrigger.create({ start: 0, end: "max", onUpdate: drawThread });
      ScrollTrigger.addEventListener("refresh", buildThread);
      requestAnimationFrame(buildThread);
      clean.push(function () { ScrollTrigger.removeEventListener("refresh", buildThread); thST.kill(); th.remove(); });
    }

    } catch (err) {
      /* if any animation cannot start on this browser, show the complete still page instead of a broken one */
      if (window.console) console.error(err);
      setTimeout(function () { mm.revert(); document.documentElement.classList.add("static"); ScrollTrigger.refresh(); }, 0);
    }
    return function () { clean.forEach(function (f) { f(); }); };
  });
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
