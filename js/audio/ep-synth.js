/**
 * Responsabilidad: Síntesis polifónica de estudio (Stereo Unison Supersaw, Glass Pluck, Deadmau5 Pluck, UKG Pad y Studio Rhodes).
 */
function createPanner(ctx, panValue) {
    if (ctx.createStereoPanner) {
        const panner = ctx.createStereoPanner();
        panner.pan.value = Math.max(-1, Math.min(1, panValue));
        return panner;
    }
    const gain = ctx.createGain();
    return gain;
}

function playEPNote(midi, durationSec = 0.9, startTimeOffset = 0, velocity = 0.85) {
    initAudioEngine();
    const patchId = state.synth.patchId || 'nina_glass_pluck';
    const now = audioCtx.currentTime + startTimeOffset;
    const freq = midiToFreq(midi);
    const isBassVoice = midi <= 54;

    const releaseTime = Math.max(0.20, state.synth.release);
    const stopAt = now + durationSec + releaseTime + 0.08;
    const brightAmt = state.synth.bell;
    const widthAmt = Math.max(0.15, state.synth.tremolo);

    const voiceBus = audioCtx.createGain();
    const voiceFilter = audioCtx.createBiquadFilter();
    voiceFilter.type = 'lowpass';

    // Filtro Highpass suave en voces agudas para limpiar el barro en graves
    const voiceHighpass = audioCtx.createBiquadFilter();
    voiceHighpass.type = 'highpass';
    voiceHighpass.frequency.setValueAtTime(isBassVoice ? 32 : 135, now);

    voiceFilter.connect(voiceHighpass);
    voiceHighpass.connect(voiceBus);
    voiceBus.connect(saturationNode);

    if (patchId === 'edm_supersaw') {
        // 🌈 FUTURE BASS / EDM SUPERSAW (Unison Estéreo + Swell de Filtro)
        const peakGain = (isBassVoice ? 0.16 : 0.12) * velocity;
        voiceBus.gain.setValueAtTime(0.0001, now);
        voiceBus.gain.linearRampToValueAtTime(peakGain, now + 0.032);
        voiceBus.gain.exponentialRampToValueAtTime(peakGain * 0.78, now + durationSec * 0.85);
        voiceBus.gain.exponentialRampToValueAtTime(0.0001, stopAt);

        const maxCutoff = 2800 + brightAmt * 7500;
        voiceFilter.Q.setValueAtTime(1.1, now);
        voiceFilter.frequency.setValueAtTime(900, now);
        voiceFilter.frequency.exponentialRampToValueAtTime(maxCutoff, now + 0.065);
        voiceFilter.frequency.exponentialRampToValueAtTime(Math.max(1600, maxCutoff * 0.62), now + durationSec + releaseTime * 0.5);

        const detuneSpread = 8 + widthAmt * 22;
        const voices = isBassVoice
            ? [
                { detune: 0, pan: 0, type: 'sawtooth', gain: 0.75 },
                { detune: -5, pan: -0.2, type: 'triangle', gain: 0.65 },
                { detune: 5, pan: 0.2, type: 'sawtooth', gain: 0.55 }
            ]
            : [
                { detune: 0, pan: 0, type: 'sawtooth', gain: 0.60 },
                { detune: -detuneSpread * 0.45, pan: -0.45, type: 'sawtooth', gain: 0.48 },
                { detune: detuneSpread * 0.45, pan: 0.45, type: 'sawtooth', gain: 0.48 },
                { detune: -detuneSpread, pan: -0.82, type: 'sawtooth', gain: 0.38 },
                { detune: detuneSpread, pan: 0.82, type: 'sawtooth', gain: 0.38 }
            ];

        voices.forEach((v, idx) => {
            const osc = audioCtx.createOscillator();
            osc.type = v.type;
            osc.frequency.setValueAtTime(freq, now);
            osc.detune.setValueAtTime(v.detune, now);

            const vGain = audioCtx.createGain();
            vGain.gain.value = v.gain;
            const panner = createPanner(audioCtx, v.pan);

            osc.connect(vGain);
            vGain.connect(panner);
            panner.connect(voiceFilter);

            const phaseOffset = idx * 0.0012;
            osc.start(now + phaseOffset);
            osc.stop(stopAt);
        });

    } else if (patchId === 'prog_house_pluck') {
        // 🔥 PROGRESSIVE HOUSE PLUCK (Deadmau5 / Prydz / Kaskade)
        const peakGain = (isBassVoice ? 0.22 : 0.17) * velocity;
        const pluckDecay = 0.22 + releaseTime * 0.22;

        voiceBus.gain.setValueAtTime(0.0001, now);
        voiceBus.gain.linearRampToValueAtTime(peakGain, now + 0.004);
        voiceBus.gain.exponentialRampToValueAtTime(peakGain * 0.28, now + pluckDecay);
        voiceBus.gain.exponentialRampToValueAtTime(0.0001, stopAt);

        const startCutoff = 2600 + brightAmt * 6800;
        const bodyCutoff = 360 + brightAmt * 650;
        voiceFilter.Q.setValueAtTime(1.8, now);
        voiceFilter.frequency.setValueAtTime(startCutoff, now);
        voiceFilter.frequency.exponentialRampToValueAtTime(bodyCutoff, now + 0.19);
        voiceFilter.frequency.exponentialRampToValueAtTime(240, stopAt);

        const detuneAmt = 6 + widthAmt * 14;
        const voices = [
            { detune: 0, pan: 0, type: 'sawtooth', gain: 0.65 },
            { detune: -detuneAmt, pan: isBassVoice ? -0.15 : -0.65, type: 'sawtooth', gain: 0.50 },
            { detune: detuneAmt, pan: isBassVoice ? 0.15 : 0.65, type: 'square', gain: 0.36 }
        ];

        voices.forEach((v, idx) => {
            const osc = audioCtx.createOscillator();
            osc.type = v.type;
            osc.frequency.setValueAtTime(freq, now);
            osc.detune.setValueAtTime(v.detune, now);

            const vGain = audioCtx.createGain();
            vGain.gain.value = v.gain;
            const panner = createPanner(audioCtx, v.pan);

            osc.connect(vGain);
            vGain.connect(panner);
            panner.connect(voiceFilter);

            osc.start(now + idx * 0.0009);
            osc.stop(stopAt);
        });

    } else if (patchId === 'ukg_warm_pad') {
        // 🌊 FRED AGAIN.. / UK GARAGE WARM ANALOG PAD & KEYS
        const peakGain = (isBassVoice ? 0.20 : 0.14) * velocity;
        voiceBus.gain.setValueAtTime(0.0001, now);
        voiceBus.gain.linearRampToValueAtTime(peakGain, now + 0.045);
        voiceBus.gain.exponentialRampToValueAtTime(peakGain * 0.72, now + durationSec * 0.9);
        voiceBus.gain.exponentialRampToValueAtTime(0.0001, stopAt);

        const warmCutoff = 950 + brightAmt * 2800;
        voiceFilter.Q.setValueAtTime(1.2, now);
        voiceFilter.frequency.setValueAtTime(warmCutoff * 0.65, now);
        voiceFilter.frequency.exponentialRampToValueAtTime(warmCutoff, now + 0.16);
        voiceFilter.frequency.exponentialRampToValueAtTime(warmCutoff * 0.5, stopAt);

        const detuneAmt = 7 + widthAmt * 16;
        const voices = [
            { detune: 0, pan: 0, type: isBassVoice ? 'sine' : 'triangle', gain: 0.75 },
            { detune: -detuneAmt, pan: isBassVoice ? -0.15 : -0.70, type: 'sawtooth', gain: 0.45 },
            { detune: detuneAmt, pan: isBassVoice ? 0.15 : 0.70, type: 'sawtooth', gain: 0.45 }
        ];

        voices.forEach((v, idx) => {
            const osc = audioCtx.createOscillator();
            osc.type = v.type;
            osc.frequency.setValueAtTime(freq, now);
            osc.detune.setValueAtTime(v.detune, now);

            const vGain = audioCtx.createGain();
            vGain.gain.value = v.gain;
            const panner = createPanner(audioCtx, v.pan);

            osc.connect(vGain);
            vGain.connect(panner);
            panner.connect(voiceFilter);

            osc.start(now + idx * 0.001);
            osc.stop(stopAt);
        });

    } else if (patchId === 'studio_rhodes') {
        // 🎹 STUDIO RHODES MKII + SHIMMER HALL
        const peakGain = 0.21 * velocity;
        voiceBus.gain.setValueAtTime(0.0001, now);
        voiceBus.gain.linearRampToValueAtTime(peakGain, now + 0.006);
        voiceBus.gain.exponentialRampToValueAtTime(peakGain * 0.52, now + 0.20);
        voiceBus.gain.exponentialRampToValueAtTime(0.0001, stopAt);

        voiceFilter.frequency.setValueAtTime(Math.min(11000, freq * (4.5 + brightAmt * 4)), now);

        const carrier = audioCtx.createOscillator();
        carrier.type = 'triangle';
        carrier.frequency.setValueAtTime(freq, now);

        const barkMod = audioCtx.createOscillator();
        barkMod.type = 'sine';
        barkMod.frequency.setValueAtTime(freq * 2, now);
        const barkGain = audioCtx.createGain();
        barkGain.gain.setValueAtTime(Math.max(14, 75 - (midi - 48) * 1.1) * velocity, now);
        barkGain.gain.exponentialRampToValueAtTime(1.0, now + 0.28);
        barkMod.connect(barkGain);
        barkGain.connect(carrier.frequency);

        const tineMod = audioCtx.createOscillator();
        tineMod.type = 'sine';
        tineMod.frequency.setValueAtTime(freq * 6, now);
        const tineGain = audioCtx.createGain();
        tineGain.gain.setValueAtTime(Math.max(0.1, brightAmt * 135 * velocity), now);
        tineGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        tineMod.connect(tineGain);
        tineGain.connect(carrier.frequency);

        const panner = createPanner(audioCtx, isBassVoice ? 0 : ((midi % 2 === 0 ? 1 : -1) * 0.25));
        carrier.connect(panner);
        panner.connect(voiceFilter);

        carrier.start(now);
        barkMod.start(now);
        tineMod.start(now);
        carrier.stop(stopAt);
        barkMod.stop(stopAt);
        tineMod.stop(stopAt);

    } else {
        // 💎 NINAJIRACHI / PORTER GLASS PLUCK (Híbrido FM Cristal + Unison Estéreo + Pluck Envelope)
        const peakGain = (isBassVoice ? 0.20 : 0.16) * velocity;
        voiceBus.gain.setValueAtTime(0.0001, now);
        voiceBus.gain.linearRampToValueAtTime(peakGain, now + 0.005);
        voiceBus.gain.exponentialRampToValueAtTime(peakGain * 0.56, now + 0.20);
        voiceBus.gain.exponentialRampToValueAtTime(0.0001, stopAt);

        const peakCutoff = 3500 + brightAmt * 7500;
        const sustainCutoff = 1400 + brightAmt * 2600;
        voiceFilter.Q.setValueAtTime(1.35, now);
        voiceFilter.frequency.setValueAtTime(peakCutoff, now);
        voiceFilter.frequency.exponentialRampToValueAtTime(sustainCutoff, now + 0.22);
        voiceFilter.frequency.exponentialRampToValueAtTime(800, stopAt);

        // Cuerpo central con golpe FM cristalino
        const centerOsc = audioCtx.createOscillator();
        centerOsc.type = 'triangle';
        centerOsc.frequency.setValueAtTime(freq, now);

        const glassMod = audioCtx.createOscillator();
        glassMod.type = 'sine';
        glassMod.frequency.setValueAtTime(freq * 4, now);
        const glassModGain = audioCtx.createGain();
        glassModGain.gain.setValueAtTime(Math.max(0.5, brightAmt * 145 * velocity), now);
        glassModGain.gain.exponentialRampToValueAtTime(0.5, now + 0.16);
        glassMod.connect(glassModGain);
        glassModGain.connect(centerOsc.frequency);

        // Voces laterales Sawtooth en estéreo para abrir el sonido como Serum
        const detuneAmt = 7 + widthAmt * 15;
        const leftSaw = audioCtx.createOscillator();
        leftSaw.type = 'sawtooth';
        leftSaw.frequency.setValueAtTime(freq, now);
        leftSaw.detune.setValueAtTime(-detuneAmt, now);

        const rightSaw = audioCtx.createOscillator();
        rightSaw.type = 'sawtooth';
        rightSaw.frequency.setValueAtTime(freq, now);
        rightSaw.detune.setValueAtTime(detuneAmt, now);

        const sideGainL = audioCtx.createGain();
        const sideGainR = audioCtx.createGain();
        sideGainL.gain.value = isBassVoice ? 0.32 : 0.44;
        sideGainR.gain.value = isBassVoice ? 0.32 : 0.44;

        const panL = createPanner(audioCtx, isBassVoice ? -0.15 : -0.72);
        const panR = createPanner(audioCtx, isBassVoice ? 0.15 : 0.72);

        centerOsc.connect(voiceFilter);
        leftSaw.connect(sideGainL);
        sideGainL.connect(panL);
        panL.connect(voiceFilter);

        rightSaw.connect(sideGainR);
        sideGainR.connect(panR);
        panR.connect(voiceFilter);

        centerOsc.start(now);
        glassMod.start(now);
        leftSaw.start(now + 0.001);
        rightSaw.start(now + 0.002);

        centerOsc.stop(stopAt);
        glassMod.stop(stopAt);
        leftSaw.stop(stopAt);
        rightSaw.stop(stopAt);
    }
}

