/* Service Desk AI landing page, version 1.0.0 */

/* Service Desk AI — scenario simulations. Each scene is a timeline of steps played on a 1280x720 stage
   that looks like the platform. All names, cases and amounts are invented. */
(function () {
  "use strict";
  var NAV = ["My Desk", "Cases", "Mail", "The office", "Finance"];
  var CURSOR = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2l15 9-6.5 1.6L16 20l-3 1.4-3.6-7.3L4 19z" fill="#fff" stroke="#23160c" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  function h(html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; }
  function fmt(v, dec) { return new Intl.NumberFormat("en-US", { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }).format(v); }

  function Stage(root, scene) {
    this.root = root; this.scene = scene; this.timers = []; this.alive = true;
    root.innerHTML = "";
    var st = h('<div class="sim-stage"></div>');
    var side = h('<aside class="s-side"><div class="s-word">RENTAL DESK AI<i></i></div></aside>');
    NAV.forEach(function (n) { side.appendChild(h('<div class="s-nav' + (n === scene.nav ? " on" : "") + '"><span class="d"></span>' + n + (n === "My Desk" ? '<span class="n">3</span>' : "") + "</div>")); });
    var main = h('<div class="s-main"><div class="s-top"><div class="s-search">Search cases, clients, emails</div><div class="s-bell">&#9673;<b>2</b></div><div class="s-me">FA</div></div><div class="s-body"></div></div>');
    st.appendChild(side); st.appendChild(main);
    this.cursor = h('<div class="s-cursor">' + CURSOR + "</div>"); st.appendChild(this.cursor);
    this.cap = h('<div class="s-cap hide"></div>'); st.appendChild(this.cap);
    st.appendChild(h('<div class="s-sim">Simulation · invented data</div>'));
    this.end = h('<div class="s-end"></div>'); st.appendChild(this.end);
    root.appendChild(st);
    this.stage = st; this.body = main.querySelector(".s-body"); this.bell = main.querySelector(".s-bell b");
    this.fit(); var self = this;
    this.ro = window.ResizeObserver ? new ResizeObserver(function () { self.fit(); }) : null; if (this.ro) this.ro.observe(root);
    this.move(1100, 650, true);
  }
  Stage.prototype.fit = function () { var w = this.root.clientWidth || 1280; this.stage.style.transform = "scale(" + (w / 1280) + ")"; };
  Stage.prototype.at = function (ms, fn) { var self = this; this.timers.push(setTimeout(function () { if (self.alive) fn(); }, ms)); };
  Stage.prototype.stop = function () { this.alive = false; this.timers.forEach(clearTimeout); this.timers = []; if (this.ro) this.ro.disconnect(); };
  Stage.prototype.add = function (html, parent) { var e = h(html); (parent || this.body).appendChild(e); return e; };
  Stage.prototype.pos = function (el) { var x = 0, y = 0, e = el; while (e && e !== this.stage) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 }; };
  Stage.prototype.move = function (x, y, instant) { if (instant) { this.cursor.style.transition = "none"; } this.cursor.style.transform = "translate(" + x + "px," + y + "px)"; if (instant) { void this.cursor.offsetWidth; this.cursor.style.transition = ""; } };
  Stage.prototype.point = function (el) { var p = this.pos(el); this.move(p.x - 4, p.y - 2); return p; };
  Stage.prototype.click = function (el) { var p = this.pos(el); var c = h('<div class="s-click"></div>'); c.style.left = p.x + "px"; c.style.top = p.y + "px"; this.stage.appendChild(c); setTimeout(function () { c.remove(); }, 700); };
  Stage.prototype.say = function (text) { var cap = this.cap; cap.classList.add("hide"); setTimeout(function () { cap.textContent = text; cap.classList.remove("hide"); }, 300); };
  Stage.prototype.type = function (el, text, cps) { var i = 0, self = this, step = 1000 / (cps || 30); (function next() { if (!self.alive || i > text.length) return; el.textContent = text.slice(0, i++); setTimeout(next, step); })(); };
  Stage.prototype.count = function (el, to, dec, ms) { var t0 = null, self = this; ms = ms || 1200; function f(ts) { if (!self.alive) return; if (t0 === null) t0 = ts; var p = Math.min(1, (ts - t0) / ms), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(to * e, dec); if (p < 1) requestAnimationFrame(f); } requestAnimationFrame(f); };

  var S = {};

  /* 1 — The day starts on My Desk */
  S.desk = { nav: "My Desk", length: 17000, play: function (s) {
    var b = s.body;
    s.at(200, function () { s.add('<p class="s-kick s-in">Wednesday · Rental Department</p>'); s.add('<h1 class="s-title s-in" style="animation-delay:.15s">Good morning, Farouk</h1>'); s.say("Every morning starts with one screen: what needs you, what is done, what is next."); });
    s.at(1300, function () {
      var g = s.add('<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:20px 0"></div>');
      [["Active cases", 42], ["Waiting for you", 3], ["Hearings this week", 5], ["Notices this month", 18]].forEach(function (k, i) {
        var c = s.add('<div class="s-card s-in" style="padding:16px 18px;animation-delay:' + (i * .1) + 's"><b class="s-num" style="font:500 32px/1 var(--display)">0</b><div style="font-size:13px;color:var(--muted);margin-top:6px">' + k[0] + "</div></div>", g);
        setTimeout(function () { s.count(c.querySelector("b"), k[1]); }, 300 + i * 100);
      });
    });
    s.at(3800, function () {
      var w = s.add('<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:14px"></div>');
      var a = s.add('<div class="s-card" style="padding:16px 18px"><div style="font:500 19px var(--display);margin-bottom:6px">Needs your attention</div></div>', w);
      var d = s.add('<div class="s-card" style="padding:16px 18px"><div style="font:500 19px var(--display);margin-bottom:6px">Next deadlines</div></div>', w);
      s.needs = a; s.dl = d;
      s.say("Three cases are waiting for a decision. Everything else, the agents handled.");
      [["Approve", "Serve the notice · Case 214", "Figures checked · ready since 08:12", "Review", "main"], ["Confirm", "Ejari rent differs from the email · Case 198", "Which one is right?", "Confirm", ""], ["Fix", "RDC sign-in expired", "RDC Tracker paused at 07:40", "Sign in", ""]].forEach(function (r, i) {
        setTimeout(function () { var row = s.add('<div class="s-in" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line)"><span class="s-pill' + (i === 2 ? " bad" : "") + '">' + r[0] + '</span><div style="flex:1;min-width:0"><b style="display:block;font-size:14px">' + r[1] + '</b><small style="color:var(--muted)">' + r[2] + '</small></div><span class="s-btn ' + r[4] + '">' + r[3] + "</span></div>", a); if (i === 0) s.review = row.querySelector(".s-btn"); }, i * 350);
      });
      [["Hearing · Case 214", "20h left", "bad"], ["Notice period · Case 198", "2d 4h", ""], ["Appeal window · Case 175", "9 days", "ok"]].forEach(function (r, i) {
        setTimeout(function () { s.add('<div class="s-in" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid var(--line);font-size:14px"><span>' + r[0] + '</span><span class="s-pill ' + r[2] + '">' + r[1] + "</span></div>", d); }, 600 + i * 300);
      });
    });
    s.at(7600, function () { s.say("A hearing is less than a day away, so it turns red and stays at the top."); });
    s.at(10600, function () { s.point(s.review); s.say("One click opens the case, with the figures already checked."); });
    s.at(11800, function () { s.click(s.review); });
    s.at(12400, function () { var t = s.add('<div class="s-card s-pop" style="position:absolute;right:28px;bottom:90px;width:360px;padding:14px 16px;display:flex;gap:12px;align-items:center"><span class="s-ava wait">ND</span><div><b style="display:block;font-size:14px">Opening Case 214</b><small style="color:var(--muted)">Notice ready · 3 checks passed</small></div></div>'); });
    s.at(14500, function () { s.say("Nothing is served, filed or sent until you approve it."); });
  } };

  /* 2 — An email arrives and is filed to the right case */
  S.mail = { nav: "Mail", length: 18000, play: function (s) {
    s.add('<p class="s-kick">Mail Desk · rental.department inbox</p>');
    var wrap = s.add('<div style="display:grid;grid-template-columns:360px 1fr;gap:16px;margin-top:12px;height:500px"></div>');
    var list = s.add('<div class="s-card" style="padding:8px;overflow:hidden"></div>', wrap);
    var pane = s.add('<div class="s-card" style="padding:20px 22px;position:relative;overflow:hidden"></div>', wrap);
    function item(from, subj, tag, cls) { return s.add('<div style="padding:12px;border-radius:12px;border-bottom:1px solid var(--line)"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:14px">' + from + '</b><span class="s-pill ' + (cls || "") + '">' + tag + '</span></div><small style="color:var(--muted)">' + subj + "</small></div>", list); }
    item("Gulf Homes", "Hearing minutes · Case 163", "Filed", "ok");
    item("Marina Assets", "Signed fee agreement", "Filed", "ok");
    s.say("The Mail Desk watches the inbox all day.");
    s.at(2200, function () {
      var n = h('<div class="s-flash s-in" style="padding:12px;border-radius:12px;border-bottom:1px solid var(--line)"><div style="display:flex;justify-content:space-between;gap:8px"><b style="font-size:14px">Barsha Real Estate</b><span class="s-pill">New</span></div><small style="color:var(--muted)">Returned cheques · Unit 1203 · 2 attachments</small></div>');
      list.insertBefore(n, list.firstChild); s.newItem = n; s.bell.textContent = "3"; s.say("A new email arrives from a client, with two attachments.");
    });
    s.at(4200, function () { s.point(s.newItem); });
    s.at(5000, function () {
      s.click(s.newItem);
      pane.innerHTML = '<div class="s-in"><b style="font-size:17px">Returned cheques · Unit 1203</b><div style="color:var(--muted);font-size:13px;margin:4px 0 14px">From: Barsha Real Estate · 09:14</div><p style="font-size:14.5px;color:var(--ink-2)">Dear Farouk, two of the tenant\'s cheques were returned by the bank. Please proceed. The Ejari and the cheques are attached.</p><div id="att" style="display:flex;gap:10px;margin-top:16px"><span class="s-card" style="padding:10px 14px;font-size:13px">Ejari-1203.pdf</span><span class="s-card" style="padding:10px 14px;font-size:13px">Cheques-000215-216.pdf</span></div><div id="res" style="margin-top:22px;display:grid;gap:10px"></div></div>';
      pane.appendChild(h('<div class="s-scan"></div>'));
      s.say("The agent reads the email and both attachments.");
    });
    s.at(8200, function () { var r = pane.querySelector("#res");
      [["Ejari certificate", "Unit 1203 · tenant and rent read", "ok"], ["Cheques 000215 and 000216", "Returned · AED 21,000.00 each", "bad"]].forEach(function (x, i) { setTimeout(function () { s.add('<div class="s-in" style="display:flex;align-items:center;gap:10px;font-size:14px"><span class="s-pill ' + x[2] + '">' + (x[2] === "ok" ? "Read" : "Returned") + '</span><b>' + x[0] + '</b><span style="color:var(--muted)">' + x[1] + "</span></div>", r); }, i * 500); });
      s.say("It recognises the documents and pulls out the facts that matter.");
    });
    s.at(11200, function () { var r = pane.querySelector("#res"); s.add('<div class="s-card s-pop" style="padding:14px 16px;margin-top:6px;display:flex;align-items:center;gap:12px;border-color:var(--teal)"><span class="s-ava on">MD</span><div><b style="display:block">Matched to Case 214</b><small style="color:var(--muted)">By the unit number and the client · filed to Documents</small></div></div>', r); s.say("It files everything to the right case, and asks you when it is not sure."); });
    s.at(13600, function () { s.newItem.querySelector(".s-pill").className = "s-pill ok"; s.newItem.querySelector(".s-pill").textContent = "Filed"; });
    s.at(14600, function () { s.say("Then the Claim Checker is told to re-check the figures."); });
  } };

  /* 3 — Every figure re-checked */
  S.claim = { nav: "Cases", length: 17500, play: function (s) {
    s.add('<p class="s-kick">Case 214 · Claim Checker</p><h1 class="s-title">Rent and cheques</h1>');
    var t = s.add('<div class="s-card" style="margin-top:14px;overflow:hidden"></div>');
    var head = s.add('<div style="display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:10px;padding:10px 18px;background:var(--surface-2);font:600 11.5px var(--ui);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)"><span>Cheque</span><span>Period</span><span class="s-num">Amount (AED)</span><span>Status</span></div>', t);
    var rows = [["000213", "Jan – Mar", "21,000.00", "Cleared", "ok"], ["000214", "Apr – Jun", "21,000.00", "Cleared", "ok"], ["000215", "Jul – Sep", "21,000.00", "Returned", "bad"], ["000216", "Oct – Dec", "21,000.00", "Returned", "bad"]];
    s.say("The Claim Checker reads the lease and the cheques.");
    rows.forEach(function (r, i) { s.at(900 + i * 450, function () { s.add('<div class="s-in" style="display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:10px;padding:12px 18px;border-top:1px solid var(--line);font-size:14.5px;align-items:center"><b>' + r[0] + '</b><span>' + r[1] + '</span><span class="s-num">' + r[2] + '</span><span><span class="s-pill ' + r[4] + '">' + r[3] + "</span></span></div>", t); }); });
    s.at(3600, function () { s.say("Each cheque is matched to its rent period."); });
    s.at(6000, function () {
      var c = s.add('<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px"></div>');
      var calc = s.add('<div class="s-card s-in" style="padding:16px 18px;font-size:14.5px"><div style="font:500 18px var(--display);margin-bottom:8px">The calculation</div></div>', c);
      [["Returned cheques", "2 × 21,000.00", "42,000.00"], ["Periods covered", "Jul – Dec", ""], ["Overlaps or duplicates", "None found", ""]].forEach(function (l, i) { setTimeout(function () { s.add('<div class="s-in" style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid var(--line)"><span>' + l[0] + ' <span style="color:var(--muted)">' + l[1] + '</span></span><b class="s-num">' + l[2] + "</b></div>", calc); }, i * 500); });
      var tot = s.add('<div class="s-card s-in" style="padding:16px 18px;animation-delay:.3s"><div style="font-size:13px;color:var(--muted)">Amount claimed</div><div style="font:500 40px/1.2 var(--display)" class="s-num">AED <span id="tt">0.00</span></div><div style="font-size:14px;color:var(--ink-2);margin-top:6px" dir="rtl">اثنان وأربعون ألف درهم</div><div style="margin-top:10px"><span class="s-pill ok">Words match the figure</span></div></div>', c);
      setTimeout(function () { s.count(tot.querySelector("#tt"), 42000, 2, 1400); }, 1200);
      s.say("The total is calculated by code, with every step shown.");
    });
    s.at(11000, function () { s.say("The amount in words is checked against the figure, so the notice is consistent."); });
    s.at(14200, function () { s.say("Result: ready for the Notice Drafter, with nothing left to re-check by hand."); });
  } };

  /* 4 — The notice is drafted and approved */
  S.draft = { nav: "Cases", length: 19000, play: function (s) {
    s.add('<p class="s-kick">Case 214 · Notice Drafter</p>');
    var w = s.add('<div style="display:grid;grid-template-columns:1.3fr 1fr;gap:18px;margin-top:10px"></div>');
    var paper = s.add('<div class="s-card" style="padding:28px 34px;min-height:470px;background:#fffdf8;color:#23160c" dir="rtl" lang="ar"></div>', w);
    var side = s.add('<div style="display:grid;gap:12px;align-content:start"></div>', w);
    var lines = [["إنذار بسداد الأجرة المستحقة", "font:700 22px/1.6 var(--arabic);text-align:center;margin-bottom:10px"], ["المُنذِر: شركة البرشاء العقارية", ""], ["المُنذَر إليه: مستأجر الوحدة 1203", ""], ["أولاً: ترصّد في ذمتكم مبلغ 42,000 درهم قيمة شيكين مرتجعين.", ""], ["ثانياً: نطالبكم بسداد المبلغ خلال المهلة المقررة قانوناً.", ""], ["لذلك، فإننا ننذركم بالسداد وإلا اتخذنا الإجراءات القانونية.", ""]];
    s.say("The Notice Drafter writes the notice in Arabic, in the firm's own format.");
    var t0 = 600;
    lines.forEach(function (l) { var el = s.add('<p style="margin:0 0 12px;font:500 17px/1.8 var(--arabic);' + l[1] + '"></p>', paper); s.at(t0, function () { s.type(el, l[0], 40); }); t0 += l[0].length * 25 + 350; });
    s.at(1500, function () { [["Parties from the lease and Ejari"], ["Amount from the Claim Checker"], ["Amount in words matches"]].forEach(function (x, i) { setTimeout(function () { s.add('<div class="s-card s-in" style="padding:12px 14px;display:flex;gap:10px;align-items:center;font-size:14px"><span class="s-pill ok">Checked</span>' + x[0] + "</div>", side); }, i * 700); }); });
    s.at(9800, function () {
      s.box = s.add('<div class="s-card s-pop" style="padding:16px 18px;display:grid;gap:10px"><b style="font:500 18px var(--display)">Approve and serve?</b><small style="color:var(--muted)">It will be served to the tenant. This is recorded with your name and the time.</small><span class="s-btn main" id="hold" style="justify-content:center;height:44px"><i class="s-hold"></i><span style="position:relative">Hold to approve and serve</span></span></div>', side);
      s.say("Serving a notice can't be undone, so it waits for you.");
    });
    s.at(12200, function () { s.point(s.box.querySelector("#hold")); });
    s.at(13100, function () { var f = s.box.querySelector(".s-hold"); f.style.transition = "transform 1.2s linear"; f.style.transform = "scaleX(1)"; s.click(s.box.querySelector("#hold")); s.say("You hold to approve, so it never happens by accident."); });
    s.at(14600, function () { s.box.innerHTML = '<div class="s-pop" style="text-align:center;display:grid;gap:8px;justify-items:center"><div style="width:84px;height:84px;border-radius:50%;border:2px solid var(--brass);display:grid;place-items:center;color:var(--brass-deep);font:700 11px var(--ui);letter-spacing:.12em;transform:rotate(-12deg)">APPROVED</div><b>Approved · serving now</b><small style="color:var(--muted)">Farouk Ali · 09:31 · recorded</small></div>'; s.say("A seal confirms it, and the record shows who approved and when."); });
  } };

  /* 5 — The office: agents hand work to each other */
  S.office = { nav: "The office", length: 18000, play: function (s) {
    s.add('<p class="s-kick">The office</p><h1 class="s-title">Your team, live</h1>');
    var g = s.add('<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:18px;position:relative"></div>');
    var A = [["MD", "Mail Desk"], ["CC", "Claim Checker"], ["ND", "Notice Drafter"], ["CU", "Client Updates"]].map(function (a) {
      var c = s.add('<div class="s-card" style="padding:16px;display:grid;gap:10px"><div style="display:flex;gap:10px;align-items:center"><span class="s-ava">' + a[0] + '</span><b style="font-size:14.5px">' + a[1] + '</b></div><div class="tk" style="font-size:13.5px;color:var(--muted);min-height:40px">Idle</div><div class="s-bar"><i></i></div><div><span class="s-pill st" style="background:var(--surface-2);color:var(--muted)">Idle</span></div></div>', g);
      return c;
    });
    function set(c, state, task, pct) { var av = c.querySelector(".s-ava"), p = c.querySelector(".st"); av.className = "s-ava" + (state === "Working" ? " on" : state === "Waiting for you" ? " wait" : ""); c.querySelector(".tk").textContent = task; c.querySelector(".tk").style.color = state === "Idle" ? "var(--muted)" : "var(--ink-2)"; c.querySelector(".s-bar i").style.width = pct + "%"; p.textContent = state; p.className = "s-pill st" + (state === "Working" || state === "Done" ? " ok" : ""); p.style.cssText = state === "Idle" ? "background:var(--surface-2);color:var(--muted)" : ""; }
    var log = s.add('<div class="s-card" style="margin-top:16px;padding:14px 18px;font-size:14px;display:grid;gap:6px"><b style="font:500 18px var(--display)">Activity</b></div>');
    function note(t) { s.add('<div class="s-in" style="display:flex;gap:12px"><span class="s-num" style="color:var(--muted);width:48px">' + t[0] + "</span><span>" + t[1] + "</span></div>", log); }
    s.say("Each agent shows its real task, its step and its result.");
    s.at(800, function () { set(A[0], "Working", "Reading an email from Barsha Real Estate", 50); note(["09:14", "Mail Desk filed two returned cheques to Case 214"]); });
    s.at(3200, function () { set(A[0], "Done", "Filed to Case 214", 100); set(A[1], "Working", "Matching cheques to rent periods", 30); note(["09:15", "Claim Checker started on Case 214"]); s.say("When one agent finishes, it hands the case to the next."); });
    s.at(5600, function () { set(A[1], "Working", "Calculating the amount claimed", 75); });
    s.at(7600, function () { set(A[1], "Done", "AED 42,000.00 · every step shown", 100); set(A[2], "Working", "Drafting the notice in Arabic", 40); note(["09:17", "Notice Drafter started the notice"]); });
    s.at(10400, function () { set(A[2], "Waiting for you", "Notice ready for your approval", 100); note(["09:19", "Notice for Case 214 is waiting for you"]); s.say("Anything that needs your decision waits for you, and says why."); });
    s.at(13200, function () { set(A[3], "Working", "Preparing the client update", 60); note(["09:20", "Client Updates drafting a note to Barsha Real Estate"]); s.say("Meanwhile the client update is prepared, ready to go once you agree."); });
    s.at(15600, function () { set(A[3], "Waiting for you", "Update ready to send", 100); });
  } };

  /* 6 — From agreement to invoice to payment */
  S.finance = { nav: "Finance", length: 19000, play: function (s) {
    s.add('<p class="s-kick">Finance · Barsha Real Estate</p><h1 class="s-title">From agreement to payment</h1>');
    var w = s.add('<div style="display:grid;grid-template-columns:1fr 1.1fr;gap:16px;margin-top:16px"></div>');
    var left = s.add('<div style="display:grid;gap:12px;align-content:start"></div>', w);
    var right = s.add('<div style="display:grid;gap:12px;align-content:start"></div>', w);
    s.say("The fee agreement is read once. The agent knows what is due, and when.");
    s.at(400, function () { s.add('<div class="s-card s-in" style="padding:16px 18px"><div class="s-kick">Fee agreement</div><div style="display:grid;gap:6px;margin-top:8px;font-size:14px"><div style="display:flex;justify-content:space-between"><span>On filing the case</span><b class="s-num">AED 10,000.00</b></div><div style="display:flex;justify-content:space-between"><span>On judgment</span><b class="s-num">AED 5,000.00</b></div><div style="display:flex;justify-content:space-between;color:var(--muted)"><span>VAT</span><span>5%</span></div></div></div>', left); });
    s.at(2600, function () { s.add('<div class="s-card s-pop" style="padding:14px 16px;display:flex;gap:12px;align-items:center;border-color:var(--teal)"><span class="s-ava on">FN</span><div><b style="display:block">Stage reached: case filed</b><small style="color:var(--muted)">Case 214 · RDC · today</small></div></div>', left); s.say("When the work reaches a billable stage, the fee is calculated."); });
    s.at(4600, function () {
      var inv = s.add('<div class="s-card s-in" style="padding:18px 20px;background:#fffdf8;color:#23160c"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font:500 20px var(--display)">Invoice INV-0142</b><span class="s-pill">Draft</span></div><div style="display:grid;gap:8px;margin-top:12px;font-size:14px"></div></div>', right);
      s.inv = inv; var g = inv.querySelector("div:last-child");
      [["Legal fees · filing stage", "10,000.00"], ["VAT 5%", "500.00"]].forEach(function (l, i) { setTimeout(function () { s.add('<div class="s-in" style="display:flex;justify-content:space-between;border-top:1px solid #ece5d8;padding-top:8px"><span>' + l[0] + '</span><span class="s-num">' + l[1] + "</span></div>", g); }, i * 500); });
      setTimeout(function () { var t = s.add('<div class="s-in" style="display:flex;justify-content:space-between;border-top:1px solid #d7cab2;padding-top:10px;font-weight:700;font-size:16px"><span>Total due</span><span class="s-num">AED <span id="it">0.00</span></span></div>', g); s.count(t.querySelector("#it"), 10500, 2, 1200); }, 1100);
      s.say("VAT is added and the invoice is prepared, figure by figure.");
    });
    s.at(8600, function () { var p = s.inv.querySelector(".s-pill"); p.textContent = "Sent"; p.className = "s-pill ok"; s.tl = s.add('<div class="s-card s-in" style="padding:14px 18px;display:grid;gap:8px;font-size:14px"><b style="font:500 17px var(--display)">Follow-up</b></div>', right); s.add('<div class="s-in" style="display:flex;gap:12px"><span class="s-num" style="width:58px;color:var(--muted)">Day 0</span><span>Invoice sent to the client after your approval</span></div>', s.tl); s.say("It goes out on time, after your approval."); });
    s.at(11200, function () { s.add('<div class="s-in" style="display:flex;gap:12px"><span class="s-num" style="width:58px;color:var(--muted)">Day 7</span><span>Polite reminder sent</span></div>', s.tl); s.say("No payment yet? A polite reminder follows, on the schedule you set."); });
    s.at(13800, function () { s.add('<div class="s-in" style="display:flex;gap:12px;align-items:center"><span class="s-num" style="width:58px;color:var(--muted)">Day 9</span><span class="s-pill ok">Paid</span><span>Payment confirmed · AED 10,500.00</span></div>', s.tl); var p = s.inv.querySelector(".s-pill"); p.textContent = "Paid"; s.say("Once the payment is confirmed, the file is closed and the reports update."); });
  } };

  /* public API: play a scene in a box, looping; stop on demand */
  window.SDSim = {
    scenes: S,
    play: function (root, name, opts) {
      opts = opts || {};
      var scene = S[name]; if (!scene) return null;
      var ctl = { stage: null, stopped: false };
      function run() {
        if (ctl.stopped) return;
        if (ctl.stage) ctl.stage.stop();
        var st = ctl.stage = new Stage(root, scene);
        scene.play(st);
        if (!opts.once) {
          st.at(scene.length - 700, function () { st.end.classList.add("on"); });
          st.at(scene.length, run);
        }
      }
      run();
      ctl.stop = function () { ctl.stopped = true; if (ctl.stage) ctl.stage.stop(); };
      return ctl;
    }
  };
})();



