/* --- global.js --- */
const clickMask = document.getElementById('clickMask');
// 🚀 初始化：检查 sessionStorage
let isLightMode = sessionStorage.getItem('portfolio-mode') === 'light';
let colorTransition = isLightMode ? 1 : 0; 

// 如果存的是 light，加载时立即应用
if (isLightMode) {
    document.body.classList.add('light-mode');
}

// 🚀 核心点击逻辑
if (clickMask) {
    clickMask.onclick = function(e) {
        const rect = this.getBoundingClientRect();
        const relativeY = e.clientY - rect.top;
        const percentY = (relativeY / rect.height) * 100;

        if (percentY <= 20) {
            // 20% 之上（眼睛）-> 回主页
            window.location.href = 'index.html';
        } else {
            // 20% 之下（绳子和手柄）-> 切换昼夜
            isLightMode = !isLightMode;
            document.body.classList.toggle('light-mode', isLightMode);
            
            // 🚀 保存到会话存储（刷新会消失，跳转会保留）
            sessionStorage.setItem('portfolio-mode', isLightMode ? 'light' : 'dark');
        }
    };
}

// --- 宇宙逻辑 ---
const canvas = document.getElementById('universe');
if (canvas) {
    const ctx = canvas.getContext('2d');
    const config = { starCount: 45, particleCount: 45000, baseSize: 40, longAxisRatio: 2.2, sharpness: 0.45, friction: 0.94, ease: 0.06 };
    let v = { x: 0, y: 0, tx: 0, ty: 0 }, lastM = { x: 0, y: 0 };
    const motherCache = { dark: [], light: [] };

    const burger = document.getElementById('burger');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuLinks = document.querySelectorAll('.menu-link');
    if (burger) {
        burger.onclick = function() {
            this.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.classList.toggle('menu-open'); 
            if (menuOverlay.classList.contains('active')) {
                menuLinks.forEach((link, index) => { link.style.transitionDelay = `${0.3 + index * 0.1}s`; });
            }
        };

                /* --- global.js 补充部分 --- */

        // ... 原有的 burger.onclick 逻辑保持不变 ...

        // 🚀 新增：点击菜单以外区域关闭菜单
        document.addEventListener('click', function(event) {
            const menuOverlay = document.getElementById('menuOverlay');
            const burger = document.getElementById('burger');
            
            // 检查菜单是否处于打开状态
            if (menuOverlay.classList.contains('active')) {
                // 如果点击的目标【不是菜单本身】且【不是汉堡按钮及其子元素】
                if (!menuOverlay.contains(event.target) && !burger.contains(event.target)) {
                    // 执行关闭逻辑
                    burger.classList.remove('active');
                    menuOverlay.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
            }
        });
    }

    function createMother(color, blurStr) {
        const mCanvas = document.createElement('canvas');
        const w = config.baseSize * 5, h = w * config.longAxisRatio;
        mCanvas.width = w; mCanvas.height = h;
        const mctx = mCanvas.getContext('2d');
        if (blurStr !== '0px') mctx.filter = `blur(${blurStr})`;
        mctx.fillStyle = color;
        const cx = w/2, cy = h/2;
        for (let i = 0; i < config.particleCount; i++) {
            const rx = (Math.random() - 0.5) * config.baseSize * 4;
            const ry = (Math.random() - 0.5) * config.baseSize * config.longAxisRatio * 2;
            const nx = Math.abs(rx) / config.baseSize, ny = Math.abs(ry) / (config.baseSize * config.longAxisRatio);
            const dist = Math.pow(nx, config.sharpness) + Math.pow(ny, config.sharpness);
            if (dist < 0.8 || (dist < 1.6 && Math.random() < Math.pow(1 - (dist - 0.8) / 0.8, 8))) {
                let pSize = 0.3 + 1.9 * Math.pow(Math.max(0, 1 - dist/1.6), 2);
                mctx.fillRect(cx + rx, cy + ry, pSize, pSize);
            }
        }
        return mCanvas;
    }
    class Star {
        constructor() { this.reset(); this.age = Math.random() * 8000; }
        reset() {
            this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
            const r = Math.random();
            if (r > 0.8) { this.idx = 0; this.sc = 0.45; this.bAmp = 0.35; this.bSpd = 0.005; } 
            else if (r > 0.4) { this.idx = 1; this.sc = 0.28; this.bAmp = 0.15; this.bSpd = 0.012; } 
            else { this.idx = 2; this.sc = 0.15; this.bAmp = 0.05; this.bSpd = 0.02; }
            this.op = 0; this.life = 10000 + Math.random() * 10000; this.age = 0;
            this.bPh = Math.random() * 7; this.tPh = Math.random() * 7;
        }
        update() {
            this.age += 16.6; this.bPh += this.bSpd; this.tPh += 0.05;
            const fade = 2500;
            if (this.age < fade) this.op = this.age / fade;
            else if (this.age > this.life - fade) this.op = (this.life - this.age) / fade;
            else this.op = 1;
            if (this.age >= this.life) this.reset();
        }
        draw(ox, oy) {
            const finalSc = this.sc * (1 + Math.sin(this.bPh) * this.bAmp) * (1 + Math.sin(this.tPh) * 0.1);
            const dx = this.x - (motherCache.dark[this.idx].width * finalSc)/2 + (ox * (2.5 - this.idx));
            const dy = this.y - (motherCache.dark[this.idx].height * finalSc)/2 + (oy * (2.5 - this.idx));
            ctx.globalAlpha = Math.max(0, this.op * (1 - colorTransition));
            ctx.drawImage(motherCache.dark[this.idx], dx, dy, motherCache.dark[this.idx].width * finalSc, motherCache.dark[this.idx].height * finalSc);
            ctx.globalAlpha = Math.max(0, this.op * colorTransition);
            ctx.drawImage(motherCache.light[this.idx], dx, dy, motherCache.light[this.idx].width * finalSc, motherCache.light[this.idx].height * finalSc);
        }
    }
    let stars = [];
    function init() {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        const blurs = ['0px', '0.6px', '1.8px'];
        motherCache.dark = blurs.map(b => createMother("white", b));
        motherCache.light = blurs.map(b => createMother("black", b));
        stars = Array.from({ length: config.starCount }, () => new Star());
    }
    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        v.tx *= config.friction; v.ty *= config.friction;
        v.x += (v.tx - v.x) * config.ease; v.y += (v.ty - v.y) * config.ease;
        const step = 16.6 / 1000;
        if (isLightMode && colorTransition < 1) colorTransition = Math.min(1, colorTransition + step);
        if (!isLightMode && colorTransition > 0) colorTransition = Math.max(0, colorTransition - step);
        stars.forEach(s => { s.update(); s.draw(v.x, v.y); });
        requestAnimationFrame(loop);
    }
    window.addEventListener('mousemove', (e) => {
        if (lastM.x !== 0) { v.tx += (e.clientX - lastM.x) * 0.5; v.ty += (e.clientY - lastM.y) * 0.5; }
        lastM.x = e.clientX; lastM.y = e.clientY;
    });
    window.addEventListener('resize', init);
    init(); loop();
}