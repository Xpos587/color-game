let audioCtx: AudioContext | null = null;
let _muted = false;

function createCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

// Eagerly create AudioContext at module load (matches original)
try { createCtx(); } catch {}

function getCtx(): AudioContext | null {
  if (_muted) return null;
  if (!audioCtx || audioCtx.state === "closed") return null;
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

// Unlock AudioContext — resume() only works from a real user gesture.
// Keep listeners attached until resume() actually succeeds.
function unlock() {
  if (!audioCtx) return;
  if (audioCtx.state === "running") {
    unlockEvents.forEach(e => document.removeEventListener(e, unlock));
    return;
  }
  audioCtx.resume().then(() => {
    // Play a silent buffer to fully prime the audio pipeline
    try {
      const b = audioCtx!.createBuffer(1, 1, audioCtx!.sampleRate);
      const s = audioCtx!.createBufferSource();
      s.buffer = b;
      s.connect(audioCtx!.destination);
      s.start();
    } catch {}
    unlockEvents.forEach(e => document.removeEventListener(e, unlock));
  }).catch(() => {});
}
const unlockEvents = ["pointerdown", "pointerup", "touchstart", "touchend", "keydown", "click"];
if (typeof document !== "undefined") {
  unlockEvents.forEach(e => document.addEventListener(e, unlock));
}

export function isMuted(): boolean { return _muted; }

export function setMuted(m: boolean): void {
  _muted = m;
  if (m && typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

// ============================================================
// Core primitives
// ============================================================

function tone(freq: number, dur: number, vol: number, type: OscillatorType = "sine") {
  try {
    const c = getCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + dur);
  } catch {}
}

// ============================================================
// General hover / click
// ============================================================

export function hover(): void { tone(880, 0.06, 0.08, "sine"); }

export function click(): void {
  tone(640, 0.05, 0.14, "triangle");
  setTimeout(() => tone(960, 0.08, 0.10, "sine"), 30);
}

// ============================================================
// Solo button — clean, singular sounds
// ============================================================

export function soloHover(): void { tone(720, 0.09, 0.09, "sine"); }

export function soloClick(): void { tone(660, 0.12, 0.16, "triangle"); }

// ============================================================
// Multi button — layered, multiple-voice sounds
// ============================================================

export function multiHover(): void {
  tone(680, 0.07, 0.06, "sine");
  tone(880, 0.07, 0.06, "sine");
}

export function multiClick(): void {
  tone(520, 0.09, 0.12, "triangle");
  setTimeout(() => tone(660, 0.09, 0.10, "sine"), 25);
  setTimeout(() => tone(830, 0.11, 0.08, "sine"), 55);
}

// ============================================================
// Dark mode hover — short dry tick
// ============================================================

export function tick(): void { tone(1200, 0.025, 0.07, "square"); }

// ============================================================
// Keystroke tick — mechanical keyboard click
// ============================================================

export function keystroke(): void {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;

    const clickLen = Math.ceil(c.sampleRate * 0.004);
    const clickBuf = c.createBuffer(1, clickLen, c.sampleRate);
    const cd = clickBuf.getChannelData(0);
    cd[0] = 1; cd[1] = -0.8; cd[2] = 0.5;
    for (let i = 3; i < clickLen; i++) cd[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / clickLen * 4);
    const clickSrc = c.createBufferSource();
    clickSrc.buffer = clickBuf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 3200 + Math.random() * 1600;
    bp.Q.value = 3;
    const clickGain = c.createGain();
    clickGain.gain.setValueAtTime(0.18, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    clickSrc.connect(bp); bp.connect(clickGain); clickGain.connect(c.destination);
    clickSrc.start(t); clickSrc.stop(t + 0.015);

    const thumpOsc = c.createOscillator();
    thumpOsc.type = "sine";
    thumpOsc.frequency.setValueAtTime(120 + Math.random() * 40, t);
    thumpOsc.frequency.exponentialRampToValueAtTime(60, t + 0.02);
    const thumpGain = c.createGain();
    thumpGain.gain.setValueAtTime(0.06, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    thumpOsc.connect(thumpGain); thumpGain.connect(c.destination);
    thumpOsc.start(t); thumpOsc.stop(t + 0.025);
  } catch {}
}

// ============================================================
// Hard mode toggle — electric zap with distorted buzz tail
// ============================================================

export function hardOn(): void {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;

    const o1 = c.createOscillator(); o1.type = "sawtooth";
    o1.frequency.setValueAtTime(1800, t);
    o1.frequency.exponentialRampToValueAtTime(60, t + 0.18);
    const dist = c.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x)); }
    dist.curve = curve;
    const g1 = c.createGain();
    g1.gain.setValueAtTime(0.2, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    o1.connect(dist); dist.connect(g1); g1.connect(c.destination);
    o1.start(t); o1.stop(t + 0.25);

    const bufSize = c.sampleRate * 0.06;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const noise = c.createBufferSource(); noise.buffer = buf;
    const hp = c.createBiquadFilter(); hp.type = "highpass";
    hp.frequency.setValueAtTime(2000, t);
    const gn = c.createGain();
    gn.gain.setValueAtTime(0.25, t);
    gn.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    noise.connect(hp); hp.connect(gn); gn.connect(c.destination);
    noise.start(t); noise.stop(t + 0.06);

    const kick = c.createOscillator(); kick.type = "sine";
    kick.frequency.setValueAtTime(120, t + 0.02);
    kick.frequency.exponentialRampToValueAtTime(30, t + 0.14);
    const gk = c.createGain();
    gk.gain.setValueAtTime(0.28, t + 0.02);
    gk.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    kick.connect(gk); gk.connect(c.destination);
    kick.start(t + 0.02); kick.stop(t + 0.16);
  } catch {}
}

