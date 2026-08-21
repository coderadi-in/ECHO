// ==================================================
// ELEMENT REFERENCE
// ==================================================

const genIllustration = document.querySelector('.generation-illustration');
const toggleToolsWindow = document.querySelectorAll('.toggle-tools-window');
const windowToggleTriggers = document.querySelectorAll('.unit .head');

const sheetBody = document.querySelector('.sheet-window .body');
const pdfPreview = document.querySelector('.sheet-window .pdf-preview');
const toolsWindow = document.querySelector('.tools-window');

const barcodeInput = document.getElementById('barcodeInput');
const generateBarcode = document.getElementById('generateBarcode');
const barcodePreview = document.getElementById('barcodePreview');

const priceInput = document.getElementById('priceInput');
const batchInput = document.getElementById('batchInput');
const mfgInput = document.getElementById('mfgInput');
const expInput = document.getElementById('expInput');
const specificInput = document.getElementById('specificInput');

const columnInput = document.getElementById('columnInput');
const rowInput = document.getElementById('rowInput');
const borderInput = document.getElementById('toggleBorder');
const exportBtn = document.getElementById('exportSheet');
const clearBtn = document.getElementById('clearSheet');

const aiGen = document.getElementById('generateAI');
const aiExport = document.getElementById('exportAI');

// ==================================================
// STATES
// ==================================================

let clearAnimation;
let borderEnabled;
let barcodeEnabled;
let textEnabled;

// ==================================================
// IMPORTS
// ==================================================

import { sendToastNotification } from '../components/toast.js';
import { showNotification } from '../base/notifications.js';
const { jsPDF } = window.jspdf;

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO RESET STICKERS
function resetStickers(clearOnly = false) {
    pdfPreview.classList.add('hidden');
    sheetBody.classList.remove('hidden');
    document.querySelectorAll('.sheet-window .body .sticker').forEach(elem => {
        elem.remove();
    });

    if (clearOnly) return;
    const stickerQuantity = rowInput.value * columnInput.value
    for (let i = 0; i < stickerQuantity; i++) {
        const sticker = createSticker();
        sheetBody.appendChild(sticker);
    }

    toggleGridLines();
}

// * FUNCTION TO TOGGLE TOOLS WINDOW
function addToggleWindowListener(trigger) {
    trigger.addEventListener('click', () => {
        toolsWindow.classList.toggle('active');
    });
}

// * FUNCTION TO CLOSE ALL TOOLS WINDOW
function closeAllToolsWindow() {
    document.querySelectorAll('.tools-window .unit').forEach(unit => {
        unit.classList.remove('active')
    });
}

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
    closeAllToolsWindow();
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
    wrapper.classList.add('sticker');

    // Create Image
    if (barcodeEnabled) {
        const barcodeImage = document.createElement('img');
        barcodeImage.classList.add('img');
        barcodeImage.src = barcodePreview.src;
        wrapper.appendChild(barcodeImage);
    }

    return wrapper
}

// * FUNCTION TO CREATE STICKER BODY
function createStickerBody() {
    // Create Body
    const barcodeBody = document.createElement('div');
    barcodeBody.classList.add('body', 'res-row', 'gap-4', 'p-8');

    // * FUNCTION TO FORMAT DATE
    function formateDate(input) {
        const date = new Date(input);

        const output = new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }).format(date);

        return output
    }

    // * FUNCTION TO CREATE A TEXT ELEMENT FOR BODY
    function createText(input, title, format) {
        if (input.value.trim() !== '') {
            const textElement = document.createElement('span');
            textElement.classList.add('mini');

            if (format) {
                const content = formateDate(input.value.trim());
                if (title) { textElement.textContent = `${title}: ${content}`; }
                else { textElement.textContent = input.value.trim(); }
            } else {
                if (title) { textElement.textContent = `${title}: ${input.value.trim()}`; }
                else { textElement.textContent = input.value.trim(); }
            }

            barcodeBody.appendChild(textElement);
        }
    }

    // Add Data
    createText(priceInput, "MRP", false);
    createText(batchInput, "Batch", false);
    createText(mfgInput, "MFG", true);
    createText(expInput, "EXP", true);
    createText(specificInput, false);

    return barcodeBody;
}

// * FUNCTION TO ADD INPUT-CHANGE LISTENER
function addInputChangeListener(input) {
    input.addEventListener('input', () => {
        updateBodyGrids(
            columnInput.value,
            rowInput.value
        );

        resetStickers();
        const stickerElements = document.querySelectorAll('.sheet-window .body .sticker');
        stickerElements.forEach(sticker => {
            sticker.classList.add('column');
            const stickerBody = createStickerBody();
            sticker.appendChild(stickerBody);
        });
    });
}

