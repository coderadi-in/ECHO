// ==================================================
// ELEMENT REFERENCE
// ==================================================

const alerts = document.querySelectorAll('.alert');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO SHOW ALERT ONE-BY-ONE
function showAlert() {
    alerts.forEach((alert, index) => {
        setTimeout(() => {
            alert.classList.add('visible');
        }, index * 500);
    });
}

// * FUNCTION TO HIDE ALERTS ONE-BY-ONE
function hideAlert() {
    alerts.forEach((alert, index) => {
        setTimeout(() => {
            alert.classList.remove('visible');
        }, index * 500);
    });
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER TO SHOW ALERTS ON PAGE LOAD
window.addEventListener('load', () => {
    showAlert();

    setTimeout(() => {
        hideAlert();
    }, 3000);
});