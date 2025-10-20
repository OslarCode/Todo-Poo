import { StorageStrategy } from "./StorageStrategy.js";

export class MemoryStorageStrategy extends StorageStrategy {
  #buffer = [];

  load() {
    return this.#buffer.map((obj) => ({ ...obj }));
  }

  save(items) {
    this.#buffer = items.map((obj) => ({ ...obj }));
  }
}
