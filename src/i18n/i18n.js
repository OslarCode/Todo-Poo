const DICTS = {
  es: {
    "app.title": "TODO (POO)",
    "app.subtitle": "Abstracción · Herencia · Encapsulación · Polimorfismo",

    "input.placeholder": "Escribe una tarea y pulsa Enter…",
    "input.ariaLabel": "Nueva tarea",

    "btn.add": "Añadir",
    "btn.edit": "Editar",
    "btn.delete": "Eliminar",
    "btn.clearCompleted": "Borrar completadas",
    "btn.cancel": "Cancelar",
    "btn.confirm": "Eliminar",
    "btn.lang.es": "ES",
    "btn.lang.en": "EN",

    "filters.all": "Todas",
    "filters.active": "Activas",
    "filters.completed": "Completadas",
    "filters.aria": "Filtros y acciones",

    "counter.total": "{n} {label} — {done}/{total} completadas",
    "counter.label.all": "totales",
    "counter.label.active": "activas",
    "counter.label.completed": "completadas",

    "confirm.delete.title": "Confirmar borrado",
    "confirm.delete.desc.named":
      "¿Seguro que quieres eliminar la tarea: “{title}”? Esta acción no se puede deshacer.",
    "confirm.delete.desc.unnamed":
      "¿Seguro que quieres eliminar esta tarea? Esta acción no se puede deshacer.",

    "confirm.clear.title": "Borrar tareas completadas",
    "confirm.clear.desc":
      "¿Seguro que quieres borrar {n} tareas completadas? Esta acción no se puede deshacer.",

    "aria.toggle.check": "Marcar tarea como completada",
    "aria.toggle.uncheck": "Desmarcar tarea",
    "aria.deleteNamed": "Eliminar tarea “{title}”",
    "aria.editTitle": "Editar título de la tarea",
    "aria.show": "Mostrar {label}",
  },

  en: {
    "app.title": "TODO (OOP)",
    "app.subtitle": "Abstraction · Inheritance · Encapsulation · Polymorphism",

    "input.placeholder": "Type a task and press Enter…",
    "input.ariaLabel": "New task",

    "btn.add": "Add",
    "btn.edit": "Edit",
    "btn.delete": "Delete",
    "btn.clearCompleted": "Clear completed",
    "btn.cancel": "Cancel",
    "btn.confirm": "Delete",
    "btn.lang.es": "ES",
    "btn.lang.en": "EN",

    "filters.all": "All",
    "filters.active": "Active",
    "filters.completed": "Completed",
    "filters.aria": "Filters and actions",

    "counter.total": "{n} {label} — {done}/{total} completed",
    "counter.label.all": "total",
    "counter.label.active": "active",
    "counter.label.completed": "completed",

    "confirm.delete.title": "Confirm deletion",
    "confirm.delete.desc.named":
      "Are you sure you want to delete: “{title}”? This action cannot be undone.",
    "confirm.delete.desc.unnamed":
      "Are you sure you want to delete this task? This action cannot be undone.",

    "confirm.clear.title": "Clear completed tasks",
    "confirm.clear.desc":
      "Are you sure you want to clear {n} completed tasks? This action cannot be undone.",

    "aria.toggle.check": "Mark task as completed",
    "aria.toggle.uncheck": "Unmark task",
    "aria.deleteNamed": "Delete task “{title}”",
    "aria.editTitle": "Edit task title",
    "aria.show": "Show {label}",
  },
};

class I18n {
  #lang = "es";
  #subs = new Set();
  #key = "todo-poo-lang";

  constructor() {
    try {
      const stored = localStorage.getItem(this.#key);
      if (stored && (stored === "es" || stored === "en")) this.#lang = stored;
      else {
        const nav = (navigator.language || "es").toLowerCase();
        this.#lang = nav.startsWith("en") ? "en" : "es";
        localStorage.setItem(this.#key, this.#lang);
      }
    } catch {}
  }

  setLang(lang) {
    if (!["es", "en"].includes(lang)) return;
    this.#lang = lang;
    try {
      localStorage.setItem(this.#key, lang);
    } catch {}
    for (const cb of this.#subs) cb(lang);
  }

  getLang() {
    return this.#lang;
  }

  onChange(cb) {
    this.#subs.add(cb);
    return () => this.#subs.delete(cb);
  }

  t(key, params = {}) {
    const dict = DICTS[this.#lang] || {};
    const template = dict[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`);
  }
}

export const i18n = new I18n();