// Easy mode toggle — friendly ascending bubble pop
export function hardOff(): void {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    [380, 520, 780].forEach((freq, i) => {
      const delay = i * 0.055;
      const o = c.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(freq, t + delay);
      o.frequency.exponentialRampToValueAtTime(freq * 1.08, t + delay + 0.08);
      const g = c.createGain();
      g.gain.setValueAtTime(i === 2 ? 0.14 : 0.10, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.12);
      o.connect(g); g.connect(c.destination);
      o.start(t + delay); o.stop(t + delay + 0.12);
    });
    const sparkle = c.createOscillator(); sparkle.type = "triangle";
    sparkle.frequency.setValueAtTime(2400, t + 0.14);
    const gs = c.createGain();
    gs.gain.setValueAtTime(0.05, t + 0.14);
    gs.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    sparkle.connect(gs); gs.connect(c.destination);
    sparkle.start(t + 0.14); sparkle.stop(t + 0.22);
  } catch {}
}

// ============================================================
// Dark mode — gentle descending / ascending
// ============================================================

export function toDark(): void {
  tone(440, 0.12, 0.10, "sine");
  setTimeout(() => tone(330, 0.15, 0.08, "sine"), 80);
  setTimeout(() => tone(220, 0.20, 0.06, "sine"), 160);
}

export function toLight(): void {
  tone(330, 0.12, 0.08, "sine");
  setTimeout(() => tone(523, 0.12, 0.10, "sine"), 80);
  setTimeout(() => tone(660, 0.15, 0.10, "sine"), 160);
}

// ============================================================
// Countdown blips
// ============================================================

export function blipReady(): void { tone(600, 0.08, 0.10, "sine"); }

export function blipGo(): void {
  tone(880, 0.10, 0.12, "triangle");
  setTimeout(() => tone(1100, 0.08, 0.08, "sine"), 40);
}

// ============================================================
// Slider drag — short filtered noise bursts
// ============================================================

let _lastSliderTick = 0;

export function sliderTick(value: number): void {
  const rounded = Math.round(value / 4) * 4;
  if (rounded === _lastSliderTick) return;
  _lastSliderTick = rounded;
  try {
    const c = getCtx();
    if (!c) return;
    const bufLen = c.sampleRate * 0.018;
    const buf = c.createBuffer(1, bufLen, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.setValueAtTime(2000 + (value / 360) * 4000, c.currentTime);
    filt.Q.setValueAtTime(2.5, c.currentTime);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.14, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.002, c.currentTime + 0.018);
    src.connect(filt); filt.connect(gain); gain.connect(c.destination);
    src.start();
  } catch {}
}

export function sliderReset(): void { _lastSliderTick = -999; }

