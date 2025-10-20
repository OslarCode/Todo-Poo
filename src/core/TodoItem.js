export class TodoItem {
  #id;
  #title;
  #completed;

  constructor(id, title, completed = false) {
    if (!title || !title.trim()) {
      throw new Error("El título de la tarea no puede estar vacío.");
    }
    this.#id = id;
    this.#title = title.trim();
    this.#completed = completed;
  }

  get id() {
    return this.#id;
  }
  get title() {
    return this.#title;
  }
  get completed() {
    return this.#completed;
  }

  toggle() {
    this.#completed = !this.#completed;
  }

  rename(newTitle) {
    if (!newTitle || !newTitle.trim()) return;
    this.#title = newTitle.trim();
  }

  toJSON() {
    return { id: this.#id, title: this.#title, completed: this.#completed };
  }

  static from(obj) {
    return new TodoItem(obj.id, obj.title, Boolean(obj.completed));
  }

  static create(title) {
    const id = `t_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    return new TodoItem(id, title, false);
  }
}
