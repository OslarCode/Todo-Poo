import { StorageStrategy } from "./StorageStrategy.js";

export class LocalStorageStrategy extends StorageStrategy {
  #key;

  constructor(key = "todo-poo-items") {
    super();
    this.#key = key;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.#key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((x) => x && typeof x === "object")
        .map((x) => ({
          id: String(x.id),
          title: String(x.title || "").trim(),
          completed: Boolean(x.completed),
        }));
    } catch {
      return [];
    }
  }

  save(items) {
    const safe = items.map((x) => ({
      id: String(x.id),
      title: String(x.title || "").trim(),
      completed: Boolean(x.completed),
    }));
    localStorage.setItem(this.#key, JSON.stringify(safe));
  }
}