// ============================================================
// Solo button hum
// ============================================================

let _soloOsc: OscillatorNode | null = null;
let _soloGain: GainNode | null = null;
let _soloFilter: BiquadFilterNode | null = null;

export function soloHumStart(): void {
  try {
    const c = getCtx();
    if (!c) return;
    _soloOsc = c.createOscillator();
    _soloGain = c.createGain();
    _soloFilter = c.createBiquadFilter();
    _soloOsc.type = "triangle";
    _soloOsc.frequency.setValueAtTime(330, c.currentTime);
    _soloFilter.type = "lowpass";
    _soloFilter.frequency.setValueAtTime(600, c.currentTime);
    _soloFilter.Q.setValueAtTime(1, c.currentTime);
    _soloGain.gain.setValueAtTime(0, c.currentTime);
    _soloOsc.connect(_soloFilter);
    _soloFilter.connect(_soloGain);
    _soloGain.connect(c.destination);
    _soloOsc.start();
  } catch {}
}

export function soloHumUpdate(speed: number, max: number): void {
  if (!_soloOsc || !_soloGain) return;
  try {
    const c = getCtx();
    if (!c) return;
    const t = Math.min(1, (speed - 45) / (max - 45));
    _soloOsc.frequency.setTargetAtTime(330 + t * 770, c.currentTime, 0.05);
    _soloFilter!.frequency.setTargetAtTime(600 + t * 4000, c.currentTime, 0.05);
    _soloGain.gain.setTargetAtTime(t * 0.07, c.currentTime, 0.05);
  } catch {}
}

export function soloHumStop(): void {
  try {
    if (_soloGain) {
      const c = getCtx();
      if (c) _soloGain.gain.setTargetAtTime(0, c.currentTime, 0.08);
      const osc = _soloOsc;
      setTimeout(() => { try { osc?.stop(); } catch {} }, 300);
    }
    _soloOsc = null; _soloGain = null; _soloFilter = null;
  } catch {}
}

// ============================================================
// Multi button hum — 7-voice detuned choir
// ============================================================

interface MultiVoice { osc: OscillatorNode; base: number; dt: number }
let _multiOscs: MultiVoice[] | null = null;
let _multiGain: GainNode | null = null;

export function multiHumStart(): void {
  try {
    const c = getCtx();
    if (!c) return;
    _multiGain = c.createGain();
    _multiGain.gain.setValueAtTime(0, c.currentTime);
    _multiGain.connect(c.destination);
    const voices = [
      { freq: 146.83, type: "sawtooth" as OscillatorType, detune: -8 },
      { freq: 220,    type: "sine" as OscillatorType,     detune: 0 },
      { freq: 277.18, type: "triangle" as OscillatorType, detune: 6 },
      { freq: 329.63, type: "sine" as OscillatorType,     detune: -5 },
      { freq: 440,    type: "triangle" as OscillatorType, detune: 7 },
      { freq: 554.37, type: "sine" as OscillatorType,     detune: -4 },
      { freq: 659.26, type: "triangle" as OscillatorType, detune: 8 },
    ];
    _multiOscs = voices.map(v => {
      const osc = c.createOscillator();
      osc.type = v.type;
      osc.frequency.setValueAtTime(v.freq, c.currentTime);
      osc.detune.setValueAtTime(v.detune, c.currentTime);
      osc.connect(_multiGain!);
      osc.start();
      return { osc, base: v.freq, dt: v.detune };
    });
  } catch {}
}

export function multiHumUpdate(speed: number, max: number): void {
  if (!_multiOscs || !_multiGain) return;
  try {
    const c = getCtx();
    if (!c) return;
    const t = Math.min(1, (speed - 45) / (max - 45));
    _multiOscs.forEach(v => {
      v.osc.frequency.setTargetAtTime(v.base + t * v.base * 2, c.currentTime, 0.05);
      v.osc.detune.setTargetAtTime(v.dt * (1 + t * 3), c.currentTime, 0.05);
    });
    _multiGain.gain.setTargetAtTime(t * 0.02, c.currentTime, 0.05);
  } catch {}
}

