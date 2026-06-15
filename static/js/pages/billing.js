// ==================================================
// ELEMENT REFERENCE
// ==================================================

const upgradeProBtn = document.getElementById('upgradePro');
const upgradeProText = document.querySelector('#upgradePro span');

const renewalDate = document.getElementById('renewalDate');
const cashfree = Cashfree({ mode: "sandbox" });
const paymentRows = document.querySelectorAll('.payment-row');

// ==================================================
// IMPORTS
// ==================================================

import { sendToastNotification } from '../components/toast.js';

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO CONVERT DATE STRING TO FORMATTED DATE
function formatDate() {
    const date = new Date(renewalDate.textContent);

    const formattedDate = date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).replace(',', '');

    renewalDate.textContent = formattedDate;
}

// * FUNCTION TO CREATE AN INTERSECTION OBSERVER FOR SIMPLIFYING DATE IN PAYMENTS TABLE
function startSimpler() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const dateElement = entry.target.querySelector('.date-text');
                
                if (dateElement) {
                    const processableString = dateElement.textContent.slice(2);
                    const dateText = processableString.split('-').reverse().join('/');
                    dateElement.textContent = dateText;
                    observer.unobserve(entry.target);
                }
            }
        });
    });
    
    paymentRows.forEach(row => { observer.observe(row); });
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    formatDate();
    startSimpler();
});

// & EVENT LISTENER FOR UPGRADE-BUTTON CLICK
if (upgradeProBtn) {
    upgradeProBtn.addEventListener('click', async () => {
        upgradeProBtn.disabled = true;
        upgradeProText.classList.add('symbol');
        upgradeProText.textContent = 'progress_activity';
        upgradeProText.classList.add('anim-rotate');

        const response = await fetch('/billing/create-order', { method: "POST" });
        const data = await response.json();

        if (!data.payment_session_id) {
            sendToastNotification("Something went wrong while processing your order!", "error", "var(--color-state-red)");
            upgradeProBtn.disabled = false;
            upgradeProText.classList.remove('symbol');
            upgradeProText.textContent = 'Upgrade to Pro';
            upgradeProText.classList.remove('anim-rotate');
        }

        cashfree.checkout({
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_self"
        });

        setTimeout(() => {
            sendToastNotification("Timeout: Processing your order took too long.", "error", "var(--color-state-red)");
            upgradeProBtn.disabled = false;
            upgradeProText.classList.remove('symbol');
            upgradeProText.textContent = 'Upgrade to Pro';
            upgradeProText.classList.remove('anim-rotate');
        }, 10000);
    });
}