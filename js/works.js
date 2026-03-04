/* --- works.js --- Works 页面专用交互逻辑 --- */
const slider = document.getElementById('worksSlider');
const timeNav = document.getElementById('timeNav');
const catNav = document.getElementById('catNav');
const progressFill = document.getElementById('progressFill');

let isDown = false, isDragging = false, startX, scrollLeftOrigin;

function initWorks() {
    if (!slider) return;

    worksData.forEach((work, index) => {
        const card = document.createElement('section');
        card.className = 'work-card';
        card.id = `work-${index}`;
        card.addEventListener('mouseup', () => { if (!isDragging) openLightbox(work); });
        
        const vidId = work.mediaType === 'youtube' ? work.path.split('?')[0] : '';
        const thumb = work.mediaType === 'image' ? work.path : `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg`;
        
        card.innerHTML = `<div class="work-img-box"><img src="${thumb}"><div style="position:absolute;bottom:10px;right:10px;font-size:8px;color:white;opacity:0.5;z-index:5;">${work.mediaType.toUpperCase()}</div></div><div class="work-meta"><div class="work-type">${work.year} / ${work.category}</div><h3 class="work-name">${work.name}</h3></div>`;
        
        const img = card.querySelector('img');
        if (img) {
            img.onload = function() { this.classList.add('loaded'); this.parentElement.classList.add('is-loaded'); };
            if (img.complete) img.onload();
        }
        slider.appendChild(card);
    });

    // 生成 Timeline 导航
    const years = [...new Set(worksData.map(w => w.year))].sort().reverse();
    years.forEach(y => {
        const a = document.createElement('a'); a.className="nav-link"; a.innerText = y;
        a.onclick=() => scrollToWork(worksData.findIndex(w => w.year === y));
        timeNav.appendChild(a);
    });

    // 生成 Category 导航
    const cats = [...new Set(worksData.map(w => w.category))];
    cats.forEach(c => {
        const a = document.createElement('a'); a.className="nav-link"; a.innerText = c;
        a.onclick=() => scrollToWork(worksData.findIndex(w => w.category === c));
        catNav.appendChild(a);
    });
}

function scrollToWork(index) {
    slider.style.scrollBehavior = 'smooth';
    const target = slider.children[index];
    if(target) slider.scrollTo({ left: target.offsetLeft - 50 });
}

function openLightbox(work) {
    const container = document.getElementById('lbMediaContainer');
    if (!container) return;
    container.innerHTML = '';
    if (work.mediaType === 'image') {
        container.innerHTML = `<img src="${work.path}" class="lightbox-media" style="object-fit:contain">`;
    } else {
        const vidId = work.path.split('?')[0];
        container.innerHTML = `<iframe class="lightbox-media" style="width:80vw; height:45vw;" src="https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    document.getElementById('lightbox').classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.getElementById('lbMediaContainer').innerHTML = '';
}

// 拖拽与进度条逻辑
if (slider) {
    slider.addEventListener('mousedown', (e) => { isDown = true; isDragging = false; slider.style.scrollBehavior = 'auto'; startX = e.pageX - slider.offsetLeft; scrollLeftOrigin = slider.scrollLeft; });
    slider.addEventListener('mousemove', (e) => { if (!isDown) return; const x = e.pageX - slider.offsetLeft; const walk = (x - startX) * 2.8; if (Math.abs(walk) > 5) isDragging = true; slider.scrollLeft = scrollLeftOrigin - walk; });
    window.addEventListener('mouseup', () => { isDown = false; setTimeout(() => isDragging = false, 10); });
    slider.addEventListener('wheel', (e) => { e.preventDefault(); slider.style.scrollBehavior = 'auto'; slider.scrollLeft += e.deltaY * 1.5; });
    slider.addEventListener('scroll', () => { const p = (slider.scrollLeft / (slider.scrollWidth - slider.clientWidth)) * 100; if(progressFill) progressFill.style.width = (p || 0) + "%"; });
}

// 初始化
document.addEventListener('DOMContentLoaded', initWorks);