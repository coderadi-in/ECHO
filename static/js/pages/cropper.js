// ==================================================
// ELEMENT REFERENCE
// ==================================================

const emptyUnit = document.querySelector('.empty-unit');
const uploadedUnit = document.querySelector('.uploaded-unit');
const downloadUnit = document.querySelector('.download-unit');
const errorUnit = document.querySelector('.error-unit');
const inputUnits = document.querySelectorAll('.input-unit');
const cropIllustration = document.querySelector('.cropping-illustration');

const pdfInput = document.getElementById('pdfInput');
const platformInput = document.getElementById('platformInput');
const cropModeInput = document.getElementById('cropModeInput');
const cropAreaInput = document.getElementById('cropAreaInput');

const cropBtn = document.getElementById('cropBtn');
const clearBtn = document.getElementById('clearBtn');

// ==================================================
// STATES
// ==================================================

let clearAnimation;
let inputValidated;

// ==================================================
// IMPORTS
// ==================================================

import { sendToastNotification } from '../components/toast.js';
import { showNotification } from '../base/notifications.js';

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO DEACTIVATE ALL UNITS
function deactivateUnits() {
    document.querySelectorAll('.unit').forEach(unit => {
        unit.classList.remove('active');
    });
}

// * FUNCTION TO CLEAR DOCUMENT WINDOW
function clearDocWindow() {
    deactivateUnits();
    pdfInput.value = '';
    emptyUnit.classList.add('active');
}

// * FUNCTION TO CHECK IF INPUT HAS A VALID VALUE
function validateInput(eventOrInput = pdfInput) {
    const input = eventOrInput?.target ? eventOrInput.target : eventOrInput;

    if (!input || !input.files) {
        deactivateUnits();
        emptyUnit.classList.add('active');
        inputValidated = false;
        return;
    }

    // Check if the input has files
    if (input.files.length === 0) {
        deactivateUnits();
        emptyUnit.classList.add('active');
        inputValidated = false;
        return;
    }

    // Check if the file is a PDF
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
        deactivateUnits();
        emptyUnit.classList.add('active');
        input.value = '';
        inputValidated = false;
        return;
    }

    deactivateUnits();
    uploadedUnit.classList.add('active');
    inputValidated = true;
    return;
}

// * FUNCTION TO CREATE A FORM
function createForm() {
    // Initiate form
    const croppingForm = new FormData();

    // Add values
    croppingForm.append('platform', platformInput.value);
    croppingForm.append('cropMode', cropModeInput.value);
    croppingForm.append('cropArea', cropAreaInput.value);

    // Add file
    croppingForm.append('pdfFile', pdfInput.files[0]);

    return croppingForm;
}

// * FUNCTION TO ANIMATE CROPPING SKELETON
function animateCropSkeleton() {
    cropIllustration.style.opacity = "1";
    const lines = cropIllustration.querySelectorAll('.line');

    const intervalId = setInterval(() => {
        lines.forEach(line => {
            const lineWidth = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
            line.style.width = `${lineWidth}%`;
        })
    }, 600);

    return () => {
        cropIllustration.style.opacity = "0";

        lines.forEach(line => {
            clearInterval(intervalId);
        });
    }
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR PDF-INPUT CHANGE
pdfInput?.addEventListener('change', validateInput);

// & EVENT LISTENER FOR CLEAR-BTN CLICK
clearBtn.addEventListener('click', clearDocWindow);

// & EVENT LISTENER FOR CROP-MODE CLICK
document.getElementById('cropModeInput').addEventListener('change', (e) => {
    if (e.target.value === 'precision') {
        document.getElementById('creditAmount').textContent = '1';
    } else {
        document.getElementById('creditAmount').textContent = '0';
    }
})

// & EVENT LISTENER FOR CROP-BTN CLICK
cropBtn.addEventListener('click', async () => {
    if (!inputValidated) sendToastNotification("Add a file to document window.", "docs", "var(--color-state-red)");

    clearAnimation = animateCropSkeleton();
    const cropRequest = createForm();

    try {
        const response = await fetch(`${window.location.origin}/app/cropper/crop`, {
            method: 'POST',
            body: cropRequest
        });

        // Check if the response is successful
        if (!response.ok) {
            clearAnimation();
            deactivateUnits();
            errorUnit.classList.add('active');
            return;
        }

        // Convert response to a Blob
        const blob = await response.blob();
        
        // Create a temporary URL and trigger download
        const url = window.URL.createObjectURL(blob);
        downloadUnit.href = url;
        downloadUnit.download = 'echo_cropped.pdf';
        
        // Show download unit
        clearAnimation();
        deactivateUnits();
        downloadUnit.classList.add('active');
        sendToastNotification("Cropped PDF is ready to download.", "docs", "var(--color-state-green)");
        showNotification("ECHO Cropper", "Cropped PDF is ready to export.", "cropper");

    } catch (error) {
        clearAnimation();
        deactivateUnits();
        errorUnit.classList.add('active');
    }
});