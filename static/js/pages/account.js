// ==================================================
// ELEMENT REFERENCE
// ==================================================

const clearConfirmation = document.getElementById('clearConfirmation');

// ==================================================
// EVENT LISTENERS
// ==================================================

// & CONFIRMATION MODEL BEFORE-TOGGLE LISTENER
clearConfirmation.addEventListener('beforetoggle', (event) => {
    setTimeout(() => {
        clearConfirmation.classList.toggle('open', event.newState === 'open');
    }, 100);
});