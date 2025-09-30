// =================================================================
// 👑 KPOP BIAS SELECTOR - REFACTORIZADO (OOP y Modular) 👑
/*  Actualizado: BTS⇄ARMY toggle, autoplay robusto, fireworks crackles  */
// =================================================================

// -----------------------------------------------------------------
// # 1. UTILIDADES Y CONFIGURACIÓN ESTATICA (Sin cambios)
// -----------------------------------------------------------------

/** Helper para seleccionar elementos con sintaxis limpia. */
const getEl = (sel, ctx = document) => ctx.querySelector(sel);
const getAllEl = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Configuración de archivos de audio por bias. */
const SONG_SOURCES = {
    default: 'assets/audio/clip.mp3',
    'RM': 'assets/audio/RM.mp3',
    'Jin': 'assets/audio/JIN.mp3',
    'Suga': 'assets/audio/SUGA.mp3',
    'J-Hope': 'assets/audio/JH.mp3',
    'Jimin': 'assets/audio/JIMIN.mp3',
    'V': 'assets/audio/V.mp3',
    'Jungkook': 'assets/audio/JK.mp3'
};

/** Colores temáticos por bias (hexadecimal). */
const THEME_COLORS = {
    'RM': '#1e5bff', // Azul
    'Jin': '#ff7ab6', // Rosa
    'Suga': '#111111', // Negro
    'J-Hope': '#ff2b2b', // Rojo
    'Jimin': '#ffd65b', // Dorado/Amarillo
    'V': '#2ecc71', // Verde
    'Jungkook': '#a86cff' // Morado (Purple You)
};

/** Mensajes motivacionales por bias. */
const BIAS_MESSAGES = {
    'RM': 'Si tu bias es RM, mi razón y mi corazón eligen: tú 💜.',
    'Jin': 'Worldwide Handsome, pero mi mundo más guapo eres tú.',
    'Suga': 'Si es Suga, entonces mi amor suena en “Daechwita”… por ti.',
    'J-Hope': 'Tú eres mi rayito de sol en cada día 💫.',
    'Jimin': 'Tú eres mi “Filter” favorito: amor puro.',
    'V': 'Mi taetae del alma eres tú 💜.',
    'Jungkook': 'Mi Euphoria empieza cada vez que te veo.'
};

/** HEX -> rgba() */
const hexToRgba = (hex, a = 1) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};

// -----------------------------------------------------------------
// # 2. CLASE PRINCIPAL: BIAS APP (métodos: openWings, sayBias, burstHearts)
// -----------------------------------------------------------------

class BiasApp {
    // Getters DOM
    get logoCard()   { return getEl('#logoCard'); }
    get logoWrap()   { return getEl('#logoWrap'); }   // <- contenedor del logo BTS/ARMY
    get loveMessage(){ return getEl('#loveMessage'); }
    get audioEl()    { return getEl('#song'); }
    get membersUl()  { return getEl('#members'); }
    get biasResult() { return getEl('#biasResult'); }

    constructor() {
        this.setupDOM();
        this.addEventListeners();

        // autoplay del clip al cargar
        window.addEventListener('DOMContentLoaded', this.playClipLoop);

        // cuando termina una pista de bias (no-loop), vuelve al clip en loop
        this.audioEl.addEventListener('ended', () => {
            if (!this.audioEl.loop) this.playClipLoop();
        });
    }

    /** Asegura botones y crea canvas de fuegos artificiales */
    setupDOM() {
        const labels = Object.keys(THEME_COLORS);
        if (getAllEl('.pill').length < labels.length) {
            this.membersUl.innerHTML = labels.map(n =>
                `<li><button class="pill" data-name="${n}" aria-label="${n}">${n.replace('Jungkook', 'JK')}</button></li>`
            ).join('');
        }
        // Canvas de fireworks (color por defecto morado)
        this.fireworksCanvas = new FireworksCanvas(THEME_COLORS.Jungkook);
    }

    /** Listeners globales */
    addEventListeners() {
        // 1) Logo: click + teclado
        const handleActivate = (e) => {
            if (e.type === 'keydown' && !(e.key === 'Enter' || e.key === ' ')) return;
            this.openWings();
        };
        this.logoCard.addEventListener('click', handleActivate);
        this.logoCard.addEventListener('keydown', handleActivate);

        // 2) Botones de bias
        getAllEl('.pill').forEach(btn => {
            btn.addEventListener('click', () => this.sayBias(btn.dataset.name, btn));
        });
    }

