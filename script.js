// =================================================================
// 👑 KPOP BIAS SELECTOR - REFACTORIZADO (OOP y Modular) 👑
// =================================================================

// -----------------------------------------------------------------
// # 1. UTILIDADES Y CONFIGURACIÓN ESTATICA
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
  'RM': '#1e5bff',
  'Jin': '#ff7ab6',
  'Suga': '#111111',
  'J-Hope': '#ff2b2b',
  'Jimin': '#ffd65b',
  'V': '#2ecc71',
  'Jungkook': '#a86cff'
};
/** Foto de fondo por bias (pon tus imágenes aquí) */
const BIAS_BACKGROUNDS = {
  'RM':        'img/bg/rm.png',
  'Jin':       'img/bg/jin.png',
  'Suga':      'img/bg/suga.png',
  'J-Hope':    'img/bg/jhope.png',
  'Jimin':     'img/bg/jimin.png',
  'V':         'img/bg/v.png',
  'Jungkook':  'img/bg/jk.png',
  // fallback si hace falta:
  'default':   'img/bg/default.jpg'
};


/** Mensajes motivacionales por bias. */
const BIAS_MESSAGES = {
  'RM': 'Si tu bias es RM, mi razón y mi corazón eligen: tú 💜. No solo eres el líder que nos guía con palabras profundas, sino la persona cuya existencia me enseña a amarme a mí mismo, tal como lo dice tu arte.',
  'Jin': '**Worldwide Handsome, pero mi mundo más guapo y reconfortante eres tú. Con cada broma y cada nota alta, me recuerdas que la vida debe disfrutarse con una risa, demostrando una calidez y un cuidado que son verdaderamente únicos.',
  'Suga': 'Si es Suga, entonces mi amor suena en “Daechwita”... por ti. Eres la calma y la tormenta, una inspiración que transforma el dolor y las luchas en una poesía cruda y honesta que resuena con la vida misma.',
  'J-Hope': 'Tú eres mi rayito de sol en cada día 💫. Tu energía inagotable y tu sonrisa son la fuente de esperanza que necesito; eres mi J-Hope y el pilar de luz que ilumina incluso los momentos más oscuros.',
  'Jimin': 'Tú eres mi “Filter” favorito: amor puro. Tu gracia, tu voz que acaricia el alma y tu dualidad en el escenario hacen que no pueda dejar de admirarte. Eres la definición de la perfección artística y la bondad.',
  'V': 'Mi Taetae del alma eres tú 💜. Tu voz profunda y tu mirada artística capturan la belleza de este mundo. Me pierdo en la magia que creas y aprecio tu perspectiva única que convierte lo ordinario en extraordinario.',
  'Jungkook': 'Mi Euphoria empieza cada vez que te veo. Eres el Golden Maknae que hace todo bien, pero es tu pasión y tu sincera forma de ser lo que realmente cautiva mi corazón, haciéndome sentir que todo es posible.'
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
// # 2. CLASE PRINCIPAL: BIAS APP
// -----------------------------------------------------------------

class BiasApp {
  // Getters DOM
  get logoCard()   { return getEl('#logoCard'); }
  get logoWrap()   { return getEl('#logoWrap'); }   // opcional
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

  /** Asegura botones y crea el canvas de corazones (lluvia) */
  setupDOM() {
    const labels = Object.keys(THEME_COLORS);
    if (getAllEl('.pill').length < labels.length) {
      this.membersUl.innerHTML = labels.map(n =>
        `<li><button class="pill" data-name="${n}" aria-label="${n}">${n.replace('Jungkook', 'JK')}</button></li>`
      ).join('');
    }
    // Canvas de Lluvia de Corazones (multicolor)
    this.heartsCanvas = new HeartRainCanvas();
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

  /** Abre el logo y asegura clip loop */
  openWings = () => {
    if (!this.logoCard.classList.contains('opened')) {
      this.logoCard.classList.add('opened');
      this.loveMessage.hidden = false;
      this.loveMessage.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 450, easing: 'cubic-bezier(.2,.9,.2,1)' }
      );
    }

    if (this.logoWrap) {
      this.logoWrap.classList.toggle('army-mode');
      this.logoWrap.classList.toggle('bts-mode');
      this.logoCard.classList.remove('opened');
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

  /** Aplica color de fondo COMPLETO al color del bias (degradado del mismo color) */
  setBackgroundTint(hex) {
    const shade = (h, p) => {
      let c = h.replace('#','');
      if (c.length === 3) c = c.split('').map(x=>x+x).join('');
      let r = parseInt(c.slice(0,2),16),
          g = parseInt(c.slice(2,4),16),
          b = parseInt(c.slice(4,6),16);
      const mix = (v)=>Math.max(0,Math.min(255, Math.round(v + (p/100)*255)));
      return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
    };
    const top = shade(hex, 0);
    const bot = shade(hex, -50);
    document.body.style.background = `linear-gradient(180deg, ${top} 0%, ${bot} 100%)`;
  }
  /** Cambia la foto de fondo (debajo del gradiente) con un suave fade */
setBackgroundPhoto(name) {
  const url = `url("${BIAS_BACKGROUNDS[name] || BIAS_BACKGROUNDS.default}")`;

  
  // baja la opacidad para simular cross-fade
  document.body.style.setProperty('--bg-photo-opacity', '0');
  // ⚠️ background-image no transiciona, así que cambiamos cuando ya está en 0
  setTimeout(() => {
    document.body.style.setProperty('--bg-photo-url', url);
    // vuelve a la opacidad objetivo
    requestAnimationFrame(() => {
      document.body.style.setProperty('--bg-photo-opacity', '0.50'); // ajústala a tu gusto
    });
  }, 150);
}


  /** Core: mensaje + tema + audio + lluvia de corazones */
  sayBias(name, fromBtn) {
    const text = BIAS_MESSAGES[name] || `Tu bias es ${name}, pero mi bias definitivo eres tú 💟`;
    this.biasResult.textContent = text;

    const hex = THEME_COLORS[name] || THEME_COLORS.Jungkook;
    const r = fromBtn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;

    // mini-animación local de corazones (emoji)
    this.burstHearts(24, x, y);

    // tema + música
    this.setBackgroundTint(hex);
    this.setBackgroundPhoto(name); 
    this.playMemberAudio(name);

    // 🌧️ Lluvia de corazones a pantalla completa (2.8 s)
    this.heartsCanvas.rain(80, 3000, hex); // (cantidad aprox, duración ms, color sugerido)
  }

  /** Explosión de corazones en (x, y) con emojis */
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
        { duration: 2000 + Math.random() * 600, easing: 'cubic-bezier(.2,.9,.2,1)' }
      ).onfinish = () => h.remove();
    }
    container.appendChild(frag);
  }
}

