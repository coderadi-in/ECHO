// ==================================================
// ELEMENT REFERENCE
// ==================================================

const allBtns = document.querySelectorAll('[data-section]');
const allSections = document.querySelectorAll('.settings-card');
const settingsPopovers = document.querySelectorAll('#appearanceSettings [popover], #aiPreferenceSettings [popover], #securitySettings [popover], #dataSettings [popover]');

const toggleTheme = document.getElementById('themeToggle');
const accentInputs = document.querySelectorAll('.accent-input');

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

// * FUNCTION TO TOGGLE THEME
function setColorTheme() {
    document.body.classList.toggle('dark-theme');

    if (localStorage.getItem('theme') === 'dark') {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
}

// * FUNCTION TO SET ACCENT COLOR
function setAccentColor(color) {
    document.body.classList.remove('accent-blue', 'accent-green', 'accent-red');
    document.body.classList.add(`accent-${color}`);

    localStorage.setItem('accent', `accent-${color}`);
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

// & EVENT LISTENER FOR SETTINGS POPOVER TOGGLE
settingsPopovers.forEach(popover => {
    popover.addEventListener('beforetoggle', (event) => {
        setTimeout(() => {
            popover.classList.toggle('open', event.newState === 'open');
        }, 100);
    });
});

// & EVENT LISTENER FOR THEME-TOGGLE CLICK
toggleTheme.addEventListener('click', setColorTheme);

// & EVENT LISTENER FOR ACCENT-INPUT CLICK
accentInputs.forEach(accent => {
    accent.addEventListener('click', () => {
        const selectedAccent = accent.id;
        setAccentColor(selectedAccent);
    });
});