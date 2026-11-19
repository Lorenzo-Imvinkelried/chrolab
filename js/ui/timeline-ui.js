/**
 * Responsabilidad: Renderizado visual de la línea de tiempo de tarjetas de la secuencia de acordes.
 */
function renderSequenceTimeline() {
    const container = document.getElementById('sequenceTimeline');
    document.getElementById('sequenceCountBadge').textContent = `${state.sequence.length} ${state.sequence.length === 1 ? 'acorde' : 'acordes'}`;

    if (state.sequence.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-8 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-800 rounded-xl">
                <i class="fa-solid fa-music text-2xl mb-2 text-slate-600"></i>
                <p class="text-xs sm:text-sm font-medium">Tu secuencia está vacía.</p>
                <p class="text-xs text-slate-400 mt-1">Elige una Secuencia EDM/Ninajirachi o añade acordes desde arriba.</p>
            </div>
        `;
        return;
    }

    const scalePcs = new Set(getScalePitchClasses(state.rootPitchClass, state.scaleKey));

    container.innerHTML = state.sequence.map((item, idx) => {
        const isSelected = idx === state.selectedSeqIndex;
        const isPlayingNow = state.isPlaying && idx === state.currentPlayIndex;
        const noteNames = item.notes.map(m => midiToNoteName(m)).join(' ');
        const outOfScaleCount = item.notes.filter(m => !scalePcs.has(((m % 12) + 12) % 12)).length;

        return `
            <div onclick="selectSequenceChord(${idx})" 
                class="cursor-pointer rounded-xl p-3 flex flex-col justify-between transition relative border ${
                    isPlayingNow
                        ? 'bg-[#1a2c47] border-emerald-400 playing-card'
                        : isSelected
                        ? 'bg-[#1b253b] border-amber-400/90 shadow-lg shadow-amber-500/10'
                        : outOfScaleCount > 0
                        ? 'bg-[#1c162e] border-fuchsia-500/40 hover:border-fuchsia-400'
                        : 'bg-[#151e30] border-slate-800 hover:border-slate-600'
                }">
                
                <!-- Top Row: Step Number, Roman & Delete -->
                <div class="flex items-center justify-between gap-1 mb-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                        }">#${idx + 1}</span>
                        <span class="text-[10px] font-mono-code font-semibold ${outOfScaleCount > 0 ? 'text-fuchsia-300' : 'text-cyan-300'} truncate max-w-[95px]">${item.roman}</span>
                    </div>

                    <div class="flex items-center gap-1" onclick="event.stopPropagation()">
                        <button onclick="duplicateSequenceChord(${idx})" class="p-1 text-slate-400 hover:text-cyan-300 text-[11px] transition" title="Duplicar acorde">
                            <i class="fa-regular fa-clone"></i>
                        </button>
                        <button onclick="removeSequenceChord(${idx})" class="p-1 text-slate-400 hover:text-rose-400 text-[11px] transition" title="Eliminar acorde">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <!-- Middle: Chord Name & Spice Badge -->
                <div class="my-1">
                    <div class="flex items-center justify-between gap-1">
                        <div class="text-lg font-extrabold text-white tracking-tight truncate">
                            ${item.name}
                        </div>
                        ${
                            outOfScaleCount > 0
                                ? `<span class="text-[9px] px-1.5 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shrink-0" title="Contiene notas fuera de la escala (Préstamo Modal / Cromatismo)">Fuera Escala</span>`
                                : ''
                        }
                    </div>
                    <div class="text-[10px] font-mono-code text-slate-300 bg-slate-950/70 px-2 py-1 rounded border border-slate-800/90 truncate mt-1">
                        ${noteNames}
                    </div>
                </div>

                <!-- Beat Progress Bar during playback -->
                <div class="grid grid-cols-4 gap-1 my-1.5">
                    ${[0, 1, 2, 3].map(b => `
                        <div class="h-1 rounded-full transition-all ${
                            isPlayingNow && state.currentBeatInChord >= b
                                ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                                : 'bg-slate-800'
                        }"></div>
                    `).join('')}
                </div>

                <!-- Bottom Controls: Move Left/Right & Duration in Beats -->
                <div class="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[11px]" onclick="event.stopPropagation()">
                    <div class="flex items-center gap-1">
                        <button onclick="moveSequenceChord(${idx}, -1)" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30" ${idx === 0 ? 'disabled' : ''} title="Mover a la izquierda">
                            <i class="fa-solid fa-chevron-left text-[10px]"></i>
                        </button>
                        <button onclick="moveSequenceChord(${idx}, 1)" class="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30" ${idx === state.sequence.length - 1 ? 'disabled' : ''} title="Mover a la derecha">
                            <i class="fa-solid fa-chevron-right text-[10px]"></i>
                        </button>
                    </div>

                    <div class="flex items-center gap-1">
                        <span class="text-[10px] text-slate-400">Dur:</span>
                        <select onchange="changeChordBeats(${idx}, this.value)" class="bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[10px] font-mono-code text-cyan-300 outline-none">
                            <option value="1" ${item.beats === 1 ? 'selected' : ''}>1 t</option>
                            <option value="2" ${item.beats === 2 ? 'selected' : ''}>2 t</option>
                            <option value="4" ${item.beats === 4 ? 'selected' : ''}>4 t</option>
                            <option value="8" ${item.beats === 8 ? 'selected' : ''}>8 t</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