// -----------------------------------------------------------------
// # 3. HEART RAIN CANVAS — Lluvia de corazones multicolor optimizada
// -----------------------------------------------------------------

class HeartRainCanvas {
  constructor() {
    this.enabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.enabled) return;

    this.DPR = window.devicePixelRatio || 1;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });

    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: 999,
      background: 'transparent'
    });
    document.body.appendChild(this.canvas);

    window.addEventListener('resize', this.resize, { passive: true });
    this.resize();

    // rendimiento
    this.particles = [];
    this.pool = [];
    this.MAX_PARTICLES = 1200;

    // paleta multicolor (incluye morado 💜)
    this.PALETTE = [
      '#ff4d6d','#ff8c00','#ffd300','#9cff00','#00e5ff',
      '#1e5bff','#a86cff','#ff77ff','#ff2b6a','#00ffa3','#ffffff'
    ];

    this.running = false;
    this.loop = this.loop.bind(this);
  }

  resize = () => {
    this.canvas.width  = Math.ceil(window.innerWidth  * this.DPR);
    this.canvas.height = Math.ceil(window.innerHeight * this.DPR);
    this.ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
  }

  // API pública: lanzar lluvia
  /**
   * @param {number} amount - número aproximado de corazones
   * @param {number} durationMs - cuánto dura la lluvia en ms
   * @param {string} colorHint - color sugerido para mezclar (hex)
   */
  rain(amount = 200, durationMs = 2500, colorHint = null) {
    if (!this.enabled) return;

    const t0 = performance.now();
    const spawnEvery = Math.max(6, Math.floor(durationMs / amount)); // espaciar spawns
    const timer = setInterval(() => {
      const now = performance.now();
      if (now - t0 > durationMs) { clearInterval(timer); return; }
      // spawns por tick
      for (let i = 0; i < 4; i++) this.spawnHeart(colorHint);
    }, spawnEvery);

    if (!this.running) { this.running = true; requestAnimationFrame(this.loop); }
  }

  // ----- utils -----
  pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  rand(min,max){ return Math.random()*(max-min)+min; }

  mixColor(hexA, hexB, t = 0.5) {
    if (!hexA) return hexB;
    const parse = h => {
      let c = h.replace('#',''); if (c.length===3) c = c.split('').map(x=>x+x).join('');
      return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)];
    };
    const [r1,g1,b1]=parse(hexA), [r2,g2,b2]=parse(hexB);
    const r = Math.round(r1+(r2-r1)*t), g=Math.round(g1+(g2-g1)*t), b=Math.round(b1+(b2-b1)*t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  colorFromHint(hint){
    const base = this.pick(this.PALETTE);
    if (!hint) return base;
    return this.mixColor(hint, base, 0.35 + Math.random()*0.4);
  }

  spawnHeart(hint){
    if (this.particles.length >= this.MAX_PARTICLES) {
      // poda suave
      this.particles.splice(0, Math.floor(this.particles.length * 0.2));
    }
    const w = window.innerWidth;
    const x = this.rand(-40, w + 40);
    const y = -30;
    const size = this.rand(8, 22); // px
    const speed = this.rand(1.2, 2.6);
    const sway = this.rand(0.6, 1.8); // oscilación horizontal
    const spin = this.rand(-0.03, 0.03); // rotación
    const life = this.rand(2200, 3400);

    const p = this.pool.pop() || {};
    Object.assign(p, {
      x, y,
      vx: this.rand(-0.5, 0.5),
      vy: speed,
      sway, swayPhase: Math.random()*Math.PI*2,
      angle: this.rand(0, Math.PI*2),
      spin,
      size,
      color: this.colorFromHint(hint),
      age: 0,
      life
    });
    this.particles.push(p);
  }

  drawHeart(ctx, x, y, s, color, alpha, angle){
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(s/16, s/16); // corazón base ~16px
    ctx.beginPath();
    // corazón con curvas bézier (forma suave)
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(0, 0, -8, 0, -8, 6);
    ctx.bezierCurveTo(-8, 10, -4, 12, 0, 16);
    ctx.bezierCurveTo(4, 12, 8, 10, 8, 6);
    ctx.bezierCurveTo(8, 0, 0, 0, 0, 6);
    ctx.closePath();
    ctx.fillStyle = hexToRgba(color.replace('rgb','rgba').replace(')', `,${alpha})`), 1);
    // la línea de arriba deja alpha aplicado; pero más robusto:
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  loop(){
    const ctx = this.ctx;
    // limpiar en crudo (DPR fix)
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.restore();

    const dt = 16;

    for (let i = this.particles.length - 1; i >= 0; i--){
      const p = this.particles[i];
      p.age += dt;

      // movimiento: caída + oscilación horizontal
      p.swayPhase += 0.02 * p.sway;
      p.x += p.vx + Math.sin(p.swayPhase) * p.sway * 0.6;
      p.y += p.vy;
      p.angle += p.spin;

      const alpha = Math.max(0, 1 - (p.age / p.life));
      this.drawHeart(ctx, p.x, p.y, p.size, p.color, alpha, p.angle);

      // eliminar si muere o sale de pantalla
      if (alpha <= 0 || p.y - p.size > window.innerHeight + 40){
        const dead = this.particles.splice(i,1)[0];
        this.pool.push(dead);
      }
    }

    // ocultar canvas si no hay nada
    this.canvas.style.display = this.particles.length ? 'block' : 'none';

    if (this.enabled) requestAnimationFrame(this.loop);
  }
}

// -----------------------------------------------------------------
// # 4. INICIALIZACIÓN
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-unused-vars
  const app = new BiasApp();
});
