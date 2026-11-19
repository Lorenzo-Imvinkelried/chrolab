/**
 * Responsabilidad: Motor de reloj BPM y control del transporte (reproducir, pausar, detener y bucle).
 */
let playbackTimer = null;

function updateBPM(val) {
    state.bpm = parseInt(val, 10);
    document.getElementById('bpmValue').textContent = state.bpm;
}

function toggleLoop() {
    state.isLooping = !state.isLooping;
    updateLoopButtonUI();
}

function togglePlay() {
    if (state.isPlaying) {
        pausePlayback();
    } else {
        startPlayback();
    }
}

function startPlayback() {
    if (state.sequence.length === 0) {
        showToast('Agrega acordes a la secuencia primero');
        return;
    }
    initAudioEngine();
    state.isPlaying = true;
    if (state.currentPlayIndex < 0 || state.currentPlayIndex >= state.sequence.length) {
        state.currentPlayIndex = 0;
        state.currentBeatInChord = 0;
    }

    updatePlayButtonUI();
    runSequencerStep();
}

function pausePlayback() {
    state.isPlaying = false;
    if (playbackTimer) clearTimeout(playbackTimer);
    updatePlayButtonUI();
    renderSequenceTimeline();
}

function stopPlayback() {
    state.isPlaying = false;
    if (playbackTimer) clearTimeout(playbackTimer);
    state.currentPlayIndex = -1;
    state.currentBeatInChord = 0;
    updatePlayButtonUI();
    updateBeatLEDs(-1);
    renderSequenceTimeline();
}

function runSequencerStep() {
    if (!state.isPlaying) return;

    const currentChord = state.sequence[state.currentPlayIndex];
    if (!currentChord) {
        stopPlayback();
        return;
    }

    const beatDurationSec = 60 / state.bpm;

    if (state.currentBeatInChord === 0) {
        const totalChordSec = beatDurationSec * currentChord.beats * 0.92;
        playEPChord(currentChord.notes, totalChordSec);
        state.selectedSeqIndex = state.currentPlayIndex;
        renderEditor();
    }

    updateBeatLEDs(state.currentBeatInChord % 4);
    renderSequenceTimeline();

    playbackTimer = setTimeout(() => {
        if (!state.isPlaying) return;
        state.currentBeatInChord++;
        if (state.currentBeatInChord >= currentChord.beats) {
            state.currentBeatInChord = 0;
            state.currentPlayIndex++;
            if (state.currentPlayIndex >= state.sequence.length) {
                if (state.isLooping) {
                    state.currentPlayIndex = 0;
                } else {
                    stopPlayback();
                    return;
                }
            }
        }
        runSequencerStep();
    }, beatDurationSec * 1000);
}
