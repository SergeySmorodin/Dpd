document.addEventListener('DOMContentLoaded', () => {
  const addCardButtons = document.querySelectorAll('.add-card-btn');

  addCardButtons.forEach(button => {
    button.addEventListener('click', () => {
      const columnId = button.dataset.column;
      const cardsContainer = document.getElementById(`cards-${columnId}`);

      // Скрыть кнопку добавления
      button.style.display = 'none';

      // Создать форму
      const form = document.createElement('div');
      form.className = 'card-form';
      form.innerHTML = `
        <textarea placeholder="Введите название карточки..." rows="3"></textarea>
        <div class="form-buttons">
          <button class="save-btn">Добавить</button>
          <button class="cancel-btn">X</button>
        </div>
      `;

      cardsContainer.append(form);

      const textarea = form.querySelector('textarea');
      const saveBtn = form.querySelector('.save-btn');
      const cancelBtn = form.querySelector('.cancel-btn');

      textarea.focus();

      // Сохранение
      saveBtn.addEventListener('click', () => {
        const text = textarea.value.trim();
        if (text) {
          const card = document.createElement('div');
          card.className = 'card';
          card.textContent = text;
          cardsContainer.insertBefore(card, form);
        }
        cardsContainer.removeChild(form);
        button.style.display = 'block';
      });

      // Отмена
      cancelBtn.addEventListener('click', () => {
        cardsContainer.removeChild(form);
        button.style.display = 'block';
      });

      // Отмена по Escape
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          cardsContainer.removeChild(form);
          button.style.display = 'block';
        }
      });
    });
  });
});