(function () {
  "use strict";
  var root = document.documentElement, reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* theme */
  var themeBtn = document.getElementById("theme");
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); }
  function label() { themeBtn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode"); }
  themeBtn.addEventListener("click", function () { root.setAttribute("data-theme", isDark() ? "light" : "dark"); label(); try { localStorage.setItem("sd-theme", root.getAttribute("data-theme")); } catch (e) {} });
  try { var saved = localStorage.getItem("sd-theme"); if (saved) root.setAttribute("data-theme", saved); } catch (e) {}
  label();

  /* sign-in pop-up */
  var pop = document.getElementById("login"), opener = document.getElementById("open-login");
  function open() { pop.hidden = false; pop.querySelector(".ws a").focus(); }
  function close() { pop.hidden = true; opener.focus(); }
  opener.addEventListener("click", open);
  pop.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", close); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pop.hidden) close(); });

  /* slides */
  var track = document.getElementById("track"), slides = track.children, n = slides.length, i = 0, dots = document.getElementById("dots"), count = document.getElementById("count");
  for (var k = 0; k < n; k++) { var d = document.createElement("button"); d.type = "button"; d.setAttribute("aria-label", "Demo " + (k + 1)); (function (k) { d.addEventListener("click", function () { go(k); }); })(k); dots.appendChild(d); }
  function go(j) {
    i = (j + n) % n;
    var rtl = getComputedStyle(track).direction === "rtl";
    track.style.transform = "translateX(" + (rtl ? i * 100 : -i * 100) + "%)";
    [].forEach.call(dots.children, function (d, m) { d.setAttribute("aria-current", m === i ? "true" : "false"); });
    [].forEach.call(slides, function (s, m) { s.setAttribute("aria-hidden", m === i ? "false" : "true"); });
    count.textContent = (i + 1) + " / " + n;
    playActive();
  }
  var current = null, visible = true, panelOn = !document.getElementById("dm-sim") || !document.getElementById("dm-sim").hidden;
  window.SDDemoPanel = function (on) { panelOn = on; if (on) { go(i); } else if (current) { current.stop(); current = null; } };
  function playActive() {
    if (current) { current.stop(); current = null; }
    if (!visible || !panelOn || !window.SDSim) return;
    var box = slides[i].querySelector(".sim");
    if (box) current = SDSim.play(box, box.getAttribute("data-scene"));
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { var was = visible; visible = e.isIntersecting; if (visible && !was) playActive(); if (!visible && current) { current.stop(); current = null; } }); }, { threshold: .25 }).observe(document.querySelector(".slides"));
  }
  document.getElementById("prev").addEventListener("click", function () { go(i - 1); });
  document.getElementById("next").addEventListener("click", function () { go(i + 1); });
  document.querySelector(".slides").addEventListener("keydown", function (e) { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); });
  var x0 = null; track.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
  track.addEventListener("pointerup", function (e) { if (x0 === null) return; var dx = e.clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
  go(0);

  /* copy buttons */
  document.querySelectorAll(".copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var el = document.getElementById(b.getAttribute("data-copy")), text = el.textContent.trim();
      function done(ok) { b.textContent = ok ? "Copied" : "Selected"; setTimeout(function () { b.textContent = "Copy"; }, 1600); }
      function select() { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); done(false); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, select); else select();
    });
  });
})();