function playEPChord(midiNotes, durationSec = 1.1) {
    if (!midiNotes || midiNotes.length === 0) return;
    initAudioEngine();
    const sorted = [...midiNotes].sort((a, b) => a - b);
    const strumSec = state.synth.strumMs / 1000;
    sorted.forEach((midi, idx) => {
        const vel = (idx === 0 || idx === sorted.length - 1) ? 0.90 : 0.78;
        playEPNote(midi, durationSec, idx * strumSec, vel);
    });
}

function selectSynthPatch(patchId) {
    const patch = SYNTH_PATCHES[patchId];
    if (!patch) return;

    state.synth.patchId = patchId;
    const d = patch.defaults;

    updateSynthParam('volume', d.volume, true);
    updateSynthParam('bell', d.bell, true);
    updateSynthParam('tremolo', d.tremolo, true);
    updateSynthParam('release', d.release, true);
    updateSynthParam('strum', d.strum, true);
    updateSynthParam('crystal', d.crystal, true);

    const badge = document.getElementById('synthPatchBadge');
    if (badge) badge.textContent = patch.badge;

    if (state.sequence[state.selectedSeqIndex]) {
        playEPChord(state.sequence[state.selectedSeqIndex].notes, 1.05);
    }
    showToast(`🎹 Sonido cambiado a: ${patch.name}`);
}

