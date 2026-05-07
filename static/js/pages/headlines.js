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
import { applyRandomBackgroundColor, copyToClipboard, closeOutputFrame, resetPromptArea } from '../pages/captions.js';

// ==================================================
// FUNCTIONS
// ==================================================



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

    // SEND MESSAGE TO SERVER
    sendMessage('headlines-sys', message);
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