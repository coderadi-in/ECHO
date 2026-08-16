// ==================================================
// ELEMENT REFERENCE
// ==================================================

const emptyUnity = document.querySelector('.empty-unit');
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

// ==================================================
// STATES
// ==================================================

let clearAnimation;
let inputValidated;

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO DEACTIVATE ALL UNITS
function deactivateUnits() {
    document.querySelectorAll('.unit').forEach(unit => {
        unit.classList.remove('active');
    });
}

// * FUNCTION TO CHECK IF INPUT HAS A VALID VALUE
function validateInput(eventOrInput = pdfInput) {
    const input = eventOrInput?.target ? eventOrInput.target : eventOrInput;

    if (!input || !input.files) {
        deactivateUnits();
        emptyUnity.classList.add('active');
        inputValidated = false;
        return;
    }

    // Check if the input has files
    if (input.files.length === 0) {
        deactivateUnits();
        emptyUnity.classList.add('active');
        inputValidated = false;
        return;
    }

    // Check if the file is a PDF
    const file = input.files[0];
    if (file.type !== 'application/pdf') {
        deactivateUnits();
        emptyUnity.classList.add('active');
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

// & EVENT LISTENER FOR CROP-BTN CLICK
cropBtn.addEventListener('click', async () => {
    if (!inputValidated) return;

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
        window.URL.revokeObjectURL(url);
        
        // Show download unit
        clearAnimation();
        deactivateUnits();
        downloadUnit.classList.add('active');

    } catch (error) {
        clearAnimation();
        deactivateUnits();
        errorUnit.classList.add('active');
        console.error(error)
    }
});