/* Page interactions – vanilla JS, no dependencies */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var body = document.body;

  function store(key, val) {
    try {
      if (val === undefined) return sessionStorage.getItem(key);
      sessionStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------- Header ---------- */
  var header = $('#header');
  // Reuse the applied project's header logo in the footer as well.
  var projectLogo = $('.logo', header), footerLogo = $('.footer-brand');
  if (projectLogo && footerLogo) {
    footerLogo.replaceChildren.apply(footerLogo, Array.from(projectLogo.childNodes, function (node) {
      return node.cloneNode(true);
    }));
    footerLogo.setAttribute('aria-label', projectLogo.getAttribute('aria-label') || 'Project home');
  }
  function onScroll() { header.classList.toggle('is-solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('#nav a').forEach(function (a) {
    a.addEventListener('click', function () {
      body.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Active nav + reveal + counters ---------- */
  if ('IntersectionObserver' in window) {
    var links = $$('#nav a');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });

    var rev = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-count]', e.target).forEach(countUp);
        rev.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { rev.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    var suffix = el.getAttribute('data-suffix') || '';
    var start = null, dur = 1400;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Tabs helper ---------- */
  function selectTab(group, btn) {
    $$('button', group).forEach(function (b) { b.setAttribute('aria-selected', b === btn); });
  }

  /* ---------- Hero form tabs (prefill message) ---------- */
  $$('.lead-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      selectTab(b.parentNode, b);
      var msg = $('#qMessage');
      if (msg) msg.value = b.getAttribute('data-msg');
    });
  });

  /* ---------- About: know more ---------- */
  var aboutBtn = $('#about-toggle');
  aboutBtn.addEventListener('click', function () {
    var open = $('#about-more').classList.toggle('open');
    aboutBtn.setAttribute('aria-expanded', open);
    aboutBtn.firstChild.textContent = open ? 'Show Less ' : 'Know More ';
  });

  /* ---------- Floor plans ---------- */
  var plans = [
    { name: '3 BHK Premium', size: '1,758 Sq. Ft.', img: 'images/floorplan-3bhk.webp', feats: ['Efficient Layout', 'Spacious Living & Dining', 'Large Bedrooms'] },
    { name: '3 BHK + Staff', size: '2,700 Sq. Ft.', img: 'images/floorplan-3bhk.webp', feats: ['Dedicated Staff Room', 'Wraparound Balconies', 'Walk-in Wardrobe in Master'] },
    { name: '4 BHK Luxury', size: '3,150 Sq. Ft.', img: 'images/floorplan-4bhk.webp', feats: ['Four En-suite Bedrooms', 'Grand Living & Dining', 'Separate Family Lounge'] },
    { name: '4 BHK + Staff', size: '3,600 Sq. Ft.', img: 'images/floorplan-4bhk.webp', feats: ['Private Foyer Entrance', 'Staff Room with Toilet', 'Panoramic Corner Views'] }
  ];
  var fpIndex = 0, fpTabs = $('#fp-tabs'), fpImg = $('#fp-img');
  function showPlan(i) {
    fpIndex = (i + plans.length) % plans.length;
    var p = plans[fpIndex];
    selectTab(fpTabs, $$('button', fpTabs)[fpIndex]);
    $('#fp-name').textContent = p.name;
    $('#fp-size').textContent = p.size;
    $('#fp-feats').innerHTML = p.feats.map(function (f) { return '<li>' + f.replace('&', '&amp;') + '</li>'; }).join('');
    if (fpImg.getAttribute('src') !== p.img) {
      fpImg.style.opacity = 0;
      setTimeout(function () { fpImg.src = p.img; fpImg.style.opacity = 1; }, 200);
    }
    fpImg.alt = p.name + ' floor plan – ' + p.size;
  }
  $$('button', fpTabs).forEach(function (b, i) { b.addEventListener('click', function () { showPlan(i); }); });
  $('#fp-prev').addEventListener('click', function () { showPlan(fpIndex - 1); });
  $('#fp-next').addEventListener('click', function () { showPlan(fpIndex + 1); });

  /* ---------- Carousels (amenities, gallery, price on mobile) ---------- */
  function slide(track, dir) {
    var item = $$(':scope > *', track).filter(function (el) { return el.offsetWidth; })[0];
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    var step = item ? item.getBoundingClientRect().width + gap : track.clientWidth;
    var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    if (dir > 0 && atEnd) track.scrollTo({ left: 0 });
    else if (dir < 0 && track.scrollLeft <= 4) track.scrollTo({ left: track.scrollWidth });
    else track.scrollBy({ left: dir * step });
  }
  $$('.carousel [data-dir]').forEach(function (b) {
    b.addEventListener('click', function () { slide($('.track', b.parentNode), +b.getAttribute('data-dir')); });
  });

  var priceGrid = $('#price-grid'), dotsBox = $('#price-dots');
  var cards = $$('.price-card', priceGrid);
  dotsBox.innerHTML = cards.map(function () { return '<button type="button" tabindex="-1"></button>'; }).join('');
  var dots = $$('button', dotsBox);
  function syncDots() {
    var i = Math.round(priceGrid.scrollLeft / ((cards[0].offsetWidth + 14) || 1));
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i); });
  }
  priceGrid.addEventListener('scroll', syncDots, { passive: true });
  dots.forEach(function (d, k) { d.addEventListener('click', function () { priceGrid.scrollTo({ left: cards[k].offsetLeft - priceGrid.offsetLeft }); }); });
  $('#price-next').addEventListener('click', function () { slide(priceGrid, 1); });
  syncDots();

  /* ---------- Map (loads Google Maps only on demand) ---------- */
  $('#map-load').addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=Gurugram,Haryana&output=embed';
    f.title = 'Project location on Google Maps';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    var map = $('#map');
    map.innerHTML = '';
    map.appendChild(f);
  });

  /* ---------- Gallery filter + lightbox ---------- */
  var items = $$('.g-item'), galTabs = $('#gal-tabs');
  $$('button', galTabs).forEach(function (b) {
    b.addEventListener('click', function () {
      selectTab(galTabs, b);
      var f = b.getAttribute('data-f');
      items.forEach(function (it) { it.classList.toggle('hide', f !== 'all' && it.getAttribute('data-cat') !== f); });
    });
  });

  var lb = $('#lightbox'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbIndex = 0;
  function visibleItems() { return items.filter(function (it) { return !it.classList.contains('hide'); }); }
  function showLb(i) {
    var list = visibleItems();
    lbIndex = (i + list.length) % list.length;
    var it = list[lbIndex];
    lbImg.src = it.getAttribute('data-full');
    lbImg.alt = it.querySelector('img').alt;
    lbCap.textContent = it.getAttribute('data-label') + '  ·  ' + (lbIndex + 1) + ' / ' + list.length;
  }
  items.forEach(function (it) {
    it.addEventListener('click', function () { showLb(visibleItems().indexOf(it)); openLayer(lb); });
  });
  $('#lb-prev').addEventListener('click', function () { showLb(lbIndex - 1); });
  $('#lb-next').addEventListener('click', function () { showLb(lbIndex + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLayer(lb); });

  /* ---------- Popup ---------- */
  var modal = $('#modal'), lastFocus = null;
  function openLayer(el) {
    lastFocus = document.activeElement;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
  }
  function closeLayer(el) {
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  function openPopup(title) {
    $('#modal-title').textContent = title || 'Enquire Now';
    var msg = $('#qMessagepopup');
    if (msg && !msg.dataset.touched) msg.value = title && title !== 'Enquire Now' ? 'Interested in: ' + title : '';
    openLayer(modal);
    store('popupSeen', '1');
    setTimeout(function () { $('#qSenderNamepopup').focus({ preventScroll: true }); }, 300);
  }
  $('#qMessagepopup').addEventListener('input', function () { this.dataset.touched = '1'; });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-popup]');
    if (t) { e.preventDefault(); openPopup(t.getAttribute('data-popup')); return; }
    if (e.target.closest('[data-close]')) closeLayer(e.target.closest('.modal, .lightbox'));
  });
  $('.fp-media').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPopup('View Floor Plan'); }
  });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeLayer(modal); });
  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('open')) {
      if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
      if (e.key === 'ArrowRight') showLb(lbIndex + 1);
    }
    if (e.key === 'Escape') {
      if (modal.classList.contains('open')) closeLayer(modal);
      if (lb.classList.contains('open')) closeLayer(lb);
    }
  });

  // Auto-open once per session after 15s (skipped if the visitor is typing in a form)
  setTimeout(function () {
    var typing = document.activeElement && document.activeElement.classList.contains('form-control');
    if (!store('popupSeen') && !typing && !modal.classList.contains('open') && !lb.classList.contains('open')) openPopup('Get Exclusive Offers');
  }, 15000);
})();
