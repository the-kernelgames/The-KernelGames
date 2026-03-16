# The KernelGames

Sitio principal de **The KernelGarden** y prototipos de juegos indie del sello **The KernelGames**.

## Estado actual del repositorio

### Estructura detectada

```text
/
├── index.html
├── css/main.css
├── js/main.js
├── img/
├── PANGOLIN THE LOST CAP/
├── LICENSE
├── README.md
├── style.css           # legacy
└── kernelgarden.js     # legacy
```

## Auditoría técnica (resumen ejecutivo)

### 1) Problemas de organización encontrados

- Había una concentración excesiva de estilos y scripts inline en `index.html`, dificultando mantenimiento y revisión.
- Existen archivos legacy (`style.css`, `kernelgarden.js`) con implementación paralela al sitio principal.
- El directorio `img/` mezcla nombres poco consistentes (`pag1.jpg`, `pag1.jpeg`, `pag 5.jpg`), lo que complica la trazabilidad de assets.
- El subproyecto `PANGOLIN THE LOST CAP` convive en el root sin un namespace claro de monorepo (`apps/` o `projects/`).

### 2) Problemas de código detectados

- JS con utilidades no usadas (`wait`) que aumenta ruido cognitivo.
- Lógica de Konami dependía de mayúsculas/minúsculas para teclas alfabéticas (`b`/`a`) de forma frágil.
- El acoplamiento de estructura + estilo + comportamiento en un único archivo reducía reutilización y testabilidad.

### 3) Refactor aplicado en esta iteración

- Se extrajo el CSS embebido a `css/main.css`.
- Se extrajo el JavaScript embebido a `js/main.js` y se cargó con `defer`.
- Se simplificó `js/main.js` removiendo helper no utilizado.
- Se robusteció la detección de teclas del Konami code normalizando `key`.

---

## Estructura profesional recomendada (siguiente fase)

```text
/project
├── apps/
│   ├── web-kernelgarden/
│   │   ├── index.html
│   │   ├── css/
│   │   ├── js/
│   │   ├── images/
│   │   └── components/
│   └── pangolin-the-lost-cap/
├── docs/
│   ├── architecture.md
│   ├── coding-standards.md
│   └── roadmap.md
├── tools/
│   ├── lint/
│   └── scripts/
└── README.md
```

---

## Estándares de código sugeridos

### Convenciones de nombres
- HTML/CSS/JS: `kebab-case` para archivos (`main-nav.js`, `contact-form.css`).
- Clases CSS: BEM o utilitario consistente (`block__element--modifier`).
- IDs solo para anclas o scripting puntual.

### Organización de CSS
- Separar por capas: `tokens.css`, `base.css`, `components.css`, `utilities.css`.
- Evitar estilos inline excepto casos críticos de runtime.
- Reutilizar variables CSS para color/spacing/typography.

### Modularización de JavaScript
- Encapsular por feature (`cursor.js`, `scroll-reveal.js`, `form-feedback.js`).
- Un `main.js` solo para bootstrap de módulos.
- Aislar side-effects y evitar funciones globales.

### Comentarios útiles
- Comentar “por qué”, no “qué”.
- Documentar supuestos de accesibilidad y performance en cada módulo.
- Mantener bloques de cabecera por archivo con propósito y límites.

---

## Depuración: riesgos que pueden romper el sitio

- **HTML:** gran volumen de contenido en una sola página dificulta detectar regressions visuales.
- **CSS:** sin pipeline de lint/autoprefix puede haber diferencias entre navegadores.
- **JavaScript:** listeners globales pueden crecer y afectar performance si se duplican en futuras páginas.
- **Compatibilidad:** efectos visuales (cursor custom, scanlines, glitch) deben degradar en dispositivos de baja potencia.

---

## Roadmap de mejora

- [ ] Corregir inconsistencias de nombres en assets (`img/`) y eliminar duplicados reales.
- [ ] Migrar archivos legacy (`style.css`, `kernelgarden.js`) o retirarlos oficialmente.
- [ ] Separar el repo en estructura de monorepo ligera (`apps/`, `docs/`, `tools/`).
- [ ] Agregar linters: `stylelint`, `eslint`, `htmlhint`.
- [ ] Implementar form de contacto backend (evitar dependencia de `mailto:`).
- [ ] Optimizar imágenes (WebP/AVIF + tamaños responsivos).
- [ ] Crear guía de contribución (`CONTRIBUTING.md`) y plantilla de PR.
- [ ] Incorporar CI para validación automática (lint + smoke tests).

---

## Recomendaciones de ingeniería de software

1. **Arquitectura:** evolucionar a módulos por dominio (UI, interacción, datos).
2. **Calidad:** definir Definition of Done con checks automáticos.
3. **Mantenibilidad:** eliminar duplicación de assets y legacy code por lotes pequeños.
4. **Observabilidad:** incluir métricas básicas de performance (Lighthouse en CI).
5. **Documentación:** mantener decisiones técnicas en `docs/architecture.md`.

---

## Ejecución local

Al ser una landing estática, puede abrirse directamente con el navegador o usando un servidor estático simple.

```bash
python -m http.server 8080
```

Luego abre `http://localhost:8080`.
