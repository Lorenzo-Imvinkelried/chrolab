/**
 * Responsabilidad: Renderizado e interacción del selector de tónica, escala y paletas de acordes (diatónicos y préstamos).
 */
function renderRootNoteButtons() {
    const container = document.getElementById('rootNoteGrid');
    container.innerHTML = NOTE_NAMES.map((note, idx) => {
        const isSelected = idx === state.rootPitchClass;
        return `
            <button onclick="selectRootNote(${idx})" 
                class="py-1.5 px-1 rounded-lg font-mono-code text-xs font-bold transition border ${
                    isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30'
                        : 'bg-[#1a2438] text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                }">
                <div>${note}</div>
                <div class="text-[9px] font-normal ${isSelected ? 'text-slate-900' : 'text-slate-400'}">${NOTE_NAMES_LATIN[idx]}</div>
            </button>
        `;
    }).join('');
}

function transposeSequenceBySemitones(deltaSemi) {
    if (deltaSemi === 0 || state.sequence.length === 0) return;
    state.sequence.forEach(chord => {
        chord.notes = chord.notes.map(m => Math.max(24, Math.min(96, m + deltaSemi)));
        chord.originalNotes = chord.originalNotes.map(m => Math.max(24, Math.min(96, m + deltaSemi)));
        refreshChordMetadata(chord);
    });
}

function selectRootNote(pitchClass) {
    const oldRoot = state.rootPitchClass;
    let delta = pitchClass - oldRoot;
    if (delta > 6) delta -= 12;
    if (delta < -6) delta += 12;

    state.rootPitchClass = pitchClass;
    transposeSequenceBySemitones(delta);
    renderRootNoteButtons();
    onScaleConfigChange();
}

function onScaleConfigChange() {
    const newOctave = parseInt(document.getElementById('baseOctaveSelect').value, 10);
    const octaveDelta = (newOctave - state.baseOctave) * 12;

    state.scaleKey = document.getElementById('scaleSelect').value;
    state.extensionType = document.getElementById('extensionSelect').value;
    state.baseOctave = newOctave;

    if (octaveDelta !== 0) {
        transposeSequenceBySemitones(octaveDelta);
    }

    regenerateScalePalette();
    renderEditor();
}

function regenerateScalePalette() {
    const scalePcs = getScalePitchClasses(state.rootPitchClass, state.scaleKey);
    document.getElementById('scaleNotesBadge').textContent = scalePcs.map(pc => NOTE_NAMES[pc]).join(' · ');

    const numDegrees = SCALES[state.scaleKey].intervals.length;
    state.paletteChords = [];
    for (let i = 0; i < numDegrees; i++) {
        state.paletteChords.push(
            buildScaleChord(state.rootPitchClass, state.scaleKey, i, state.extensionType, state.baseOctave)
        );
    }

    state.borrowedChords = buildBorrowedChords(state.rootPitchClass, state.baseOctave);

    renderPaletteGrid();
    renderBorrowedPaletteGrid();
    renderSequenceTimeline();
}

function renderPaletteGrid() {
    const grid = document.getElementById('paletteGrid');
    grid.innerHTML = state.paletteChords.map((chord, idx) => {
        const noteNames = chord.notes.map(m => midiToNoteName(m)).join(' ');
        return `
            <div class="bg-[#172033] hover:bg-[#1e2a44] border border-slate-700/80 hover:border-cyan-400/60 rounded-xl p-2 flex flex-col justify-between transition group relative overflow-hidden">
                <div onclick="previewPaletteChord(${idx})" class="cursor-pointer">
                    <div class="flex items-center justify-between mb-0.5">
                        <span class="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            ${chord.roman}
                        </span>
                        <span class="text-[9px] text-slate-400 font-mono-code">[${idx + 1}]</span>
                    </div>
                    <div class="text-sm sm:text-base font-extrabold text-white group-hover:text-cyan-300 transition truncate">
                        ${chord.name}
                    </div>
                    <div class="text-[9px] font-mono-code text-slate-300/90 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800 truncate mt-1">
                        ${noteNames}
                    </div>
                </div>

                <div class="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center gap-1">
                    <button onclick="previewPaletteChord(${idx})" class="p-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] transition" title="Escuchar acorde">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                    <button onclick="addPaletteChordToSequence(${idx})" class="flex-1 py-1 px-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-semibold text-[11px] border border-cyan-500/30 transition flex items-center justify-center gap-1">
                        <i class="fa-solid fa-plus text-[9px]"></i> Añadir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderBorrowedPaletteGrid() {
    const grid = document.getElementById('borrowedPaletteGrid');
    if (!grid) return;

    grid.innerHTML = state.borrowedChords.map((chord, idx) => {
        const noteNames = chord.notes.map(m => midiToNoteName(m)).join(' ');
        return `
            <div class="bg-[#1f1631] hover:bg-[#2a1d42] border border-fuchsia-500/30 hover:border-fuchsia-400 rounded-xl p-2 flex flex-col justify-between transition group">
                <div onclick="previewBorrowedChord(${idx})" class="cursor-pointer">
                    <div class="flex items-center justify-between mb-0.5">
                        <span class="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
                            ${chord.roman}
                        </span>
                        <span class="text-[9px] text-fuchsia-300/80">Préstamo</span>
                    </div>
                    <div class="text-sm font-extrabold text-white group-hover:text-fuchsia-300 transition truncate">
                        ${chord.name}
                    </div>
                    <div class="text-[9px] text-slate-300 truncate">${chord.qualityDesc}</div>
                    <div class="text-[9px] font-mono-code text-fuchsia-200/90 bg-slate-950/70 px-1.5 py-0.5 rounded border border-fuchsia-900/50 truncate mt-1">
                        ${noteNames}
                    </div>
                </div>

                <div class="mt-1.5 pt-1.5 border-t border-fuchsia-900/40 flex items-center gap-1">
                    <button onclick="replaceSelectedWithBorrowed(${idx})" class="flex-1 py-1 px-1 rounded bg-slate-800 hover:bg-amber-500/30 text-amber-300 text-[10px] font-semibold border border-slate-700 transition" title="Reemplazar el acorde seleccionado en la secuencia por este">
                        Reemplazar
                    </button>
                    <button onclick="addBorrowedChordToSequence(${idx})" class="flex-1 py-1 px-1 rounded bg-fuchsia-500/25 hover:bg-fuchsia-500 text-fuchsia-200 hover:text-slate-950 font-semibold text-[10px] border border-fuchsia-500/40 transition">
                        + Añadir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function previewPaletteChord(idx) {
    const chord = state.paletteChords[idx];
    if (chord) playEPChord(chord.notes, 1.0);
}

function previewBorrowedChord(idx) {
    const chord = state.borrowedChords[idx];
    if (chord) playEPChord(chord.notes, 1.05);
}
