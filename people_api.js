// ====== ЛОГІКА ДЛЯ ЗАВАНТАЖЕННЯ ТА ВІДОБРАЖЕННЯ КОРИСТУВАЧІВ ======
document.addEventListener('DOMContentLoaded', () => {
// Елемент DOM для відображення карток
const usersContainer = document.getElementById("users-container");

// Змінна для кешування даних користувачів
let usersCache = null;

/**
 * Рендеринг карток користувачів.
 * @param {Array<Object>} users - Масив об'єктів користувачів з API.
 */
const renderUserCards = (users) => {
    usersContainer.innerHTML = ""; 
    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';
        card.innerHTML = `
            <h3>${user.name}</h3>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Телефон:</strong> ${user.phone}</p>
            <p><strong>Компанія:</strong> ${user.company.name}</p>
        `;
        usersContainer.appendChild(card);
    });
};


const fetchAndRenderUsers = async () => {
    if (usersCache) {
        console.log("Loading users from cache.");
        renderUserCards(usersCache);
        return;
    }

    try {
        console.log("Fetching users from API...");
        usersContainer.innerHTML = `<p class="message">Завантаження даних...</p>`;

        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();

        usersCache = users;
        
        renderUserCards(users);
    } catch (error) {
        console.error("Помилка завантаження даних користувачів:", error);
        usersContainer.innerHTML = `<p class="message error-message">Помилка завантаження даних: ${error.message}</p>`;
    }
};

fetchAndRenderUsers();
});