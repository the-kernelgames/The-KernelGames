# 🎮 Cómo contribuir a The KernelGames

> "Aprender. Crear. Romper. Repetir."

Somos un grupo de amigos universitarios del Quindío.
Este documento explica cómo trabajamos juntos sin caos.

---

## 🚀 Primeros pasos

1. Clona el repo:
```bash
   git clone https://github.com/the-kernelgames/The-KernelGames.git
   cd The-KernelGames
```
2. Crea tu rama de trabajo (ver convención abajo)
3. Haz tus cambios
4. Abre un Pull Request hacia `main`

---

## 🌿 Cómo nombrar tus ramas
```
tipo/descripcion-corta
```

| Tipo | Cuándo usarlo | Ejemplo |
|------|--------------|---------|
| `feat/` | Feature nueva | `feat/pantalla-menu-pangolin` |
| `fix/` | Corrección de bug | `fix/colision-personaje` |
| `docs/` | Documentación | `docs/actualizar-readme` |
| `style/` | CSS, diseño | `style/navbar-responsive` |
| `chore/` | Config, limpieza | `chore/borrar-archivos-legacy` |

---

## 💬 Cómo escribir commits

Usamos **Conventional Commits**:
```
tipo(scope): descripción corta en español
```

**Ejemplos:**
```
feat(pangolin): agregar animación de salto
fix(web): corregir link roto en navbar
docs(readme): actualizar instrucciones de instalación
style(pangolin): ajustar colores de pantalla de inicio
```

---

## 🔁 Cómo hacer un Pull Request

1. Asegúrate de que tu rama está actualizada con `main`
2. Abre el PR con título descriptivo
3. Llena la plantilla que aparece automáticamente
4. Asigna a alguien del equipo para revisar
5. Espera mínimo **1 aprobación** antes de mergear
6. El que aprueba hace el merge, no el autor

---

## 🏷️ Cómo usar los Labels e Issues

Cuando crees un Issue, ponle:
- El label del proyecto: `juego: pangolin` o `juego: web`
- El tipo: `tipo: bug`, `tipo: feature`, `tipo: docs`
- La dificultad: `dificultad: fácil` o `dificultad: media`

Si es tu primera contribución, busca issues con `dificultad: fácil`.

---

## ❌ Lo que NO hacemos

- No pushear directo a `main` — todo entra por PR
- No mergear tu propio PR sin aprobación
- No subir archivos binarios grandes (imágenes pesadas, ejecutables)
- No borrar ramas de otros sin avisar

---

## 🆘 ¿Dudas?

Abre una discusión en:
```
github.com/the-kernelgames/The-KernelGames/discussions
```
O escríbenos en Telegram: https://t.me/TheKernelGames
```

---

**⑤ Commit:**
- Clic en **"Commit changes"**
- Mensaje:
```
docs: agregar CONTRIBUTING.md
