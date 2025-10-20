export class Renderer {
  mount(rootEl) {
    throw new Error("Método abstracto: implementa mount(rootEl).");
  }
  render(items) {
    throw new Error("Método abstracto: implementa render(items).");
  }
  bindEvents(controller) {
    throw new Error("Método abstracto: implementa bindEvents(controller).");
  }
}