export function multiHumStop(): void {
  try {
    if (_multiGain) {
      const c = getCtx();
      if (c) _multiGain.gain.setTargetAtTime(0, c.currentTime, 0.08);
      const oscs = _multiOscs;
      setTimeout(() => { try { oscs?.forEach(v => v.osc.stop()); } catch {} }, 300);
    }
    _multiOscs = null; _multiGain = null;
  } catch {}
}

// ============================================================
// Click sounds for intro buttons
// ============================================================

export function soloClickSound(): void {
  soloHumStop();
  tone(880, 0.06, 0.18, "sine");
  setTimeout(() => tone(1760, 0.04, 0.08, "sine"), 30);
}

export function multiClickSound(): void {
  multiHumStop();
  const base = [261.63, 329.63, 392, 523.25, 659.26, 783.99, 1046.5];
  base.forEach((f, i) => {
    setTimeout(() => tone(f, 0.06, 0.12, i % 2 === 0 ? "triangle" : "sine"), i * 12);
  });
}

// ============================================================
// Timer flutter — persistent noise bursts
// ============================================================

let _flutterRunning = false;
let _flutterProgress = 0;
let _flutterNext = 0;
let _flutterNoise: AudioBufferSourceNode | null = null;
let _flutterGain: GainNode | null = null;
let _flutterBp: BiquadFilterNode | null = null;
let _flutterRafId = 0;

