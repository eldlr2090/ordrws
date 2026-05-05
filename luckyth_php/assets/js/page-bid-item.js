// assets/js/page-bid-item.js — Single auction detail (read-only for now; bidding in step 3)
document.addEventListener('pageReady', initBidItem);

let _auction       = null;
let _imgIndex      = 0;
let _timerInterval = null;
let _pollInterval  = null;

async function initBidItem() {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) { location.href = '/bids.html'; return; }

    await loadAuction(id);

    // Poll every 8 seconds to keep bid info and countdown fresh.
    _pollInterval = setInterval(() => loadAuction(id), 8_000);
}

async function loadAuction(id) {
    try {
        const data = await API.getAuctions();
        const a    = (data.auctions || []).find(x => x.id === parseInt(id));
        if (!a) { location.href = '/bids.html'; return; }
        _auction = a;
        renderDetail(a);
    } catch(e) {
        console.warn('Could not load auction', e);
    }
}

function renderDetail(a) {
    // Page title / breadcrumb
    document.title = `${a.name} | LuckyThrift`;
    document.getElementById('breadcrumb-name').textContent = a.name;

    // Category + name
    document.getElementById('detail-category').textContent    = a.category;
    document.getElementById('detail-name').textContent        = a.name;
    document.getElementById('detail-description').textContent = a.description || 'No description provided.';

    // Images
    const imgs = a.images || [];
    _imgIndex  = Math.max(0, Math.min(_imgIndex, imgs.length - 1));
    const mainImg = document.getElementById('main-img');
    mainImg.src   = imgs[_imgIndex] || '';
    mainImg.alt   = a.name;

    document.getElementById('img-prev').classList.toggle('hidden', imgs.length < 2);
    document.getElementById('img-next').classList.toggle('hidden', imgs.length < 2);
    document.getElementById('img-counter').classList.toggle('hidden', imgs.length < 2);
    if (imgs.length > 1)
        document.getElementById('img-counter').textContent = `${_imgIndex + 1} / ${imgs.length}`;

    const thumbs = document.getElementById('thumbnails');
    thumbs.innerHTML = imgs.length > 1 ? imgs.map((src, i) =>
        `<button onclick="setImg(${i})" class="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === _imgIndex ? 'border-orange' : 'border-slate-100 hover:border-slate-300'}">
            <img src="${src}" alt="" class="w-full h-full object-cover">
         </button>`
    ).join('') : '';

    // Status badge on image
    const badge = document.getElementById('status-badge');
    if (a.status === 'live') {
        badge.innerHTML = `<div class="flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md"><span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block"></span> Live</div>`;
    } else if (a.status === 'scheduled') {
        badge.innerHTML = `<div class="bg-orange text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">Coming Soon</div>`;
    } else {
        badge.innerHTML = `<div class="bg-slate-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">Ended</div>`;
    }

    // Bid panel
    const bidLabel   = document.getElementById('bid-label');
    const bidDisplay = document.getElementById('current-bid-display');
    const incDisplay = document.getElementById('increment-display');

    if (a.current_bid !== null) {
        bidLabel.textContent   = 'Current Bid';
        bidDisplay.textContent = `₱${Number(a.current_bid).toLocaleString()}`;
    } else {
        bidLabel.textContent   = 'Starting Price';
        bidDisplay.textContent = `₱${Number(a.starting_price).toLocaleString()}`;
    }
    incDisplay.textContent = `+₱${Number(a.bid_increment).toLocaleString()} min. increment`;

    // Bid action area
    const actionArea = document.getElementById('bid-action-area');
    if (a.status === 'live') {
        const minBid = (a.current_bid ?? a.starting_price) + a.bid_increment;
        actionArea.innerHTML = `
            <div id="bid-form-placeholder" class="mt-2 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center">
                <p class="text-sm font-bold text-slate-400">Bidding is live.</p>
                <p class="text-xs text-slate-300 mt-1">Min next bid: <strong class="text-navy">₱${Number(minBid).toLocaleString()}</strong></p>
                <p class="text-xs text-orange font-bold mt-2">Sign in to place a bid — coming next!</p>
            </div>`;
    } else if (a.status === 'scheduled') {
        actionArea.innerHTML = `
            <div class="mt-2 p-4 bg-slate-50 rounded-xl text-center">
                <p class="text-sm font-bold text-slate-400">Bidding hasn't opened yet.</p>
                <p class="text-xs text-slate-300 mt-1">Come back when it goes live!</p>
            </div>`;
    } else {
        const winnerLine = a.winner_id
            ? `<p class="text-xs text-slate-400 mt-1">This auction has a winner.</p>`
            : `<p class="text-xs text-slate-300 mt-1">No bids were placed.</p>`;
        actionArea.innerHTML = `
            <div class="mt-2 p-4 bg-slate-50 rounded-xl text-center">
                <p class="text-sm font-bold text-slate-500">This auction has ended.</p>
                ${winnerLine}
            </div>`;
    }

    // Countdown timer
    const timerBlock = document.getElementById('timer-block');
    if (_timerInterval) clearInterval(_timerInterval);

    if (a.status === 'live' && a.end_time) {
        timerBlock.classList.remove('hidden');
        document.getElementById('timer-label').textContent = 'Auction Ends In';
        startTimer(new Date(a.end_time.replace(' ', 'T')));
    } else if (a.status === 'scheduled' && a.start_time) {
        timerBlock.classList.remove('hidden');
        document.getElementById('timer-label').textContent = 'Bidding Opens In';
        startTimer(new Date(a.start_time.replace(' ', 'T')));
    } else {
        timerBlock.classList.add('hidden');
    }

    // Bid history (placeholder — will be real in step 3 when bids table is used)
    document.getElementById('bid-history').innerHTML =
        `<p class="text-slate-300 font-bold text-center py-4">No bids yet — be the first!</p>`;

    // Reveal page
    const loader = document.getElementById('global-loader');
    if (loader) loader.style.display = 'none';

    lucide.createIcons();
}

function startTimer(target) {
    const tick = () => {
        const diff = target - Date.now();
        if (diff <= 0) {
            ['t-days','t-hours','t-mins','t-secs'].forEach(id => {
                document.getElementById(id).textContent = '00';
            });
            clearInterval(_timerInterval);
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000)  / 60000);
        const s = Math.floor((diff % 60000)    / 1000);
        document.getElementById('t-days').textContent  = String(d).padStart(2,'0');
        document.getElementById('t-hours').textContent = String(h).padStart(2,'0');
        document.getElementById('t-mins').textContent  = String(m).padStart(2,'0');
        document.getElementById('t-secs').textContent  = String(s).padStart(2,'0');
    };
    tick();
    _timerInterval = setInterval(tick, 1000);
}

function setImg(i) {
    const imgs = _auction?.images || [];
    _imgIndex  = Math.max(0, Math.min(i, imgs.length - 1));
    document.getElementById('main-img').src = imgs[_imgIndex] || '';
    document.getElementById('img-counter').textContent = `${_imgIndex + 1} / ${imgs.length}`;
    // Refresh thumbnail highlight
    document.querySelectorAll('#thumbnails button').forEach((b, idx) => {
        b.classList.toggle('border-orange', idx === _imgIndex);
        b.classList.toggle('border-slate-100', idx !== _imgIndex);
    });
}

function shiftImg(dir) {
    const len = (_auction?.images || []).length;
    setImg((_imgIndex + dir + len) % len);
}
