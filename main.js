// Petite file d'attente pour décaler les scripts non-critiques après le premier rendu
const runIdle = (cb, delay = 400) => {
  const runner = () => { try { cb(); } catch (err) { /* no-op */ } };
  (window.requestIdleCallback || ((fn) => setTimeout(fn, delay)))(runner);
};

// ===== Burger menu (décalé à l'idle pour réduire le travail main thread) ====
runIdle(() => {
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('#site-nav');
  if (!burger || !nav) return;

  const open = () => {
    nav.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  burger.addEventListener('click', () => {
    nav.classList.contains('open') ? close() : open();
  });

  // Fermer sur Echap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Fermer quand on clique sur un lien du menu
  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', close);
  });
});

// ===== Cookie banner & GA4 consent (Consent Mode v2) ========================
(() => {
  const banner   = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  const rejectBtn = document.getElementById('cookie-reject');
  const GA_ID = 'G-T5NE017KTW';
  let gaAppended = false;
  const callGtag = (...args) => {
    if (typeof gtag === 'function') gtag(...args);
  };

  const loadGA = () => {
    if (gaAppended) return;
    gaAppended = true;
    const s = document.createElement('script');
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    s.async = true;
    s.dataset.ga4 = '1';
    s.onload = () => {
      callGtag('js', new Date());
      callGtag('config', GA_ID);
    };
    document.head.appendChild(s);
  };

  const scheduleGALoad = () => {
    if (gaAppended) return;
    const runner = () => loadGA();
    (window.requestIdleCallback || window.setTimeout)(runner, 800);
  };

  function setConsent(status){ try { localStorage.setItem('cookie_consent', status); } catch(e){} }
  function getConsent(){ try { return localStorage.getItem('cookie_consent'); } catch(e){ return null; } }

  // Applique la décision à GA4 (cohérent avec les pages HTML : Accept = tout "granted")
  function applyConsent(granted){
    if (granted) {
      scheduleGALoad();
      callGtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
      // N’activer GA4 qu’après consentement
      callGtag('config', GA_ID);
    } else {
      callGtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  }

  // Évite un double-binding si un script inline attache déjà des listeners
  function bindOnce(el, type, handler){
    if (!el) return;
    const key = `bound_${type}`;
    if (el.dataset[key]) return;
    el.addEventListener(type, handler);
    el.dataset[key] = '1';
  }

  const saved = getConsent();
  if (saved === 'accepted') {
    banner && banner.classList.add('hidden');
    applyConsent(true);
    scheduleGALoad();
  } else if (saved === 'rejected') {
    banner && banner.classList.add('hidden');
    applyConsent(false);
  } else {
    banner && banner.classList.remove('hidden');
  }

  bindOnce(acceptBtn, 'click', () => {
    setConsent('accepted');
    banner && banner.classList.add('hidden');
    applyConsent(true);
    scheduleGALoad();
  });

  bindOnce(rejectBtn, 'click', () => {
    setConsent('rejected');
    banner && banner.classList.add('hidden');
    applyConsent(false);
  });
})();

// ===== Lazy load hero video (LCP reste l'affiche légère) ====================
runIdle(() => {
  const holder = document.querySelector('[data-lazy-video]');
  if (!holder) return;

  const src = holder.dataset.src;
  const poster = holder.dataset.poster || '';
  const prefersDataSave = window.matchMedia && window.matchMedia('(prefers-reduced-data: reduce)').matches;
  if (!src || prefersDataSave) return;

  const mountVideo = () => {
    const video = document.createElement('video');
    // Inline video playback to avoid user-gesture requirement and keep CWV safe
    video.muted = true; video.defaultMuted = true; video.autoplay = true; video.loop = true; video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('loop', '');
    video.preload = 'auto';
    video.setAttribute('preload', 'auto');
    if (poster) video.poster = poster;
    video.className = 'hero-video';

    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    video.appendChild(source);

    // Kick playback (some browsers need an explicit play call even with autoplay)
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    video.addEventListener('canplay', tryPlay, { once: true });
    holder.replaceChildren(video);
    tryPlay();

    video.addEventListener('loadeddata', () => video.classList.add('loaded'), { once: true });
    // Safety: if playback stalls, keep the poster visible
    video.addEventListener('error', () => {
      if (!video.classList.contains('loaded')) video.classList.add('loaded');
    }, { once: true });
  };

  const kickOff = () => {
    const runner = () => mountVideo();
    (window.requestIdleCallback || window.setTimeout)(runner, 400);
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        kickOff();
        io.disconnect();
      }
    }, { rootMargin: '120px' });
    io.observe(holder);
  } else {
    kickOff();
  }
});

// ===== Lazy YouTube embeds (all pages) =====================================
runIdle(() => {
  const embeds = Array.from(document.querySelectorAll('iframe.video-embed[data-src]'));
  if (!embeds.length) return;

  const activate = (el) => {
    if (el.dataset.loaded) return;
    el.dataset.loaded = '1';
    const src = el.dataset.src;
    if (src) el.src = src;
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (isIntersecting) {
          activate(target);
          io.unobserve(target);
        }
      });
    }, { rootMargin: '200px' });
    embeds.forEach((el) => io.observe(el));
  } else {
    setTimeout(() => embeds.forEach(activate), 1200);
  }

  // Fallback : interaction utilisateur
  embeds.forEach((el) => {
    el.addEventListener('pointerdown', () => activate(el), { once: true });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') activate(el);
    });
  });

  // Sécurité : charge après quelques secondes quand le thread est libre
  (window.requestIdleCallback || window.setTimeout)(() => embeds.forEach(activate), 6000);
});

// ===== Smooth anchors =======================================================
runIdle(() => {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

// ===== FAQ (un seul gestionnaire, ARIA + hauteur auto) ======================
runIdle(() => {
  const buttons = Array.from(document.querySelectorAll('.faq .faq-q'));
  const panels  = Array.from(document.querySelectorAll('.faq .faq-a'));
  if (!buttons.length) return;

  // init : fermé
  panels.forEach((p) => { p.setAttribute('aria-hidden', 'true'); p.style.maxHeight = '0px'; });
  buttons.forEach((b) => b.setAttribute('aria-expanded', 'false'));

  const closeAll = (exceptBtn = null) => {
    buttons.forEach((b) => {
      if (b !== exceptBtn) b.setAttribute('aria-expanded', 'false');
    });
    panels.forEach((p) => {
      if (p !== (exceptBtn && exceptBtn.nextElementSibling)) {
        p.setAttribute('aria-hidden', 'true');
        p.style.maxHeight = '0px';
      }
    });
  };

  buttons.forEach((btn) => {
    const panel = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        panel.style.maxHeight = '0px';
      } else {
        closeAll(btn);
        btn.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // Recalcule la hauteur des panneaux ouverts au resize
  window.addEventListener('resize', () => {
    buttons.forEach((btn) => {
      const panel = btn.nextElementSibling;
      if (btn.getAttribute('aria-expanded') === 'true') {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
});

// ===== Force hero video play (non-lazy fallback) ===========================
runIdle(() => {
  const video = document.querySelector('.hero-video');
  if (!video) return;
  const tryPlay = () => {
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };
  video.addEventListener('canplay', tryPlay, { once: true });
  tryPlay();
});
