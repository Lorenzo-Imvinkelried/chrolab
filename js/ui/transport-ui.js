/**
 * Responsabilidad: Actualización visual de los botones de transporte (Play/Pausa, Bucle) e indicadores LED de pulso.
 */
function updatePlayButtonUI() {
    const btn = document.getElementById('btnPlay');
    const icon = document.getElementById('playIcon');
    const text = document.getElementById('playText');

    if (state.isPlaying) {
        btn.className = 'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow-md shadow-amber-400/20';
        icon.className = 'fa-solid fa-pause';
        text.textContent = 'Pausar';
    } else {
        btn.className = 'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-md shadow-emerald-500/20';
        icon.className = 'fa-solid fa-play';
        text.textContent = 'Reproducir';
    }
}

function updateLoopButtonUI() {
    const btn = document.getElementById('btnLoop');
    if (state.isLooping) {
        btn.className = 'p-2 px-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition text-xs sm:text-sm';
    } else {
        btn.className = 'p-2 px-2.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition text-xs sm:text-sm';
    }
}

function updateBeatLEDs(activeBeat) {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById(`beatDot${i}`);
        if (!dot) continue;
        if (i === activeBeat) {
            dot.className = i === 0
                ? 'w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 scale-125 transition-all'
                : 'w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 scale-110 transition-all';
        } else {
            dot.className = 'w-2.5 h-2.5 rounded-full bg-slate-700 transition-all';
        }
    }
}
