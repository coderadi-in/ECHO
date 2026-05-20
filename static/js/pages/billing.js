// ==================================================
// ELEMENT REFERENCE
// ==================================================

const upgradeProBtn = document.getElementById('upgradePro');
const renewalDate = document.getElementById('renewalDate');
const cashfree = Cashfree({ mode: "sandbox" });

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

// ==================================================
// EVENT LISTENERS
// ==================================================

// & INITIAL DISPLAY SETTINGS
document.addEventListener('DOMContentLoaded', () => {
    formatDate();
});

// & EVENT LISTENERS FOR UPGRADE-BUTTON CLICK
upgradeProBtn.addEventListener('click', async () => {
    const response = await fetch('/billing/create-order', {method: "POST"});
    const data = await response.json();
    cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
    });
});