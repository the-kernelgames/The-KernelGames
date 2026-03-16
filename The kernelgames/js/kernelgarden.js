/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           THE KERNELGARDEN — main.js  v2.0                  ║
 * ║  Arquitectura: módulos IIFE → init secuencial → eventos     ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Índice:
 *   1. Utils            — helpers reutilizables
 *   2. BootScreen       — secuencia de arranque
 *   3. Typewriter       — efecto de escritura en el hero
 *   4. ScrollReveal     — animaciones de entrada al hacer scroll
 *   5. ActiveNav        — link activo según sección visible
 *   6. NavBorder        — borde del nav según scroll
 *   7. GlitchOnView     — glitch en el h1 al entrar al viewport
 *   8. FormFeedback     — respuesta visual al enviar el formulario
 *   9. KonamiCode       — easter egg para los que saben
 *  10. Init             — orquestador principal
 */

'use strict';

/* ================================================================
   1. UTILS — cosas pequeñas que se usan en todos lados
================================================================ */
const Utils = (() => {

  /**
   * Selector único — shorthand de querySelector.
   * @param {string} sel - selector CSS
   * @param {Element} [ctx=document] - contexto de búsqueda
   * @returns {Element|null}
   */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);

  /**
   * Selector múltiple — shorthand de querySelectorAll como array.
   * @param {string} sel - selector CSS
   * @param {Element} [ctx=document]
   * @returns {Element[]}
   */
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /**
   * Ejecuta fn solo cuando el DOM esté listo.
   * @param {Function} fn
   */
  const onReady = fn => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  };

  /**
   * Retraso basado en Promise — permite await limpio.
   * @param {number} ms - milisegundos
   * @returns {Promise<void>}
   */
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Detecta si el usuario prefiere reducir el movimiento.
   * Respeta la accesibilidad en TODAS las animaciones.
   * @returns {boolean}
   */
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return { $, $$, onReady, wait, prefersReducedMotion };
})();


/* ================================================================
   2. BOOT SCREEN — simula el arranque de un sistema operativo
================================================================ */
const BootScreen = (() => {

  const BOOT_DURATION   = 2800; // ms total antes de ocultar el boot
  const FADE_DELAY      = 200;  // ms de margen tras ocultar para señalizar "listo"

  let _onDone = null; // callback que se ejecuta cuando el boot termina

  /**
   * Inicia el boot screen y llama a onDone cuando termina.
   * Si el usuario prefiere motion reducido, salta directo.
   * @param {Function} onDone
   */
  const init = (onDone) => {
    _onDone = onDone;
    const el = Utils.$('#boot-screen');
    if (!el) { onDone?.(); return; }

    // Con prefers-reduced-motion: quitar el boot inmediatamente
    if (Utils.prefersReducedMotion()) {
      el.classList.add('hidden');
      onDone?.();
      return;
    }

    setTimeout(() => {
      el.classList.add('hidden');

      // Esperar que la transición CSS de fade-out termine antes de disparar onDone
      el.addEventListener('transitionend', () => onDone?.(), { once: true });

      // Fallback: si transitionend no dispara (e.g. display:none), garantizar onDone
      setTimeout(() => onDone?.(), FADE_DELAY);
    }, BOOT_DURATION);
  };

  return { init };
})();


/* ================================================================
   3. TYPEWRITER — escribe el subtítulo del hero letra a letra
================================================================ */
const Typewriter = (() => {

  const SPEED_MS  = 26;  // ms entre cada carácter
  const PAUSE_END = 500; // ms de pausa al terminar (hace que el cursor parpade solo)

  /**
   * Anima la escritura de un elemento párrafo.
   * Extrae el texto plano, lo borra del DOM, y lo reescribe carácter a carácter.
   * Preserva el cursor HTML al final.
   * @param {string} selector - selector del elemento target
   */
  const run = (selector) => {
    const el = Utils.$(selector);
    if (!el || Utils.prefersReducedMotion()) return;

    // Separar el cursor del texto para no destruirlo
    const cursor  = Utils.$('.cursor', el);
    const rawText = el.childNodes[0]?.textContent?.trim() ?? '';

    if (!rawText) return;

    // Limpiar solo el nodo de texto, dejar el cursor en su lugar
    el.childNodes[0].textContent = '';

    let i = 0;

    const tick = () => {
      if (i <= rawText.length) {
        el.childNodes[0].textContent = rawText.slice(0, i);
        i++;
        setTimeout(tick, SPEED_MS);
      }
      // Al terminar, el cursor sigue parpadeando por el CSS — no hace falta nada más
    };

    tick();
  };

  return { run };
})();


