document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginErrorMessage = document.getElementById('login-error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginErrorMessage.textContent = '';
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;
        const storedUser = localStorage.getItem(email);
        
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.password === password) {
                localStorage.setItem('loggedInUser', JSON.stringify({ email: user.email }));
                window.location.href = '../main/index.html'; 
            } else {
                loginErrorMessage.textContent = 'Невірний пароль.';
            }
        } else {
            loginErrorMessage.textContent = 'Користувача з таким email не існує.';
        }
    });
});
