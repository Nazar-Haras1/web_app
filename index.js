document.addEventListener('DOMContentLoaded', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        window.location.href = '../login-page/login.html';
        return; 
    }

    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
        }
    });

    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            link.classList.add('active');
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        
        window.location.href = '../login-page/login.html';
    });
});
