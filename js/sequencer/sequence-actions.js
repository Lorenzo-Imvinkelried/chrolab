/**
 * Responsabilidad: Gestión de operaciones sobre la secuencia de acordes (añadir, reemplazar, mover, duplicar, eliminar y presets).
 */
function addPaletteChordToSequence(idx) {
    const template = state.paletteChords[idx];
    if (!template) return;
    const newChord = {
        degreeIndex: template.degreeIndex,
        roman: template.roman,
        name: template.name,
        qualityDesc: template.qualityDesc,
        notes: [...template.notes],
        originalNotes: [...template.notes],
        beats: 4,
        isCustom: false
    };
    state.sequence.push(newChord);
    state.selectedSeqIndex = state.sequence.length - 1;
    playEPChord(newChord.notes, 0.9);
    renderSequenceTimeline();
    renderEditor();
    showToast(`Acorde ${newChord.name} añadido a la secuencia`);
}

function addBorrowedChordToSequence(idx) {
    const template = state.borrowedChords[idx];
    if (!template) return;
    const newChord = {
        ...template,
        notes: [...template.notes],
        originalNotes: [...template.notes],
        beats: 4
    };
    state.sequence.push(newChord);
    state.selectedSeqIndex = state.sequence.length - 1;
    playEPChord(newChord.notes, 1.0);
    renderSequenceTimeline();
    renderEditor();
    showToast(`Acorde fuera de escala ${newChord.name} (${newChord.roman}) añadido`);
}

function replaceSelectedWithBorrowed(idx) {
    const template = state.borrowedChords[idx];
    if (!template) return;
    if (state.sequence.length === 0) {
        addBorrowedChordToSequence(idx);
        return;
    }
    const targetIdx = state.selectedSeqIndex;
    state.sequence[targetIdx] = {
        ...template,
        notes: [...template.notes],
        originalNotes: [...template.notes],
        beats: state.sequence[targetIdx].beats || 4
    };
    playEPChord(state.sequence[targetIdx].notes, 1.0);
    renderSequenceTimeline();
    renderEditor();
    showToast(`Paso #${targetIdx + 1} reemplazado por préstamo modal ${template.name}`);
}

function applyProgressionPreset(presetId, playPreview = true) {
    const preset = PROGRESSION_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    const baseMidi = (state.baseOctave + 1) * 12 + state.rootPitchClass;

    if (preset.customChords) {
        state.sequence = preset.customChords.map(cc => {
            const notes = cc.offsets.map(o => baseMidi + o).sort((a, b) => a - b);
            const analysis = analyzeChordNotes(notes, state.rootPitchClass);
            return {
                roman: cc.label || analysis.roman,
                name: analysis.name,
                qualityDesc: analysis.qualityDesc,
                notes: [...notes],
                originalNotes: [...notes],
                beats: 4,
                isCustom: false,
                isBorrowed: hasOutOfScaleNotes(notes)
            };
        });
    } else {
        triggerSmartProgressionGenerator();
        return;
    }

    state.selectedSeqIndex = 0;
    renderSequenceTimeline();
    renderEditor();

    if (playPreview && state.sequence[0]) {
        playEPChord(state.sequence[0].notes, 1.05);
        showToast(`Secuencia "${preset.name}" cargada en ${NOTE_NAMES[state.rootPitchClass]}`);
    }
}

function selectSequenceChord(idx) {
    if (idx < 0 || idx >= state.sequence.length) return;
    state.selectedSeqIndex = idx;
    const chord = state.sequence[idx];
    playEPChord(chord.notes, 0.9);
    renderSequenceTimeline();
    renderEditor();
}

function duplicateSequenceChord(idx) {
    const orig = state.sequence[idx];
    if (!orig) return;
    const copy = {
        ...orig,
        notes: [...orig.notes],
        originalNotes: [...orig.originalNotes]
    };
    state.sequence.splice(idx + 1, 0, copy);
    state.selectedSeqIndex = idx + 1;
    renderSequenceTimeline();
    renderEditor();
    showToast(`Acorde ${copy.name} duplicado`);
}

function removeSequenceChord(idx) {
    state.sequence.splice(idx, 1);
    if (state.selectedSeqIndex >= state.sequence.length) {
        state.selectedSeqIndex = Math.max(0, state.sequence.length - 1);
    }
    renderSequenceTimeline();
    renderEditor();
}

function moveSequenceChord(idx, dir) {
    const target = idx + dir;
    if (target < 0 || target >= state.sequence.length) return;
    const temp = state.sequence[idx];
    state.sequence[idx] = state.sequence[target];
    state.sequence[target] = temp;
    state.selectedSeqIndex = target;
    renderSequenceTimeline();
    renderEditor();
}

function changeChordBeats(idx, val) {
    if (!state.sequence[idx]) return;
    state.sequence[idx].beats = parseInt(val, 10);
    renderSequenceTimeline();
}

function clearSequence() {
    stopPlayback();
    state.sequence = [];
    state.selectedSeqIndex = 0;
    renderSequenceTimeline();
    renderEditor();
    showToast('Secuencia limpiada');
}
