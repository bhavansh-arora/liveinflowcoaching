# Live in Flow Coaching: website

A multi-page site for Maria Angoso's career transition coaching practice, built to turn visitors into booked calls and roadmap sign-ups. All copy, client stories, photos and links come from liveinflowcoaching.com.

**Pages:** Home · About · Coaching · Workshops · Client wins · Free roadmap · Contact · 404

## Preview

```
python3 -m http.server 8000      # then open http://localhost:8000
```

It's a plain static site, so any static host works: Netlify, Vercel, Cloudflare Pages or GitHub Pages. The preloader shows once per browser session. Open a private window to see it again.

## What's in it

- **Preloader:** a paper boat sails along a wave as the counter runs to 100. The boat comes from Maria's logo.
- **Page curtain:** a sea-teal curtain carries the next page's name between pages.
- **Home:** a full-height hero slideshow with a rotating "Get clarity · Feel confident · Find your flow" line and a floating free-guide card. Below it: a statement that lights up word by word, a client marquee, a bento grid of the coaching paths, a pinned "zone of genius" section where three circles merge into *Flow*, client wins that scroll sideways, a word marquee that reacts to scroll speed, stacking "how it works" cards, testimonials and a roadmap band.
- **Throughout:** headline word reveals, image reveals and parallax, a custom cursor and magnetic buttons (mouse only), a scroll progress line, a header that hides on scroll, a full-screen mobile menu and a sticky "Book a call" button on phones.
- Scrolling stays native, with no scroll-jacking. With "reduce motion" switched on, all animation is off. If a script fails to load, every page still reads and works.
- GSAP and ScrollTrigger live in `assets/vendor/`, and the fonts (Inter Tight, Instrument Serif, Geist Mono) are self-hosted in `assets/fonts/`, so the site needs no CDN.

## Editing

The HTML files in the root are generated. Edit the files in `src/`, then rebuild:

```
node build.mjs                   # Node 18+, no dependencies
```

| What you want to change | Where |
| --- | --- |
| Booking link, email, bio PDF, social links | `src/site.json` |
| Page content | `src/pages/*.html` |
| Header, menu, footer, client marquee | `src/partials/` |
| Colours, type, layout | `assets/css/main.css` (tokens at the top) |
| Where forms are sent | `assets/js/config.js` |

Images are responsive WebP files in `assets/img/`, listed in `src/images.json`.

## Before launch

- **Forms.** The roadmap sign-up and the contact form open a pre-filled email to Maria until `formEndpoint` in `assets/js/config.js` is set. Point it at Maria's email tool (MailerLite, ConvertKit, Formspree, a Dubsado webhook) so the roadmap PDF is sent automatically.
- **Booking.** "Book a call" buttons open Maria's existing Dubsado scheduler. The workshop "Contact Maria" button opens her Dubsado workshop form.
- **Check with Maria:** the "400+ clients" and "1,500+ hours" figures come from different pages of her current site. Clients on the Client wins page appear the way they do on her current site (first names or initials).
