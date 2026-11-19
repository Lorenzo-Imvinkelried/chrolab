/**
 * Responsabilidad: Controlador de interfaz del Generador Inteligente de Progresiones (lectura de parámetros y actualización visual).
 */
function triggerSmartProgressionGenerator() {
    const lengthSelect = document.getElementById('genLengthSelect');
    const sharedSelect = document.getElementById('genSharedScaleSelect');
    const styleSelect = document.getElementById('genStyleSelect');
    const rhythmSelect = document.getElementById('genRhythmSelect');

    const options = {
        length: lengthSelect ? parseInt(lengthSelect.value, 10) : 4,
        sharedMode: sharedSelect ? sharedSelect.value : 'balanced',
        voicingStyle: styleSelect ? styleSelect.value : 'lush_voice_leading',
        rhythmMode: rhythmSelect ? rhythmSelect.value : 'even'
    };

    const result = generateSmartProgression(options);
    state.sequence = result.sequence;
    state.selectedSeqIndex = 0;

    renderSequenceTimeline();
    renderEditor();
    updateGeneratorStatusBadge(result.usedSharedScales);

    if (state.sequence[0]) {
        playEPChord(state.sequence[0].notes, 1.05);
    }

    const chordSummary = state.sequence.map(c => c.name).join(' → ');
    showToast(`✨ Nueva progresión (${state.sequence.length} acordes): ${chordSummary}`);
}

function updateGeneratorStatusBadge(usedSharedScales) {
    const badge = document.getElementById('genSharedScalesBadge');
    if (!badge) return;

    const mainScaleName = SCALES[state.scaleKey].name.split(' (')[0];
    const rootName = NOTE_NAMES[state.rootPitchClass];

    if (!usedSharedScales || usedSharedScales.length === 0) {
        badge.textContent = `100% Diatónica en ${rootName} ${mainScaleName}`;
        badge.className = 'text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30';
    } else {
        badge.textContent = `${rootName} ${mainScaleName} + ${usedSharedScales.join(' · ')}`;
        badge.className = 'text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/40';
    }
}
