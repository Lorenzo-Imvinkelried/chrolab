/**
 * Responsabilidad: Punto de entrada e inicialización general de la aplicación al cargar el DOM.
 */
function initApp() {
    renderRootNoteButtons();

    const synthPatchSelect = document.getElementById('synthPatchSelect');
    if (synthPatchSelect) {
        synthPatchSelect.innerHTML = Object.values(SYNTH_PATCHES).map(p =>
            `<option value="${p.id}" ${p.id === state.synth.patchId ? 'selected' : ''}>${p.name}</option>`
        ).join('');
    }

    const scaleSelect = document.getElementById('scaleSelect');
    scaleSelect.innerHTML = Object.entries(SCALES).map(([key, sc]) =>
        `<option value="${key}" ${key === state.scaleKey ? 'selected' : ''}>${sc.name}</option>`
    ).join('');

    const presetContainer = document.getElementById('presetButtonsContainer');
    presetContainer.innerHTML = PROGRESSION_PRESETS.map(p => `
        <button onclick="applyProgressionPreset('${p.id}')" 
            class="px-2.5 py-2 rounded-xl bg-[#1a2438] hover:bg-fuchsia-500/20 border border-slate-700/80 hover:border-fuchsia-500/50 text-left transition group flex flex-col justify-between">
            <div class="flex items-center justify-between gap-1">
                <span class="text-xs font-bold text-slate-100 group-hover:text-fuchsia-300 truncate">${p.name}</span>
            </div>
            <span class="text-[10px] font-mono-code text-slate-400 group-hover:text-fuchsia-200/80 truncate mt-0.5">${p.desc}</span>
        </button>
    `).join('');

    const manualSelect = document.getElementById('manualAddNoteSelect');
    let manualOptions = '';
    for (let m = 83; m >= 36; m--) {
        manualOptions += `<option value="${m}" ${m === 60 ? 'selected' : ''}>${midiToNoteName(m)} (MIDI ${m})</option>`;
    }
    manualSelect.innerHTML = manualOptions;

    document.getElementById('bpmSlider').value = state.bpm;
    document.getElementById('bpmValue').textContent = state.bpm;

    regenerateScalePalette();
    applyProgressionPreset('nina_glassy', false);
    setupGlobalEvents();
}

window.onload = initApp;
