document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerErrorMessage = document.getElementById('register-error-message');

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerErrorMessage.textContent = '';
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        
        if (!validateEmail(email)) {
            registerErrorMessage.textContent = 'Будь ласка, введіть коректний email.';
            return;
        }
        if (password.length < 6) {
            registerErrorMessage.textContent = 'Пароль має містити щонайменше 6 символів.';
            return;
        }
        
        const user = { email, password };
        localStorage.setItem(email, JSON.stringify(user));
        alert('Реєстрація успішна! Тепер увійдіть.');
        
        window.location.href = '../login-page/login.html'; 
    });

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };
});
