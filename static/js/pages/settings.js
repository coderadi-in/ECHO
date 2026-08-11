// ==================================================
// ELEMENT REFERENCE
// ==================================================

const allBtns = document.querySelectorAll('[data-section]');
const allSections = document.querySelectorAll('.settings-card');
const settingsPopovers = document.querySelectorAll('#appearanceSettings [popover], #aiPreferenceSettings [popover], #securitySettings [popover], #dataSettings [popover]');

const toggleTheme = document.getElementById('themeToggle');
const accentInputs = document.querySelectorAll('.accent-input');
const toggleShadow = document.getElementById('toggleShadow');

const toggleNotification = document.getElementById('toggleNotifications');
const notificationInfo = document.querySelector('#toggleNotifications .info');

const toggleBeta = document.getElementById('toggleBetaMode');

// ==================================================
// IMPORTS
// ==================================================

import { sendToastNotification } from '../components/toast.js';

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

// * FUNCTION TO CHECK SHADOW TOGGLE
function checkShadowToggle() {
    const shadowEnabled = localStorage.getItem('shadow') === 'enabled';
    if (shadowEnabled) {
        toggleShadow.classList.add('enabled');
    } else {
        toggleShadow.classList.remove('enabled');
    }
}

// * FUNCTION TO CHECK FOR NOTIFICATION FUNCTIONALITY
function checkNotificationFunctionality() {
    if (!("Notification" in window)) {
        toggleNotification.classList.add('disabled');
        notificationInfo.textContent = "Notifications are not supported in this browser.";
    }
}

// * FUNCTION CHECK FOR NOTIFICATION PERMISSION
function checkNotificationPermission() {
    const permissionEnabled = Notification.permission === "granted";
    if (permissionEnabled) {
        toggleNotification.classList.add('enabled');
    } else {
        toggleNotification.classList.remove('enabled');
    }
}

// * FUNCTION TO CHECK FOR BETA MODE
function checkBetaMode() {
    const betaEnabled = localStorage.getItem('betaMode') === 'enabled';
    if (betaEnabled) {
        toggleBeta.classList.add('enabled');
    } else {
        toggleBeta.classList.remove('enabled');
    }
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    checkShadowToggle();
    checkNotificationFunctionality();
    checkNotificationPermission();
    checkBetaMode();
});

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
toggleTheme.addEventListener('click', () => {
    setColorTheme();
    sendToastNotification('Theme toggled successfully!', 'contrast', 'var(--color-status-green)');
});

// & EVENT LISTENER FOR ACCENT-INPUT CLICK
accentInputs.forEach(accent => {
    accent.addEventListener('click', () => {
        const selectedAccent = accent.id;
        setAccentColor(selectedAccent);
        sendToastNotification('Accent color updated successfully!', 'palette', 'var(--color-status-green)');
    });
});

// & EVENT LISTENER FOR SHADOW-TOGGLE CLICK
toggleShadow.addEventListener('click', () => {
    toggleShadow.classList.toggle('enabled');

    if (localStorage.getItem('shadow') === 'enabled') {
        localStorage.setItem('shadow', 'disabled');
        sendToastNotification('Shadow disabled successfully!', 'ev_shadow', 'var(--color-status-green)');
    } else {
        localStorage.setItem('shadow', 'enabled');
        sendToastNotification('Shadow enabled successfully!', 'ev_shadow', 'var(--color-status-green)');
    }
});

// & EVENT LISTENER FOR NOTIFICATION-TOGGLE CLICK
toggleNotification.addEventListener('click', () => {
    if (toggleNotification.classList.contains('enabled')) {
        sendToastNotification('You can disable notifications from your browser settings.', 'notifications_off', 'var(--color-status-yellow)');
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            sendToastNotification('Notifications enabled successfully!', 'notifications', 'var(--color-status-green)');
            toggleNotification.classList.add('enabled');
        } else {
            sendToastNotification('Notifications permission denied.', 'notifications_off', 'var(--color-status-red)');
            toggleNotification.classList.remove('enabled');
        }
    });
})

// & EVENT LISTENER FOR BETA-TOGGLE CLICK
toggleBeta.addEventListener('click', () => {
    toggleBeta.classList.toggle('enabled');

    if (localStorage.getItem('betaMode') === 'enabled') {
        localStorage.setItem('betaMode', 'disabled');
        sendToastNotification('Beta mode disabled successfully!', 'science', 'var(--color-status-green)');
    } else {
        localStorage.setItem('betaMode', 'enabled');
        sendToastNotification('Beta mode enabled successfully!', 'science', 'var(--color-status-green)');
    }

    setTimeout(() => {
        window.location.reload();
    }, 500);
});