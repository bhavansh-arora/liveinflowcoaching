/* Live in Flow Coaching: core behaviour.
   Works without GSAP. Handles the preloader, page curtain, header, menu,
   hero slideshow, marquees, cursor, magnetic buttons and forms. */
(function () {
  "use strict";
  var html = document.documentElement;
  var body = document.body;
  var cfg = window.SITE_CONFIG || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var store = (function () { try { var s = window.sessionStorage; s.setItem("_t", "1"); s.removeItem("_t"); return s; } catch (e) { return null; } })();

  html.classList.add("motion-ready");
  if (!reduce) html.classList.add("has-motion");

  var LIF = window.LIF = { introDone: false, onIntro: [] };
  function intro() {
    if (LIF.introDone) return;
    LIF.introDone = true;
    LIF.onIntro.forEach(function (fn) { try { fn(); } catch (e) {} });
    document.dispatchEvent(new CustomEvent("lif:intro"));
  }
  LIF.whenIntro = function (fn) { if (LIF.introDone) fn(); else LIF.onIntro.push(fn); };

  /* ---------- Preloader ---------- */
  var pre = $(".preloader");
  if (html.classList.contains("is-loading") && pre) {
    var countEl = $("[data-count]", pre);
    var plWords = $$(".preloader__words span", pre);
    var t0 = performance.now(), MIN = 2500, MAX = 4200, shown = 0;
    var fontsReady = false, imgReady = false;
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { fontsReady = true; });
    var heroImg = $(".hero img, .phero img, .page-hero img");
    if (!heroImg || heroImg.complete) imgReady = true;
    else { heroImg.addEventListener("load", function () { imgReady = true; }); heroImg.addEventListener("error", function () { imgReady = true; }); }
    (function tick(now) {
      var el = now - t0;
      var ready = (fontsReady && imgReady) || el > MAX;
      var target = Math.min(ready ? 100 : 88, (el / MIN) * 100);
      shown += (target - shown) * 0.09 + 0.15;
      if (shown > target) shown = target;
      var p = Math.round(shown);
      if (countEl) countEl.textContent = p;
      pre.style.setProperty("--p", (shown / 100).toFixed(3));
      plWords.forEach(function (w, i) { w.classList.toggle("is-lit", p >= (i + 1) * 25 - 12); });
      if (ready && p >= 100 && el > MIN) return leave();
      requestAnimationFrame(tick);
    })(t0);
    function leave() {
      if (store) store.setItem("lif-seen", "1");
      pre.classList.add("is-done");
      setTimeout(function () {
        var anim = pre.animate(
          [{ clipPath: "inset(0 0 0 0 round 0)" }, { clipPath: "inset(0 0 100% 0 round 0 0 40% 40%)" }],
          { duration: 1000, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
        setTimeout(intro, 420);
        anim.onfinish = function () { html.classList.remove("is-loading"); pre.style.display = "none"; };
      }, 420);
    }
  } else if (html.classList.contains("is-entering")) {
    if (store) store.removeItem("lif-nav");
    var cur = $(".curtain");
    var go = function () {
      $$(".curtain__inner > *", cur).forEach(function (el, i) {
        el.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-40px)" }], { duration: 500, delay: i * 40, easing: "cubic-bezier(.7,0,.84,0)", fill: "forwards" });
      });
      var a = cur.animate(
        [{ transform: "translateY(0)", borderRadius: "0" }, { transform: "translateY(-101%)", borderRadius: "0 0 50% 50% / 0 0 18% 18%" }],
        { duration: 900, delay: 180, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
      setTimeout(intro, 300);
      a.onfinish = function () { html.classList.remove("is-entering"); cur.getAnimations({ subtree: true }).forEach(function (x) { x.cancel(); }); };
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { setTimeout(go, 120); });
  } else {
    if (store) store.setItem("lif-seen", "1");
    requestAnimationFrame(intro);
  }

  /* Fetch internal pages early (on hover or touch) so the next page is ready the moment the curtain closes. */
  var fetched = {};
  function prefetch(href) {
    if (fetched[href]) return; fetched[href] = 1;
    var l = document.createElement("link"); l.rel = "prefetch"; l.href = href; document.head.appendChild(l);
  }
  ["mouseover", "touchstart", "focusin"].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var a = e.target.closest && e.target.closest("a[href$='.html'], a[href*='.html#']");
      if (a && a.origin === location.origin && !a.target) prefetch(a.href.split("#")[0]);
    }, { passive: true });
  });

  /* ---------- Page curtain on internal links ---------- */
  var titles = {
    "index.html": "<em>Home</em>", "about.html": "About <em>Maria</em>", "coaching.html": "1:1 <em>Coaching</em>",
    "workshops.html": "Team <em>Workshops</em>", "stories.html": "Client <em>wins</em>", "roadmap.html": "Free <em>roadmap</em>",
    "contact.html": "Let's <em>talk</em>"
  };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || /^(mailto|tel):/.test(a.getAttribute("href"))) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (url.href === location.href) { e.preventDefault(); return; }
    var file = url.pathname.split("/").pop() || "index.html";
    if (!/\.html$/.test(file)) return;
    e.preventDefault();
    closeMenu();
    var cur = $(".curtain"), t = $(".curtain__title", cur);
    if (t) t.innerHTML = titles[file] || "";
    if (store) store.setItem("lif-nav", "1");
    cur.classList.add("is-on");
    cur.animate(
      [{ transform: "translateY(101%)", borderRadius: "50% 50% 0 0 / 18% 18% 0 0" }, { transform: "translateY(0)", borderRadius: "0" }],
      { duration: 750, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
    $$(".curtain__inner > *", cur).forEach(function (el, i) {
      el.animate([{ opacity: 0, transform: "translateY(40px)" }, { opacity: 1, transform: "none" }], { duration: 520, delay: 200 + i * 60, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
    });
    prefetch(url.href);
    /* Navigate only once the curtain and its text have fully settled, so nothing jumps when the next page takes over. */
    setTimeout(function () { location.href = url.href; }, 900);
  });
  /* Returning with the back button from bfcache: make sure nothing is covered. */
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    html.classList.remove("is-entering", "is-loading");
    var cur = $(".curtain");
    if (cur) { cur.classList.remove("is-on"); cur.getAnimations().forEach(function (x) { x.cancel(); }); }
    $$(".curtain__inner > *").forEach(function (el) { el.getAnimations().forEach(function (x) { x.cancel(); }); });
  });

  /* ---------- Header: hide on scroll down, scroll progress, sticky CTA ---------- */
  var header = $(".site-header"), sticky = $(".sticky-cta"), bar = $(".scroll-progress"), footer = $(".site-footer");
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) {
      if (y > 400 && y > lastY + 4 && !body.classList.contains("menu-open")) header.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 400) header.classList.remove("is-hidden");
    }
    if (bar) bar.style.setProperty("--sp", max > 0 ? (y / max).toFixed(4) : 0);
    if (sticky) {
      var nearFooter = footer && footer.getBoundingClientRect().top < window.innerHeight;
      sticky.classList.toggle("is-visible", y > 640 && !nearFooter);
    }
    lastY = y; ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $(".menu-btn"), menu = $("#menu");
  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    requestAnimationFrame(function () { body.classList.add("menu-open"); });
    menuBtn.setAttribute("aria-expanded", "true");
    $(".menu-btn__label", menuBtn).textContent = "Close";
    header.classList.remove("is-hidden");
  }
  function closeMenu() {
    if (!menu || !body.classList.contains("menu-open")) return;
    body.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded", "false");
    $(".menu-btn__label", menuBtn).textContent = "Menu";
    setTimeout(function () { if (!body.classList.contains("menu-open")) menu.hidden = true; }, 700);
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { body.classList.contains("menu-open") ? closeMenu() : openMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  window.addEventListener("resize", function () { if (window.innerWidth >= 1100) closeMenu(); });

  /* ---------- Hero slideshow + rotator ---------- */
  var slides = $$(".hero__slide"), count = $(".hero__count"), heroBar = $(".hero__bar i");
  if (slides.length > 1 && !reduce) {
    var idx = 0, DUR = 6000;
    var run = function () {
      if (heroBar) heroBar.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: DUR, easing: "linear" });
      setTimeout(function () {
        slides[idx].classList.remove("is-active");
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add("is-active");
        if (count) count.textContent = "0" + (idx + 1);
        run();
      }, DUR);
    };
    LIF.whenIntro(run);
  }
  var rot = $(".rotator__track");
  if (rot && !reduce) {
    var words = $$(".rotator__word", rot), ri = 0;
    setInterval(function () {
      ri = (ri + 1) % words.length;
      rot.style.transform = "translateY(" + (-ri * 1.25) + "em)";
    }, 2600);
  }

  /* ---------- Marquee: duplicate content so the loop is seamless ---------- */
  $$(".marquee__track").forEach(function (t) { t.innerHTML += t.innerHTML; $$("span", t).slice(t.children.length / 2).forEach(function (s) { s.setAttribute("aria-hidden", "true"); }); });

  /* ---------- Cursor + magnetic buttons (mouse only) ---------- */
  if (fine && !reduce) {
    var cursor = $(".cursor"), label = $(".cursor__label");
    var mx = -100, my = -100, cx = -100, cy = -100;
    html.classList.add("has-cursor");
    var raf = 0;
    /* The follow loop runs only while the cursor is catching up, then sleeps. */
    var loop = function () {
      cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
      cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      raf = (Math.abs(mx - cx) + Math.abs(my - cy) > 0.3) ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      var lab = t.closest && t.closest("[data-cursor]");
      var dark = t.closest && t.closest("[data-theme='dark'], .menu");
      cursor.classList.toggle("is-dark", !!dark);
      cursor.classList.toggle("is-label", !!lab);
      label.textContent = lab ? lab.getAttribute("data-cursor") : "";
      cursor.classList.toggle("is-hidden", !lab && !!(t.closest && t.closest("input, textarea, select, iframe")));
    });
    document.addEventListener("mouseleave", function () { cursor.classList.add("is-hidden"); });
    document.addEventListener("mouseenter", function () { cursor.classList.remove("is-hidden"); });

    $$(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22, y = (e.clientY - r.top - r.height / 2) * 0.3;
        el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Scroll-to-top links ---------- */
  $$("[data-scroll-top]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      var f = $("form input");
      if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, reduce ? 0 : 700);
    });
  });

  /* ---------- Forms ---------- */
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || "").trim()); }
  function send(payload) {
    if (!cfg.formEndpoint) return Promise.resolve("mailto");
    return fetch(cfg.formEndpoint, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload)
    }).then(function (r) { return r.ok ? "sent" : "error"; }).catch(function () { return "error"; });
  }
  function mailto(subject, text) {
    location.href = "mailto:" + (cfg.email || "") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
  }
  $$("form[data-form]").forEach(function (form) {
    var msg = $(".form-msg", form), kind = form.getAttribute("data-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = null;
      $$("[required]", form).forEach(function (f) {
        var ok = f.type === "email" ? validEmail(f.value) : f.value.trim().length > 0;
        f.classList.toggle("is-invalid", !ok);
        f.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok && !bad) bad = f;
      });
      if (bad) {
        msg.classList.add("is-error");
        msg.textContent = bad.type === "email" ? "Please add a valid email address." : "Please fill in the highlighted field.";
        bad.focus();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.form = kind; data.page = location.pathname;
      msg.classList.remove("is-error");
      msg.textContent = "Sending...";
      var btn = $("button[type=submit]", form); btn.disabled = true;
      send(data).then(function (res) {
        btn.disabled = false;
        if (res === "mailto") {
          if (kind === "roadmap") mailto("Please send me the 5-Step Roadmap", "Hi Maria,\n\nI'd love a copy of The Practical 5-Step Roadmap to Accelerate Your Tech Career.\n\nName: " + data.name + "\nEmail: " + data.email + "\n");
          else mailto("Coaching enquiry: " + (data.topic || ""), "Hi Maria,\n\n" + data.message + "\n\n" + data.name + "\n" + data.email + "\n");
          msg.textContent = "Your email app should open with your message ready to send.";
        } else if (res === "sent") {
          form.reset();
          msg.textContent = kind === "roadmap" ? "Thank you! The roadmap is on its way to your inbox." : "Thank you! Maria will get back to you soon.";
        } else {
          msg.classList.add("is-error");
          msg.innerHTML = 'Something went wrong. Please email <a class="inline-link" href="mailto:' + cfg.email + '">' + cfg.email + "</a>.";
        }
      });
    });
    $$("[required]", form).forEach(function (f) { f.addEventListener("input", function () { f.classList.remove("is-invalid"); f.removeAttribute("aria-invalid"); }); });
  });
})();
