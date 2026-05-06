// ==================================================
// ELEMENT REFERENCE
// ==================================================

const cards = document.querySelectorAll('.card');
const colors = [ '#F6DECBA0', '#FCC5D2A0', '#DFDDE3A0', '#CCF5F5A0', '#C2EDFFA0' ];

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

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR DOM-CONTENT-LOAD
document.addEventListener('DOMContentLoaded', applyRandomBackgroundColor);