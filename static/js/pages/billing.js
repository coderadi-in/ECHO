// ==================================================
// ELEMENT REFERENCE
// ==================================================

const upgradeProBtn = document.getElementById('upgradePro');

const cashfree = Cashfree({ mode: "sandbox" });

// ==================================================
// EVENT LISTENERS
// ==================================================

upgradeProBtn.addEventListener('click', async () => {
    const response = await fetch('/billing/create-order', {method: "POST"});
    const data = await response.json();
    cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self"
    });
});