    /** Abre el logo, alterna BTS⇄ARMY y asegura clip loop */
openWings = () => {
  if (!this.logoCard.classList.contains('opened')) {
    this.logoCard.classList.add('opened');
    this.loveMessage.hidden = false;
    this.loveMessage.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 450, easing: 'cubic-bezier(.2,.9,.2,1)' }
    );
  }

  // Alterna el logo BTS ⇄ ARMY (si usas el modo)
  if (this.logoWrap) {
    this.logoWrap.classList.toggle('army-mode');
    this.logoWrap.classList.toggle('bts-mode');

    /* 👇 Retraso opcional antes del fade del overlay (0.45s) */
    this.logoCard.classList.remove('opened');           // re-mostrar overlay
    setTimeout(() => this.logoCard.classList.add('opened'), 450);
  }

  this.playClipLoop();
}

    /** Reproduce clip.mp3 en loop (con desbloqueo si el navegador lo bloquea) */
    playClipLoop = async () => {
        try {
            if (this.audioEl.src.indexOf('clip.mp3') === -1) this.audioEl.src = SONG_SOURCES.default;
            this.audioEl.loop = true;
            this.audioEl.currentTime = 0;
            await this.audioEl.play();
        } catch (e) {
            // desbloqueo en primera interacción
            const unlock = () => { this.audioEl.play().catch(()=>{}); cleanup(); };
            const cleanup = () => {
                document.removeEventListener('click', unlock);
                document.removeEventListener('keydown', unlock);
            };
            document.addEventListener('click', unlock, { once: true });
            document.addEventListener('keydown', unlock, { once: true });
        }
    }

    /** Reproduce la canción del miembro (no loop) */
    playMemberAudio = async (name) => {
        const src = SONG_SOURCES[name];
        if (!src) { this.playAudioWithFallback(); return; }

        try {
            this.audioEl.pause();
            this.audioEl.src = src;
            this.audioEl.loop = false;
            this.audioEl.currentTime = 0;
            await this.audioEl.play();
        } catch (e) {
            this.playAudioWithFallback();
        }
    }

    /** Fallback beep si falla audio */
    playAudioWithFallback = async () => {
        try {
            if (this.audioEl && this.audioEl.src) {
                this.audioEl.currentTime = 0;
                await this.audioEl.play();
                return;
            }
            throw new Error('Audio element not found or source empty, using beep.');
        } catch (err) {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine'; o.frequency.value = 659; // E5
                g.gain.value = 0.0001;
                o.connect(g); g.connect(ctx.destination);
                o.start();
                const now = ctx.currentTime;
                g.gain.exponentialRampToValueAtTime(0.08, now + 0.03);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
                o.stop(now + 0.38);
            } catch (e) {
                console.warn('No se pudo reproducir audio ni beep.', e);
            }
        }
    }

    /** Aplica tinte de fondo al color del bias */
    setBackgroundTint(hex) {
        const t1 = hexToRgba(hex, 0.20);
        const t2 = hexToRgba(hex, 0.16);
        document.body.style.background =
            `radial-gradient(1200px 900px at 70% -10%, ${t1}, transparent 60%),` +
            `radial-gradient(1000px 700px at -10% 80%, ${t2}, transparent 55%),` +
            `linear-gradient(180deg, #0b0d13, #121529)`;
    }

    /** Core: mensaje + tema + audio + fireworks */
    sayBias(name, fromBtn) {
        const text = BIAS_MESSAGES[name] || `Tu bias es ${name}, pero mi bias definitivo eres tú 💟`;
        this.biasResult.textContent = text;

        const hex = THEME_COLORS[name] || THEME_COLORS.Jungkook;
        const r = fromBtn.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;

        // corazones desde el botón
        this.burstHearts(24, x, y);

        // tema + música
        this.setBackgroundTint(hex);
        this.playMemberAudio(name);

        // fuegos artificiales realistas
        this.fireworksCanvas.triggerBurst(x, y, hex);
    }

    /** Explosión de corazones en (x, y) */
    burstHearts = (count = 12, x = window.innerWidth / 2, y = window.innerHeight / 2) => {
        const container = document.body;
        const frag = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const h = document.createElement('div');
            h.textContent = '💜';
            Object.assign(h.style, {
                position: 'fixed',
                left: `${x + (Math.random() * 140 - 70)}px`,
                top: `${y + (Math.random() * 20 - 10)}px`,
                fontSize: `${Math.random() * 18 + 14}px`,
                opacity: 0.9,
                pointerEvents: 'none',
                transform: 'translate(-50%,-50%)'
            });
            frag.appendChild(h);

            const dx = (Math.random() * 2 - 1) * 80;
            const dy = -(Math.random() * 120 + 60);
            const rot = (Math.random() * 2 - 1) * 45;
            h.animate(
                [
                    { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
                    { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 }
                ],
                { duration: 900 + Math.random() * 400, easing: 'cubic-bezier(.2,.9,.2,1)' }
            ).onfinish = () => h.remove();
        }
        container.appendChild(frag);
    }
}