function _flutterEnsureChain(): void {
  const c = getCtx();
  if (!c || _flutterNoise) return;
  const bufLen = c.sampleRate * 2;
  const buf = c.createBuffer(1, bufLen, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
  _flutterNoise = c.createBufferSource();
  _flutterNoise.buffer = buf;
  _flutterNoise.loop = true;
  _flutterBp = c.createBiquadFilter();
  _flutterBp.type = "bandpass";
  _flutterBp.frequency.value = 5500;
  _flutterBp.Q.value = 1.5;
  _flutterGain = c.createGain();
  _flutterGain.gain.setValueAtTime(0, c.currentTime);
  _flutterNoise.connect(_flutterBp);
  _flutterBp.connect(_flutterGain);
  _flutterGain.connect(c.destination);
  _flutterNoise.start();
}

function _flutterTeardown(): void {
  if (_flutterNoise) {
    try { _flutterNoise.stop(); } catch {}
    try { _flutterNoise.disconnect(); } catch {}
    try { _flutterBp?.disconnect(); } catch {}
    try { _flutterGain?.disconnect(); } catch {}
  }
  _flutterNoise = null; _flutterBp = null; _flutterGain = null;
}

function _flutterLoop(): void {
  if (!_flutterRunning) return;
  const now = performance.now();
  if (now >= _flutterNext && _flutterGain) {
    const c = getCtx();
    if (!c) { _flutterRafId = requestAnimationFrame(_flutterLoop); return; }
    const p = _flutterProgress;
    const interval = 60 - p * 45;
    const vol = 0.035 + p * 0.05;
    const jitter = (Math.random() - 0.5) * interval * 0.25;
    if (_flutterBp) _flutterBp.frequency.value = 4000 + Math.random() * 3000;
    _flutterGain.gain.setValueAtTime(vol, c.currentTime);
    _flutterGain.gain.setValueAtTime(0, c.currentTime + 0.006);
    _flutterNext = now + Math.max(12, interval + jitter);
  }
  _flutterRafId = requestAnimationFrame(_flutterLoop);
}

export function flutterStart(): void {
  _flutterRunning = true;
  _flutterProgress = 0;
  _flutterNext = 0;
  try { _flutterEnsureChain(); } catch {}
  _flutterRafId = requestAnimationFrame(_flutterLoop);
}

export function flutterUpdate(progress: number): void {
  _flutterProgress = Math.min(1, Math.max(0, progress));
}

export function flutterStop(): void {
  _flutterRunning = false;
  _flutterProgress = 0;
  cancelAnimationFrame(_flutterRafId);
  _flutterTeardown();
}

// ============================================================
// Score climb tick — rising pitch pluck with harmonic shimmer
// ============================================================

export function scoreTick(progress: number, isInt: boolean): void {
  try {
    const c = getCtx();
    if (!c) return;
    const baseFreq = 523 * Math.pow(2, progress * 2);
    const vol = isInt ? 0.12 : 0.06;
    const dur = isInt ? 0.09 : 0.04;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(baseFreq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(gain); gain.connect(c.destination);
    osc.start(c.currentTime); osc.stop(c.currentTime + dur);

    if (isInt) {
      const osc2 = c.createOscillator();
      const g2 = c.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(baseFreq * 2, c.currentTime);
      g2.gain.setValueAtTime(0.06, c.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
      osc2.connect(g2); g2.connect(c.destination);
      osc2.start(c.currentTime); osc2.stop(c.currentTime + 0.12);
    }
  } catch {}
}

// ============================================================
// Score landing — satisfying chime
// ============================================================

export function scoreLand(): void {
  try {
    const c = getCtx();
    if (!c) return;
    [1046, 1318, 1568].forEach((f, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, c.currentTime + i * 0.03);
      gain.gain.setValueAtTime(0.1, c.currentTime + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.03 + 0.2);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(c.currentTime + i * 0.03); osc.stop(c.currentTime + i * 0.03 + 0.2);
    });
  } catch {}
}

// ============================================================
// GO / submit button — punchy percussive lock-in
// ============================================================

export function goLock(): void {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;

    const snapLen = Math.ceil(c.sampleRate * 0.008);
    const snapBuf = c.createBuffer(1, snapLen, c.sampleRate);
    const sd = snapBuf.getChannelData(0);
    sd[0] = 1; sd[1] = -1;
    for (let i = 2; i < snapLen; i++) sd[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - i / snapLen * 3);
    const snapSrc = c.createBufferSource();
    snapSrc.buffer = snapBuf;
    const res = c.createBiquadFilter();
    res.type = "bandpass"; res.frequency.value = 2800; res.Q.value = 5;
    const snapG = c.createGain();
    snapG.gain.setValueAtTime(0.22, t);
    snapG.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    snapSrc.connect(res); res.connect(snapG); snapG.connect(c.destination);
    snapSrc.start(t); snapSrc.stop(t + 0.03);

    const kick = c.createOscillator();
    kick.type = "sine";
    kick.frequency.setValueAtTime(200, t);
    kick.frequency.exponentialRampToValueAtTime(50, t + 0.06);
    const kg = c.createGain();
    kg.gain.setValueAtTime(0.18, t);
    kg.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    kick.connect(kg); kg.connect(c.destination);
    kick.start(t); kick.stop(t + 0.08);

    const body = c.createOscillator();
    body.type = "triangle";
    body.frequency.setValueAtTime(520, t);
    const bg = c.createGain();
    bg.gain.setValueAtTime(0.10, t);
    bg.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    body.connect(bg); bg.connect(c.destination);
    body.start(t); body.stop(t + 0.05);
  } catch {}
}

// ============================================================
// Start playing — ascending arpeggio burst into power chord
// ============================================================

export function startPlaying(): void {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;

    const notes = [330, 440, 554, 660];
    notes.forEach((freq, i) => {
      const delay = i * 0.045;
      const o = c.createOscillator();
      o.type = i < 2 ? "triangle" : "sine";
      o.frequency.setValueAtTime(freq, t + delay);
      const g = c.createGain();
      g.gain.setValueAtTime(0.12 + i * 0.02, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.12);
      o.connect(g); g.connect(c.destination);
      o.start(t + delay); o.stop(t + delay + 0.12);
    });

    const chordT = t + 0.18;
    const chord = [660, 830, 990];
    chord.forEach((freq) => {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, chordT);
      o.frequency.setTargetAtTime(freq * 1.003, chordT, 0.1);
      const g = c.createGain();
      g.gain.setValueAtTime(0.09, chordT);
      g.gain.setTargetAtTime(0.04, chordT + 0.08, 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, chordT + 0.35);
      o.connect(g); g.connect(c.destination);
      o.start(chordT); o.stop(chordT + 0.35);
    });

    const kick = c.createOscillator();
    kick.type = "sine";
    kick.frequency.setValueAtTime(120, chordT);
    kick.frequency.exponentialRampToValueAtTime(40, chordT + 0.1);
    const kg = c.createGain();
    kg.gain.setValueAtTime(0.2, chordT);
    kg.gain.exponentialRampToValueAtTime(0.001, chordT + 0.12);
    kick.connect(kg); kg.connect(c.destination);
    kick.start(chordT); kick.stop(chordT + 0.12);

    const noiseLen = Math.ceil(c.sampleRate * 0.015);
    const noiseBuf = c.createBuffer(1, noiseLen, c.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) nd[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
    const noiseSrc = c.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    const hpf = c.createBiquadFilter();
    hpf.type = "highpass"; hpf.frequency.value = 3000;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.15, chordT);
    ng.gain.exponentialRampToValueAtTime(0.001, chordT + 0.04);
    noiseSrc.connect(hpf); hpf.connect(ng); ng.connect(c.destination);
    noiseSrc.start(chordT); noiseSrc.stop(chordT + 0.04);
  } catch {}
}

