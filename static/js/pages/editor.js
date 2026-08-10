// ==================================================
// ELEMENT REFERENCE
// ==================================================

const imagePreview = document.getElementById('imagePreview');
const textPreview = document.getElementById('textPreview');
const postHeadline = document.getElementById('postHeadline');
const postDescription = document.getElementById('postDescription');

const imageInput = document.getElementById('photoInput');
const clearCanvasBtn = document.getElementById('clearCanvas');
const increaseTextWidthBtn = document.getElementById('increaseWidth');
const decreaseTextWidthBtn = document.getElementById('decreaseWidth');
const headlineColorInput = document.querySelector('#headlineColor input');
const headlineColorSymbol = document.querySelector('#headlineColor .symbol');
const exportBtn = document.getElementById('exportBtn');

const addBtns = document.querySelectorAll('.add-btn');
const headGenBtns = document.querySelectorAll('.head-gen-btn');

const canvas = document.querySelector('.canvas');
const generateTab = document.querySelector('.generate');

const outputFrame = document.querySelector('.output-frame');
const closeFrameBtn = document.getElementById('closeFrame');
const keepBtn = document.getElementById('keepBtn');
const regenBtn = document.getElementById('regenBtn');
const lines = document.querySelectorAll('.output-frame .line');

const outputHeadline = document.getElementById('outputHeadline');
const outputDesc = document.getElementById('outputDesc');

// ==================================================
// STATES
// ==================================================

let intervalId = null;
let clearAnimation;
let cachedData;

// ==================================================
// IMPORTS
// ==================================================

import { socket, sendMessage } from '../base/socket_listeners.js';
import { sendToastNotification } from '../components/toast.js';

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO DISPLAY GENERATION SKELETON
function showGenSkeleton() {
    outputFrame.style.display = 'flex';
    setTimeout(() => { outputFrame.style.opacity = '1'; }, 100);
}

// * FUNCTION TO ANIMATE GENERATION SKELETON
function animateGenSkeleton() {
    generateTab.style.opacity = "0.6";
    generateTab.style.cursor = "wait";
    generateTab.style.pointerEvents = "none";

    const intervalId = setInterval(() => {
        lines.forEach(line => {
            const lineWidth = Math.floor(Math.random() * (80 - 20 + 1)) + 20;
            line.style.width = `${lineWidth}%`;
        })
    }, 600);

    return () => {
        generateTab.style.opacity = "1";
        generateTab.style.cursor = "auto";
        generateTab.style.pointerEvents = "none";

        lines.forEach(line => {
            document.querySelector('.output-frame .head .fs-24').style.display = 'none';
            line.style.display = 'none';
            clearInterval(intervalId);
        })
    }
}

// * FUNCTION TO UPDATE IMAGE PREVIEW
function updateImagePreview(event, imagePreview) {
    const file = event.target.files[0];

    if (file) {
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.opacity = '1';
        canvas.style.aspectRatio = `${imagePreview.naturalWidth} / ${imagePreview.naturalHeight}`;
    }
}

// * FUNCTION TO CLEAR CANVAS
function clearCanvas() {
    imagePreview.style.opacity = '0';
    imagePreview.src = '';

    postHeadline.textContent = '';
    postDescription.textContent = '';
}

// * FUNCTION TO SELECT TEXT CONTENT
function selectTextContent() {
    textPreview.classList.toggle('selected');
}

// * FUNCTION TO SHOW TEXT-CONTENT [HEADLINE] IN CANVAS
function showHeadline(btn) {
    const headlineElement = btn.closest('.headline');
    const headlineText = headlineElement.querySelector('.text').textContent;
    const headlineMini = headlineElement.querySelector('.mini').textContent;

    postHeadline.textContent = headlineText;
    postDescription.textContent = headlineMini;
    
    let textXCoord = imagePreview.x + 20
    let textYCoord = imagePreview.y + imagePreview.offsetHeight - 20 - textPreview.offsetHeight;
    let textWidth = imagePreview.offsetWidth - 40;
    console.log(textWidth);

    textPreview.style.left = `${textXCoord}px`;
    textPreview.style.top = `${textYCoord}px`;
    textPreview.style.width = `${textWidth}px`;
    textPreview.style.height = 'fit-content';
}

// * FUNCTION TO UPDATE THE WIDTH OF TEXT-PREVIEW
function updateTextPreviewWidth(width) {
    textPreview.style.width = `${parseInt(textPreview.style.width) + width}px`;
}

// * FUNCTION TO DOWNLOAD THE CANVAS AS AN IMAGE
function downloadElement() {
    exportBtn.disabled = true;

    // Render the element to a canvas object
    html2canvas(canvas).then(canvas => {
        const imageURL = canvas.toDataURL("image/png");

        const link = document.createElement("a");
        link.download = "echo-post.png";
        link.href = imageURL;

        link.click();
    });
    
    exportBtn.disabled = false;
}

// * FUNCTION TO GET PRODUCT DATA FROM PRODUCT CARD'S BUTTON
function getProductData(btn) {
    const productCard = btn.closest('.product');

    const title = productCard.querySelector('.product-title').textContent;
    const desc = productCard.querySelector('.product-desc').textContent;

    return { title: title, desc: desc };
}