/* ================================================================
   4. SCROLL REVEAL — elementos aparecen al entrar al viewport
================================================================ */
const ScrollReveal = (() => {

  const THRESHOLD   = 0.1;          // % del elemento que debe ser visible
  const ROOT_MARGIN = '0px 0px -36px 0px'; // margen inferior negativo: revela un poco antes del borde

  /**
   * Observa todos los elementos con clase .reveal.
   * Cuando entran al viewport se les añade .visible (animación CSS).
   * Una vez revelados se deja de observarlos (rendimiento).
   */
  const init = () => {
    const elements = Utils.$$('.reveal');
    if (!elements.length) return;

    // Si prefiere motion reducido, mostrar todo sin animación
    if (Utils.prefersReducedMotion()) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // desconectar una vez revelado
          }
        });
      },
      { threshold: THRESHOLD, rootMargin: ROOT_MARGIN }
    );

    elements.forEach(el => observer.observe(el));
  };

  return { init };
})();


/* ================================================================
   5. ACTIVE NAV — resalta el link de la sección actualmente visible
================================================================ */
const ActiveNav = (() => {

  const THRESHOLD = 0.35; // 35% de la sección debe ser visible para activarse

  /**
   * Observa las secciones y actualiza el link activo en el navbar.
   * Usa IntersectionObserver en lugar de scroll + getBoundingClientRect
   * porque es más eficiente (no bloquea el hilo principal).
   */
  const init = () => {
    const sections = Utils.$$('section[id], header[id]');
    const links    = Utils.$$('.nav-links a');
    if (!sections.length || !links.length) return;

    /**
     * Dado un id, activa el link correspondiente y desactiva el resto.
     * @param {string} id
     */
    const setActive = (id) => {
      links.forEach(link => {
        const matches = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', matches);
        // Accesibilidad: aria-current para lectores de pantalla
        if (matches) link.setAttribute('aria-current', 'true');
        else         link.removeAttribute('aria-current');
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: THRESHOLD }
    );

    sections.forEach(s => observer.observe(s));
  };

  return { init };
})();


/* ================================================================
   6. NAV BORDER — el borde del navbar cambia al hacer scroll
================================================================ */
const NavBorder = (() => {

  const SCROLL_THRESHOLD = 60; // px de scroll para activar el cambio
  const COLOR_SCROLLED   = 'rgba(201,168,76,.35)';
  const COLOR_TOP        = 'transparent';

  let _ticking = false; // flag para requestAnimationFrame throttling

  /**
   * Actualiza el color del borde inferior del nav.
   * Usa requestAnimationFrame para no saturar el hilo principal.
   */
  const init = () => {
    const nav = Utils.$('.nav');
    if (!nav) return;

    const update = () => {
      nav.style.borderBottomColor =
        window.scrollY > SCROLL_THRESHOLD ? COLOR_SCROLLED : COLOR_TOP;
      _ticking = false;
    };

    window.addEventListener('scroll', () => {
      // rAF throttle: solo un update por frame, sin importar cuántos eventos scroll llegan
      if (!_ticking) {
        requestAnimationFrame(update);
        _ticking = true;
      }
    }, { passive: true }); // passive: true = el browser no bloquea el scroll
  };

  return { init };
})();


/* ================================================================
   7. GLITCH ON VIEW — el h1 del hero hace glitch al entrar visible
================================================================ */
const GlitchOnView = (() => {

  const GLITCH_CLASS    = 'glitch-active';
  const GLITCH_DURATION = 600; // ms que dura el glitch al entrar

  /**
   * Añade brevemente una clase de glitch al h1 del hero cuando
   * el usuario llega a la página por primera vez.
   * No se repite en sesiones ya vistas (sessionStorage).
   */
  const init = () => {
    // Solo glitch en la primera visita de la sesión
    if (sessionStorage.getItem('kg_hero_seen')) return;

    const h1 = Utils.$('#hero h1');
    if (!h1 || Utils.prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            h1.classList.add(GLITCH_CLASS);
            setTimeout(() => h1.classList.remove(GLITCH_CLASS), GLITCH_DURATION);
            sessionStorage.setItem('kg_hero_seen', '1');
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(h1);
  };

  return { init };
})();


/* ================================================================
   8. FORM FEEDBACK — respuesta visual al enviar el formulario
================================================================ */
const FormFeedback = (() => {

  const STATES = {
    sending: 'Transmitiendo...',
    done:    '[ ENVIADO ✓ ]',
  };

  const SENDING_DELAY = 1200; // ms hasta mostrar "enviado"
  const RESET_DELAY   = 3200; // ms hasta restablecer el texto original

  /**
   * Intercepta el submit del formulario de contacto.
   * Da feedback visual sin recargar la página.
   * La acción mailto: igual se ejecuta si el browser lo permite.
   */
  const init = () => {
    const form = Utils.$('.contact-form');
    if (!form) return;

    const btn       = Utils.$('button[type="submit"]', form);
    if (!btn) return;

    const originalText = btn.textContent;

    form.addEventListener('submit', (e) => {
      // No prevenir el default: dejar que mailto: haga su trabajo
      // Solo añadir feedback visual encima

      btn.textContent  = STATES.sending;
      btn.disabled     = true;

      setTimeout(() => {
        btn.textContent = STATES.done;
      }, SENDING_DELAY);

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled    = false;
      }, RESET_DELAY);
    });
  };

  return { init };
})();