// ============================================================
// Close / dismiss — soft downward poof
// ============================================================

export function dismiss(): void {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;

    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(660, t);
    o.frequency.exponentialRampToValueAtTime(280, t + 0.12);
    const g = c.createGain();
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + 0.14);

    const airLen = Math.ceil(c.sampleRate * 0.08);
    const airBuf = c.createBuffer(1, airLen, c.sampleRate);
    const ad = airBuf.getChannelData(0);
    for (let i = 0; i < airLen; i++) ad[i] = (Math.random() * 2 - 1) * (1 - i / airLen);
    const airSrc = c.createBufferSource();
    airSrc.buffer = airBuf;
    const hp = c.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 4000;
    const ag = c.createGain();
    ag.gain.setValueAtTime(0.04, t);
    ag.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    airSrc.connect(hp); hp.connect(ag); ag.connect(c.destination);
    airSrc.start(t); airSrc.stop(t + 0.08);
  } catch {}
}

// ============================================================
// Leaderboard tab switch — short pitched flick
// ============================================================

export function tabFlick(): void {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;

    const impLen = Math.ceil(c.sampleRate * 0.003);
    const impBuf = c.createBuffer(1, impLen, c.sampleRate);
    const id = impBuf.getChannelData(0);
    id[0] = 0.9; id[1] = -0.7; id[2] = 0.4;
    for (let i = 3; i < impLen; i++) id[i] = (Math.random() * 0.3) * (1 - i / impLen);
    const impSrc = c.createBufferSource();
    impSrc.buffer = impBuf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 3500; bp.Q.value = 2;
    const ig = c.createGain();
    ig.gain.setValueAtTime(0.16, t);
    ig.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    impSrc.connect(bp); bp.connect(ig); ig.connect(c.destination);
    impSrc.start(t); impSrc.stop(t + 0.025);

    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(1100, t);
    o.frequency.exponentialRampToValueAtTime(600, t + 0.04);
    const og = c.createGain();
    og.gain.setValueAtTime(0.08, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    o.connect(og); og.connect(c.destination);
    o.start(t); o.stop(t + 0.05);
  } catch {}
}

// ============================================================
// Credit hum on desktop "Made by" hover
// ============================================================

let _creditOsc: OscillatorNode | null = null;
let _creditLfo: OscillatorNode | null = null;
let _creditGain: GainNode | null = null;

export function creditHumStart(): void {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    _creditOsc = c.createOscillator();
    _creditOsc.type = "sine";
    _creditOsc.frequency.setValueAtTime(150, t);
    _creditLfo = c.createOscillator();
    _creditLfo.type = "sine";
    _creditLfo.frequency.setValueAtTime(1.6, t);
    const lfoGain = c.createGain();
    lfoGain.gain.setValueAtTime(24, t);
    _creditLfo.connect(lfoGain);
    lfoGain.connect(_creditOsc.frequency);
    _creditGain = c.createGain();
    _creditGain.gain.setValueAtTime(0, t);
    _creditGain.gain.linearRampToValueAtTime(0.06, t + 0.4);
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(340, t);
    _creditOsc.connect(filter);
    filter.connect(_creditGain);
    _creditGain.connect(c.destination);
    _creditOsc.start(t);
    _creditLfo.start(t);
  } catch {}
}

export function creditHumStop(): void {
  try {
    if (!_creditGain) return;
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    _creditGain.gain.cancelScheduledValues(t);
    _creditGain.gain.setValueAtTime(_creditGain.gain.value, t);
    _creditGain.gain.linearRampToValueAtTime(0, t + 0.3);
    const osc = _creditOsc, lfo = _creditLfo;
    setTimeout(() => { try { osc?.stop(); lfo?.stop(); } catch {} }, 400);
    _creditOsc = null; _creditLfo = null; _creditGain = null;
  } catch {}
}

