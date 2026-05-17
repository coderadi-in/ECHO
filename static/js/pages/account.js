// ==================================================
// ELEMENT REFERENCE
// ==================================================

const popovers = document.querySelector('.main').querySelectorAll('[popover]');

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR POPOVER BEFORE-TOGGLE
popovers.forEach(popover => {
    popover.addEventListener('beforetoggle', (event) => {
        setTimeout(() => {
            popover.classList.toggle('open', event.newState === 'open');
        }, 100);
    });
});