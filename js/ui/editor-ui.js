/**
 * Responsabilidad: Renderizado del inspector de notas activas y edición individual de voces del acorde seleccionado.
 */
function renderEditor() {
    const badge = document.getElementById('editingChordBadge');
    const notesList = document.getElementById('activeNotesList');
    const chord = state.sequence[state.selectedSeqIndex];

    if (!chord) {
        badge.textContent = 'Ningún acorde seleccionado';
        notesList.innerHTML = `<div class="text-xs text-slate-400 py-4 text-center">Selecciona o añade un acorde en la secuencia para editar sus notas.</div>`;
        renderPianoRoll(null);
        return;
    }

    badge.textContent = `Paso #${state.selectedSeqIndex + 1}: ${chord.name} (${chord.roman})`;
    const scalePcs = new Set(getScalePitchClasses(state.rootPitchClass, state.scaleKey));
    const sortedAsc = [...chord.notes].sort((a, b) => a - b);
    const chordRootPc = sortedAsc.length > 0 ? ((sortedAsc[0] % 12) + 12) % 12 : state.rootPitchClass;

    const sortedDesc = [...chord.notes].sort((a, b) => b - a);
    notesList.innerHTML = sortedDesc.map((midi) => {
        const pc = ((midi % 12) + 12) % 12;
        const inScale = scalePcs.has(pc);
        const isPedal = isHighPedalNote(midi);
        const intervalName = getNoteIntervalLabel(midi, chordRootPc);

        return `
            <div class="flex items-center justify-between gap-2 bg-[#141d30] border ${
                !inScale ? 'border-fuchsia-500/60 bg-fuchsia-950/20' : isPedal ? 'border-amber-400/50' : 'border-slate-700/80'
            } rounded-xl px-2.5 py-1.5">
                <div class="flex items-center gap-2 cursor-pointer" onclick="playEPNote(${midi}, 0.6)">
                    <span class="w-2.5 h-2.5 rounded-full ${
                        !inScale ? 'bg-fuchsia-400 shadow-sm shadow-fuchsia-400' : isPedal ? 'bg-amber-400' : 'bg-cyan-400'
                    }"></span>
                    <div>
                        <span class="font-mono-code font-bold text-xs sm:text-sm text-white">${midiToNoteName(midi)}</span>
                        <span class="text-[10px] ${!inScale ? 'text-fuchsia-300 font-semibold' : 'text-slate-400'} ml-1">
                            (${intervalName}${!inScale ? ' · Fuera Escala' : isPedal ? ' · Pedal' : ''})
                        </span>
                    </div>
                </div>

                <div class="flex items-center gap-1">
                    <button onclick="nudgeSingleNote(${midi}, -12)" class="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono-code text-slate-300 transition" title="Bajar 1 Octava (-12 semitonos)">
                        -Oct
                    </button>
                    <button onclick="nudgeSingleNote(${midi}, -1)" class="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500/30 text-xs font-bold text-cyan-300 transition" title="Bajar 1 semitono">
                        <i class="fa-solid fa-arrow-down text-[10px]"></i>
                    </button>
                    <button onclick="nudgeSingleNote(${midi}, 1)" class="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500/30 text-xs font-bold text-cyan-300 transition" title="Subir 1 semitono">
                        <i class="fa-solid fa-arrow-up text-[10px]"></i>
                    </button>
                    <button onclick="nudgeSingleNote(${midi}, 12)" class="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono-code text-slate-300 transition" title="Subir 1 Octava (+12 semitonos)">
                        +Oct
                    </button>
                    <button onclick="removeSingleNote(${midi})" class="p-1 px-1.5 rounded bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 text-xs transition ml-0.5" title="Quitar esta nota">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    renderPianoRoll(chord, chordRootPc);
}

function nudgeSingleNote(oldMidi, deltaSemitones) {
    const chord = state.sequence[state.selectedSeqIndex];
    if (!chord) return;
    const newMidi = Math.max(24, Math.min(96, oldMidi + deltaSemitones));
    chord.notes = chord.notes.map(m => (m === oldMidi ? newMidi : m));
    refreshChordMetadata(chord);
    playEPNote(newMidi, 0.55);
    setTimeout(() => playEPChord(chord.notes, 0.8), 140);
    renderSequenceTimeline();
    renderEditor();
}

function removeSingleNote(midiToRemove) {
    const chord = state.sequence[state.selectedSeqIndex];
    if (!chord) return;
    if (chord.notes.length <= 1) {
        showToast('El acorde debe conservar al menos 1 nota');
        return;
    }
    chord.notes = chord.notes.filter(m => m !== midiToRemove);
    refreshChordMetadata(chord);
    playEPChord(chord.notes, 0.8);
    renderSequenceTimeline();
    renderEditor();
}

function addManualNoteToSelectedChord() {
    const chord = state.sequence[state.selectedSeqIndex];
    if (!chord) return;
    const midi = parseInt(document.getElementById('manualAddNoteSelect').value, 10);
    if (!chord.notes.includes(midi)) {
        chord.notes.push(midi);
        refreshChordMetadata(chord);
        playEPChord(chord.notes, 0.9);
        renderSequenceTimeline();
        renderEditor();
    } else {
        playEPNote(midi, 0.6);
        showToast('Esa nota ya está activa en el acorde');
    }
}

function previewSelectedChord() {
    const chord = state.sequence[state.selectedSeqIndex];
    if (chord) playEPChord(chord.notes, 1.0);
}
