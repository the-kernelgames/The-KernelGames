'use strict';

  /* ────────────────────────────────────────────────
     UTILS
  ──────────────────────────────────────────────── */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const noMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ────────────────────────────────────────────────
     AÑO DINÁMICO
  ──────────────────────────────────────────────── */
  const yearEl = $('#current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ────────────────────────────────────────────────
     CURSOR PERSONALIZADO
     Sigue el mouse con dos elementos: punto y anillo.
     El anillo tiene lag intencional (transición CSS).
  ──────────────────────────────────────────────── */
  (() => {
    if (noMotion()) return;
    const dot  = $('#cursor-dot');
    const ring = $('#cursor-ring');
    if (!dot || !ring) return;

    // Elementos interactivos que agrandan el cursor
    const hoverTargets = 'a, button, .btn, .card, .tag, input, textarea, label';

    document.addEventListener('mousemove', e => {
      // rAF para no saturar el hilo principal
      requestAnimationFrame(() => {
        dot.style.left  = e.clientX + 'px';
        dot.style.top   = e.clientY + 'px';
        ring.style.left = e.clientX + 'px';
        ring.style.top  = e.clientY + 'px';
      });
    }, { passive: true });

    // Estado "hover" cuando está sobre elementos interactivos
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverTargets)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor-hover');
    });

    // Ocultar cursor cuando el mouse sale de la ventana
    document.addEventListener('mouseleave', () => {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  })();

  /* ────────────────────────────────────────────────
     SCROLL — barra de progreso + botón arriba + nav
  ──────────────────────────────────────────────── */
  (() => {
    const bar     = $('#scroll-bar');
    const backTop = $('#back-top');
    const nav     = $('.nav');
    let ticking   = false;

    const onScroll = () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const max      = document.documentElement.scrollHeight - window.innerHeight;

        // Barra de progreso
        if (bar) bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';

        // Botón arriba (visible tras 400px)
        if (backTop) backTop.classList.toggle('visible', scrolled > 400);

        // Borde del navbar
        if (nav) nav.classList.toggle('scrolled', scrolled > 60);

        ticking = false;
      });
      ticking = true;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Acción del botón arriba
    backTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

  /* ────────────────────────────────────────────────
     BOOT SCREEN → dispara todo lo demás al terminar
  ──────────────────────────────────────────────── */
  const bootDone = (() => {
    // Devuelve una Promise que resuelve cuando el boot termina
    return new Promise(resolve => {
      const boot = $('#boot-screen');
      if (!boot || noMotion()) { resolve(); return; }

      const DURATION = 2800;
      setTimeout(() => {
        boot.classList.add('hidden');
        // transitionend como señal definitiva; setTimeout como fallback
        boot.addEventListener('transitionend', resolve, { once: true });
        setTimeout(resolve, 600); // fallback si transitionend no dispara
      }, DURATION);
    });
  })();

  /* ────────────────────────────────────────────────
     TYPEWRITER — escribe el subtítulo del hero
     Opera sobre .subtitulo-text, preserva el cursor
  ──────────────────────────────────────────────── */
  bootDone.then(() => {
    if (noMotion()) {
      const span = $('.subtitulo-text');
      if (span) span.textContent = 'Un jardín donde seis ingenieros construyen programas, videojuegos, seguridad e IA — desde el Quindío.';
      return;
    }

    const target   = $('.subtitulo-text');
    if (!target) return;

    const fullText = 'Un jardín donde seis ingenieros construyen programas, videojuegos, seguridad e IA — desde el Quindío.';
    let i = 0;

    const tick = () => {
      target.textContent = fullText.slice(0, i);
      i++;
      if (i <= fullText.length) setTimeout(tick, 26);
    };
    tick();
  });

  /* ────────────────────────────────────────────────
     SCROLL REVEAL — elementos con clase .reveal
  ──────────────────────────────────────────────── */
  (() => {
    const els = $$('.reveal');
    if (!els.length) return;

    if (noMotion()) { els.forEach(e => e.classList.add('visible')); return; }

    const obs = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    );
    els.forEach(e => obs.observe(e));
  })();

  /* ────────────────────────────────────────────────
     ACTIVE NAV — link activo según sección visible
  ──────────────────────────────────────────────── */
  (() => {
    const sections = $$('section[id], header[id]');
    const links    = $$('.nav-links a');
    if (!sections.length || !links.length) return;

    const setActive = id => {
      links.forEach(l => {
        const active = l.getAttribute('href') === `#${id}`;
        l.classList.toggle('active', active);
        active ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current');
      });
    };

    new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { threshold: 0.35 }
    ).observe(...sections, sections); // observar todas

    // Compatibilidad — IntersectionObserver no acepta spread en observe
    const navObs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { threshold: 0.35 }
    );
    sections.forEach(s => navObs.observe(s));
  })();

  /* ────────────────────────────────────────────────
     CONTADOR DE STATS — anima los números desde 0
     Activa cuando .stats-row entra al viewport
  ──────────────────────────────────────────────── */
  (() => {
    const nums = $$('.stat-num[data-target]');
    if (!nums.length) return;

    const animate = (el) => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix ?? '';
      const dur    = 900; // ms
      const step   = 16;  // ~60fps
      const steps  = Math.round(dur / step);
      let current  = 0;

      const timer = setInterval(() => {
        current++;
        el.textContent = Math.round((current / steps) * target) + suffix;
        if (current >= steps) {
          el.textContent = target + suffix;
          clearInterval(timer);
        }
      }, step);
    };

    if (noMotion()) {
      nums.forEach(el => {
        el.textContent = el.dataset.target + (el.dataset.suffix ?? '');
      });
      return;
    }

    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); }
      }),
      { threshold: 0.6 }
    );
    nums.forEach(n => obs.observe(n));
  })();

  /* ────────────────────────────────────────────────
     MOBILE NAV — hamburger toggle
  ──────────────────────────────────────────────── */
  (() => {
    const toggle = $('.nav-toggle');
    const menu   = $('#nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Cerrar al hacer clic en un link
    $$('.nav-links a').forEach(a => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Cerrar al presionar Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  })();

  /* ────────────────────────────────────────────────
     FORM FEEDBACK — respuesta visual al enviar
  ──────────────────────────────────────────────── */
  (() => {
    const form   = $('.contact-form');
    const status = $('.form-status');
    if (!form) return;

    const btn = $('button[type="submit"]', form);
    const origText = btn?.textContent;

    form.addEventListener('submit', () => {
      if (!btn || !status) return;
      btn.disabled = true;
      if (btn) btn.textContent = 'Transmitiendo...';

      setTimeout(() => {
        if (btn) btn.textContent = '[ ENVIADO ✓ ]';
        if (status) {
          status.textContent = '// Mensaje transmitido correctamente.';
          status.classList.add('visible');
        }
      }, 1200);

      setTimeout(() => {
        if (btn) { btn.textContent = origText; btn.disabled = false; }
        if (status) { status.classList.remove('visible'); }
      }, 4000);
    });
  })();

  /* ────────────────────────────────────────────────
     KONAMI CODE — ↑↑↓↓←→←→BA
     Easter egg para los que abren el código fuente
  ──────────────────────────────────────────────── */
  (() => {
    const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;

    document.addEventListener('keydown', e => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = (key === SEQ[pos]) ? pos + 1 : (key === SEQ[0] ? 1 : 0);
      if (pos < SEQ.length) return;
      pos = 0;

      // Firma en consola
      console.log(
        '%c[ THE KERNELGARDEN ]%c\n\nkernel@garden:~$ cat equipo.txt\n\ndaniel · santiago · juan · miguel · jeshua · david\n\n"No somos grandes — pero somos reales."\n\ngithub.com/dbarrientos-dev/The-KernelGames',
        'color:#c9a84c;font-family:monospace;font-weight:bold;font-size:14px;',
        'color:#d4956a;font-family:monospace;font-size:12px;line-height:1.8;'
      );

      // Flash dorado en pantalla
      const flash = Object.assign(document.createElement('div'), {
        style: 'position:fixed;inset:0;background:rgba(201,168,76,.07);z-index:9993;pointer-events:none;transition:opacity .9s ease;'
      });
      document.body.appendChild(flash);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => { flash.style.opacity = '0'; });
      });
      setTimeout(() => flash.remove(), 1000);
    });
  })();
