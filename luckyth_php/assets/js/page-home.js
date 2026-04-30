// assets/js/page-home.js — Home page (New Releases slider)
document.addEventListener('pageReady', renderHome);

async function renderHome() {
    const slider = document.getElementById('home-slider');
    if (!slider) return;
    try {
        const data = await API.getProducts();
        // Only show "real" products (skip empty placeholders the admin hasn't filled in yet),
        // then take the most recent 5 as the New Releases.
        const real     = data.products.filter(p => (p.name || '').trim() !== '');
        const featured = real.slice(-5).reverse();

        if (featured.length === 0) {
            slider.innerHTML = `<p class="w-full text-center text-slate-400 font-bold py-10">No new releases yet.</p>`;
            updateSliderArrows();
            return;
        }

        slider.innerHTML = featured.map(productCard).join('');
        lucide.createIcons();
        wireSlider();
    } catch(e) {
        console.warn('Could not load home products', e);
        slider.innerHTML = `<p class="w-full text-center text-red-400 font-bold py-10">Could not load products.</p>`;
    }
}

function productCard(p) {
    const img = p.images?.[0] || '';
    return `
    <a href="/products/product-${p.id}.html"
       class="snap-start shrink-0 w-[80%] sm:w-[45%] lg:w-[23%] bg-white rounded-[2rem] overflow-hidden border-2 border-slate-100 hover:border-orange transition-all duration-300 group block">
        <div class="aspect-[4/5] relative overflow-hidden bg-slate-100">
            <img src="${img}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
            ${p.stock === 0 ? '<div class="absolute inset-0 bg-navy/70 backdrop-blur-[2px] flex items-center justify-center text-white font-black uppercase tracking-widest text-sm">Sold Out</div>' : ''}
            ${p.stock === 1 ? '<div class="absolute top-4 left-4 bg-orange text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">Last One!</div>' : ''}
            ${p.images?.length > 1 ? `<div class="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] font-black px-2 py-1 rounded-full">+${p.images.length - 1} photos</div>` : ''}
        </div>
        <div class="p-6">
            <h3 class="font-bold text-navy mb-3 leading-tight">${p.name}</h3>
            <div class="flex items-center justify-between">
                <span class="text-xl font-black text-navy">₱${p.price}</span>
                <span class="bg-slate-100 text-navy px-3 py-2 rounded-lg text-xs font-bold group-hover:bg-orange group-hover:text-white transition-colors">View</span>
            </div>
        </div>
    </a>`;
}

function wireSlider() {
    const slider = document.getElementById('home-slider');
    const prev   = document.getElementById('slider-prev');
    const next   = document.getElementById('slider-next');
    if (!slider || !prev || !next) return;

    const step = () => {
        const card = slider.querySelector('a, div.snap-start');
        if (!card) return slider.clientWidth * 0.9;
        // Card width + the flex gap (24px = gap-6).
        return card.getBoundingClientRect().width + 24;
    };

    prev.onclick = () => slider.scrollBy({ left: -step(), behavior: 'smooth' });
    next.onclick = () => slider.scrollBy({ left:  step(), behavior: 'smooth' });

    slider.addEventListener('scroll', updateSliderArrows, { passive: true });
    window.addEventListener('resize', updateSliderArrows);
    updateSliderArrows();
}

function updateSliderArrows() {
    const slider = document.getElementById('home-slider');
    const prev   = document.getElementById('slider-prev');
    const next   = document.getElementById('slider-next');
    if (!slider || !prev || !next) return;
    const max = slider.scrollWidth - slider.clientWidth - 1;
    prev.disabled = slider.scrollLeft <= 1;
    next.disabled = slider.scrollLeft >= max;
}
