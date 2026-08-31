function setTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    } else { null }
}

function setAccent() {
    const savedAccent = localStorage.getItem('accent');
    if (!savedAccent) return;

    document.body.classList.add(savedAccent);
}

function setShadow() {
    const shadow = localStorage.getItem('shadow') === 'enabled';
    if (!shadow) return;

    document.body.classList.add('shadow-enabled');
}

document.addEventListener('DOMContentLoaded', () => {
    setTheme();
    setAccent();
    setShadow();
});