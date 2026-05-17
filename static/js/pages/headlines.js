// ==================================================
// ELEMENT REFERENCE
// ==================================================

const cards = document.querySelectorAll('.card');

const outputFrame = document.querySelector('.output-frame');
const copyBtn = document.getElementById('copyBtn');
const closeFrameBtn = document.getElementById('closeFrame');

const outputHeadline = document.getElementById('outputHeadline');
const outputDesc = document.getElementById('outputDesc');

const titleInput = document.getElementsByName('title')[0];
const priceInput = document.getElementsByName('price')[0];
const descInput = document.getElementsByName('desc')[0];

const sendBtn = document.getElementById('sendBtn');
const colors = [ '#F6DECBA0', '#FCC5D2A0', '#DFDDE3A0', '#CCF5F5A0', '#C2EDFFA0' ];

// ==================================================
// IMPORTS
// ==================================================

import { socket, sendMessage } from '../base/socket_listeners.js';

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO APPLY RANDOM BACKGROUND COLOR TO EACH CARD
function applyRandomBackgroundColor() {
    cards.forEach(card => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        card.style.backgroundColor = randomColor;
    });
}

// * FUNCTION TO COPY OUTPUT RESPONSE TO CLIPBOARD
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

// * FUNCTION TO CLOSE OUTPUT FRAME
function closeOutputFrame() {
    outputFrame.style.opacity = '0';
    setTimeout(() => { outputFrame.style.display = 'none'; }, 500);
}

// * FUNCTION TO HANDLE SEND-BUTTON CLICK
function handleSendButtonClick(event, message) {
    // UPDATE SEND-BTN
    sendBtn.disabled = true;
    sendBtn.textContent = 'progress_activity';
    sendBtn.classList.add('anim-rotate');

    // DATA VALIDATION
    if (titleInput.value.trim() === '' || priceInput.value.trim() === '' || descInput.value.trim() === '') {
        sendBtn.disabled = false;
        sendBtn.textContent = 'send';
        sendBtn.classList.remove('anim-rotate');
        return;
    }

    // SEND MESSAGE TO SERVER
    sendMessage(event, message);
}

// * FUNCTION TO RESET PROMPT AREA
function resetPromptArea() {
    // CLEAR INPUT FIELDS
    titleInput.value = '';
    priceInput.value = '';
    descInput.value = '';

    // CLEAR INPUT FIELDS
    titleInput.value = '';
    priceInput.value = '';
    descInput.value = '';

    // UPDATE SEND-BTN
    sendBtn.disabled = false;
    sendBtn.textContent = 'send';
    sendBtn.classList.remove('anim-rotate');

    setTimeout(() => { outputFrame.style.opacity = '1'; }, 100);
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR DOM-CONTENT-LOAD
document.addEventListener('DOMContentLoaded', applyRandomBackgroundColor);

// & EVENT LISTENER FOR COPY-BUTTON CLICK
copyBtn.addEventListener('click', () => {
    copyToClipboard(outputHeadline.textContent + "\n" + outputDesc.textContent);
    copyBtn.textContent = 'check';
});

// & EVENT LISTENER FOR CLOSE-FRAME-BUTTON CLICK
closeFrameBtn.addEventListener('click', closeOutputFrame);

// & EVENT LISTENER FOR SEND-BUTTON CLICK
sendBtn.addEventListener('click', () => {
    // CREATE MESSAGE OBJECT
    const message = {
        title: titleInput.value.trim(),
        price: priceInput.value.trim(),
        desc: descInput.value.trim()
    }

    handleSendButtonClick("headlines-sys", message);
});

// ==================================================
// SOCKET EVENTS
// ==================================================

// | EVENT FOR RECEIVING NEW HEADLINE
socket.on('headlines-cl', (data) => {
    try {
        outputHeadline.textContent = data.headline;
        outputDesc.textContent = data.desc;    
    } catch (error) {
        outputHeadline.textContent = "Generation Error";
        outputDesc.textContent = data;
    }

    outputFrame.style.display = 'flex';

    resetPromptArea();
});