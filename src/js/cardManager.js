export class CardManager {
  constructor(storageService) {
    this.storageService = storageService;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  createCard(text, columnId, index) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.column = columnId;
    card.dataset.index = index;
    card.innerHTML = `
        <span class="card-text">${this.escapeHtml(text)}</span>
        <span class="delete-icon material-icons">close</span>
      `;
    return card;
  }

  createAddButton(columnId) {
    const button = document.createElement("button");
    button.className = "add-card-btn";
    button.dataset.column = columnId;
    button.textContent = "+ Add another card";
    return button;
  }

  showAddForm(button, onSave) {
    const columnId = button.dataset.column;
    const container = button.closest(".column").querySelector(".cards");
    if (!container) return;

    button.style.display = "none";

    const form = document.createElement("div");
    form.className = "card-form";
    form.innerHTML = `
        <textarea placeholder="Введите название карточки..." rows="3"></textarea>
        <div class="form-buttons">
          <button class="save-btn">Добавить</button>
          <button class="cancel-btn material-icons">close</button>
        </div>
      `;

    const indicator = container.querySelector(".insert-indicator");
    indicator.before(form);

    const textarea = form.querySelector("textarea");
    const saveBtn = form.querySelector(".save-btn");
    const cancelBtn = form.querySelector(".cancel-btn");

    textarea.focus();

    const hide = () => {
      form.remove();
      button.style.display = "block";
    };

    const save = () => {
      const text = textarea.value.trim();
      if (text) {
        onSave(columnId, text);
      }
      hide();
    };

    saveBtn.addEventListener("click", save);
    cancelBtn.addEventListener("click", hide);
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        save();
      } else if (e.key === "Escape") {
        hide();
      }
    });
  }

  removeCard(state, columnId, index) {
    state[columnId].splice(index, 1);
    return state;
  }

  addCard(state, columnId, text) {
    state[columnId].push(text);
    return state;
  }

  moveCard(state, fromCol, fromIdx, toCol, toIdx) {
    const text = state[fromCol][fromIdx];
    const newState = { ...state };

    newState[fromCol] = [...state[fromCol]];
    newState[toCol] = [...state[toCol]];

    newState[fromCol].splice(fromIdx, 1);
    newState[toCol].splice(toIdx, 0, text);

    return newState;
  }
}
