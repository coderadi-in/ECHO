// ==================================================
// ELEMENT REFERENCE
// ==================================================

const tabBtns = document.querySelectorAll('.tabs .text');
const captionContent = document.querySelector('.recent-gens .body .captions');
const headlineContent = document.querySelector('.recent-gens .body .headlines');
const capCopyBtns = document.querySelectorAll('.caption .copy-btn');
const headCopyBtns = document.querySelectorAll('.headline .copy-btn');
const usageChart = document.getElementById("usageChart").getContext('2d');

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

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    captionContent.style.display = 'flex';
    headlineContent.style.display = 'none';
    renderUsageChart();
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