// -----------------------------------------------------------------
// # 3. CLASE MODULAR: FIREWORKS CANVAS (mejorado con crackles)
// -----------------------------------------------------------------

/**
 * Canvas de partículas para fuegos artificiales.
 * Mezcla aditiva + estelas + mini-crackles al final de las chispas.
 */
class FireworksCanvas {
    constructor(defaultColor) {
        this.DPR = window.devicePixelRatio || 1;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.particles = [];
        this.defaultColor = defaultColor;
        this.initCanvas();
        this.loop();
    }

    initCanvas() {
        Object.assign(this.canvas.style, {
            position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: 999
        });
        document.body.appendChild(this.canvas);
        window.addEventListener('resize', this.resize);
        this.resize();
    }

    resize = () => {
        this.canvas.width = window.innerWidth * this.DPR;
        this.canvas.height = window.innerHeight * this.DPR;
        this.ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
    }

    rand(min, max) { return Math.random() * (max - min) + min; }

    /** Inicia una explosión de fuegos artificiales. */
    triggerBurst(x, y, hex) {
        const bursts = 2 + Math.floor(this.rand(0, 2)); // 2–3
        for (let b = 0; b < bursts; b++) {
            const bx = x + this.rand(-20, 20);
            const by = y + this.rand(-20, 20);
            this.createBurst(bx, by, hex, 90 + Math.floor(this.rand(0, 25)));
        }
    }

    /** Crea partículas de la explosión. */
    createBurst(x, y, hex, count = 100) {
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = this.rand(2.2, 4.6);
            this.particles.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                life: this.rand(900, 1500), age: 0,
                size: this.rand(1, 2.2),
                drag: 0.985,
                gravity: 0.06,
                color: hex,
                trail: [],
                kind: 'main'
            });
        }
    }

    /** Mini-crackles cuando muere una partícula principal. */
    createCrackle(x, y, hex) {
        const n = 14 + Math.floor(this.rand(0, 12));
        for (let i = 0; i < n; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = this.rand(1.0, 2.0);
            this.particles.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                life: this.rand(300, 700), age: 0,
                size: this.rand(0.6, 1.4),
                drag: 0.98,
                gravity: 0.08,
                color: hex,
                trail: [],
                kind: 'crackle'
            });
        }
    }

    /** Dibuja estela. */
    drawTrail(trail, color) {
        if (trail.length < 2) return;
        this.ctx.beginPath();
        this.ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) this.ctx.lineTo(trail[i].x, trail[i].y);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.2;
        this.ctx.stroke();
    }

    /** Bucle principal de animación. */
    loop = () => {
        const ctx = this.ctx;

        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // brillo aditivo
        ctx.globalCompositeOperation = 'lighter';

        const dt = 16; // ~60fps
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.age += dt;

            // física
            p.vx *= p.drag;
            p.vy = p.vy * p.drag + p.gravity;
            p.x += p.vx;
            p.y += p.vy;

            // trail
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > 8) p.trail.shift();

            const alpha = Math.max(0, 1 - (p.age / p.life));
            if (alpha <= 0) {
                if (p.kind === 'main' && Math.random() < 0.18) {
                    this.createCrackle(p.x, p.y, p.color);
                }
                this.particles.splice(i, 1);
                continue;
            }

            // estela tenue
            this.drawTrail(p.trail, hexToRgba(p.color, alpha * 0.35));

            // chispa con leve parpadeo
            const flick = 0.85 + Math.random() * 0.3;
            ctx.beginPath();
            ctx.fillStyle = hexToRgba(p.color, alpha * flick);
            ctx.arc(p.x, p.y, p.size * (0.9 + Math.random() * 0.4), 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(this.loop);
    }
}

// -----------------------------------------------------------------
// # 4. INICIALIZACIÓN (Sin cambios)
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // eslint-disable-next-line no-unused-vars
    const app = new BiasApp();
});

