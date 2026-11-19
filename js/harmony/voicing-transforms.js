/**
 * Responsabilidad: Transformaciones de voicing (inversiones, Drop 2, Lush cluster, nota pedal, conducción de voces).
 */
function buildLushVoicingFromNotes(midiNotes) {
    if (!midiNotes || midiNotes.length === 0) return midiNotes;
    const sorted = [...midiNotes].sort((a, b) => a - b);
    const rootPc = ((sorted[0] % 12) + 12) % 12;
    const bassMidi = state.baseOctave * 12 + rootPc;
    const midRoot = bassMidi + 12;

    const pcs = new Set(sorted.map(m => ((m % 12) + 12) % 12));
    const hasMinor3 = pcs.has((rootPc + 3) % 12);
    const thirdSemi = hasMinor3 ? 3 : 4;
    const seventhSemi = pcs.has((rootPc + 11) % 12) ? 11 : 10;

    return Array.from(new Set([
        bassMidi,
        midRoot + thirdSemi,
        midRoot + 7,
        midRoot + seventhSemi,
        midRoot + 14,
        midRoot + 19
    ])).sort((a, b) => a - b);
}

function applyPedalToneToSequence() {
    if (state.sequence.length === 0) return;
    const highTonic = (state.baseOctave + 2) * 12 + state.rootPitchClass;
    const highFifth = highTonic + 7;
    const pedalNotes = [highTonic, highFifth];

    state.sequence.forEach(chord => {
        const filtered = chord.notes.filter(m =>
            m < highTonic - 1 &&
            !hasHarmonicClash(m, pedalNotes)
        );
        filtered.push(highTonic, highFifth);
        chord.notes = Array.from(new Set(filtered)).sort((a, b) => a - b);
        refreshChordMetadata(chord);
    });

    renderSequenceTimeline();
    renderEditor();
    if (state.sequence[state.selectedSeqIndex]) {
        playEPChord(state.sequence[state.selectedSeqIndex].notes, 1.0);
    }
    showToast(`✨ Nota Pedal Aguda (${midiToNoteName(highTonic)} + ${midiToNoteName(highFifth)}) clavada sin choques`);
}

function applyLushClusterToSequence() {
    if (state.sequence.length === 0) return;

    state.sequence.forEach(chord => {
        chord.notes = buildLushVoicingFromNotes(chord.notes);
        refreshChordMetadata(chord);
    });

    renderSequenceTimeline();
    renderEditor();
    if (state.sequence[state.selectedSeqIndex]) {
        playEPChord(state.sequence[state.selectedSeqIndex].notes, 1.0);
    }
    showToast('🌸 Voicings Lush (9na limpia sin choques de semitono) aplicados a toda la secuencia');
}

function humanizeSequenceVoicings() {
    if (state.sequence.length < 2) {
        showToast('Añade al menos 2 acordes para suavizar enlaces');
        return;
    }

    const firstCenter = state.sequence[0].notes.reduce((a, b) => a + b, 0) / state.sequence[0].notes.length;

    for (let i = 1; i < state.sequence.length; i++) {
        const chord = state.sequence[i];
        if (chord.notes.length < 2) continue;

        const bass = chord.notes[0];
        const upper = [];
        for (const m of chord.notes.slice(1)) {
            let bestMidi = m;
            let bestDist = Math.abs(m - firstCenter);
            for (let shift = -24; shift <= 24; shift += 12) {
                const cand = m + shift;
                if (cand > bass + 2 && cand <= 81 && !hasHarmonicClash(cand, [bass, ...upper]) && Math.abs(cand - firstCenter) < bestDist) {
                    bestMidi = cand;
                    bestDist = Math.abs(cand - firstCenter);
                }
            }
            upper.push(bestMidi);
        }

        chord.notes = Array.from(new Set([bass, ...upper])).sort((a, b) => a - b);
        refreshChordMetadata(chord);
    }

    renderSequenceTimeline();
    renderEditor();
    if (state.sequence[state.selectedSeqIndex]) {
        playEPChord(state.sequence[state.selectedSeqIndex].notes, 1.0);
    }
    showToast('Enlaces de voces (Voice Leading) optimizados suavemente');
}

function transformSelectedChord(action) {
    const chord = state.sequence[state.selectedSeqIndex];
    if (!chord || chord.notes.length === 0) return;

    let notes = [...chord.notes].sort((a, b) => a - b);

    if (action === 'lushCluster') {
        notes = buildLushVoicingFromNotes(notes);
        showToast('✨ Voicing Lush (9na abierta sin choques) aplicado al acorde');
    } else if (action === 'slashBass') {
        const rootPc = ((notes[0] % 12) + 12) % 12;
        const pcs = new Set(notes.map(m => ((m % 12) + 12) % 12));
        const thirdSemi = pcs.has((rootPc + 3) % 12) ? 3 : 4;
        const slashBassMidi = (state.baseOctave - 1) * 12 + ((rootPc + thirdSemi) % 12);
        notes.unshift(Math.max(36, slashBassMidi));
        showToast('🌊 Bajo en 3ra (Slash Chord) añadido para suavizar el bajo');
    } else if (action === 'modalFlip') {
        const rootPc = ((notes[0] % 12) + 12) % 12;
        let flipped = false;
        notes = notes.map(m => {
            const rel = ((m % 12) - rootPc + 12) % 12;
            if (rel === 4) { flipped = true; return m - 1; }
            if (rel === 3) { flipped = true; return m + 1; }
            return m;
        });
        if (!flipped && notes.length >= 2) {
            notes[1] += 1;
        }
        showToast('🎭 Intercambio Modal aplicado (Mayor ↔ Menor fuera de escala)');
    } else if (action === 'invUp') {
        const lowest = notes.shift();
        notes.push(Math.min(96, lowest + 12));
    } else if (action === 'invDown') {
        const highest = notes.pop();
        notes.unshift(Math.max(24, highest - 12));
    } else if (action === 'drop2') {
        if (notes.length >= 3) {
            const secondHighestIdx = notes.length - 2;
            notes[secondHighestIdx] = Math.max(24, notes[secondHighestIdx] - 12);
        }
    } else if (action === 'addBass') {
        const lowest = notes[0];
        const newBass = lowest >= 48 ? lowest - 12 : lowest;
        if (!notes.includes(newBass)) notes.unshift(newBass);
    } else if (action === 'semiUp') {
        notes = notes.map(m => Math.min(96, m + 1));
    } else if (action === 'semiDown') {
        notes = notes.map(m => Math.max(24, m - 1));
    } else if (action === 'octUp') {
        notes = notes.map(m => Math.min(96, m + 12));
    } else if (action === 'octDown') {
        notes = notes.map(m => Math.max(24, m - 12));
    } else if (action === 'reset') {
        notes = [...chord.originalNotes];
    }

    chord.notes = Array.from(new Set(notes)).sort((a, b) => a - b);
    refreshChordMetadata(chord);
    playEPChord(chord.notes, 0.95);
    renderSequenceTimeline();
    renderEditor();
}
