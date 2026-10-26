/* Live in Flow Coaching: motion layer.
   GSAP + ScrollTrigger drive scroll effects. Native scrolling, no scroll-jacking.
   If GSAP fails to load, or reduce-motion is on, every page still reads fully. */
(function () {
  "use strict";
  var html = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var LIF = window.LIF || { whenIntro: function (fn) { fn(); } };

  /* Statement words light up as you read (works with or without GSAP). */
  function splitStatement() {
    $$("[data-statement]").forEach(function (el) {
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
              else { var s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && !n.classList.contains("inline-img")) walk(n);
          else if (n.nodeType === 1) n.classList.add("w");
        });
      };
      walk(el);
    });
  }

  if (reduce || !gsap || !ST) { return; }
  gsap.registerPlugin(ST);
  html.classList.add("has-gsap");
  splitStatement();

  var mm = gsap.matchMedia();
  var EASE = "expo.out";

  /* ---------- Headline word reveals ---------- */
  function splitWords(el) {
    var out = [];
    var walk = function (node, wrapEm) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "split-w";
            var i = document.createElement("span"); i.textContent = part;
            w.appendChild(i); frag.appendChild(w); out.push(i);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return out;
  }
  $$("[data-split]").forEach(function (el) {
    var words = splitWords(el);
    gsap.set(words, { yPercent: 110 });
    var inHero = el.closest(".page-hero");
    var play = function () { gsap.to(words, { yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.05, onComplete: function () { el.classList.add("is-split-done"); } }); };
    if (inHero) LIF.whenIntro(function () { setTimeout(play, 120); });
    else ST.create({ trigger: el, start: "top 88%", once: true, onEnter: play });
  });

  /* Home hero title */
  var heroLines = $$(".hero__title .line > span");
  if (heroLines.length) {
    gsap.set(heroLines, { yPercent: 110 });
    gsap.set([".hero__eyebrow", ".hero__foot", ".hero-card", ".hero__dots"], { autoAlpha: 0, y: 24 });
    LIF.whenIntro(function () {
      var tl = gsap.timeline({ delay: 0.15 });
      tl.to(heroLines, { yPercent: 0, duration: 1.4, ease: EASE, stagger: 0.12, onComplete: function () { $(".hero__title").classList.add("is-in"); } })
        .to(".hero__eyebrow", { autoAlpha: 1, y: 0, duration: 1, ease: EASE }, 0.2)
        .to(".hero__foot", { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE }, 0.55)
        .to([".hero-card", ".hero__dots"], { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.1 }, 0.75);
    });
    mm.add("(min-width: 900px)", function () {
      gsap.to(".hero__slides", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero__content", { yPercent: -10, autoAlpha: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
    });
  }

  /* Inner-page immersive hero */
  var ph = $(".phero");
  if (ph) {
    var phLines = $$(".phero__title .line > span", ph);
    gsap.set(phLines, { yPercent: 110 });
    gsap.set([".phero__eyebrow", ".phero__foot", ".phero__card", ".phero__top", ".phero__scroll"], { autoAlpha: 0, y: 24 });
    gsap.set(".phero__img", { scale: 1.16 });
    LIF.whenIntro(function () {
      var tl = gsap.timeline({ delay: 0.1 });
      tl.to(".phero__img", { scale: 1, duration: 2.2, ease: "expo.out" }, 0)
        .to(phLines, { yPercent: 0, duration: 1.3, ease: EASE, stagger: 0.12, onComplete: function () { $(".phero__title", ph).classList.add("is-in"); } }, 0.1)
        .to([".phero__top", ".phero__eyebrow"], { autoAlpha: 1, y: 0, duration: 1, ease: EASE, stagger: 0.08 }, 0.2)
        .to(".phero__foot", { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE }, 0.5)
        .to([".phero__card", ".phero__scroll"], { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.1 }, 0.7);
    });
    gsap.to(".phero__media", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ph, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".phero__content", { yPercent: -12, autoAlpha: 0.15, ease: "none", scrollTrigger: { trigger: ph, start: "35% top", end: "bottom top", scrub: true } });
  }

  /* ---------- Generic reveals ---------- */
  $$(".reveal").forEach(function (el) {
    var inHero = el.closest(".page-hero");
    gsap.set(el, { autoAlpha: 0, y: 34 });
    var play = function () { gsap.to(el, { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, delay: inHero ? 0.35 : 0 }); };
    if (inHero) LIF.whenIntro(play);
  });
  ST.batch($$(".reveal").filter(function (el) { return !el.closest(".page-hero"); }), {
    start: "top 90%", once: true,
    onEnter: function (els) { gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.08, overwrite: true }); }
  });

  /* ---------- Everything else rises in too, so no text or image just sits there ---------- */
  var SKIP = ".reveal, [data-split], .ribbon, .qslide__stage, .programs__media, .option__num, .hero, .phero, .chapter, .page-hero, .menu, .marquee, .words, [data-statement], .genius, .feels, .hscroll, .footer-mark, .stack-card, .footer-top, .meet__stats";
  var autos = [];
  $$("main h2, main h3, main .lede, main .body, main p, main .btn, main .link, main li, main figure, main dl, main form, main details, .site-footer .footer-brand, .site-footer .footer-col").forEach(function (el) {
    if (el.closest(SKIP) || el.closest(".is-auto")) return;
    el.classList.add("is-auto"); autos.push(el);
  });
  if (autos.length) {
    gsap.set(autos, { autoAlpha: 0, y: 28 });
    ST.batch(autos, { start: "top 92%", once: true, onEnter: function (els) { gsap.to(els, { autoAlpha: 1, y: 0, duration: 1, ease: EASE, stagger: 0.07, overwrite: true }); } });
  }
  /* Images settle from a gentle zoom as they scroll in. */
  $$("main img, .site-footer img").forEach(function (img) {
    if (img.closest(".hero, .phero, .ribbon, .programs__img, .topics__float, .inline-img, .marquee, .hero-card, .feature__mock, .tile__badge, .pcc-badge, .cred__badge, .badge-spin")) return;
    var box = img.parentElement, clipped = false;
    for (var k = 0; k < 3 && box; k++, box = box.parentElement) { var o = getComputedStyle(box).overflow; if (o === "hidden" || o === "clip") { clipped = true; break; } }
    if (!clipped) return;
    gsap.set(img, { scale: 1.18, transformOrigin: "50% 50%" });
    var zoom = function () { gsap.to(img, { scale: 1, duration: 1.8, ease: EASE }); };
    if (img.closest(".page-hero")) LIF.whenIntro(zoom);
    else ST.create({ trigger: img.parentElement, start: "top 95%", once: true, onEnter: zoom });
  });

  /* ---------- Image clip reveal + parallax ---------- */
  $$(".media, .stack-card__media, .trait__img, .meet__arch").forEach(function (el) {
    var inHero = el.closest(".page-hero");
    gsap.set(el, { clipPath: "inset(14% 0% 0% 0%)" });
    var play = function () { gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", clearProps: "clipPath" }); };
    if (inHero) LIF.whenIntro(function () { setTimeout(play, 200); });
    else ST.create({ trigger: el, start: "top 92%", once: true, onEnter: play });
  });
  $$("[data-parallax]").forEach(function (el) {
    var host = el.parentElement;
    gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- Statement lights up word by word ---------- */
  $$("[data-statement]").forEach(function (el) {
    var words = $$(".w", el);
    ST.create({
      trigger: el, start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: function (self) {
        var n = Math.round(self.progress * words.length);
        for (var i = 0; i < words.length; i++) words[i].classList.toggle("is-lit", i < n);
      }
    });
  });

  /* ---------- Sound familiar: lines light up one by one ---------- */
  $$(".feel").forEach(function (row) {
    ST.create({ trigger: row, start: "top 72%", onEnter: function () { row.classList.add("is-on"); }, onLeaveBack: function () { row.classList.remove("is-on"); } });
  });

  /* ---------- Zone of genius: steps scroll normally, the diagram stays in view and converges ---------- */
  var venn = $(".venn"), gSteps = $$(".genius__step"), gCount = $(".genius__count b");
  if (venn && gSteps.length) {
    var setStep = function (i) {
      gSteps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      venn.setAttribute("data-step", i);
      if (gCount) gCount.textContent = "0" + (i + 1);
    };
    venn.style.setProperty("--p", 0);
    mm.add("(min-width: 900px)", function () {
      ST.create({
        trigger: ".genius__steps", start: "top 75%", end: "bottom 65%", scrub: true,
        onUpdate: function (self) { venn.style.setProperty("--p", self.progress.toFixed(3)); }
      });
      gSteps.forEach(function (step, i) {
        ST.create({
          trigger: step, start: "top 62%", end: "bottom 62%",
          onEnter: function () { setStep(i); }, onEnterBack: function () { setStep(i); }
        });
      });
    });
    /* Phones: the circles come together as the diagram scrolls into view, then each step lights as you read it. */
    mm.add("(max-width: 899px)", function () {
      ST.create({
        trigger: venn, start: "top 90%", end: "center 45%", scrub: true,
        onUpdate: function (self) {
          var p = self.progress; venn.style.setProperty("--p", p.toFixed(3));
          venn.setAttribute("data-step", p < 0.45 ? 0 : p < 0.9 ? 1 : 2);
        }
      });
      gSteps.forEach(function (step, i) {
        ST.create({
          trigger: step, start: "top 75%", end: "bottom 40%",
          onToggle: function (self) { step.classList.toggle("is-active", self.isActive); }
        });
      });
    });
  }

  /* ---------- Horizontal rows (client wins, about journey): pinned sideways scroll on desktop ---------- */
  $$(".hscroll").forEach(function (hs) {
    var track = $(".hscroll__track", hs), host = hs.closest("section");
    if (!track || !host) return;
    mm.add("(min-width: 900px)", function () {
      hs.classList.add("is-pinned");
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tw = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: host, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.3, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      return function () { hs.classList.remove("is-pinned"); tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(track, { clearProps: "transform" }); };
    });
  });

  /* ---------- Word marquee reacts to scroll speed and direction ---------- */
  var wt = $(".words__track");
  if (wt) {
    var x = 0, dir = -1, speed = 0.6, half = 0;
    var measure = function () { half = wt.scrollWidth / 2; };
    measure(); window.addEventListener("resize", measure);
    var onTick = function () {
      x += dir * speed; speed += (0.6 - speed) * 0.05;
      if (half) { if (x <= -half) x += half; if (x > 0) x -= half; }
      wt.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
    };
    /* Only animate while the band is on screen. */
    ST.create({
      trigger: ".words", start: "top bottom", end: "bottom top",
      onToggle: function (self) { if (self.isActive) gsap.ticker.add(onTick); else gsap.ticker.remove(onTick); },
      onUpdate: function (self) { dir = self.direction === 1 ? -1 : 1; speed = Math.min(6, 0.6 + Math.abs(self.getVelocity()) / 400); }
    });
  }

  /* ---------- Stacking cards shrink as the next one covers them ---------- */
  mm.add("(min-width: 900px)", function () {
    var cards = $$(".stack-card");
    var tws = cards.slice(0, -1).map(function (card, i) {
      return gsap.to(card, { scale: 0.92 + i * 0.02, "--dim": 0.18, ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top 85%", end: "top 120px", scrub: true } });
    });
    return function () { tws.forEach(function (t) { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }); gsap.set(cards, { clearProps: "transform,--dim" }); };
  });

  /* ---------- Photo ribbon: runs on its own like a marquee, speeds up with the scroll, and follows a drag or swipe ---------- */
  $$("[data-ribbon]").forEach(function (tr) {
    var box = tr.parentElement;
    Array.prototype.slice.call(tr.children).forEach(function (el) { tr.appendChild(el.cloneNode(true)); });
    var half = 0, x = 0, vel = 0, boost = 0, down = false, axis = "", sx = 0, sy = 0, lx = 0, lt = 0, onScreen = false, SPEED = 0.6;
    var measure = function () { var first = tr.children[0], mid = tr.children[tr.children.length / 2]; half = mid.offsetLeft - first.offsetLeft; };
    measure(); window.addEventListener("resize", measure); window.addEventListener("load", measure);
    var wrap = function () { if (half) { while (x <= -half) x += half; while (x > 0) x -= half; } };
    ST.create({
      trigger: box, start: "top bottom", end: "bottom top",
      onToggle: function (self) { onScreen = self.isActive; },
      onUpdate: function (self) { boost = Math.min(8, Math.abs(self.getVelocity()) / 300); }
    });
    gsap.ticker.add(function (t, dt) {
      if (!onScreen) return;
      var k = Math.min(3, dt / 16.67);
      if (!down) {
        x -= (SPEED + boost) * k;
        if (Math.abs(vel) > 0.05) { x += vel * k; vel *= Math.pow(0.94, k); }
      }
      boost *= Math.pow(0.92, k);
      wrap();
      tr.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
    });
    box.addEventListener("pointerdown", function (e) {
      down = true; vel = 0; axis = e.pointerType === "mouse" ? "x" : ""; sx = lx = e.clientX; sy = e.clientY; lt = performance.now();
      if (axis) { box.classList.add("is-dragging"); box.setPointerCapture(e.pointerId); }
    });
    box.addEventListener("pointermove", function (e) {
      if (!down) return;
      if (!axis) {
        var dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy);
        if (dx < 6 && dy < 6) return;
        axis = dx > dy ? "x" : "y";
        if (axis === "x") { box.classList.add("is-dragging"); lx = e.clientX; }
      }
      if (axis !== "x") { down = false; return; }
      var now = performance.now(), d = e.clientX - lx;
      x += d; wrap();
      vel = d / Math.max(1, now - lt) * 16; lx = e.clientX; lt = now;
    });
    var up = function () { if (!down) return; down = false; box.classList.remove("is-dragging"); };
    box.addEventListener("pointerup", up); box.addEventListener("pointercancel", up);
  });

  /* ---------- Coaching programmes: the sticky photo follows the option you are reading ---------- */
  var progs = $$(".program"), pImgs = $$(".programs__img"), pNames = $$(".programs__name span"), pBars = $$(".programs__bars i"), pNum = $(".programs__count b");
  if (progs.length && pImgs.length) {
    var cur = 0;
    var setProg = function (i) {
      if (i === cur) return;
      pImgs.forEach(function (im, k) { im.classList.toggle("was-active", k === cur); im.classList.toggle("is-active", k === i); });
      pNames.forEach(function (n, k) { n.classList.toggle("is-active", k === i); });
      pBars.forEach(function (b, k) { b.classList.toggle("is-active", k === i); b.classList.toggle("is-done", k < i); });
      if (pNum) gsap.fromTo(pNum, { yPercent: i > cur ? 60 : -60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: EASE, onStart: function () { pNum.textContent = "0" + (i + 1); } });
      cur = i;
    };
    progs.forEach(function (pr, i) {
      ST.create({ trigger: pr, start: "top 60%", end: "bottom 60%", onEnter: function () { setProg(i); }, onEnterBack: function () { setProg(i); } });
    });
  }

  /* ---------- Option numbers count in (coaching) ---------- */
  $$(".option__num").forEach(function (el) {
    gsap.from(el, { yPercent: 40, autoAlpha: 0, duration: 1.4, ease: EASE, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });

  /* ---------- Footer wordmark rises ---------- */
  var fm = $$(".footer-mark > *");
  if (fm.length) {
    gsap.set(fm, { yPercent: 70, autoAlpha: 0 });
    ST.create({ trigger: ".footer-mark", start: "top 95%", once: true, onEnter: function () { gsap.to(fm, { yPercent: 0, autoAlpha: 1, duration: 1.5, ease: EASE, stagger: 0.1 }); } });
  }

  /* Recalculate once fonts and images have settled. */
  window.addEventListener("load", function () { ST.refresh(); });
  if (document.fonts) document.fonts.ready.then(function () { ST.refresh(); });
})();
