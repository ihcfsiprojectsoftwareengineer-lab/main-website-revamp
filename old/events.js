/* Events – renders everything from events.json (used by events.html and event-details.html) */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const fmt = iso => { const [y, m, d] = iso.split('-'); return `${d}-${MON[m - 1]}-${y}`; };
  const dateText = e => (!e.endDate || e.endDate === e.startDate) ? fmt(e.startDate) : `${fmt(e.startDate)} to ${fmt(e.endDate)}`;
  const yearsOf = e => {
    const a = +e.startDate.slice(0, 4), b = +(e.endDate || e.startDate).slice(0, 4), out = [];
    for (let y = a; y <= b; y++) out.push(String(y));
    return out;
  };
  const gallery = e => (e.gallery || []).map(g => typeof g === 'string' ? { src: g } : g);
  const img = (src, alt = '') => src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.remove()">` : '';
  const ext = (url, cls, label, glyph) => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(label)}">${glyph}</a>`;

  /* ---------- Gallery lightbox (opens on the same page) ---------- */
  let lb, items = [], idx = 0, opener = null;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo gallery');
    lb.innerHTML = `
      <button type="button" class="lb-btn lb-close" aria-label="Close gallery">&times;</button>
      <button type="button" class="lb-btn lb-prev" aria-label="Previous photo">&#8249;</button>
      <div class="lb-stage"><img alt=""></div>
      <p class="lb-cap"></p>
      <button type="button" class="lb-btn lb-next" aria-label="Next photo">&#8250;</button>`;
    document.body.append(lb);
    lb.addEventListener('click', e => {
      if (e.target.closest('.lb-prev')) step(-1);
      else if (e.target.closest('.lb-next')) step(1);
      else if (!e.target.closest('img, .lb-cap')) closeLb();
    });
  }
  function showLb() {
    const it = items[idx];
    const im = $('img', lb);
    im.src = it.src;
    im.alt = it.caption || '';
    $('.lb-cap', lb).textContent = (it.caption ? it.caption + '  ·  ' : '') + `${idx + 1} / ${items.length}`;
    lb.querySelectorAll('.lb-prev, .lb-next').forEach(b => b.hidden = items.length < 2);
  }
  function step(d) { idx = (idx + d + items.length) % items.length; showLb(); }
  function openLb(list, i, from) {
    if (!list.length) return;
    if (!lb) buildLightbox();
    items = list; idx = i; opener = from;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    showLb();
    $('.lb-close', lb).focus();
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (opener) opener.focus();
  }
  document.addEventListener('keydown', e => {
    if (!lb || lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'Tab') {
      const f = [...lb.querySelectorAll('button')].filter(b => !b.hidden);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Data helpers ---------- */
  async function load() {
    const res = await fetch('events.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('events.json returned ' + res.status);
    const data = await res.json();
    data.types = { ...(data.types || {}) };
    data.events.forEach(e => { if (!data.types[e.type]) data.types[e.type] = e.type; });
    data.page = data.settings?.detailsPage || 'event-details.html';
    return data;
  }
  const detailsHref = (e, data) => e.detailsUrl || (e.details ? `${data.page}?id=${encodeURIComponent(e.id)}` : '');

  /* ---------- Listing page ---------- */
  function renderList(data) {
    const grid = $('#events-grid'), empty = $('.no-results'), type = $('#f-type'), year = $('#f-year');
    const events = [...data.events].sort((a, b) => b.startDate.localeCompare(a.startDate));
    const byId = Object.fromEntries(events.map(e => [e.id, e]));
    const years = [...new Set(events.flatMap(yearsOf))].sort();

    type.innerHTML = '<option value="all">All Event Type</option>' +
      Object.entries(data.types).map(([k, v]) => `<option value="${esc(k)}">${esc(v)}</option>`).join('');
    year.innerHTML = '<option value="all">All</option>' + years.map(y => `<option>${y}</option>`).join('');

    grid.innerHTML = events.map(e => {
      const href = detailsHref(e, data), g = gallery(e), t = esc(e.title);
      return `<li class="card event" data-type="${esc(e.type)}" data-years="${yearsOf(e).join(' ')}">
        <span class="tag">${esc(data.types[e.type])}</span>
        <div class="card-img" aria-hidden="true">${img(e.image)}</div>
        <h3>${href ? `<a href="${esc(href)}">${t}</a>` : t}</h3>
        <p class="date"><span class="cal"></span>${dateText(e)}</p>
        <p class="venue">Venue: ${esc(e.venue)}</p>
        <div class="actions">
          ${g.length ? `<button type="button" class="pill" data-gallery="${esc(e.id)}" aria-label="Open photo gallery: ${t}">&#9636;</button>` : ''}
          ${e.videoUrl ? ext(e.videoUrl, 'pill', 'Watch video: ' + e.title, '&#9654;') : ''}
          ${e.linkUrl ? ext(e.linkUrl, 'pill', 'Open link: ' + e.title, '&#128279;') : ''}
          ${e.brochureUrl ? ext(e.brochureUrl, 'pill', 'Download brochure: ' + e.title, '&#128196;') : ''}
          ${href ? `<a class="pill" href="${esc(href)}" aria-label="View details: ${t}">&bull;&bull;&bull;</a>` : ''}
        </div>
      </li>`;
    }).join('');

    const cards = grid.querySelectorAll('.event');
    function apply() {
      let shown = 0;
      cards.forEach(el => {
        const ok = (type.value === 'all' || el.dataset.type === type.value) &&
                   (year.value === 'all' || el.dataset.years.split(' ').includes(year.value));
        el.hidden = !ok;
        if (ok) shown++;
      });
      empty.textContent = 'No events match these filters.';
      empty.hidden = shown > 0;
    }
    type.addEventListener('change', apply);
    year.addEventListener('change', apply);
    apply();

    grid.addEventListener('click', e => {
      const b = e.target.closest('[data-gallery]');
      if (b) openLb(gallery(byId[b.dataset.gallery]), 0, b);
    });
  }

  /* ---------- Detail page ---------- */
  function renderDetail(data) {
    const out = $('#event-content');
    const id = new URLSearchParams(location.search).get('id');
    const e = data.events.find(x => x.id === id);

    if (e && !e.details && e.detailsUrl) { location.replace(e.detailsUrl); return; }
    if (!e || !e.details) {
      out.innerHTML = '<p class="no-results container">We could not find this event. <a href="events.html"><u>Back to all events</u></a></p>';
      return;
    }

    const d = e.details, g = gallery(e), label = data.types[e.type];
    document.title = `${e.title} – IHCFSI`;
    $('#banner-title').textContent = label;
    $('#crumb').textContent = e.title;

    const para = p => `<p>${esc(p)}</p>`;
    const hasAbout = (d.subtitle && d.subtitle.length) || (d.sections && d.sections.length);
    const reach = d.howToReach || {};
    const contacts = (d.contacts || []).map(c => `
      <p class="contact"><b>${esc(c.name)}${c.role ? ', ' + esc(c.role) : ''}</b>
        ${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ''}
        ${c.phone ? `<span>${esc(c.phone)}</span>` : ''}</p>`).join('');

    out.innerHTML = `
      <div class="container">
        <section class="detail-hero">
          <div class="poster">
            <span class="tag">${esc(label)}</span>
            ${img(e.image, e.title)}
          </div>
          <div class="hero-info">
            <h2>${esc(e.title)}</h2>
            <p class="date"><span class="cal"></span>${dateText(e)}</p>
            <p class="venue">${esc(e.venue)}</p>
            <div class="hero-actions">
              ${e.registerUrl ? `<a class="btn" href="${esc(e.registerUrl)}" target="_blank" rel="noopener">Register now</a>` : ''}
              ${g.length ? `<button type="button" class="btn alt" data-open-gallery>View gallery (${g.length})</button>` : ''}
              ${e.videoUrl ? ext(e.videoUrl, 'btn alt', 'Watch video', 'Watch video') : ''}
              ${e.brochureUrl ? ext(e.brochureUrl, 'btn alt', 'Download brochure', 'Brochure') : ''}
            </div>
          </div>
        </section>

        <div class="detail-body">
          <div class="detail-main">
            ${hasAbout ? `<section class="panel">
              <h2>About ${esc(label)}</h2>
              <h3 class="event-name">${esc(e.title)}</h3>
              ${(d.subtitle || []).map(s => `<p class="subtitle">${esc(s)}</p>`).join('')}
              ${(d.sections || []).map(s => `
                <h3>${esc(s.heading)}</h3>
                ${(s.paragraphs || []).map(para).join('')}
                ${s.bullets && s.bullets.length ? `<ul>${s.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}`).join('')}
            </section>` : ''}

            ${d.faqs && d.faqs.length ? `<section class="panel faq">
              <h2>Frequently asked questions</h2>
              ${d.faqs.map(f => `<details><summary>${esc(f.q)}</summary>${para(f.a)}</details>`).join('')}
            </section>` : ''}

            ${g.length ? `<section class="panel" id="gallery">
              <h2>Photo gallery</h2>
              <div class="gallery-grid">
                ${g.map((p, i) => `<button type="button" class="thumb" data-i="${i}" aria-label="Open photo ${i + 1}${p.caption ? ': ' + esc(p.caption) : ''}">${img(p.src, p.caption || '')}</button>`).join('')}
              </div>
            </section>` : ''}

            <section class="panel reach">
              <h2>How to reach</h2>
              <p><b>Venue</b></p>
              <p>${esc(reach.venue || e.venue)}</p>
              ${reach.address ? para(reach.address) : ''}
              ${reach.mapUrl ? `<p><a href="${esc(reach.mapUrl)}" target="_blank" rel="noopener"><u>View location on map</u></a></p>` : ''}
            </section>
          </div>

          <aside class="info-box" aria-label="Event information">
            <h2>Information</h2>
            <p class="row"><span class="cal"></span>${dateText(e)}</p>
            <p class="row">${esc(e.venue)}</p>
            ${e.registerUrl ? `<p class="row"><a href="${esc(e.registerUrl)}" target="_blank" rel="noopener">Click here to register</a></p>` : ''}
            ${e.fees ? `<hr><p><b>Fees:</b> ${esc(e.fees)}</p>` : ''}
            ${contacts ? `<hr><h2>Contact details</h2>${contacts}` : ''}
          </aside>
        </div>
      </div>`;

    out.addEventListener('click', ev => {
      const t = ev.target.closest('.thumb');
      if (t) return openLb(g, +t.dataset.i, t);
      const b = ev.target.closest('[data-open-gallery]');
      if (b) openLb(g, 0, b);
    });
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }

  /* ---------- Start ---------- */
  const detail = document.body.dataset.page === 'details';
  load().then(d => detail ? renderDetail(d) : renderList(d)).catch(err => {
    console.error(err);
    const msg = 'Could not load events.json. Open the site through your server (for example http://localhost:3000), not as a file.';
    const box = detail ? $('#event-content') : $('.no-results');
    box.innerHTML = msg; box.hidden = false;
    box.className = 'no-results container';
  });
})();