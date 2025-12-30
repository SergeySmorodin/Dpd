export class TaskBoard {
  init() {
    const addCardButtons = document.querySelectorAll('.add-card-btn');
    addCardButtons.forEach(button => {
      button.addEventListener('click', () => {
        const columnId = button.dataset.column;
        const cardsContainer = document.getElementById(`cards-${columnId}`);

        button.style.display = 'none';

        const form = document.createElement('div');
        form.className = 'card-form';
        form.innerHTML = `
          <textarea placeholder="Введите название карточки..." rows="3"></textarea>
          <div class="form-buttons">
            <button class="save-btn">Добавить</button>
            <button class="cancel-btn material-icons">close</button>
          </div>
        `;

        cardsContainer.append(form);

        const textarea = form.querySelector('textarea');
        const saveBtn = form.querySelector('.save-btn');
        const cancelBtn = form.querySelector('.cancel-btn');

        textarea.focus();

        saveBtn.addEventListener('click', () => {
          const text = textarea.value.trim();
          if (text) {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
              <span class="card-text">${text}</span>
              <span class="delete-icon material-icons">close</span>
            `;

            const deleteIcon = card.querySelector('.delete-icon');
            deleteIcon.addEventListener('click', (e) => {
              e.stopPropagation();
              card.remove();
            });

            cardsContainer.insertBefore(card, form);
          }

          cardsContainer.removeChild(form);
          button.style.display = 'block';
        });

        cancelBtn.addEventListener('click', () => {
          cardsContainer.removeChild(form);
          button.style.display = 'block';
        });

        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            cardsContainer.removeChild(form);
            button.style.display = 'block';
          }
        });
      });
    });
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const board = new TaskBoard();
    board.init();
  });
}
