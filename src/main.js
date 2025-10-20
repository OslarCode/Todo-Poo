import { LocalStorageStrategy } from "./storage/LocalStorageStrategy.js";
import { TodoList } from "./core/TodoList.js";
import { DomRenderer } from "./ui/DomRenderer.js";
import { AppController } from "./AppController.js";
import { i18n } from "./i18n/i18n.js";

const mount = document.getElementById("mount");

const storage = new LocalStorageStrategy("todo-poo-items");
const list = new TodoList(storage);
const renderer = new DomRenderer();
const app = new AppController(list, renderer);
app.init(mount);
