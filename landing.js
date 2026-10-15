/* Service Desk AI landing, Landing 2.0.0. No third-party requests, no user data. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* The six steps from email to client update: one lights up at a time; a click picks a step and stops the autoplay. */
  var flow = document.getElementById("flow");
  var steps = flow ? Array.prototype.slice.call(flow.querySelectorAll(".fs")) : [];
  var nodes = Array.prototype.slice.call(document.querySelectorAll(".node"));
  var rail = document.getElementById("rail");
  var step = 0, auto = true;

  function show(i) {
    step = i;
    steps.forEach(function (b, k) {
      b.classList.toggle("on", k === i);
      b.classList.toggle("done", k < i);
      b.setAttribute("aria-pressed", k === i ? "true" : "false");
    });
    nodes.forEach(function (n, k) { n.classList.toggle("on", k === i); });
    if (rail) rail.style.height = Math.round((i + 0.5) / steps.length * 100) + "%";
  }
  steps.forEach(function (b, k) {
    b.addEventListener("click", function () { auto = false; show(k); });
  });
  if (steps.length) show(0);

  /* The three agent cards in the opening take turns glowing. */
  var floats = Array.prototype.slice.call(document.querySelectorAll(".fl"));
  var tick = 0;

  if (!reduce) {
    setInterval(function () {
      if (document.hidden) return;
      tick = (tick + 1) % (floats.length || 1);
      floats.forEach(function (f, k) { f.classList.toggle("live", k === tick); });
      if (auto && steps.length) show((step + 1) % steps.length);
    }, 3200);
  }
})();
