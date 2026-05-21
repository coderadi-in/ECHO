// ==================================================
// ELEMENT REFERENCE
// ==================================================

const products = document.querySelectorAll('.product');
const colors = [ '#F6DECBA0', '#FCC5D2A0', '#DFDDE3A0', '#CCF5F5A0', '#C2EDFFA0' ];
const capGenBtns = document.querySelectorAll('.cap-gen-btn');
const HedGenBtns = document.querySelectorAll('.hed-gen-btn');

// ==================================================
// FUNCTIONS
// ==================================================

// * FUNCTION TO APPLY RANDOM BACKGROUND COLOR TO EACH CARD
export function applyRandomBackgroundColor() {
    products.forEach(product => {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        product.style.backgroundColor = randomColor;
    });
}

// * FUNCTION TO GET PRODUCT DATA FROM PRODUCT CARD'S BUTTON
function getProductData(btn) {
    const productCard = btn.closest('.product');

    const title = productCard.querySelector('.product-title').textContent;
    const price = productCard.querySelector('.product-price').textContent;
    const desc = productCard.querySelector('.product-desc').textContent;

    return { title: title, price: price, desc: desc };
}

// ==================================================
// EVENT LISTENERS
// ==================================================

// & EVENT LISTENER FOR DOM-CONTENT-LOAD
document.addEventListener('DOMContentLoaded', applyRandomBackgroundColor);

// & EVENT LISTENER FOR CAP-GEN-BUTTONS CLICK
capGenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const message = getProductData(btn);
        localStorage.setItem('pending_generation', JSON.stringify(message));             
        window.location.href = '/app/captions?refer=store';
    });
});

// & EVENT LISTENER FOR HED-GEN-BUTTONS CLICK
HedGenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const message = getProductData(btn);
        localStorage.setItem('pending_generation', JSON.stringify(message));             
        window.location.href = '/app/headlines?refer=store';
    });
});