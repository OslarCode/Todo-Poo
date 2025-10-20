import { Renderer } from "./Renderer.js";
import { i18n } from "../i18n/i18n.js";

export class DomRenderer extends Renderer {
  #root;
  #form;
  #input;
  #list;
  #counter;
  #filtersBar;
  #btnAll;
  #btnActive;
  #btnCompleted;
  #btnClearCompleted;
  #btnLangES;
  #btnLangEN;
  #controller;
  #currentFilter = "all";
  #currentCounts;

  #backdrop;
  #dialog;
  #modalTitle;
  #modalDesc;
  #btnCancel;
  #btnConfirm;
  #pending = null;
  #lastFocusedEl = null;

  mount(rootEl) {
    this.#root = rootEl;

    const wrapper = document.createElement("div");

    this.#form = document.createElement("form");
    this.#form.className = "todo-form";

    const formLabel = document.createElement("label");
    formLabel.htmlFor = "new-task";
    formLabel.className = "sr-only";
    formLabel.textContent = i18n.t("input.ariaLabel");

    this.#input = document.createElement("input");
    this.#input.className = "todo-input";
    this.#input.id = "new-task";
    this.#input.name = "title";
    this.#input.placeholder = i18n.t("input.placeholder");
    this.#input.autocomplete = "off";
    this.#input.setAttribute("aria-label", i18n.t("input.ariaLabel"));

    const addBtn = document.createElement("button");
    addBtn.type = "submit";
    addBtn.className = "btn btn-accent";
    addBtn.textContent = i18n.t("btn.add");

    this.#form.append(formLabel, this.#input, addBtn);

    this.#filtersBar = document.createElement("div");
    this.#filtersBar.style =
      "display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin:6px 0 10px;";
    this.#filtersBar.setAttribute("role", "toolbar");
    this.#filtersBar.setAttribute("aria-label", i18n.t("filters.aria"));

    const group = document.createElement("div");
    group.style = "display:flex; gap:6px;";

    this.#btnAll = this.#makeFilterBtn(i18n.t("filters.all"), "all");
    this.#btnActive = this.#makeFilterBtn(i18n.t("filters.active"), "active");
    this.#btnCompleted = this.#makeFilterBtn(
      i18n.t("filters.completed"),
      "completed"
    );
    group.append(this.#btnAll, this.#btnActive, this.#btnCompleted);

    this.#btnClearCompleted = document.createElement("button");
    this.#btnClearCompleted.className = "btn btn-danger";
    this.#btnClearCompleted.textContent = i18n.t("btn.clearCompleted");
    this.#btnClearCompleted.setAttribute(
      "aria-label",
      i18n.t("btn.clearCompleted")
    );

    const langBox = document.createElement("div");
    langBox.style = "display:flex; gap:6px; margin-left:auto;";
    this.#btnLangES = this.#makeLangBtn("es");
    this.#btnLangEN = this.#makeLangBtn("en");
    langBox.append(this.#btnLangES, this.#btnLangEN);

    this.#filtersBar.append(group, this.#btnClearCompleted, langBox);

    this.#list = document.createElement("ul");
    this.#list.className = "list";
    this.#list.id = "todo-list";
    this.#list.setAttribute("aria-label", "Todos");

    const footerBar = document.createElement("div");
    footerBar.style =
      "display:flex; justify-content:space-between; align-items:center; margin-top:8px;";
    this.#counter = document.createElement("span");
    this.#counter.className = "counter";
    this.#counter.setAttribute("aria-live", "polite");
    this.#counter.textContent = "0";

    footerBar.append(this.#counter);

    wrapper.append(this.#form, this.#filtersBar, this.#list, footerBar);
    this.#root.replaceChildren(wrapper);
    this.#setActiveFilterButton(this.#currentFilter);
    this.#highlightLang();

    this.#buildModal();

    i18n.onChange(() => this.#retitleStatics());
  }

  #makeFilterBtn(label, type) {
    const b = document.createElement("button");
    b.className = "btn";
    b.type = "button";
    b.setAttribute("data-filter", type);
    b.textContent = label;
    b.setAttribute(
      "aria-pressed",
      type === this.#currentFilter ? "true" : "false"
    );
    b.setAttribute(
      "aria-label",
      i18n.t("aria.show", {
        label:
          type === "active"
            ? i18n.t("filters.active").toLowerCase()
            : type === "completed"
            ? i18n.t("filters.completed").toLowerCase()
            : i18n.t("filters.all").toLowerCase(),
      })
    );
    return b;
  }

  #makeLangBtn(lang) {
    const b = document.createElement("button");
    b.className = "btn";
    b.type = "button";
    b.setAttribute("data-lang", lang);
    b.textContent =
      lang === "es" ? i18n.t("btn.lang.es") : i18n.t("btn.lang.en");
    b.title = lang.toUpperCase();
    return b;
  }

  #highlightLang() {
    const current = i18n.getLang();
    this.#btnLangES.style.outline =
      current === "es" ? "2px solid var(--accent)" : "none";
    this.#btnLangEN.style.outline =
      current === "en" ? "2px solid var(--accent)" : "none";
  }

