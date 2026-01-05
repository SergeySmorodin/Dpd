import { StorageService } from "./storageService.js";
import { CardManager } from "./cardManager.js";
import { DragManager } from "./dragManager.js";

export class TaskBoard {
  constructor() {
    this.columns = ["column-1", "column-2", "column-3"];
    this.columnTitles = ["TODO", "IN PROGRESS", "DONE"];

    this.storageService = new StorageService();
    this.cardManager = new CardManager(this.storageService);
    this.dragManager = new DragManager();

    const defaultState = this.columns.reduce(
      (acc, col) => ({ ...acc, [col]: [] }),
      {},
    );
    this.state = this.storageService.loadState(defaultState);
  }

  init() {
    this.renderBoard();
    this.bindGlobalListeners();
  }

  bindGlobalListeners() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("add-card-btn")) {
        this.handleAddCard(e.target);
      } else if (e.target.classList.contains("delete-icon")) {
        this.handleDeleteCard(e.target);
      }
    });

    document.addEventListener("mouseup", () => {
      if (this.dragManager.isDragging()) {
        this.handleDragEnd();
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (this.dragManager.isDragging()) {
        this.dragManager.drag(e, this.columns);
      }
    });
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
        const card = this.cardManager.createCard(text, colId, index);
        card.addEventListener("mousedown", (e) => {
          if (!e.target.classList.contains("delete-icon")) {
            this.dragManager.startDrag(e, card);
          }
        });
        cardsContainer.append(card);
      });

      const insertIndicator = document.createElement("div");
      insertIndicator.className = "insert-indicator";
      cardsContainer.append(insertIndicator);

      column.append(cardsContainer, this.cardManager.createAddButton(colId));
      board.append(column);
    });
  }

  handleAddCard(button) {
    this.cardManager.showAddForm(button, (columnId, text) => {
      this.state = this.cardManager.addCard(this.state, columnId, text);
      this.storageService.saveState(this.state);
      this.renderBoard();
    });
  }

  handleDeleteCard(deleteIcon) {
    const card = deleteIcon.closest(".card");
    if (card) {
      this.state = this.cardManager.removeCard(
        this.state,
        card.dataset.column,
        parseInt(card.dataset.index, 10),
      );
      this.storageService.saveState(this.state);
      this.renderBoard();
    }
  }

  handleDragEnd() {
    const result = this.dragManager.endDrag();

    if (result.moved) {
      this.state = this.cardManager.moveCard(
        this.state,
        result.fromCol,
        result.fromIdx,
        result.toCol,
        result.toIdx,
      );
      this.storageService.saveState(this.state);
      this.renderBoard();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TaskBoard().init();
});
