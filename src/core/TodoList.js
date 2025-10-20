import { TodoItem } from "./TodoItem.js";

export class TodoList {
  #items = new Map();
  #storageStrategy;

  constructor(storageStrategy) {
    this.#storageStrategy = storageStrategy;
  }

  load() {
    const plain = this.#storageStrategy.load();
    this.#items.clear();
    for (const obj of plain) {
      const item = TodoItem.from(obj);
      this.#items.set(item.id, item);
    }
  }

  #save() {
    const all = [...this.#items.values()].map((item) => item.toJSON());
    this.#storageStrategy.save(all);
  }

  add(title) {
    const item = TodoItem.create(title);
    this.#items.set(item.id, item);
    this.#save();
    return item;
  }

  toggle(id) {
    const item = this.#items.get(id);
    if (!item) return;
    item.toggle();
    this.#save();
  }

  remove(id) {
    if (this.#items.delete(id)) {
      this.#save();
    }
  }

  clearCompleted() {
    let mutated = false;
    for (const [id, it] of this.#items) {
      if (it.completed) {
        this.#items.delete(id);
        mutated = true;
      }
    }
    if (mutated) this.#save();
  }

  rename(id, newTitle) {
    const it = this.#items.get(id);
    if (!it) return;
    it.rename(newTitle);
    this.#save();
  }

  getAll() {
    return [...this.#items.values()].map((it) => it.toJSON());
  }

  getByFilter(type = "all") {
    const arr = this.getAll();
    switch (type) {
      case "active":
        return arr.filter((x) => !x.completed);
      case "completed":
        return arr.filter((x) => x.completed);
      default:
        return arr;
    }
  }

  counts() {
    const total = this.#items.size;
    let completed = 0;
    for (const it of this.#items.values()) if (it.completed) completed++;
    return { total, completed, active: total - completed };
  }
}
