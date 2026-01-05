import { TaskBoard } from "../js/taskBoard";

describe("TaskBoard", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<div id="board"></div>';
    new TaskBoard().init();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("создаёт карточку при сохранении", () => {
    const addBtn = document.querySelector(
      '.add-card-btn[data-column="column-1"]',
    );
    expect(addBtn).toBeTruthy();
    addBtn.click();

    const textarea = document.querySelector("textarea");
    const saveBtn = document.querySelector(".save-btn");

    expect(textarea).toBeTruthy();
    expect(saveBtn).toBeTruthy();

    textarea.value = "Новая задача";
    saveBtn.click();

    const card = document.querySelector(".card");
    expect(card).toBeTruthy();
    expect(card.querySelector(".card-text").textContent).toBe("Новая задача");
    expect(card.querySelector(".delete-icon")).toBeTruthy();
  });

  test("удаляет карточку при клике на иконку", () => {
    const addBtn = document.querySelector(
      '.add-card-btn[data-column="column-1"]',
    );
    expect(addBtn).toBeTruthy();
    addBtn.click();

    const textarea = document.querySelector("textarea");
    const saveBtn = document.querySelector(".save-btn");

    expect(textarea).toBeTruthy();
    expect(saveBtn).toBeTruthy();

    textarea.value = "Удалить меня";
    saveBtn.click();

    const deleteIcon = document.querySelector(".delete-icon");
    expect(deleteIcon).toBeTruthy();
    deleteIcon.click();

    expect(document.querySelector(".card")).toBeNull();
  });
});