// ============================================================
// Tile flip
// ============================================================

export function tileFlip(index: number): void {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    const freq = 800 + index * 120;
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.06);
    const g = c.createGain();
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + 0.12);
  } catch {}
}

// ============================================================
// Daily button drone — heavy sub-bass rumble
// ============================================================

let _dailyOscs: (OscillatorNode)[] | null = null;
let _dailyGain: GainNode | null = null;
let _dailyFilter: BiquadFilterNode | null = null;

export function dailyDroneStart(): void {
  if (_dailyOscs) return;
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;
    _dailyGain = c.createGain();
    _dailyFilter = c.createBiquadFilter();
    _dailyFilter.type = "lowpass";
    _dailyFilter.frequency.setValueAtTime(200, t);
    _dailyFilter.Q.setValueAtTime(4, t);
    const dist = c.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = Math.tanh(x * 3); }
    dist.curve = curve;
    _dailyGain.gain.setValueAtTime(0, t);
    _dailyGain.gain.setTargetAtTime(0.12, t, 0.15);
    _dailyFilter.connect(dist);
    dist.connect(_dailyGain);
    _dailyGain.connect(c.destination);

    const o1 = c.createOscillator(); o1.type = "sawtooth";
    o1.frequency.setValueAtTime(40, t); o1.connect(_dailyFilter); o1.start();
    const o2 = c.createOscillator(); o2.type = "sine";
    o2.frequency.setValueAtTime(42, t); o2.connect(_dailyFilter); o2.start();
    const o3 = c.createOscillator(); o3.type = "square";
    o3.frequency.setValueAtTime(80, t);
    const o3g = c.createGain(); o3g.gain.setValueAtTime(0.15, t);
    o3.connect(o3g); o3g.connect(_dailyFilter); o3.start();
    const o4 = c.createOscillator(); o4.type = "sine";
    o4.frequency.setValueAtTime(20, t);
    const o4g = c.createGain(); o4g.gain.setValueAtTime(0.5, t);
    o4.connect(o4g); o4g.connect(_dailyFilter); o4.start();
    const lfo = c.createOscillator(); lfo.type = "sine";
    lfo.frequency.setValueAtTime(3, t);
    const lfoGain = c.createGain(); lfoGain.gain.setValueAtTime(30, t);
    lfo.connect(lfoGain); lfoGain.connect(_dailyFilter.frequency); lfo.start();

    _dailyOscs = [o1, o2, o3, o4, lfo];
  } catch {}
}

export function dailyDroneStop(): void {
  if (!_dailyOscs) return;
  try {
    const oscs = _dailyOscs;
    if (_dailyGain && audioCtx) {
      _dailyGain.gain.cancelScheduledValues(audioCtx.currentTime);
      _dailyGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.08);
    }
    setTimeout(() => { try { oscs.forEach(o => o.stop()); } catch {} }, 300);
  } catch {}
  _dailyOscs = null; _dailyGain = null; _dailyFilter = null;
}

// ============================================================
// Challenge button — dramatic charge-up
// ============================================================

