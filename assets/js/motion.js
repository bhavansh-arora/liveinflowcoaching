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
    var play = function () { gsap.to(words, { yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.05 }); };
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
      tl.to(heroLines, { yPercent: 0, duration: 1.4, ease: EASE, stagger: 0.12 })
        .to(".hero__eyebrow", { autoAlpha: 1, y: 0, duration: 1, ease: EASE }, 0.2)
        .to(".hero__foot", { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE }, 0.55)
        .to([".hero-card", ".hero__dots"], { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.1 }, 0.75);
    });
    mm.add("(min-width: 900px)", function () {
      gsap.to(".hero__slides", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero__content", { yPercent: -10, autoAlpha: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
    });
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

  /* ---------- Image clip reveal + parallax ---------- */
  $$(".media, .stack-card__media, .trait__img").forEach(function (el) {
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

  /* ---------- Zone of genius: circles converge as you scroll ---------- */
  var genius = $(".genius"), venn = $(".venn");
  if (genius && venn) {
    var steps = $$(".genius__step");
    var setP = function (p) {
      venn.style.setProperty("--p", p.toFixed(3));
      var a = p < 0.34 ? 0 : p < 0.72 ? 1 : 2;
      steps.forEach(function (s, i) { s.classList.toggle("is-active", i === a); });
    };
    setP(0);
    mm.add("(min-width: 900px)", function () {
      genius.classList.add("genius--pinned");
      var st = ST.create({ trigger: genius.parentElement, start: "top top", end: "+=140%", pin: true, scrub: 0.6, onUpdate: function (self) { setP(self.progress); } });
      return function () { genius.classList.remove("genius--pinned"); st.kill(); };
    });
    mm.add("(max-width: 899px)", function () {
      var st = ST.create({ trigger: venn, start: "top 85%", end: "bottom 40%", scrub: 0.6, onUpdate: function (self) { setP(self.progress); } });
      steps.forEach(function (s) { s.classList.add("is-active"); });
      return function () { st.kill(); };
    });
  }

  /* ---------- Client wins: pinned horizontal scroll on desktop ---------- */
  var hs = $(".hscroll"), track = $(".hscroll__track");
  if (hs && track) {
    mm.add("(min-width: 900px)", function () {
      hs.classList.add("is-pinned");
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tw = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: ".wins", start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      return function () { hs.classList.remove("is-pinned"); tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(track, { clearProps: "transform" }); };
    });
  }

  /* ---------- Word marquee reacts to scroll speed and direction ---------- */
  var wt = $(".words__track");
  if (wt) {
    var x = 0, dir = -1, speed = 0.6, half = 0;
    var measure = function () { half = wt.scrollWidth / 2; };
    measure(); window.addEventListener("resize", measure);
    ST.create({ trigger: ".words", start: "top bottom", end: "bottom top", onUpdate: function (self) { dir = self.direction === 1 ? -1 : 1; speed = Math.min(6, 0.6 + Math.abs(self.getVelocity()) / 400); } });
    gsap.ticker.add(function () {
      x += dir * speed; speed += (0.6 - speed) * 0.05;
      if (half) { if (x <= -half) x += half; if (x > 0) x -= half; }
      wt.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
    });
  }

  /* ---------- Stacking cards shrink as the next one covers them ---------- */
  mm.add("(min-width: 900px)", function () {
    var cards = $$(".stack-card");
    var tws = cards.slice(0, -1).map(function (card, i) {
      return gsap.to(card, { scale: 0.94 + i * 0.012, filter: "brightness(0.92)", ease: "none", scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 140px", scrub: true } });
    });
    return function () { tws.forEach(function (t) { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }); gsap.set(cards, { clearProps: "transform,filter" }); };
  });

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
