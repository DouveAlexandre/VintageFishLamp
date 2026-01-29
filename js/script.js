document.addEventListener('DOMContentLoaded', () => {
    const fishContainer = document.getElementById('fish-container');
    const backgroundLayer = document.getElementById('background');
    const godRays = document.getElementById('god-rays');
    const caustics = document.getElementById('caustics');
    const glass = document.getElementById('glass-overlay');
    const particlesContainer = document.getElementById('particles');
    const turbulence = document.querySelector('feTurbulence');

    // Configurações Dinâmicas
    let config = {
        fishCount: 15,
        speedMult: 0.2,
        parallaxIntensity: 1.0,
        bubbleAmount: 80,
        causticsOpacity: 0.15,
        showGodRays: true,
        mouseInteraction: true
    };

    let frame = 0;
    let bgPosition = 0;
    const bgSpeed = 0.05; // Velocidade da rotação do fundo
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let fishes = [];

    const fishFiles = [
        'assets/peixe-azul.png', 'assets/peixe-brasileiro.png', 'assets/peixe-calda.png',
        'assets/peixe-chaveiro.png', 'assets/peixe-escamudo.png', 'assets/peixe-listrado.png',
        'assets/peixe-palhaco.png', 'assets/peixe-peixinho.png', 'assets/peixe-sardinha.png', 'assets/dory.png'
    ];

    function createFish(initial = false) {
        const file = fishFiles[Math.floor(Math.random() * fishFiles.length)];
        const fishEl = document.createElement('img');
        fishEl.src = file;
        fishEl.className = 'individual-fish';

        const scale = 0.3 + Math.random() * 0.7;
        const baseSpeed = (0.5 + Math.random() * 1.5) * config.speedMult;
        const depth = 0.2 + (Math.random() * 0.8);

        let x = initial ? Math.random() * (window.innerWidth + 400) - 200 : -250;
        let y = 10 + Math.random() * 80;

        fishEl.style.width = `${160 * scale}px`;
        fishEl.style.zIndex = Math.floor(depth * 10);
        fishEl.style.setProperty('--bob-duration', `${3 + Math.random() * 5}s`);
        fishEl.style.opacity = 0.6 + (depth * 0.4);

        fishContainer.appendChild(fishEl);

        return { el: fishEl, x: x, y: y, speed: baseSpeed, depth: depth };
    }

    function initFishes() {
        fishes.forEach(f => f.el.remove());
        fishes = [];
        for (let i = 0; i < config.fishCount; i++) {
            fishes.push(createFish(true));
        }
    }

    function initParticles() {
        if (!particlesContainer) return;
        particlesContainer.innerHTML = '';
        for (let i = 0; i < config.bubbleAmount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            if (Math.random() > 0.85) p.classList.add('glow');
            const size = Math.random() * 4 + 1;
            p.style.width = p.style.height = `${size}px`;
            p.style.left = `${Math.random() * 100}%`;
            p.style.setProperty('--duration', `${15 + Math.random() * 20}s`);
            p.style.animationDelay = `${-Math.random() * 30}s`;
            particlesContainer.appendChild(p);
        }
    }

    function animate() {
        frame++;

        // Interpolação suave para o mouse
        if (config.mouseInteraction) {
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;
        } else {
            mouseX += (0 - mouseX) * 0.05;
            mouseY += (0 - mouseY) * 0.05;
        }

        fishes.forEach((fish) => {
            fish.x += fish.speed;
            if (fish.x > window.innerWidth + 300) {
                fish.x = -300;
                fish.y = 10 + Math.random() * 80;
            }
            const pIntensity = config.parallaxIntensity;
            const pX = fish.x + (mouseX * 30 * fish.depth * pIntensity);
            const pY = fish.y + (mouseY * 15 * fish.depth * pIntensity);
            fish.el.style.transform = `translate(${pX}px, ${pY}vh)`;
        });

        // Background: Rotação (Auto-scroll) + Parallax (Mouse)
        bgPosition -= bgSpeed;
        if (backgroundLayer) {
            backgroundLayer.style.backgroundPosition = `${bgPosition}px center`;
            backgroundLayer.style.transform = `translate(${-mouseX * 15 * config.parallaxIntensity}px, ${-mouseY * 15 * config.parallaxIntensity}px) scale(1.1)`;
        }

        if (godRays) godRays.style.transform = `translate(${-mouseX * 40 * config.parallaxIntensity}px, 0)`;
        if (caustics) caustics.style.transform = `translate(${mouseX * 20 * config.parallaxIntensity}px, ${mouseY * 20 * config.parallaxIntensity}px)`;

        const gInt = 15 * config.parallaxIntensity;
        if (glass) glass.style.background = `radial-gradient(circle at ${50 + mouseX * gInt}% ${50 + mouseY * gInt}%, transparent 25%, rgba(0,0,0,0.4) 100%)`;

        if (frame % 2 === 0 && turbulence) {
            const baseFreq = 0.008 + Math.sin(frame * 0.01) * 0.002;
            turbulence.setAttribute('baseFrequency', `${baseFreq} ${baseFreq * 1.5}`);
        }
        requestAnimationFrame(animate);
    }

    // Event Listeners para o Painel de Debug
    const inputs = {
        fishCount: document.getElementById('input-fishCount'),
        speed: document.getElementById('input-speed'),
        parallax: document.getElementById('input-parallax'),
        bubbles: document.getElementById('input-bubbles'),
        caustics: document.getElementById('input-caustics'),
        godrays: document.getElementById('input-godrays'),
        mouse: document.getElementById('input-mouse')
    };

    const labels = {
        fishCount: document.getElementById('val-fishCount'),
        speed: document.getElementById('val-speed'),
        parallax: document.getElementById('val-parallax'),
        bubbles: document.getElementById('val-bubbles'),
        caustics: document.getElementById('val-caustics')
    };

    function updateFromInputs() {
        config.fishCount = parseInt(inputs.fishCount.value);
        labels.fishCount.innerText = config.fishCount;
        initFishes();

        config.speedMult = parseInt(inputs.speed.value) * 0.01;
        labels.speed.innerText = inputs.speed.value;
        fishes.forEach(f => f.speed = (0.5 + Math.random() * 1.5) * config.speedMult);

        config.parallaxIntensity = parseInt(inputs.parallax.value) / 50;
        labels.parallax.innerText = inputs.parallax.value;

        config.bubbleAmount = parseInt(inputs.bubbles.value);
        labels.bubbles.innerText = config.bubbleAmount;
        initParticles();

        config.causticsOpacity = parseInt(inputs.caustics.value) / 100;
        labels.caustics.innerText = inputs.caustics.value;
        if (caustics) caustics.style.opacity = config.causticsOpacity;

        config.showGodRays = inputs.godrays.checked;
        if (godRays) godRays.style.display = config.showGodRays ? 'block' : 'none';

        config.mouseInteraction = inputs.mouse.checked;
    }

    Object.values(inputs).forEach(input => {
        if (input) input.addEventListener('input', updateFromInputs);
    });

    // Mouse Tracking
    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    initFishes();
    initParticles();
    animate();

    // Wallpaper Engine API Listener
    window.wallpaperPropertyListener = {
        applyUserProperties: function (properties) {
            if (document.getElementById('debug-panel')) {
                document.getElementById('debug-panel').style.display = 'none';
            }

            if (properties.fishCount) {
                config.fishCount = properties.fishCount.value;
                initFishes();
            }
            if (properties.speed) {
                config.speedMult = properties.speed.value * 0.01;
                fishes.forEach(f => f.speed = (0.5 + Math.random() * 1.5) * config.speedMult);
            }
            if (properties.parallaxIntensity) {
                config.parallaxIntensity = properties.parallaxIntensity.value / 50;
            }
            if (properties.bubbleAmount) {
                config.bubbleAmount = properties.bubbleAmount.value;
                initParticles();
            }
            if (properties.causticsOpacity) {
                config.causticsOpacity = properties.causticsOpacity.value / 100;
                if (caustics) caustics.style.opacity = config.causticsOpacity;
            }
            if (properties.showGodRays !== undefined) {
                config.showGodRays = properties.showGodRays.value;
                if (godRays) godRays.style.display = config.showGodRays ? 'block' : 'none';
            }
            if (properties.mouseInteraction !== undefined) {
                config.mouseInteraction = properties.mouseInteraction.value;
            }
        }
    };
});