function updateSynthParam(param, val, syncSlider = false) {
    const num = parseFloat(val);
    if (param === 'volume') {
        state.synth.volume = num / 100;
        document.getElementById('lblVol').textContent = `${Math.round(num)}%`;
        if (syncSlider && document.getElementById('sliderVol')) document.getElementById('sliderVol').value = num;
        if (masterGain && audioCtx) {
            masterGain.gain.setTargetAtTime(state.synth.volume * 0.82, audioCtx.currentTime, 0.02);
        }
    } else if (param === 'bell') {
        state.synth.bell = num / 100;
        document.getElementById('lblBell').textContent = `${Math.round(num)}%`;
        if (syncSlider && document.getElementById('sliderBell')) document.getElementById('sliderBell').value = num;
    } else if (param === 'tremolo') {
        state.synth.tremolo = num / 100;
        document.getElementById('lblTremolo').textContent = `${Math.round(num)}%`;
        if (syncSlider && document.getElementById('sliderTremolo')) document.getElementById('sliderTremolo').value = num;
        if (tremoloDepthGain && audioCtx) {
            tremoloDepthGain.gain.setTargetAtTime(state.synth.tremolo * 0.14, audioCtx.currentTime, 0.03);
        }
    } else if (param === 'release') {
        state.synth.release = num / 10;
        document.getElementById('lblRelease').textContent = `${state.synth.release.toFixed(1)}s`;
        if (syncSlider && document.getElementById('sliderRelease')) document.getElementById('sliderRelease').value = num;
    } else if (param === 'strum') {
        state.synth.strumMs = num;
        document.getElementById('lblStrum').textContent = `${Math.round(num)}ms`;
        if (syncSlider && document.getElementById('sliderStrum')) document.getElementById('sliderStrum').value = num;
    } else if (param === 'crystal') {
        state.synth.crystal = num / 100;
        document.getElementById('lblCrystal').textContent = `${Math.round(num)}%`;
        if (syncSlider && document.getElementById('sliderCrystal')) document.getElementById('sliderCrystal').value = num;
        if (reverbWetGain && audioCtx) {
            reverbWetGain.gain.setTargetAtTime(state.synth.crystal * 0.48, audioCtx.currentTime, 0.03);
        }
        if (delayWetGain && audioCtx) {
            delayWetGain.gain.setTargetAtTime(0.14 + state.synth.crystal * 0.12, audioCtx.currentTime, 0.03);
        }
    }
}
