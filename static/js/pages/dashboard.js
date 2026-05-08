// ==================================================
// ELEMENT REFERENCE
// ==================================================

const tabBtns = document.querySelectorAll('.tabs .text');
const captionContent = document.querySelector('.recent-gens .body .captions');
const headlineContent = document.querySelector('.recent-gens .body .headlines');
const capCopyBtns = document.querySelectorAll('.caption .copy-btn');
const headCopyBtns = document.querySelectorAll('.headline .copy-btn');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO SWITCH TABS
function switchTab(e) {
    const target = e.target.id;

    if (target === 'captionsTabBtn') {
        captionContent.style.display = 'flex';
        headlineContent.style.display = 'none';
    } else {
        captionContent.style.display = 'none';
        headlineContent.style.display = 'flex';
    }

    tabBtns.forEach(btn => {
        btn.classList.toggle('selected', btn.id === target);
    });
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    captionContent.style.display = 'flex';
    headlineContent.style.display = 'none';
});

// & EVENT LISTENER FOR TAB-BTN CLICK
tabBtns.forEach((btn) => {
    btn.addEventListener('click', switchTab);
});

// & EVENT LISTENER FOR CAPTION COPY-BTN CLICK
capCopyBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        const captionText = e.target.closest('.caption').querySelector('.para').textContent;
        navigator.clipboard.writeText(captionText);
        btn.textContent = 'check';
    });
});

// & EVENT LISTENER FOR HEADLINE COPY-BTN CLICK
headCopyBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        const headlineText = e.target.closest('.headline').querySelector('.text').textContent;
        const headlineDesc = e.target.closest('.headline').querySelector('.mini').textContent;
        navigator.clipboard.writeText(headlineText + "\n" + headlineDesc);
        btn.textContent = 'check';
    });
});