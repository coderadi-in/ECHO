// ==================================================
// ELEMENT REFERENCE
// ==================================================

const barcodeInput = document.getElementById('barcodeInput');
const generateBarcode = document.getElementById('generateBarcode');
const barcodePreview = document.getElementById('barcodePreview');

const sheetBody = document.querySelector('.sheet-window .body');
const genIllustration = document.querySelector('.generation-illustration');
const windowToggleTriggers = document.querySelectorAll('.unit .head');

const columnInput = document.getElementById('columnInput');
const rowInput = document.getElementById('rowInput');

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

// * FUNCTION TO CREATE A FORM
function createForm(inputs) {
    // Initiate form
    const genForm = new FormData();
    const names = Object.keys(inputs);

    // Add values
    names.forEach(name => {
        genForm.append(name, inputs[name]);
    });

    return genForm;
}

// * FUNCTION TO ANIMATE CROPPING SKELETON
function animateGenSkeleton(frame = genIllustration) {
    frame.style.opacity = "1";
    const lines = frame.querySelectorAll('.line');

    const intervalId = setInterval(() => {
        lines.forEach(line => {
            const lineWidth = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
            line.style.width = `${lineWidth}%`;
        })
    }, 600);

    return () => {
        frame.style.opacity = "0";
        clearInterval(intervalId);
    }
}

// * FUNCTION TO TOGGLE WINDOW STATE
function toggleWindow(window) {
    window.classList.toggle('active');
}

// * FUNCTION TO UPDATE BODY GRIDS
function updateBodyGrids(x, y) {
    sheetBody.style.gridTemplateColumns = `repeat(${x}, 1fr)`;
    sheetBody.style.gridTemplateRows = `repeat(${y}, 1fr)`;
}

// * FUNCTION TO CREATE A STICKER ELEMENT
function createSticker() {
    // Create Wrapper
    const wrapper = document.createElement('div');
    wrapper.classList.add('sticker', 'column', 'gap-12');

    // Create Image
    const barcodeImage = document.createElement('img');
    barcodeImage.classList.add('img');
    barcodeImage.src = barcodePreview.src;

    // Append children
    wrapper.appendChild(barcodeImage);
    return wrapper
}

// * FUNCTION TO ADD INPUT-CHANGE LISTENER
function addInputChangeListener(input) {
    input.addEventListener('input', () => {
        updateBodyGrids(
            columnInput.value,
            rowInput.value
        );

        document.querySelectorAll('.sheet-window .body .sticker').forEach(elem => {
            elem.remove();
        });

        const stickerQuantity = rowInput.value * columnInput.value
        for (let i = 0; i < stickerQuantity; i++) {
            const sticker = createSticker();
            sheetBody.appendChild(sticker);
        }
    });
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR GENERATE-BARCODE CLICK
generateBarcode.addEventListener('click', async () => {
    if (barcodeInput.value.trim() === "") {
        sendToastNotification("There's no barcode content", "barcode", "var(--color-state-red)");
        return;
    }

    clearAnimation = animateGenSkeleton();
    const genRequest = createForm({ 'barcode': barcodeInput.value });

    try {
        const response = await fetch(`${window.location.origin}/app/sticker/generate`, {
            method: "POST",
            body: genRequest
        });

        // Check if response is ok
        if (!response.ok) {
            console.log(response.status);
            clearAnimation();
            sendToastNotification("Generation failed, please try again.", "error", "var(--color-state-red)");
            return;
        }

        // Convert response to a blob
        const blob = await response.blob();
        const barcodeURL = URL.createObjectURL(blob);
        barcodePreview.src = barcodeURL;
        barcodePreview.classList.remove('hidden');

        clearAnimation();
        sendToastNotification("Barcode generated.", "thumb_up", "var(--color-state-green)");

        const stickerQuantity = rowInput.value * columnInput.value
        for (let i = 0; i < stickerQuantity; i++) {
            const sticker = createSticker();
            sheetBody.appendChild(sticker);
        }


    } catch (error) {
        clearAnimation();
        sendToastNotification("Generation failed, please try again.", "error", "var(--color-state-red)");
    }
});

// & EVENT LISTENER FOR WINDOW-TOGGLE-TRIGGER CLICK
windowToggleTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        const targetSectionClass = e.target.dataset.section;
        const targetSection = document.querySelector(targetSectionClass);
        toggleWindow(targetSection);
    });
});

// & EVENT LISTENER FOR BODY-SHEET-GRID UPDATE
addInputChangeListener(columnInput);
addInputChangeListener(rowInput);

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    updateBodyGrids(
        columnInput.value,
        rowInput.value
    );
})