// assets/js/page-profile.js
document.addEventListener('pageReady', initProfile);

async function initProfile() {
    if (!Nav.user) {
        document.getElementById('profile-content').innerHTML =
            `<div class="text-center py-20"><p class="text-slate-400 font-bold text-lg mb-4">You're not signed in.</p>
            <button onclick="Nav.openAuth()" class="btn-primary px-8 py-3 rounded-xl font-bold">Sign In</button></div>`;
        return;
    }
    document.getElementById('profile-username').innerText = Nav.user.username;
    await renderOrderHistory();
}

async function renderOrderHistory() {
    const list = document.getElementById('profile-history');
    try {
        const data = await API.getOrders();
        if (!data.orders.length) {
            list.innerHTML = `<p class="text-slate-500 italic text-sm">No orders yet.</p>`;
            return;
        }
        list.innerHTML = data.orders.map(o => {
            const sc = { Pending:'bg-orange text-white', Shipped:'bg-navy text-white', Cancelled:'bg-slate-300 text-slate-600', Processing:'bg-blue-500 text-white' }[o.status] || '';
            return `
            <div class="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                <div>
                    <p class="font-bold text-navy">${o.items.map(i=>i.name).join(', ')}</p>
                    <p class="text-xs text-slate-400 font-mono mt-1">ORD-${o.id} | ₱${Number(o.total_amount).toLocaleString()}</p>
                    ${o.delivery_addr ? `<p class="text-xs text-slate-400 truncate">📍 ${o.delivery_addr}</p>` : ''}
                </div>
                <span class="text-[10px] font-black uppercase px-3 py-1 rounded-full ${sc} ml-3 shrink-0">${o.status}</span>
            </div>`;
        }).join('');
    } catch {
        list.innerHTML = `<p class="text-red-400 text-sm">Could not load orders.</p>`;
    }
}
