export class DragManager {
  constructor() {
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
      cardHeight: 0,
    };
  }

  startDrag(e, card) {
    e.preventDefault();

    const cardHeight = card.offsetHeight;

    this.dragState = {
      ...this.initDragState(),
      isDragging: true,
      originalCard: card,
      offsetX: e.clientX - card.getBoundingClientRect().left,
      offsetY: e.clientY - card.getBoundingClientRect().top,
      cardHeight,
    };

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

    return this.dragState;
  }

  drag(e, columns) {
    if (!this.dragState.phantom) return;

    Object.assign(this.dragState.phantom.style, {
      left: `${e.clientX - this.dragState.offsetX}px`,
      top: `${e.clientY - this.dragState.offsetY}px`,
    });

    const { columnId, insertIndex } = this.getInsertPosition(
      e.clientX,
      e.clientY,
      columns,
    );
    this.dragState.currentColumn = columnId;
    this.dragState.insertIndex = insertIndex;

    this.clearInsertIndicator();
    if (columnId !== null && insertIndex !== -1) {
      this.activateIndicator(columnId, insertIndex);
    }
  }

  getInsertPosition(clientX, clientY, columns) {
    for (const colId of columns) {
      const container = document.querySelector(
        `.cards[data-column="${colId}"]`,
      );
      if (!container) continue;

      const rect = container.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        const allElements = Array.from(container.children);
        const cards = allElements.filter(
          (el) =>
            el.classList.contains("card") && el !== this.dragState.originalCard,
        );

        if (cards.length === 0) {
          return { columnId: colId, insertIndex: 0 };
        }

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
    const { originalCard, currentColumn, insertIndex } = this.dragState;

    const result = {
      moved: false,
      fromCol: null,
      fromIdx: null,
      toCol: currentColumn,
      toIdx: insertIndex,
    };

    if (originalCard && currentColumn !== null && insertIndex !== -1) {
      result.moved = true;
      result.fromCol = originalCard.dataset.column;
      result.fromIdx = parseInt(originalCard.dataset.index, 10);
    } else if (originalCard) {
      originalCard.style.visibility = "visible";
    }

    // Очистка
    this.dragState.phantom?.remove();
    this.clearInsertIndicator();
    this.dragState = this.initDragState();

    return result;
  }

  clearInsertIndicator() {
    document.querySelectorAll(".insert-indicator").forEach((el) => {
      el.style.opacity = "0";
      el.style.height = "0";
    });
  }

  activateIndicator(columnId, index) {
    const container = document.querySelector(
      `.cards[data-column="${columnId}"]`,
    );
    if (!container) return;

    const indicator = container.querySelector(".insert-indicator");
    if (!indicator) return;

    indicator.style.height = `${this.dragState.cardHeight}px`;
    indicator.style.opacity = "1";

    const allCards = Array.from(container.children);
    const originalIndex = allCards.indexOf(this.dragState.originalCard);

    if (
      originalIndex !== -1 &&
      columnId === this.dragState.originalCard?.dataset?.column
    ) {
      const adjustedIndex =
        index >= originalIndex ? Math.max(0, index - 1) : index;

      const targetElements = allCards.filter(
        (el) =>
          el !== this.dragState.originalCard &&
          el !== indicator &&
          !el.classList.contains("card-form"),
      );

      if (adjustedIndex < targetElements.length) {
        targetElements[adjustedIndex].before(indicator);
      } else {
        container.append(indicator);
      }
    } else {
      const targetElements = allCards.filter(
        (el) =>
          el.classList.contains("card") &&
          el !== indicator &&
          !el.classList.contains("card-form"),
      );

      if (index < targetElements.length) {
        targetElements[index].before(indicator);
      } else {
        container.append(indicator);
      }
    }
  }

  isDragging() {
    return this.dragState.isDragging;
  }
}
