// assets/js/page-product.js
// Reads data-product-id from <body> and loads that product.
// Each product-N.html sets <body data-product-id="N">

let _product = null;
let _imgIdx  = 0;

document.addEventListener('pageReady', () => {
    const productId = parseInt(document.body.dataset.productId);
    if (productId) loadProduct(productId);
});

async function loadProduct(id) {
    try {
        const data = await API.getProducts();
        _product   = data.products.find(p => p.id === id);
        if (!_product) {
            document.getElementById('product-content').innerHTML =
                `<p class="text-red-400 font-bold text-center py-20">Product not found.</p>`;
            return;
        }
        renderProduct(_product);
    } catch(e) {
        document.getElementById('product-content').innerHTML =
            `<p class="text-red-400 font-bold text-center py-20">Could not load product.</p>`;
    }
}

function renderProduct(p) {
    // Title
    document.title = `${p.name} | LuckyThrift`;

    // Main image
    setImage(0);

    // Name / price / description
    document.getElementById('prod-name').innerText  = p.name;
    document.getElementById('prod-price').innerText = `₱${p.price}`;
    document.getElementById('prod-desc').innerText  = p.description || 'Premium vintage piece from the LuckyThrift collection.';

    // Stock badge
    const badge = document.getElementById('prod-stock-badge');
    if (p.stock <= 0) {
        badge.innerText   = 'Sold Out';
        badge.className   = 'inline-block bg-navy text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider';
    } else if (p.stock === 1) {
        badge.innerText   = 'Last One!';
        badge.className   = 'inline-block bg-orange text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider';
    } else {
        badge.innerText   = `In Stock (${p.stock})`;
        badge.className   = 'inline-block bg-green-500 text-white text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider';
    }

    // Add to cart button
    const btn = document.getElementById('add-to-cart-btn');
    if (p.stock <= 0) {
        btn.disabled  = true;
        btn.className = 'w-full bg-slate-200 text-slate-400 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 cursor-not-allowed';
        btn.innerHTML = `<i data-lucide="lock" class="w-5 h-5"></i> Out of Stock`;
    } else {
        btn.disabled  = false;
        btn.className = 'w-full btn-primary py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2';
        btn.innerHTML = `<i data-lucide="shopping-cart" class="w-5 h-5"></i> Add to Cart`;
        btn.onclick   = () => addToCart(p.id);
    }

    // Thumbnail strip
    const thumbs = document.getElementById('prod-thumbs');
    if (p.images?.length > 1) {
        thumbs.innerHTML = p.images.map((img, i) => `
            <button onclick="setImage(${i})" id="thumb-${i}"
                class="w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${i === 0 ? 'border-orange' : 'border-slate-200'} hover:border-orange">
                <img src="${img}" class="w-full h-full object-cover">
            </button>`).join('');
    } else {
        thumbs.classList.add('hidden');
    }

    // Show/hide arrows
    const showArrows = p.images?.length > 1;
    document.getElementById('prev-btn').classList.toggle('hidden', !showArrows);
    document.getElementById('next-btn').classList.toggle('hidden', !showArrows);

    lucide.createIcons();
}

function setImage(idx) {
    if (!_product?.images?.length) return;
    _imgIdx = idx;
    document.getElementById('prod-main-img').src = _product.images[idx];
    document.querySelectorAll('[id^="thumb-"]').forEach((el, i) => {
        el.classList.toggle('border-orange',   i === idx);
        el.classList.toggle('border-slate-200', i !== idx);
    });
}

function prevImage() {
    if (!_product) return;
    setImage((_imgIdx - 1 + _product.images.length) % _product.images.length);
}
function nextImage() {
    if (!_product) return;
    setImage((_imgIdx + 1) % _product.images.length);
}

async function addToCart(productId) {
    if (!Nav.user) {
        showToast('Please Sign In to add items to cart.');
        Nav.openAuth();
        return;
    }
    const btn = document.getElementById('add-to-cart-btn');
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> Adding…`;
    lucide.createIcons();
    try {
        await API.addToCart(productId);
        await Nav.updateCartBadge();
        showToast(`🛒 Added to cart: ${_product.name}`, 'success');
        btn.innerHTML = `<i data-lucide="check" class="w-5 h-5"></i> Added!`;
        lucide.createIcons();
        setTimeout(() => {
            btn.disabled  = false;
            btn.innerHTML = `<i data-lucide="shopping-cart" class="w-5 h-5"></i> Add to Cart`;
            lucide.createIcons();
        }, 1500);
    } catch(e) {
        showToast(e.message, 'error');
        btn.disabled  = false;
        btn.innerHTML = `<i data-lucide="shopping-cart" class="w-5 h-5"></i> Add to Cart`;
        lucide.createIcons();
    }
}
