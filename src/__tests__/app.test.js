import { TaskBoard } from "../js/app";

describe("TaskBoard", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="container">
        <div class="board">
          <div class="column" id="column-1">
            <h2>Запланировано</h2>
            <div class="cards" id="cards-1"></div>
            <button class="add-card-btn" data-column="1">+ Add another card</button>
          </div>
        </div>
      </div>
    `;

    const board = new TaskBoard();
    board.init();
  });

  test("создаёт карточку при сохранении", () => {
    const addBtn = document.querySelector(".add-card-btn");
    addBtn.click();

    const textarea = document.querySelector("textarea");
    const saveBtn = document.querySelector(".save-btn");

    textarea.value = "Новая задача";
    saveBtn.click();

    const card = document.querySelector(".card");
    expect(card).toBeTruthy();
    expect(card.querySelector(".card-text").textContent).toBe("Новая задача");
    expect(card.querySelector(".delete-icon")).toBeTruthy();
  });

  test("удаляет карточку при клике на иконку", () => {
    const addBtn = document.querySelector(".add-card-btn");
    addBtn.click();

    const textarea = document.querySelector("textarea");
    const saveBtn = document.querySelector(".save-btn");

    textarea.value = "Удалить меня";
    saveBtn.click();

    const deleteIcon = document.querySelector(".delete-icon");
    deleteIcon.click();

    expect(document.querySelector(".card")).toBeNull();
  });

  test("закрывает форму при отмене", () => {
    const addBtn = document.querySelector(".add-card-btn");
    addBtn.click();

    const cancelBtn = document.querySelector(".cancel-btn");
    cancelBtn.click();

    expect(document.querySelector(".card-form")).toBeNull();
    expect(addBtn.style.display).toBe("block");
  });
});
