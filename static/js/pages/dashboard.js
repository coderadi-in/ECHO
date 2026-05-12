// ==================================================
// ELEMENT REFERENCE
// ==================================================

const tabBtns = document.querySelectorAll('.tabs .text');
const captionContent = document.querySelector('.recent-gens .body .captions');
const headlineContent = document.querySelector('.recent-gens .body .headlines');
const capCopyBtns = document.querySelectorAll('.caption .copy-btn');
const headCopyBtns = document.querySelectorAll('.headline .copy-btn');

const generationOptions = document.getElementById('generationOptions');
const usageChart = document.getElementById("usageChart").getContext('2d');

const userPrompt = document.getElementById("userPrompt");
const sendPrompt = document.getElementById("sendPrompt");
const chatsContainer = document.querySelector('.chats-container');

// ==================================================
// IMPORTS
// ==================================================

import { socket, sendMessage } from '../base/socket_listeners.js';

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO SWITCH TABS
function switchTab(e) {
    const target = e.target.id;

    if (target === 'captionsTabBtn') {
        captionContent.style.display = 'flex';
        headlineContent.style.display = 'none';
    } else {
        captionContent.style.display = 'none';
        headlineContent.style.display = 'flex';
    }

    tabBtns.forEach(btn => {
        btn.classList.toggle('selected', btn.id === target);
    });
}

// * FUNCTION TO GET DATES IN CURRENT-MONTH
function getCurrentMonthDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth()

    // Get total days by moving to the 0th day of the next month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
        return new Date(year, month, i + 1);
    });

    return monthDates;
}

// * FUNCTION TO RENDER USAGE CHART
function renderUsageChart() {
    const chart = new Chart(usageChart, {
        type: 'line',
        labels: getCurrentMonthDates(),
        data: {
            labels: getCurrentMonthDates().map(date => date.getDate()),
            datasets: [{
                label: 'Usage',
                data: Array.from({ length: getCurrentMonthDates().length }, () => Math.floor(Math.random() * 40) + 1),
                fill: true,
                tension: 0.4,
                borderColor: '#2A78CB',
                backgroundColor: '#2364AA57'
            }]
        }
    });
}

// * FUNCTION TO RENDER PROMPT IN CHATS-CONTAINER
function renderPrompt(prompt) {
    // CREATE PROMPT PARA ELEMENT
    const para = document.createElement('p');
    para.classList.add('prompt', 'para');
    para.textContent = prompt;

    // APPEND TO CHATS CONTAINER
    chatsContainer.appendChild(para);
}

// * FUNCTION TO HANDLE SEND-BUTTON CLICK
export function handleSendButtonClick(event, message) {
    // UPDATE SEND-BTN
    sendPrompt.disabled = true;
    sendPrompt.textContent = 'progress_activity';
    sendPrompt.classList.add('anim-rotate');

    // SEND MESSAGE TO SERVER
    sendMessage(event, message);
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    captionContent.style.display = 'flex';
    headlineContent.style.display = 'none';
    renderUsageChart();
});

// & EVENT LISTENER FOR GENERATION-OPTIONS
generationOptions.addEventListener('beforetoggle', () => {
    setTimeout(() => {
        generationOptions.classList.toggle('open');
    }, 100);
});

// & EVENT LISTENER FOR TAB-BTN CLICK
tabBtns.forEach((btn) => {
    btn.addEventListener('click', switchTab);
});

// & EVENT LISTENER FOR CAPTION COPY-BTN CLICK
capCopyBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        const captionText = e.target.closest('.caption').querySelector('.para').textContent;
        navigator.clipboard.writeText(captionText);
        btn.textContent = 'check';
    });
});

// & EVENT LISTENER FOR HEADLINE COPY-BTN CLICK
headCopyBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        const headlineText = e.target.closest('.headline').querySelector('.text').textContent;
        const headlineDesc = e.target.closest('.headline').querySelector('.mini').textContent;
        navigator.clipboard.writeText(headlineText + "\n" + headlineDesc);
        btn.textContent = 'check';
    });
});

// & EVENT LISTENER TO ENABLE/DISABLE SEND-BTN ON PROMPT-INPUT CHANGE
userPrompt.addEventListener('input', () => {
    sendPrompt.disabled = userPrompt.value.trim() === '';
});

// & EVENT LISTENER FOR SEND-BTN CLICK
sendPrompt.addEventListener('click', () => {
    // REMOVE WELCOME MESSAGE FROM CHAT CONTAINER
    if (chatsContainer.contains(chatsContainer.querySelector('.h1'))) {
        chatsContainer.querySelector('.h1').remove();
    }
    
    renderPrompt(userPrompt.value.trim());
    handleSendButtonClick("response-sys", userPrompt.value.trim());
    userPrompt.value = "";
});

// & EVENT LISTENER TO SEND MESSAGE ON `CTRL+ENTER` KEYPRESS
userPrompt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        // REMOVE WELCOME MESSAGE FROM CHAT CONTAINER
        if (chatsContainer.contains(chatsContainer.querySelector('.h1'))) {
            chatsContainer.querySelector('.h1').remove();
        }

        renderPrompt(userPrompt.value.trim());
        handleSendButtonClick("response-sys", userPrompt.value.trim());
        userPrompt.value = "";
    }
});

// ==================================================
// SOCKET EVENTS
// ==================================================

socket.on('response-cl', (data) => {
    // UPDATE SEND-BTN
    sendPrompt.disabled = false;
    sendPrompt.textContent = 'send';
    sendPrompt.classList.remove('anim-rotate');

    // RENDER RESPONSE IN CHATS-CONTAINER
    const responsePara = document.createElement('p');
    responsePara.classList.add('response', 'para');
    responsePara.textContent = data.response;
    chatsContainer.appendChild(responsePara);
});