/**
 * Responsabilidad: Utilidades puras de conversión de números MIDI a frecuencia (Hz) y notación musical (Estándar FL Studio: MIDI 60 = C5).
 */
function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

function midiToNoteName(midi) {
    const pc = ((midi % 12) + 12) % 12;
    // Estándar de octavas de FL Studio: MIDI 0 = C0, MIDI 48 = C4, MIDI 52 = E4, MIDI 60 = C5
    const oct = Math.floor(midi / 12);
    return `${NOTE_NAMES[pc]}${oct}`;
}
