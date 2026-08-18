// ==================================================
// ELEMENT REFERENCE
// ==================================================

const barcodeInput = document.getElementById('barcodeInput');
const generateBarcode = document.getElementById('generateBarcode');

const genIllustration = document.querySelector('.generation-illustration');

const barcodeImage = document.getElementById('barcodeImage');

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

// ==================================================
// EVENT LISTENERS
// ==================================================

generateBarcode.addEventListener('click', async () => {
    if (barcodeInput.value.trim() === "") {
        sendToastNotification("There's no barcode content", "barcode", "var(--color-state-red)");
        return;
    }

    clearAnimation = animateGenSkeleton();
    const genRequest = createForm({'barcode': barcodeInput.value});

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
        barcodeImage.src = barcodeURL;
        barcodeImage.classList.remove('hidden');

        clearAnimation();
        sendToastNotification("Barcode generated.", "thumb_up", "var(--color-state-green)");

        
    } catch (error) {
        clearAnimation();
        sendToastNotification("Generation failed, please try again.", "error", "var(--color-state-red)");
    }
})