export function challengeSend(): void {
  try {
    const c = getCtx();
    if (!c) return;
    const t = c.currentTime;

    const chargeLen = Math.ceil(c.sampleRate * 0.12);
    const chargeBuf = c.createBuffer(1, chargeLen, c.sampleRate);
    const cd = chargeBuf.getChannelData(0);
    for (let i = 0; i < chargeLen; i++) cd[i] = Math.random() * 2 - 1;
    const chargeSrc = c.createBufferSource();
    chargeSrc.buffer = chargeBuf;
    const chargeBp = c.createBiquadFilter();
    chargeBp.type = "bandpass"; chargeBp.Q.value = 5;
    chargeBp.frequency.setValueAtTime(400, t);
    chargeBp.frequency.exponentialRampToValueAtTime(8000, t + 0.12);
    const chargeG = c.createGain();
    chargeG.gain.setValueAtTime(0.04, t);
    chargeG.gain.linearRampToValueAtTime(0.18, t + 0.10);
    chargeG.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    chargeSrc.connect(chargeBp); chargeBp.connect(chargeG); chargeG.connect(c.destination);
    chargeSrc.start(t); chargeSrc.stop(t + 0.14);

    const burst = 0.12;
    [1047, 1319, 1568, 2093].forEach((freq, i) => {
      const o = c.createOscillator();
      o.type = i % 2 === 0 ? "triangle" : "sine";
      o.frequency.setValueAtTime(freq, t + burst);
      o.frequency.setValueAtTime(freq * 1.01, t + burst + 0.02);
      const g = c.createGain();
      g.gain.setValueAtTime(0.14, t + burst);
      g.gain.exponentialRampToValueAtTime(0.001, t + burst + 0.28);
      o.connect(g); g.connect(c.destination);
      o.start(t + burst); o.stop(t + burst + 0.28);
    });

    const kick = c.createOscillator();
    kick.type = "sine";
    kick.frequency.setValueAtTime(180, t + burst);
    kick.frequency.exponentialRampToValueAtTime(60, t + burst + 0.08);
    const kg = c.createGain();
    kg.gain.setValueAtTime(0.20, t + burst);
    kg.gain.exponentialRampToValueAtTime(0.001, t + burst + 0.10);
    kick.connect(kg); kg.connect(c.destination);
    kick.start(t + burst); kick.stop(t + burst + 0.10);

    [3520, 2637, 3136].forEach((freq, i) => {
      const delay = burst + 0.06 + i * 0.05;
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, t + delay);
      o.frequency.exponentialRampToValueAtTime(freq * 0.7, t + delay + 0.15);
      const g = c.createGain();
      g.gain.setValueAtTime(0.06 - i * 0.015, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.15);
      o.connect(g); g.connect(c.destination);
      o.start(t + delay); o.stop(t + delay + 0.15);
    });
  } catch {}
}

// ============================================================
// Robot voice — SpeechSynthesis with robotic voice
// ============================================================

let _robotVoice: SpeechSynthesisVoice | null = null;
let _robotReady = false;

function _initRobotVoice(): void {
  if (typeof speechSynthesis === "undefined") return;
  const voices = speechSynthesis.getVoices();
  _robotVoice =
    voices.find(v => /zarvox/i.test(v.name)) ||
    voices.find(v => /trinoids|cellos|whisper|fred/i.test(v.name)) ||
    voices.find(v => /en.*us|en.*gb|english/i.test(v.lang) && /compact|robot|synth/i.test(v.name)) ||
    null;
  _robotReady = true;
}

function robotSay(text: string, opts?: { delay?: number; pitch?: number; rate?: number; volume?: number }): void {
  if (_muted || typeof speechSynthesis === "undefined") return;
  const o = Object.assign({ delay: 0, pitch: 0.3, rate: 1.1, volume: 0.6 }, opts);
  const speak = () => {
    try {
      if (!_robotReady) _initRobotVoice();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.endsWith(".") ? text : text + ".");
      if (_robotVoice) u.voice = _robotVoice;
      u.pitch = o.pitch;
      u.rate = o.rate;
      u.volume = o.volume;
      speechSynthesis.speak(u);
    } catch {}
  };
  if (o.delay) setTimeout(speak, o.delay);
  else speak();
}

export function robotCopied(): void { robotSay("link copied"); }
export function robotSolo(): void { robotSay("single player", { delay: 150, pitch: 0.1, rate: 0.85, volume: 0.8 }); }
export function robotMulti(): void { robotSay("multiplayer", { delay: 150, pitch: 0.1, rate: 0.8, volume: 0.85 }); }
export function robotEasy(): void { robotSay("easy", { delay: 200, pitch: 0.8, rate: 0.7, volume: 0.5 }); }
export function robotHardcore(): void { robotSay("hard", { delay: 200, pitch: 0.01, rate: 0.55, volume: 0.9 }); }
export function robotHighscores(): void { robotSay("high scores", { delay: 100 }); }
export function robotDaily(): void { robotSay("daily mode", { delay: 150, pitch: 0.01, rate: 0.5, volume: 0.95 }); }

// Init robot voice on module load
if (typeof speechSynthesis !== "undefined") {
  speechSynthesis.onvoiceschanged = _initRobotVoice;
  _initRobotVoice();
}