(function(){var p=document.getElementById('portrait'); if(!p) return; if(!('IntersectionObserver' in window)){p.classList.add('in');return;}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){p.classList.add('in');io.disconnect();}});},{threshold:.25}); io.observe(p);})();

/* demo switch: live recordings / walk-throughs */
(function () {
  "use strict";
  var tabs = [document.getElementById("tab-real"), document.getElementById("tab-sim")];
  if (!tabs[0] || !tabs[1]) return;
  function show(t) {
    tabs.forEach(function (b) {
      var on = b === t, panel = document.getElementById(b.getAttribute("aria-controls"));
      b.setAttribute("aria-selected", on ? "true" : "false"); b.tabIndex = on ? 0 : -1; panel.hidden = !on;
    });
    document.querySelectorAll("#dm-real video").forEach(function (v) { if (t !== tabs[0]) v.pause(); });
    window.dispatchEvent(new Event("resize"));
    if (window.SDDemoPanel) window.SDDemoPanel(t === tabs[1]);
  }
  tabs.forEach(function (b, k) {
    b.addEventListener("click", function () { show(b); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var o = tabs[(k + 1) % 2]; o.focus(); show(o); e.preventDefault(); }
    });
  });
  /* one video at a time */
  document.querySelectorAll("#dm-real video").forEach(function (v) {
    v.addEventListener("play", function () { document.querySelectorAll("#dm-real video").forEach(function (o) { if (o !== v) o.pause(); }); });
  });
})();
