export class AppController {
  #list;
  #renderer;
  #filter = "all";

  constructor(todoList, renderer) {
    this.#list = todoList;
    this.#renderer = renderer;
  }

  init(mountEl) {
    this.#list.load();

    this.#renderer.mount(mountEl);
    this.#renderer.bindEvents(this);

    this.#renderNow();
  }

  handleAdd(title) {
    this.#list.add(title);
    this.#renderNow();
  }

  handleToggle(id) {
    this.#list.toggle(id);
    this.#renderNow();
  }

  handleRemove(id) {
    this.#list.remove(id);
    this.#renderNow();
  }

  handleFilter(type) {
    if (!["all", "active", "completed"].includes(type)) type = "all";
    this.#filter = type;
    this.#renderNow();
  }

  handleClearCompleted() {
    this.#list.clearCompleted();
    this.#renderNow();
  }

  handleRename(id, newTitle) {
    this.#list.rename(id, newTitle);
    this.#renderNow();
  }

  #renderNow() {
    const items = this.#list.getByFilter(this.#filter);
    const counts = this.#list.counts();
    this.#renderer.render(items, counts, this.#filter);
  }
}