// * FUNCTION TO ADD DATA-CHANGE LISTENER
function addDataChangeListener(input) {
    input.addEventListener('input', () => {
        resetStickers();
        const stickerElements = document.querySelectorAll('.sheet-window .body .sticker');
        stickerElements.forEach(sticker => {
            sticker.classList.add('column');
            const stickerBody = createStickerBody();
            sticker.appendChild(stickerBody);
        });
    });

    if (
        priceInput.value.trim() === "" &&
        batchInput.value.trim() === "" &&
        mfgInput.value.trim() === "" &&
        expInput.value.trim() === "" &&
        specificInput.value.trim() === ""
    ) { textEnabled = false } else { textEnabled = true }
}

// * FUNCTION TO TOGGLE GRID LINES IN STICKERS
function toggleGridLines() {
    const stickers = document.querySelectorAll('.sheet-window .body .sticker');
    stickers.forEach(sticker => {
        if (borderEnabled) sticker.classList.add('border');
        else sticker.classList.remove('border');
    });
}

// * FUNCTION TO EXPORT SHEET
function exportSheet() {
    exportBtn.disabled = true;
    exportBtn.style.opacity = "0.6";

    html2canvas(sheetBody, {
        scale: 2,
        useCORS: true,
    }).then(canvas => {
        // 1. Get the image data from the canvas as a PNG
        const imgData = canvas.toDataURL("image/png");

        // 2. Calculate PDF dimensions based on the canvas size
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // 3. Create a new PDF instance matching the canvas orientation
        const orientation = imgWidth > imgHeight ? "l" : "p";
        const pdf = new jsPDF(orientation, "px", [imgWidth, imgHeight]);

        // 4. Add the image to the PDF and save it
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("echo-sheet.pdf");
    });

    exportBtn.disabled = false;
    exportBtn.style.opacity = "1";

    showNotification("Export done.", "The sheet has been exported.", "echo-sheet");
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    updateBodyGrids(
        columnInput.value,
        rowInput.value
    );
});

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

        barcodeEnabled = true;
        resetStickers();
        if (!textEnabled) return;

        const stickerElements = document.querySelectorAll('.sheet-window .body .sticker');
        stickerElements.forEach(sticker => {
            sticker.classList.add('column');
            const stickerBody = createStickerBody();
            sticker.appendChild(stickerBody);
        });

    } catch (error) {
        clearAnimation();
        sendToastNotification("Generation failed, please try again.", "error", "var(--color-state-red)");
    }
});

// & EVENT LISTENER FOR AI-GEN CLICK
aiGen.addEventListener('click', async () => {
    // Input validation
    if (
        barcodeInput.value.trim() === "" &&
        priceInput.value.trim() === "" &&
        batchInput.value.trim() === "" &&
        mfgInput.value.trim() === "" &&
        expInput.value.trim() === "" &&
        specificInput.value.trim() === ""
    ) {
        sendToastNotification("There's no content", "error", "var(--color-state-red)");
        return;
    }

    // Initiate form creation
    clearAnimation = animateGenSkeleton();
    const genRequest = createForm({
        barcode: barcodeInput.value,
        price: priceInput.value,
        batch: batchInput.value,
        mfg: mfgInput.value,
        exp: expInput.value,
        specific: specificInput.value
    });

    try {
        // Send request
        const response = await fetch(`${window.location.origin}/api/ai/generate-sticker-sheet`, {
            method: 'POST',
            body: genRequest
        });

        // Check if response ins't ok
        if (!response.ok) {
            clearAnimation();
            sendToastNotification("Generation failed, please try again.", "error", "var(--color-state-red)");
            return;
        }

        // Convert response to a blob
        const blob = await response.blob();
        const sheetURL = URL.createObjectURL(blob)+"#toolbar=0&navpanes=0&scrollbar=0";

        clearAnimation();
        sendToastNotification("Sheet generated.", "thumb_up", "var(--color-state-green)");

        // Show response
        sheetBody.classList.add('hidden');
        pdfPreview.classList.remove('hidden');
        aiExport.classList.remove('hidden');
        pdfPreview.src = sheetURL;
        aiExport.href = sheetURL;
        aiExport.download = "echo-sheet.pdf"

    } catch (error) {
        clearAnimation();
        sendToastNotification("Generation failed, please try again.", "error", "var(--color-state-red)");
    }
})

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

// & EVENT LISTENER FOR TOGGLE-BORDER CLICK
borderInput.addEventListener('change', () => {
    borderEnabled = borderInput.checked ? true : false;
    toggleGridLines();
});

// & EVENT LISTENER FOR PRODUCT-DATA CHANGE
addDataChangeListener(priceInput);
addDataChangeListener(batchInput);
addDataChangeListener(mfgInput);
addDataChangeListener(expInput);
addDataChangeListener(specificInput);

// & EVENT LISTENER TO EXPORT SHEET
exportBtn.addEventListener('click', exportSheet);

// & EVENT LISTENER TO CLEAR SHEET
clearBtn.addEventListener('click', () => {
    resetStickers(true);
    aiExport.classList.add('hidden');
});

// & EVENT LISTENER TO TOGGLE TOOLS-WINDOW
toggleToolsWindow.forEach(trigger => {
    addToggleWindowListener(trigger);
});