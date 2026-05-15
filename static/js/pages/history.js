// ==================================================
// ELEMENT REFERENCE
// ==================================================

const popovers = document.querySelector('.main').querySelectorAll('[popover]');
const deleteLink = document.querySelector('#deleteConfirmation .ulink');

const cards = document.querySelectorAll('.card');
const colors = [ '#F6DECBA0', '#FCC5D2A0', '#DFDDE3A0', '#CCF5F5A0', '#C2EDFFA0' ];

const copyBtns = document.querySelectorAll(".copy-content");
const deleteBtns = document.querySelectorAll('.delete-btn');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO APPLY RANDOM BACKGROUND COLOR TO EACH CARD
function applyRandomBackgroundColor() {
    cards.forEach(card => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        card.style.backgroundColor = randomColor;
    });
}

// * FUNCTION TO COPY CONTENT TO CLIPBOARD
function copyToClipboard(btnElement) {
    const content = btnElement.dataset.content;
    navigator.clipboard.writeText(content);
    btnElement.textContent = 'check';
}

// * FUNCTION TO CREATE HREF OF A TAG FOR DELETION
function createDeleteHref(btnElement) {
    const id = btnElement.dataset.id;
    const type = btnElement.dataset.type;
    return `/app/history/delete/${type}?id=${id}`;
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', applyRandomBackgroundColor);

// & EVENT LISTENER FOR POPOVERS BEFORE-TOGGLE
popovers.forEach(popover => {
    popover.addEventListener('beforetoggle', () => {
        setTimeout(() => {
            popover.classList.toggle('open');
        }, 100);
    });
});

// & EVENT LISTENERS FOR COPY-BTNS CLICK
copyBtns.forEach(btn => { btn.addEventListener('click', () => { copyToClipboard(btn); }); });

// & EVENT LISTENERS FOR DELETE-BTNS CLICK
deleteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const url = createDeleteHref(btn);
        deleteLink.setAttribute('href', url);
    });
});