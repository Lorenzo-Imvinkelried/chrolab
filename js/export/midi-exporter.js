/**
 * Responsabilidad: Codificación binaria y descarga de archivos MIDI (.mid) estándar para DAWs.
 */
function writeMidiVarLen(value) {
    const bytes = [];
    let v = Math.max(0, Math.round(value));
    bytes.push(v & 0x7f);
    while ((v >>= 7) > 0) {
        bytes.push((v & 0x7f) | 0x80);
    }
    return bytes.reverse();
}

function exportProgressionMIDI() {
    if (state.sequence.length === 0) {
        showToast('No hay acordes para exportar');
        return;
    }

    const ppq = 480;
    const trackBytes = [];

    const microsecondsPerBeat = Math.round(60000000 / state.bpm);
    trackBytes.push(
        0x00, 0xff, 0x51, 0x03,
        (microsecondsPerBeat >> 16) & 0xff,
        (microsecondsPerBeat >> 8) & 0xff,
        microsecondsPerBeat & 0xff
    );

    let pendingRestTicks = 0;

    state.sequence.forEach(chord => {
        const totalStepTicks = chord.beats * ppq;
        // Deja un margen de articulación de 10 ticks antes del siguiente acorde
        // para que notas repetidas (ej. Nota Pedal) re-disparen limpiamente en cualquier VST de FL Studio.
        const gateTicks = Math.max(ppq / 4, totalStepTicks - 10);
        const restAfterChord = totalStepTicks - gateTicks;
        const notes = [...chord.notes].sort((a, b) => a - b);

        notes.forEach((midi, idx) => {
            const delta = idx === 0 ? writeMidiVarLen(pendingRestTicks) : [0x00];
            // Respeta el balance de voces de la web: bajo y tope ligeramente destacados, voces internas equilibradas
            const isOuterVoice = idx === 0 || idx === notes.length - 1;
            const velocity = isOuterVoice ? 100 : 86;
            trackBytes.push(...delta, 0x90, midi & 0x7f, velocity);
        });

        notes.forEach((midi, idx) => {
            const delta = idx === 0 ? writeMidiVarLen(gateTicks) : [0x00];
            trackBytes.push(...delta, 0x80, midi & 0x7f, 0x40);
        });

        pendingRestTicks = restAfterChord;
    });

    trackBytes.push(...writeMidiVarLen(pendingRestTicks), 0xff, 0x2f, 0x00);

    const header = [
        0x4d, 0x54, 0x68, 0x64,
        0x00, 0x00, 0x00, 0x06,
        0x00, 0x00,
        0x00, 0x01,
        (ppq >> 8) & 0xff, ppq & 0xff
    ];

    const len = trackBytes.length;
    const trackHeader = [
        0x4d, 0x54, 0x72, 0x6b,
        (len >> 24) & 0xff,
        (len >> 16) & 0xff,
        (len >> 8) & 0xff,
        len & 0xff
    ];

    const midiFile = new Uint8Array([...header, ...trackHeader, ...trackBytes]);
    const blob = new Blob([midiFile], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ChordLab_${NOTE_NAMES[state.rootPitchClass]}_${state.scaleKey}_${state.bpm}bpm.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Archivo MIDI descargado correctamente');
}
