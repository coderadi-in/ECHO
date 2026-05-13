// ==================================================
// ELEMENT REFERENCE
// ==================================================

const allBtns = document.querySelectorAll('[data-section]');
const allSections = document.querySelectorAll('.settings-card');
const accentsList = document.getElementById('accentsList');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO HIDE ALL SECTIONS
function hideAllSections() {
    allSections.forEach((section) => {
        section.classList.remove('active');
    });
}

// * FUNCTION TO DESELECT ALL BUTTONS
function deselectAllBtns() {
    allBtns.forEach(btn => { btn.classList.remove('fl'); });
}

// * FUNCTION TO SELECT A SPECIFIC BUTTON
function selectBtn(btn) { btn.classList.add('fl'); }

// * FUNCTION TO SHOW SPECIFIC SETTINGS CARD
function showSection(section) { section.classList.add('active'); }

// * FUNCTION TO SHOW SPECIFIC SETTINGS CARD BY ID
function showSectionById(section) {
    const sectionElement = document.getElementById(section);
    if (!sectionElement) return false;

    sectionElement.classList.add('active');
    return true;
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR CARD-BUTTON CLICK
allBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const relatedSection = btn.dataset.section;
        if (!document.getElementById(relatedSection)) return;

        hideAllSections();
        deselectAllBtns();
        selectBtn(btn);
        showSectionById(relatedSection);
    });
});

// & EVENT LISTENER FOR ACCENTS-LIST TOGGLE
accentsList.addEventListener('beforetoggle', () => {
    setTimeout(() => { accentsList.classList.toggle('open'); }, 100);
});