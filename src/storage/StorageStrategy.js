export class StorageStrategy {
  load() {
    throw new Error("Método abstracto: implementa load() en la subclase.");
  }

  save(items) {
    throw new Error("Método abstracto: implementa save(items) en la subclase.");
  }
}
