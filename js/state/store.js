/**
 * Responsabilidad: Estado reactivo centralizado de la aplicación.
 */
const state = {
    rootPitchClass: 0,
    scaleKey: 'major',
    extensionType: '9th',
    baseOctave: 4,
    bpm: 118,
    isPlaying: false,
    isLooping: true,
    selectedSeqIndex: 0,
    currentPlayIndex: -1,
    currentBeatInChord: 0,
    paletteChords: [],
    borrowedChords: [],
    sequence: [],
    synth: {
        patchId: 'nina_glass_pluck',
        volume: 0.85,
        bell: 0.72,
        tremolo: 0.35,
        release: 1.6,
        strumMs: 22,
        crystal: 0.75
    },
    dragState: {
        isDragging: false,
        startMidi: null,
        currentMidi: null
    }
};
