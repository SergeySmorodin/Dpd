export class TaskBoard {
  constructor() {
    this.columns = ["column-1", "column-2", "column-3"];
    this.columnTitles = ["TODO", "IN PROGRESS", "DONE"];
    this.state = this.loadState();
    this.dragState = this.initDragState();
  }

  initDragState() {
    return {
      isDragging: false,
      phantom: null,
      originalCard: null,
      offsetX: 0,
      offsetY: 0,
      currentColumn: null,
      insertIndex: -1,
    };
  }

  loadState() {
    const saved = localStorage.getItem("taskBoardState");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Invalid localStorage state, resetting");
      }
    }
    return this.columns.reduce((acc, col) => ({ ...acc, [col]: [] }), {});
  }

  saveState() {
    localStorage.setItem("taskBoardState", JSON.stringify(this.state));
  }

  init() {
    this.renderBoard();
    this.bindGlobalListeners();
  }

  bindGlobalListeners() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-card-btn")) {
        this.showAddForm(e.target);
      } else if (e.target.classList.contains("delete-icon")) {
        const card = e.target.closest(".card");
        if (card) {
          this.removeCard(
            card.dataset.column,
            parseInt(card.dataset.index, 10),
          );
        }
      }
    });

    // Обработчики drag-and-drop
    document.addEventListener(
      "mouseup",
      () => this.dragState.isDragging && this.endDrag(),
    );
    document.addEventListener(
      "mousemove",
      (e) => this.dragState.isDragging && this.drag(e),
    );
  }

  renderBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    this.columns.forEach((colId, idx) => {
      const column = document.createElement("div");
      column.className = "column";
      column.id = colId;
      column.innerHTML = `<h2>${this.columnTitles[idx]}</h2>`;

      const cardsContainer = document.createElement("div");
      cardsContainer.className = "cards";
      cardsContainer.dataset.column = colId;

      this.state[colId].forEach((text, index) => {
        cardsContainer.append(this.createCard(text, colId, index));
      });

      // Индикатор вставки
      cardsContainer.append(
        Object.assign(document.createElement("div"), {
          className: "insert-indicator",
        }),
      );

      column.append(cardsContainer, this.createAddButton(colId));
      board.append(column);
    });
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

    card.addEventListener("mousedown", (e) => {
      if (!e.target.classList.contains("delete-icon")) {
        this.startDrag(e, card);
      }
    });

    return card;
  }

  createAddButton(columnId) {
    const button = document.createElement("button");
    button.className = "add-card-btn";
    button.dataset.column = columnId;
    button.textContent = "+ Add another card";
    return button;
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  startDrag(e, card) {
    e.preventDefault();

    this.dragState = {
      ...this.dragState,
      isDragging: true,
      originalCard: card,
      offsetX: e.clientX - card.getBoundingClientRect().left,
      offsetY: e.clientY - card.getBoundingClientRect().top,
    };

    // фантом
    const phantom = card.cloneNode(true);
    Object.assign(phantom.style, {
      position: "fixed",
      pointerEvents: "none",
      opacity: "0.8",
      zIndex: "1000",
      left: `${e.clientX - this.dragState.offsetX}px`,
      top: `${e.clientY - this.dragState.offsetY}px`,
    });
    phantom.classList.add("drag-phantom");
    document.body.append(phantom);

    this.dragState.phantom = phantom;
    card.style.visibility = "hidden";
  }

  drag(e) {
    if (!this.dragState.phantom) return;

    // Двигаем фантом
    Object.assign(this.dragState.phantom.style, {
      left: `${e.clientX - this.dragState.offsetX}px`,
      top: `${e.clientY - this.dragState.offsetY}px`,
    });

    const { columnId, insertIndex } = this.getInsertPosition(
      e.clientX,
      e.clientY,
    );
    this.dragState.currentColumn = columnId;
    this.dragState.insertIndex = insertIndex;

    // Обновляем индикатор
    this.clearInsertIndicator();
    if (columnId !== null && insertIndex !== -1) {
      this.activateIndicator(columnId, insertIndex);
    }
  }

  getInsertPosition(clientX, clientY) {
    for (const colId of this.columns) {
      const container = document.querySelector(
        `.cards[data-column="${colId}"]`,
      );
      if (!container) continue;

      const rect = container.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        const cards = Array.from(container.children).filter((el) =>
          el.classList.contains("card"),
        );
        let insertIndex = cards.length;

        for (let i = 0; i < cards.length; i++) {
          const cardRect = cards[i].getBoundingClientRect();
          if (clientY < cardRect.top + cardRect.height / 2) {
            insertIndex = i;
            break;
          }
        }

        return { columnId: colId, insertIndex };
      }
    }
    return { columnId: null, insertIndex: -1 };
  }

  endDrag() {
    if (!this.dragState.isDragging) return;

    const { originalCard, currentColumn, insertIndex } = this.dragState;

    if (originalCard && currentColumn !== null && insertIndex !== -1) {
      const fromCol = originalCard.dataset.column;
      const fromIdx = parseInt(originalCard.dataset.index, 10);
      const text = this.state[fromCol][fromIdx];

      // Перемещаем данные
      this.state[fromCol].splice(fromIdx, 1);
      this.state[currentColumn].splice(insertIndex, 0, text);
      this.saveState();
      this.renderBoard();
    } else if (originalCard) {
      originalCard.style.visibility = "visible";
    }

    // Очистка
    this.dragState.phantom?.remove();
    this.clearInsertIndicator();
    this.dragState = this.initDragState();
  }

  showAddForm(button) {
    const columnId = button.dataset.column;
    const container = document.querySelector(
      `.cards[data-column="${columnId}"]`,
    );
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
    container.insertBefore(form, indicator);

    const textarea = form.querySelector("textarea");
    const saveBtn = form.querySelector(".save-btn");
    const cancelBtn = form.querySelector(".cancel-btn");

    textarea.focus();

    const hide = () => {
      if (form.parentNode) {
        form.parentNode.removeChild(form);
      }
      button.style.display = "block";
    };

    const save = () => {
      const text = textarea.value.trim();
      if (text) {
        this.state[columnId].push(text);
        this.saveState();
        this.renderBoard();
      }
      hide();
    };

    saveBtn.addEventListener("click", save);
    cancelBtn.addEventListener("click", hide);
    textarea.addEventListener("keydown", (e) =>
      e.key === "Enter" && (e.ctrlKey || e.metaKey)
        ? save()
        : e.key === "Escape" && hide(),
    );
  }

  removeCard(columnId, index) {
    this.state[columnId].splice(index, 1);
    this.saveState();
    this.renderBoard();
  }

  clearInsertIndicator() {
    document.querySelectorAll(".insert-indicator").forEach((el) => {
      el.style.opacity = "0";
    });
  }

  activateIndicator(columnId, index) {
    const indicator = document.querySelector(
      `.cards[data-column="${columnId}"] .insert-indicator`,
    );
    if (!indicator) return;

    indicator.style.opacity = "1";
    const container = indicator.parentElement;
    const cards = Array.from(container.children).filter((el) =>
      el.classList.contains("card"),
    );

    container.insertBefore(indicator, cards[index] || null);
  }
}

document.addEventListener("DOMContentLoaded", () => new TaskBoard().init());
