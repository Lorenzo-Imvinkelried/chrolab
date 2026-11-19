/**
 * Responsabilidad: Renderizado e interacción táctil/arrastre (Drag & Drop) del Piano Roll (C2–B5).
 */
let dragMoved = false;

function renderPianoRoll(chord, chordRootPc = state.rootPitchClass) {
    const grid = document.getElementById('pianoRollGrid');
    const scalePcs = new Set(getScalePitchClasses(state.rootPitchClass, state.scaleKey));
    const activeSet = new Set(chord ? chord.notes : []);

    let html = '';
    for (let midi = 83; midi >= 36; midi--) {
        const pc = ((midi % 12) + 12) % 12;
        const isBlack = BLACK_KEYS.has(pc);
        const isInScale = scalePcs.has(pc);
        const isRoot = pc === state.rootPitchClass;
        const isActive = activeSet.has(midi);
        const isPedal = isHighPedalNote(midi);
        const noteLabel = midiToNoteName(midi);
        const intervalName = getNoteIntervalLabel(midi, chordRootPc);

        let barColorClass = 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 border border-cyan-300';
        if (!isInScale) {
            barColorClass = 'bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white border border-fuchsia-300 shadow-fuchsia-500/30';
        } else if (isPedal) {
            barColorClass = 'bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 border border-amber-200';
        }

        html += `
            <div data-midi="${midi}" 
                onmousedown="onPianoRowMouseDown(event, ${midi})"
                onmouseenter="onPianoRowMouseEnter(event, ${midi})"
                class="piano-key-row flex items-center h-7 border-b border-slate-800/70 cursor-pointer ${
                    isInScale
                        ? 'bg-[#131d31]/90 hover:bg-[#1c2b47]'
                        : isBlack
                        ? 'bg-[#090d16] hover:bg-[#1a1326]'
                        : 'bg-[#0d1320] hover:bg-[#1c162b]'
                }">
                
                <!-- Left Piano Key Label -->
                <div class="w-20 shrink-0 h-full px-2 flex items-center justify-between border-r border-slate-800 ${
                    isBlack ? 'bg-slate-950 text-slate-400' : 'bg-slate-900/90 text-slate-200'
                }">
                    <span class="font-mono-code text-[11px] font-semibold ${isRoot ? 'text-cyan-300 font-bold' : ''}">
                        ${noteLabel}
                    </span>
                    ${
                        isRoot
                            ? '<span class="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300 font-mono-code">Tónica</span>'
                            : isInScale
                            ? '<span class="w-1.5 h-1.5 rounded-full bg-cyan-500/50"></span>'
                            : '<span class="text-[9px] text-fuchsia-400/70 font-mono-code">Fuera</span>'
                    }
                </div>

                <!-- Right Note Lane -->
                <div class="flex-1 h-full px-3 flex items-center relative">
                    ${
                        isActive
                            ? `
                            <div class="note-block w-full h-5 rounded-md px-3 flex items-center justify-between text-xs font-bold shadow-md ${barColorClass}">
                                <span class="font-mono-code flex items-center gap-2">
                                    <i class="fa-solid fa-grip-lines text-[10px] opacity-75"></i>
                                    <span>${noteLabel} (${NOTE_NAMES_LATIN[pc]})</span>
                                    <span class="text-[10px] px-1.5 py-0.2 rounded bg-black/25 font-mono-code">
                                        ${intervalName}${!isInScale ? ' · ✨ Fuera de Escala' : isPedal ? ' · 📌 Pedal' : ''}
                                    </span>
                                </span>
                                <span class="text-[10px] font-normal opacity-85 hidden sm:inline">
                                    Arrastra ↑↓ · Clic quitar
                                </span>
                            </div>
                            `
                            : `
                            <div class="w-full h-full flex items-center opacity-0 hover:opacity-100 transition-opacity">
                                <span class="text-[10px] ${isInScale ? 'text-cyan-300/70' : 'text-fuchsia-300/80'} font-mono-code">
                                    + Clic para activar ${noteLabel} ${!isInScale ? '(Nota Fuera de Escala / Spice)' : ''}
                                </span>
                            </div>
                            `
                    }
                </div>
            </div>
        `;
    }

    grid.innerHTML = html;
}

function onPianoRowMouseDown(e, midi) {
    e.preventDefault();
    const chord = state.sequence[state.selectedSeqIndex];
    if (!chord) return;

    const hasNote = chord.notes.includes(midi);
    if (hasNote) {
        state.dragState.isDragging = true;
        state.dragState.startMidi = midi;
        state.dragState.currentMidi = midi;
        dragMoved = false;
        playEPNote(midi, 0.5);
    } else {
        chord.notes.push(midi);
        refreshChordMetadata(chord);
        playEPNote(midi, 0.7);
        renderSequenceTimeline();
        renderEditor();
    }
}

function onPianoRowMouseEnter(e, targetMidi) {
    if (!state.dragState.isDragging) return;
    if (targetMidi === state.dragState.currentMidi) return;

    const chord = state.sequence[state.selectedSeqIndex];
    if (!chord) return;

    dragMoved = true;
    chord.notes = chord.notes.filter(m => m !== state.dragState.currentMidi);
    if (!chord.notes.includes(targetMidi)) {
        chord.notes.push(targetMidi);
    }
    state.dragState.currentMidi = targetMidi;

    refreshChordMetadata(chord);
    playEPNote(targetMidi, 0.45);
    renderSequenceTimeline();
    renderEditor();
}

function handlePianoRollMouseUp() {
    if (!state.dragState.isDragging) return;
    const startMidi = state.dragState.startMidi;
    state.dragState.isDragging = false;
    if (!dragMoved && startMidi !== null) {
        const chord = state.sequence[state.selectedSeqIndex];
        if (chord && chord.notes.length > 1) {
            chord.notes = chord.notes.filter(m => m !== startMidi);
            refreshChordMetadata(chord);
            renderSequenceTimeline();
            renderEditor();
        } else if (chord && chord.notes.length <= 1) {
            showToast('El acorde debe conservar al menos 1 nota');
        }
    }
    state.dragState.startMidi = null;
    state.dragState.currentMidi = null;
}
