// ==================================================
// ELEMENT REFERENCE
// ==================================================

const popovers = document.querySelector('.main').querySelectorAll('[popover]');
const deleteLink = document.querySelector('#deleteConfirmation .ulink');

const searchInput = document.querySelector('.search-bar .input');
const searchBtn = document.querySelector('.search-bar .btn');

const cards = document.querySelectorAll('.card');
const colors = [ '#F6DECBA0', '#FCC5D2A0', '#DFDDE3A0', '#CCF5F5A0', '#C2EDFFA0' ];

const copyBtns = document.querySelectorAll(".copy-content");
const deleteBtns = document.querySelectorAll('.delete-btn');

const showAllBtn = document.getElementById('showAll');
const showCaptions = document.getElementById('showCaptions');
const showHeadlines = document.getElementById('showHeadlines');
const showSaved = document.getElementById('showSaved');

// ==================================================
// IMPORTS
// ==================================================

import { sendToastNotification } from '../components/toast.js';

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
    sendToastNotification('Content copied to clipboard!', 'check', 'var(--color-state-green)');
}

// * FUNCTION TO CREATE HREF OF A TAG FOR DELETION
function createDeleteHref(btnElement) {
    const id = btnElement.dataset.id;
    const type = btnElement.dataset.type;
    return `/app/history/delete/${type}?id=${id}`;
}

// * FUNCTION TO HIDE ALL CARDS EXCEPT SPECIFIC ONES
function filterCards(filterType) {
    cards.forEach(card => {
        if (card.dataset.type === filterType || filterType === 'all') {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// * FUNCTION TO ADD EVENT LISTENER TO FILTER BUTTONS
function addFilterEvent() {
    showAllBtn.addEventListener('click', () => filterCards('all'));
    showCaptions.addEventListener('click', () => filterCards('caption'));
    showHeadlines.addEventListener('click', () => filterCards('headline'));
    showSaved.addEventListener('click', () => filterCards('saved'));
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    applyRandomBackgroundColor();
    addFilterEvent();
});

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

// & EVENT LISTENER FOR SEARCH-BAR BUTTON CLICK
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    
    if (query) {
        cards.forEach(card => {
            const content = card.querySelector('.content').textContent.toLowerCase();
            if (content.includes(query.toLowerCase())) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
});