/* ================================================================
   9. KONAMI CODE — easter egg para los que saben
   ↑ ↑ ↓ ↓ ← → ← → B A
================================================================ */
const KonamiCode = (() => {

  const SEQUENCE = [
    'ArrowUp','ArrowUp',
    'ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight',
    'ArrowLeft','ArrowRight',
    'b','a'
  ];

  /**
   * Muestra un mensaje en consola y activa un efecto visual secreto.
   * Recompensa a los visitantes que exploran el código fuente.
   */
  const _activate = () => {
    // Mensaje en consola — la firma del equipo
    console.log(
      '%c[ THE KERNELGARDEN ]%c\n\n' +
      'kernel@garden:~$ ls ./equipo/\n' +
      'daniel/  santiago/  juan/  miguel/  jeshua/  david/\n\n' +
      'kernel@garden:~$ cat ./mensaje.txt\n' +
      '"No somos grandes — pero somos reales."\n\n' +
      'github.com/dbarrientos-dev/The-KernelGames\n',
      'color:#c9a84c;font-family:monospace;font-weight:bold;font-size:14px;',
      'color:#d4956a;font-family:monospace;font-size:12px;'
    );

    // Efecto visual: destello dorado en el body
    const flash = document.createElement('div');
    Object.assign(flash.style, {
      position:   'fixed',
      inset:      '0',
      background: 'rgba(201,168,76,.06)',
      zIndex:     '9997',
      pointerEvents: 'none',
      transition: 'opacity .8s ease',
    });
    document.body.appendChild(flash);

    // Forzar reflow antes de animar para que la transición funcione
    flash.getBoundingClientRect();
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 900);
  };

  /**
   * Escucha el teclado y verifica si la secuencia coincide.
   */
  const init = () => {
    let progress = 0; // índice actual en la secuencia

    document.addEventListener('keydown', (e) => {
      if (e.key === SEQUENCE[progress]) {
        progress++;
        if (progress === SEQUENCE.length) {
          _activate();
          progress = 0; // reset para que se pueda repetir
        }
      } else {
        // Cualquier tecla incorrecta reinicia la secuencia
        // Excepción: si la tecla incorrecta coincide con el inicio, no perder el intento
        progress = (e.key === SEQUENCE[0]) ? 1 : 0;
      }
    });
  };

  return { init };
})();


/* ================================================================
  10. INIT — orquestador principal
      Ejecuta los módulos en el orden correcto:
      primero lo que no depende del boot, luego lo que sí.
================================================================ */
Utils.onReady(() => {

  /* ── Año dinámico en el footer (no necesita esperar nada) ── */
  const yearEl = Utils.$('#current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Módulos independientes del boot ── */
  ScrollReveal.init();
  ActiveNav.init();
  NavBorder.init();
  FormFeedback.init();
  KonamiCode.init();

  /* ── Boot screen → al terminar, lanza lo que depende de él ── */
  BootScreen.init(() => {
    // El typewriter empieza justo cuando el boot desaparece
    Typewriter.run('.subtitulo');

    // El glitch del h1 también espera a que el boot termine
    GlitchOnView.init();
  });

});