// ==================================================
// ELEMENT REFERENCE
// ==================================================

const signupMode = document.getElementById("signupMode");
const loginMode = document.getElementById("loginMode");
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO TOGGLE MODE SELECTION
function toggleModeSelected(mode) {
    mode.classList.toggle("selected");
}

// * FUNCTION TO TOGGLE FORM CONTENT
function toggleFormContent(form) {
    form.classList.toggle("active");
}

// * FUNCTION TO SETUP TOGGLE ON CLICK
function setupToggle() {
    toggleModeSelected(signupMode);
    toggleModeSelected(loginMode);
    toggleFormContent(signupForm);
    toggleFormContent(loginForm);
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR SIGNUP-MODE/LOGIN-MODE CLICK
signupMode.addEventListener("click", setupToggle);
loginMode.addEventListener("click", setupToggle);