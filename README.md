# TODO POO — Vanilla JS (ES6+)

Aplicación TODO mínima diseñada para practicar POO en JavaScript (Abstracción, Herencia, Encapsulación, Polimorfismo) con arquitectura limpia\*\* y UI accesible sin frameworks.

## Características

- Crear, completar, eliminar y **editar en línea** (dblclick o botón).
- Filtros: **todas / activas / completadas**.
- **Persistencia** con `localStorage`.
- **Confirmación accesible** al eliminar una tarea o **borrar todas las completadas** (modal con foco atrapado).
- **Atajos**: `Alt+1/2/3` (filtros), `n` (enfocar input), `Ctrl+Enter` (añadir).
- **i18n ES/EN** con persistencia de idioma.

## Estructura

```

public/
index.html
styles.css
src/
core/
TodoItem.js        # Entidad con estado privado (#) y reglas propias
TodoList.js        # Agregador: reglas de colección + persistencia delegada
storage/
StorageStrategy.js # Contrato (abstracto)
LocalStorageStrategy.js
MemoryStorageStrategy.js
ui/
Renderer.js        # Contrato
DomRenderer.js     # Implementación DOM (accesible)
i18n/
i18n.js            # Mini-motor i18n
AppController.js     # Orquestador UI ↔ dominio
main.js              # Composición/arranque
tests/
*.test.js            # Vitest básico

```

## Decisiones de arquitectura

1. **Separación estricta de responsabilidades**

   - `core/` no conoce el DOM ni `localStorage`.
   - `storage/` no conoce entidades (trabaja con **objetos planos**).
   - `ui/` (renderer) no conoce reglas de negocio (delegadas al **controller**).

2. **Contratos + Polimorfismo**

   - `StorageStrategy` y `Renderer` definen **interfaces**. Cambiar de almacenamiento o UI no toca el resto.
   - `TodoList` solo llama `load()`/`save()` del storage y `getByFilter()` para UI.

3. **Encapsulación real**

   - Campos privados `#` en entidades y agregadores.
   - Copias al exponer datos (`toJSON()`) para evitar mutaciones externas.

4. **Abstracción**

   - Serialización/deserialización (`toJSON()`/`from`) separa **uso** de **almacenamiento**.

5. **Accesibilidad**

   - Semántica nativa (`ul/li`), `aria-*`, `aria-live`, **foco visible** y **modal** con **focus trap**.

6. **i18n simple**
   - Diccionarios ES/EN, `i18n.t(key, params)`, persistencia en `localStorage` y conmutador en UI.

## Ejecutar

- Opción rápida: abrir `public/index.html` con Live Server (VSCode) o
  ```bash
  npx http-server public
  ```

* Tests:

  ```bash
  npm i
  npm run coverage
  ```

## Extensiones recomendadas

1. **Repositorios remotos (API)**

   - Crear `HttpStorageStrategy` que implemente `load()/save()` contra un backend REST.
   - Mantener contrato para no tocar `TodoList`.

2. **Renderer alternativo**

   - `ConsoleRenderer` o un `VirtualDomRenderer` para pruebas de UI sin navegador.

3. **Edición avanzada**

   - Validación con mensajes accesibles; undo/redo con un `HistoryService` simple.

4. **i18n ampliado**

   - Carga asíncrona de diccionarios y detección de RTL.

5. **Testing**

   - Tests de `DomRenderer` con JSDOM y `@testing-library/dom`.

6. **Accesibilidad extra**

   - Diálogo de “clear completed” con conteo dinámico, y anuncios `aria-live` al crear/borrar.

## FAQ rápida

- **¿Por qué `Map` en `TodoList`?** Búsqueda/mutación por `id` O(1) y orden estable al serializar.
- **¿Por qué serializar a “objetos planos”?** Evita acoplar storage/UI a las clases (mejor testing y portabilidad).
- **¿Puedo usar TypeScript?** Sí. Mantén los **contratos** y añade tipos en interfaces y clases.