// * FUNCTION TO HANDLE GENERATION DURATION
function handleGenDuration(btn) {
    showGenSkeleton();
    clearAnimation = animateGenSkeleton();

    cachedData = getProductData(btn);
    sendMessage("headlines-sys", cachedData);
}

// * FUNCTION TO CLOSE OUTPUT FRAME
function closeOutputFrame() {
    outputFrame.style.opacity = '0';
    setTimeout(() => { outputFrame.style.display = 'none'; }, 500);
}

// * FUNCTION TO KEEP HEADLINES IN CANVAS
function keepHeadlines() {
    postHeadline.textContent = outputHeadline.textContent;
    postDescription.textContent = outputDesc.textContent;

    let textXCoord = imagePreview.x + 20
    let textYCoord = imagePreview.y + imagePreview.offsetHeight - 20 - textPreview.offsetHeight;
    let textWidth = imagePreview.offsetWidth - 40;

    textPreview.style.left = `${textXCoord}px`;
    textPreview.style.top = `${textYCoord}px`;
    textPreview.style.width = `${textWidth}px`;
    textPreview.style.height = 'fit-content';

    closeOutputFrame();
}

// * FUNCTION TO REGENERATE HEADLINES
function regenerate() {
    document.querySelector('.output-frame .head .fs-24').style.display = 'block';
    lines.forEach(line => {
        line.style.display = 'block';
    });

    outputHeadline.textContent = '';
    outputDesc.textContent = '';

    showGenSkeleton();
    clearAnimation = animateGenSkeleton();

    sendMessage("headlines-sys", cachedData);
}

// * FUNCTION TO UPDATE COLOR VALUE OF HEADLINE
function updateHeadlineColor() {
    const color = headlineColorInput.value;
    
    headlineColorSymbol.style.color = color;
    postHeadline.style.color = color;
    postDescription.style.color = color;
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR CLEAR CANVAS BUTTON
clearCanvasBtn.addEventListener('click', clearCanvas);

// & EVENT LISTENER FOR IMAGE INPUT
imageInput.addEventListener('change', (event) => {
    updateImagePreview(event, imagePreview);
});

// & EVENT LISTENERS FOR ADD BUTTONS
addBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        showHeadline(btn);
    });
});

// & EVENT LISTENER FOR TEXT PREVIEW
textPreview.addEventListener('click', selectTextContent);

// & EVENT LISTENER FOR INCREASE TEXT-PREVIEW WIDTH BUTTON
increaseTextWidthBtn.addEventListener('mousedown', () => {
    intervalId = setInterval(() => {
        updateTextPreviewWidth(20);
    }, 100);
});

// & EVENT LISTENER FOR DECREASE TEXT-PREVIEW WIDTH BUTTON
decreaseTextWidthBtn.addEventListener('mousedown', () => {
    intervalId = setInterval(() => {
        updateTextPreviewWidth(-20);
    }, 100);
});

// & EVENT LISTENER FOR INCREASE TEXT-PREVIEW WIDTH BUTTON
increaseTextWidthBtn.addEventListener('mouseup', () => {
    clearInterval(intervalId);
});

// & EVENT LISTENER FOR DECREASE TEXT-PREVIEW WIDTH BUTTON
decreaseTextWidthBtn.addEventListener('mouseup', () => {
    clearInterval(intervalId);
});

// & EVENT LISTENER FOR HEADLINE COLOR INPUT
headlineColorInput.addEventListener('input', updateHeadlineColor);

// & EVENT LISTENER FOR EXPORT BUTTON
exportBtn.onclick = downloadElement;

// & EVENT LISTENER FOR HEAD-GEN-BTN CLICK
headGenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        handleGenDuration(btn);
    })
})

// & EVENT LISTENER FOR KEEP BUTTON
keepBtn.onclick = keepHeadlines;

// & EVENT LISTENER FOR REGENERATE BUTTON
regenBtn.onclick = regenerate;

// & EVENT LISTENER FOR CLOSE OUTPUT FRAME BUTTON
closeFrameBtn.onclick = closeOutputFrame;

// & EVENT LISTENER FOR DRAGGING TEXT PREVIEW
textPreview.addEventListener('mousedown', (e) => {
    // Calculate the initial cursor offset relative to the element
    let shiftX = e.clientX - textPreview.getBoundingClientRect().left;
    let shiftY = e.clientY - textPreview.getBoundingClientRect().top;

    // Move the element under the cursor coordinates
    function moveAt(pageX, pageY) {
        textPreview.style.left = pageX - shiftX + 'px';
        textPreview.style.top = pageY - shiftY + 'px';
    }

    // Handle mouse movement
    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    // Attach the mousemove listener to the document to prevent losing tracking
    document.addEventListener('mousemove', onMouseMove);

    // Clean up listeners when the mouse button is released
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMouseMove);
    }, { once: true }); // Automatically unsubscribes after one run
});

textPreview.ondragstart = () => false;

// ==================================================
// SOCKET EVENTS
// ==================================================

// | EVENT FOR RECEIVING NEW HEADLINE
socket.on('headlines-cl', (data) => {
    clearAnimation();
    
    try {
        outputHeadline.textContent = data.headline;
        outputDesc.textContent = data.desc;    
    } catch (error) {
        outputHeadline.textContent = "Generation Error";
        outputDesc.textContent = data;
    }

    sendToastNotification('Headline generated successfully!', 'thumb_up', 'var(--color-state-green)');
});