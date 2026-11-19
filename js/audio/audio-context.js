/**
 * Responsabilidad: Inicialización del grafo DSP de estudio en Web Audio API (Reverb Hall Estéreo, Ping-Pong Delay, Saturación, EQ Air y Compresor Bus).
 */
let audioCtx = null;
let masterGain = null;
let masterCompressor = null;
let airShelfEQ = null;
let tremoloGain = null;
let tremoloLFO = null;
let tremoloDepthGain = null;
let saturationNode = null;
let reverbConvolver = null;
let reverbWetGain = null;
let delayWetGain = null;

function makeWarmSaturationCurve(amount = 1.35) {
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const norm = Math.tanh(amount);
    for (let i = 0; i < nSamples; ++i) {
        const x = (i * 2) / nSamples - 1;
        curve[i] = Math.tanh(x * amount) / norm;
    }
    return curve;
}

/**
 * Genera una respuesta al impulso (Impulse Response) estéreo estilo Valhalla Lush Hall
 * para el ConvolverNode sin depender de archivos externos.
 */
function createStereoHallImpulse(ctx, durationSec = 2.6, decayRate = 2.9) {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * durationSec);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    let lpL = 0;
    let lpR = 0;

    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        // Pre-delay de 14ms para separar el ataque limpio del acorde de la cola de reverb
        if (t < 0.014) {
            left[i] = 0;
            right[i] = 0;
            continue;
        }
        const env = Math.pow(1 - (i / length), decayRate) * Math.exp(-t * 1.35);
        const whiteL = (Math.random() * 2 - 1);
        const whiteR = (Math.random() * 2 - 1);

        // Amortiguación progresiva de agudos (Damping natural de sala de estudio)
        const damp = Math.max(0.18, 0.72 - t * 0.22);
        lpL = lpL + damp * (whiteL - lpL);
        lpR = lpR + damp * (whiteR - lpR);

        left[i] = lpL * env * 0.65;
        right[i] = lpR * env * 0.65;
    }
    return impulse;
}

function initAudioEngine() {
    if (audioCtx) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();

    // 1. Master Bus Compressor (Glue / OTT suave para compactar acordes EDM)
    masterCompressor = audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.value = -16;
    masterCompressor.knee.value = 12;
    masterCompressor.ratio.value = 3.5;
    masterCompressor.attack.value = 0.005;
    masterCompressor.release.value = 0.18;

    // 2. High-Shelf "Air" EQ (Brillo profesional de estudio arriba de 7.5 kHz)
    airShelfEQ = audioCtx.createBiquadFilter();
    airShelfEQ.type = 'highshelf';
    airShelfEQ.frequency.value = 7500;
    airShelfEQ.gain.value = 3.2;

    // 3. Master Gain
    masterGain = audioCtx.createGain();
    masterGain.gain.value = state.synth.volume * 0.82;

    // 4. Saturación Analógica Cálida (punto de entrada de las voces)
    saturationNode = audioCtx.createWaveShaper();
    saturationNode.curve = makeWarmSaturationCurve(1.25);
    saturationNode.oversample = '2x';

    // 5. Etapa de Movimiento / Trémolo
    tremoloGain = audioCtx.createGain();
    tremoloGain.gain.value = 1.0;

    tremoloLFO = audioCtx.createOscillator();
    tremoloLFO.type = 'sine';
    tremoloLFO.frequency.value = 4.5;

    tremoloDepthGain = audioCtx.createGain();
    tremoloDepthGain.gain.value = state.synth.tremolo * 0.14;

    tremoloLFO.connect(tremoloDepthGain);
    tremoloDepthGain.connect(tremoloGain.gain);
    tremoloLFO.start();

    // 6. Delay Estéreo Ping-Pong Suave
    const delayL = audioCtx.createDelay();
    const delayR = audioCtx.createDelay();
    delayL.delayTime.value = 0.25;
    delayR.delayTime.value = 0.375;

    const delayFeedback = audioCtx.createGain();
    delayFeedback.gain.value = 0.24;

    const delayFilter = audioCtx.createBiquadFilter();
    delayFilter.type = 'bandpass';
    delayFilter.frequency.value = 1600;
    delayFilter.Q.value = 0.7;

    const merger = audioCtx.createChannelMerger(2);
    delayWetGain = audioCtx.createGain();
    delayWetGain.gain.value = 0.14 + state.synth.crystal * 0.12;

    // 7. Reverb Hall Estéreo de Estudio (ConvolverNode)
    reverbConvolver = audioCtx.createConvolver();
    reverbConvolver.buffer = createStereoHallImpulse(audioCtx, 2.5, 2.8);

    const reverbHighpass = audioCtx.createBiquadFilter();
    reverbHighpass.type = 'highpass';
    reverbHighpass.frequency.value = 210; // Limpia subgraves de la reverb para no embarrar

    reverbWetGain = audioCtx.createGain();
    reverbWetGain.gain.value = state.synth.crystal * 0.48;

    // Ruteo de la cadena de estudio
    saturationNode.connect(tremoloGain);

    // Señal Seca (Dry) -> Air EQ
    tremoloGain.connect(airShelfEQ);

    // Envío a Delay Estéreo
    tremoloGain.connect(delayFilter);
    delayFilter.connect(delayL);
    delayL.connect(delayR);
    delayR.connect(delayFeedback);
    delayFeedback.connect(delayL);
    delayL.connect(merger, 0, 0);
    delayR.connect(merger, 0, 1);
    merger.connect(delayWetGain);
    delayWetGain.connect(airShelfEQ);

    // Envío a Reverb Hall Estéreo
    tremoloGain.connect(reverbHighpass);
    reverbHighpass.connect(reverbConvolver);
    reverbConvolver.connect(reverbWetGain);
    reverbWetGain.connect(airShelfEQ);

    // Bus Final: Air EQ -> Compressor -> Master Gain -> Salida
    airShelfEQ.connect(masterCompressor);
    masterCompressor.connect(masterGain);
    masterGain.connect(audioCtx.destination);
}
