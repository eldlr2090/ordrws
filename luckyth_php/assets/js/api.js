const API_BASE = '/api/index.php?endpoint=';

async function apiFetch(endpoint, method = 'GET', body = null) {
    const opts = {
        method,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + endpoint, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

const API = {
    // ── AUTH ──────────────────────────────────────────────────────────────────
    register:     (username, password, email = '') =>
        apiFetch('auth/register', 'POST', { username, password, email }),
    login:        (username, password) =>
        apiFetch('auth/login', 'POST', { username, password }),
    logout:       () => apiFetch('auth/logout', 'POST'),
    me:           () => apiFetch('auth/me'),
    resetRequest: (email) =>
        apiFetch('auth/reset-request', 'POST', { email }),

    // ── PRODUCTS ──────────────────────────────────────────────────────────────
    getProducts:   () => apiFetch('products'),
    updateStock:   (id, stock) => apiFetch(`products/${id}/stock`, 'PUT', { stock }),
    createProduct: (data) => apiFetch('products', 'POST', data),
    updateProduct: (id, data) => apiFetch(`products/${id}`, 'PUT', data),

    // ── CART ──────────────────────────────────────────────────────────────────
    getCart:        () => apiFetch('cart'),
    addToCart:      (product_id) => apiFetch('cart', 'POST', { product_id }),
    removeFromCart: (cart_id) => apiFetch(`cart/${cart_id}`, 'DELETE'),

    // ── ORDERS ────────────────────────────────────────────────────────────────
    getOrders: () => apiFetch('orders'),
    placeOrder: (cartIds, barangay, address, payment, ewalletNum = '') =>
        apiFetch('orders', 'POST', {
            cart_ids: cartIds, barangay, address, payment, ewallet_num: ewalletNum
        }),
    cancelOrder: (orderId) => apiFetch(`orders/${orderId}/cancel`, 'PUT'),
    shipOrder:   (orderId) => apiFetch(`orders/${orderId}/ship`,   'PUT'),

    // ── ADMIN ─────────────────────────────────────────────────────────────────
    adminGetOrders: () => apiFetch('admin/orders'),

    // ── ANALYTICS ─────────────────────────────────────────────────────────────
    getDashboard:    () => apiFetch('analytics/dashboard'),
    getCustomers:    () => apiFetch('analytics/customers'),
};