  #retitleStatics() {
    this.#input.placeholder = i18n.t("input.placeholder");
    this.#input.setAttribute("aria-label", i18n.t("input.ariaLabel"));
    this.#form.querySelector("button[type='submit']").textContent =
      i18n.t("btn.add");

    this.#btnAll.textContent = i18n.t("filters.all");
    this.#btnActive.textContent = i18n.t("filters.active");
    this.#btnCompleted.textContent = i18n.t("filters.completed");
    this.#filtersBar.setAttribute("aria-label", i18n.t("filters.aria"));

    this.#btnClearCompleted.textContent = i18n.t("btn.clearCompleted");
    this.#btnClearCompleted.setAttribute(
      "aria-label",
      i18n.t("btn.clearCompleted")
    );

    this.#btnLangES.textContent = i18n.t("btn.lang.es");
    this.#btnLangEN.textContent = i18n.t("btn.lang.en");
    this.#highlightLang();
  }

  bindEvents(controller) {
    this.#controller = controller;

    this.#form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = this.#input.value.trim();
      if (!title) return;
      this.#controller.handleAdd(title);
      this.#input.value = "";
      this.#input.focus();
    });

    this.#input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const title = this.#input.value.trim();
        if (!title) return;
        this.#controller.handleAdd(title);
        this.#input.value = "";
        this.#input.focus();
      }
    });

    this.#list.addEventListener("click", (e) => {
      const target = e.target;

      if (target.matches("input[type='checkbox'][data-id]")) {
        this.#controller.handleToggle(target.getAttribute("data-id"));
        return;
      }
      if (target.matches("button[data-action='remove'][data-id]")) {
        const id = target.getAttribute("data-id");
        const titleEl = this.#list.querySelector(
          `.title[data-id="${CSS.escape(id)}"]`
        );
        const title = titleEl ? titleEl.textContent || "" : "";
        this.#openConfirm(
          { type: "deleteOne", payload: { id, title } },
          target
        );
        return;
      }
      if (target.matches("button[data-action='edit'][data-id]")) {
        const id = target.getAttribute("data-id");
        const titleEl = this.#list.querySelector(
          `.title[data-id="${CSS.escape(id)}"]`
        );
        if (titleEl) this.#enterEditMode(titleEl, id);
        return;
      }
    });

    this.#list.addEventListener("dblclick", (e) => {
      const titleEl = e.target.closest(".title[data-id]");
      if (!titleEl) return;
      const id = titleEl.getAttribute("data-id");
      this.#enterEditMode(titleEl, id);
    });

    this.#filtersBar.addEventListener("click", (e) => {
      const btnFilter = e.target.closest("button[data-filter]");
      if (btnFilter) {
        const type = btnFilter.getAttribute("data-filter");
        this.#currentFilter = type;
        this.#setActiveFilterButton(type);
        this.#controller.handleFilter(type);
        return;
      }
      const btnLang = e.target.closest("button[data-lang]");
      if (btnLang) {
        i18n.setLang(btnLang.getAttribute("data-lang"));
        this.#retitleStatics();
      }
    });

    this.#btnClearCompleted.addEventListener("click", (e) => {
      const counts = this.#currentCounts || { completed: 0 };
      if (counts.completed === 0) return;
      this.#openConfirm(
        { type: "clearCompleted", payload: { n: counts.completed } },
        e.currentTarget
      );
    });

    document.addEventListener("keydown", (e) => {
      if (this.#isModalOpen()) return;
      if (e.altKey && ["1", "2", "3"].includes(e.key)) {
        e.preventDefault();
        const map = { 1: "all", 2: "active", 3: "completed" };
        const type = map[e.key];
        this.#currentFilter = type;
        this.#setActiveFilterButton(type);
        this.#controller.handleFilter(type);
      } else if (e.key.toLowerCase() === "n") {
        if (this.#list.querySelector(".edit-input")) return;
        this.#input.focus();
      }
    });
  }

  #setActiveFilterButton(type) {
    const all = [this.#btnAll, this.#btnActive, this.#btnCompleted];
    for (const b of all) b.setAttribute("aria-pressed", "false");
    const current =
      type === "active"
        ? this.#btnActive
        : type === "completed"
        ? this.#btnCompleted
        : this.#btnAll;
    current.setAttribute("aria-pressed", "true");
  }

  render(items, counts, activeFilter = "all") {
    this.#currentCounts = counts;

    this.#list.replaceChildren(
      ...items.map(({ id, title, completed }) => {
        const li = document.createElement("li");
        li.className = `item${completed ? " completed" : ""}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.checked = completed;
        checkbox.setAttribute("data-id", id);
        checkbox.setAttribute(
          "aria-label",
          completed
            ? i18n.t("aria.toggle.uncheck")
            : i18n.t("aria.toggle.check")
        );

        const h = document.createElement("p");
        h.className = "title";
        h.textContent = title;
        h.setAttribute("tabindex", "0");
        h.setAttribute("data-id", id);
        h.setAttribute("title", i18n.t("aria.editTitle"));

        const actions = document.createElement("div");
        actions.className = "actions";

        const edit = document.createElement("button");
        edit.className = "btn";
        edit.setAttribute("data-action", "edit");
        edit.setAttribute("data-id", id);
        edit.setAttribute("aria-label", i18n.t("aria.editTitle"));
        edit.textContent = i18n.t("btn.edit");

        const del = document.createElement("button");
        del.className = "btn btn-danger";
        del.setAttribute("data-action", "remove");
        del.setAttribute("data-id", id);
        del.setAttribute("aria-label", i18n.t("aria.deleteNamed", { title }));
        del.textContent = i18n.t("btn.delete");

        actions.append(edit, del);
        li.append(checkbox, h, actions);
        return li;
      })
    );

    const label =
      activeFilter === "active"
        ? i18n.t("counter.label.active")
        : activeFilter === "completed"
        ? i18n.t("counter.label.completed")
        : i18n.t("counter.label.all");

    this.#counter.textContent = i18n.t("counter.total", {
      n: String(items.length),
      label,
      done: String(counts.completed),
      total: String(counts.total),
    });
  }

  #enterEditMode(titleEl, id) {
    const row = titleEl.closest(".item");
    if (!row || row.classList.contains("editing")) return;

    row.classList.add("editing");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = titleEl.textContent || "";
    input.setAttribute("aria-label", i18n.t("aria.editTitle"));
    input.setAttribute("data-id", id);

    titleEl.after(input);
    input.focus();
    input.setSelectionRange(0, input.value.length);

    const cleanup = () => {
      if (input.isConnected) input.remove();
      row.classList.remove("editing");
      titleEl.focus();
    };

    const save = () => {
      const newTitle = input.value.trim();
      if (newTitle && newTitle !== (titleEl.textContent || "").trim()) {
        this.#controller.handleRename(id, newTitle);
      }
      cleanup();
    };

    const cancel = () => cleanup();

    input.addEventListener("blur", save);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        save();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    });
  }

  #buildModal() {
    this.#backdrop = document.createElement("div");
    this.#backdrop.className = "modal-backdrop";
    this.#backdrop.hidden = true;

    this.#dialog = document.createElement("div");
    this.#dialog.className = "modal-dialog";
    this.#dialog.setAttribute("role", "dialog");
    this.#dialog.setAttribute("aria-modal", "true");

    const titleId = "confirm-title";
    const descId = "confirm-desc";
    this.#dialog.setAttribute("aria-labelledby", titleId);
    this.#dialog.setAttribute("aria-describedby", descId);

    this.#modalTitle = document.createElement("h2");
    this.#modalTitle.className = "modal-title";
    this.#modalTitle.id = titleId;

    this.#modalDesc = document.createElement("p");
    this.#modalDesc.className = "modal-desc";
    this.#modalDesc.id = descId;

    const actions = document.createElement("div");
    actions.className = "modal-actions";

    this.#btnCancel = document.createElement("button");
    this.#btnCancel.className = "btn";
    this.#btnCancel.type = "button";

    this.#btnConfirm = document.createElement("button");
    this.#btnConfirm.className = "btn btn-danger";
    this.#btnConfirm.type = "button";

    actions.append(this.#btnCancel, this.#btnConfirm);
    this.#dialog.append(this.#modalTitle, this.#modalDesc, actions);
    this.#backdrop.append(this.#dialog);
    document.body.append(this.#backdrop);

    this.#btnCancel.addEventListener("click", () => this.#closeConfirm(false));
    this.#btnConfirm.addEventListener("click", () => this.#closeConfirm(true));
    this.#backdrop.addEventListener("mousedown", (e) => {
      if (e.target === this.#backdrop) this.#closeConfirm(false);
    });
    this.#backdrop.addEventListener("keydown", (e) => this.#trapKey(e), true);

    this.#localizeModalButtons();
    i18n.onChange(() => this.#localizeModalButtons());
  }

  #localizeModalButtons() {
    this.#btnCancel.textContent = i18n.t("btn.cancel");
    this.#btnConfirm.textContent = i18n.t("btn.confirm");
  }

  #openConfirm(config, triggerEl) {
    this.#pending = config;
    this.#lastFocusedEl = triggerEl || document.activeElement;

    if (config.type === "deleteOne") {
      this.#modalTitle.textContent = i18n.t("confirm.delete.title");
      const t = (config.payload.title || "").trim();
      this.#modalDesc.textContent = t
        ? i18n.t("confirm.delete.desc.named", { title: t })
        : i18n.t("confirm.delete.desc.unnamed");
    } else {
      this.#modalTitle.textContent = i18n.t("confirm.clear.title");
      this.#modalDesc.textContent = i18n.t("confirm.clear.desc", {
        n: String(config.payload.n ?? 0),
      });
    }

    this.#backdrop.hidden = false;
    this.#backdrop.classList.add("open");
    this.#btnCancel.focus();
  }

  #closeConfirm(confirmed) {
    this.#backdrop.classList.remove("open");
    this.#backdrop.hidden = true;

    if (confirmed && this.#pending) {
      if (this.#pending.type === "deleteOne") {
        const { id } = this.#pending.payload || {};
        if (id) this.#controller.handleRemove(id);
      } else if (this.#pending.type === "clearCompleted") {
        this.#controller.handleClearCompleted();
      }
    }

    this.#pending = null;
    if (this.#lastFocusedEl && this.#lastFocusedEl.focus) {
      this.#lastFocusedEl.focus();
    }
    this.#lastFocusedEl = null;
  }

  #isModalOpen() {
    return !this.#backdrop.hidden;
  }

  #trapKey(e) {
    if (!this.#isModalOpen()) return;

    const focusable = this.#dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const els = Array.from(focusable).filter(
      (el) => !el.hasAttribute("disabled")
    );
    const first = els[0];
    const last = els[els.length - 1];

    if (e.key === "Escape") {
      e.preventDefault();
      this.#closeConfirm(false);
      return;
    }

    if (e.key === "Tab") {
      if (els.length === 0) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      return;
    }

    if (e.key === "Enter") {
      const isBtn = document.activeElement?.tagName === "BUTTON";
      if (!isBtn) {
        e.preventDefault();
        this.#closeConfirm(true);
      }
    }
  }
}
