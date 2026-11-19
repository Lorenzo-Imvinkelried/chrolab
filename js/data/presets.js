/**
 * Responsabilidad: Catálogo estático de progresiones predefinidas (EDM, Ninajirachi y Rompe-Escalas).
 * Todos los voicings están diseñados sin choques de semitono (b9 / 2da menor) para sonar limpios en cualquier VST.
 */
const PROGRESSION_PRESETS = [
    {
        id: 'nina_glassy',
        name: '✨ Ninajirachi Glassy',
        desc: 'IVmaj9 – V6/9 – iiim11 – ivm9 (Pedal + Préstamo)',
        badge: 'EDM / Pedal',
        customChords: [
            { offsets: [-7, 5, 9, 12, 16, 19], label: 'IVmaj9 (Pedal)' },
            { offsets: [-5, 4, 7, 11, 14, 19], label: 'V6/9 (Pedal)' },
            { offsets: [-8, 4, 7, 11, 14, 19], label: 'iiim7 (Pedal)' },
            { offsets: [-7, 5, 8, 12, 15, 19], label: 'ivm9 (Préstamo)' }
        ]
    },
    {
        id: 'nina_euphoria',
        name: '🌸 Ninajirachi Euphoria',
        desc: 'Iadd9/3 – IVmaj9 – vim9 – bVIImaj9',
        badge: 'Slash + Fuera',
        customChords: [
            { offsets: [-8, 0, 4, 7, 14, 19], label: 'Iadd9/3ra' },
            { offsets: [-7, 5, 9, 12, 16, 19], label: 'IVmaj9' },
            { offsets: [-3, 0, 4, 7, 11, 19], label: 'vim9' },
            { offsets: [-2, 5, 9, 12, 14, 19], label: 'bVIImaj9 (Fuera)' }
        ]
    },
    {
        id: 'future_bass',
        name: '🌈 Future Bass / Kawaii',
        desc: 'IVmaj9 – V9sus4 – III7 – vim9',
        badge: 'Porter / Anime',
        customChords: [
            { offsets: [-7, 5, 9, 12, 16, 19], label: 'IVmaj9' },
            { offsets: [-5, 5, 9, 12, 14, 19], label: 'V9sus4' },
            { offsets: [-8, 4, 8, 11, 14, 16], label: 'III7 (Dom. Sec.)' },
            { offsets: [-3, 0, 4, 7, 11, 16], label: 'vim9' }
        ]
    },
    {
        id: 'hyperpop',
        name: '⚡ Hyperpop / PC Music',
        desc: 'bVImaj9 – bVII6/9 – vm11 – Imaj9 (Picarda)',
        badge: 'Rompe-Escala',
        customChords: [
            { offsets: [-4, 3, 7, 10, 12, 19], label: 'bVImaj9' },
            { offsets: [-2, 2, 5, 7, 12, 17], label: 'bVII6/9' },
            { offsets: [-5, 2, 5, 10, 12, 17], label: 'vm11' },
            { offsets: [-12, 0, 4, 7, 11, 14], label: 'Imaj9 (Picarda)' }
        ]
    },
    {
        id: 'edm_festival',
        name: '🔥 EDM Prog / Festival',
        desc: 'vim9 – IVadd9 – Iadd9/3 – V7sus4',
        badge: 'Anthem',
        customChords: [
            { offsets: [-3, 0, 4, 7, 11, 19], label: 'vim9' },
            { offsets: [-7, 0, 5, 9, 12, 19], label: 'IVadd9' },
            { offsets: [-8, 0, 4, 7, 14, 19], label: 'Iadd9/3ra' },
            { offsets: [-5, 2, 5, 7, 12, 19], label: 'V7sus4' }
        ]
    },
    {
        id: 'uk_garage',
        name: '🎧 UK Garage / Melodic Bass',
        desc: 'im9 – bVImaj9 – ivm11 – V7alt',
        badge: 'Club / Lush',
        customChords: [
            { offsets: [-12, 0, 3, 7, 10, 14], label: 'im9' },
            { offsets: [-4, 3, 7, 10, 12, 15], label: 'bVImaj9' },
            { offsets: [-7, 0, 5, 8, 10, 15], label: 'ivm11' },
            { offsets: [-5, -1, 5, 10, 15, 19], label: 'V7#9' }
        ]
    },
    {
        id: 'neosoul',
        name: '🎹 Neo-Soul / Rhodes',
        desc: 'iim9 – V13 – Imaj9 – VI7#9',
        badge: 'Groove',
        customChords: [
            { offsets: [-10, 2, 5, 9, 12, 16], label: 'iim9' },
            { offsets: [-5, 5, 9, 11, 14, 16], label: 'V13' },
            { offsets: [-12, 0, 4, 7, 11, 14], label: 'Imaj9' },
            { offsets: [-3, 1, 7, 12, 16], label: 'VI7#9 (Fuera)' }
        ]
    },
    {
        id: 'dark_trap',
        name: '🌑 Trap Oscuro / Phonk',
        desc: 'im(add9) – bIImaj7#11 – im9 – vii°7',
        badge: 'Tensión',
        customChords: [
            { offsets: [-12, 0, 3, 7, 14, 19], label: 'im(add9)' },
            { offsets: [-11, 1, 5, 8, 12, 19], label: 'bIImaj7#11' },
            { offsets: [-12, 0, 3, 7, 10, 14], label: 'im9' },
            { offsets: [-1, 2, 5, 8, 11, 14], label: 'vii°7' }
        ]
    },
    {
        id: 'random',
        name: '🎲 Sorpresa Rompe-Escala',
        desc: 'Mezcla acordes Lush + Préstamos',
        badge: 'Experimental',
        degrees: 'random'
    }
];
