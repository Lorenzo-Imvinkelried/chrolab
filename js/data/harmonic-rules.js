/**
 * Responsabilidad: Catálogo estático de transiciones armónicas funcionales (Markov) y acordes de escalas compartidas.
 */
const HARMONIC_TRANSITIONS = {
    major: {
        starters: [
            { degree: 3, weight: 5 }, // IV (Apertura emotiva EDM / Ninajirachi / Pop)
            { degree: 0, weight: 4 }, // I  (Tónica luminosa)
            { degree: 5, weight: 4 }, // vi (Relativo menor melancólico)
            { degree: 1, weight: 2 }  // ii (Arranque Neo-Soul / Jazz)
        ],
        nextMap: {
            0: [
                { degree: 3, weight: 5 },
                { degree: 4, weight: 4 },
                { degree: 5, weight: 4 },
                { degree: 2, weight: 3 },
                { degree: 1, weight: 2 }
            ],
            1: [
                { degree: 4, weight: 6 },
                { degree: 5, weight: 3 },
                { degree: 3, weight: 2 },
                { degree: 0, weight: 2 }
            ],
            2: [
                { degree: 5, weight: 5 },
                { degree: 3, weight: 5 },
                { degree: 1, weight: 3 },
                { degree: 4, weight: 2 }
            ],
            3: [
                { degree: 4, weight: 5 },
                { degree: 0, weight: 4 },
                { degree: 5, weight: 4 },
                { degree: 2, weight: 3 },
                { degree: 1, weight: 2 }
            ],
            4: [
                { degree: 5, weight: 5 },
                { degree: 0, weight: 4 },
                { degree: 3, weight: 3 },
                { degree: 2, weight: 2 }
            ],
            5: [
                { degree: 3, weight: 5 },
                { degree: 1, weight: 4 },
                { degree: 4, weight: 3 },
                { degree: 2, weight: 2 },
                { degree: 0, weight: 2 }
            ],
            6: [
                { degree: 0, weight: 5 },
                { degree: 5, weight: 4 },
                { degree: 2, weight: 3 }
            ]
        },
        turnarounds: [4, 3, 1, 2]
    },
    minor: {
        starters: [
            { degree: 0, weight: 5 }, // i    (Tónica menor)
            { degree: 5, weight: 4 }, // bVI  (Apertura épica / Melodic Bass)
            { degree: 3, weight: 3 }, // iv   (Subdominante profunda)
            { degree: 6, weight: 2 }  // bVII (Arranque modal)
        ],
        nextMap: {
            0: [
                { degree: 5, weight: 5 },
                { degree: 3, weight: 4 },
                { degree: 6, weight: 4 },
                { degree: 2, weight: 3 },
                { degree: 4, weight: 2 }
            ],
            1: [
                { degree: 4, weight: 5 },
                { degree: 0, weight: 3 },
                { degree: 5, weight: 3 }
            ],
            2: [
                { degree: 5, weight: 4 },
                { degree: 3, weight: 4 },
                { degree: 6, weight: 4 },
                { degree: 0, weight: 2 }
            ],
            3: [
                { degree: 6, weight: 5 },
                { degree: 4, weight: 4 },
                { degree: 5, weight: 3 },
                { degree: 0, weight: 3 }
            ],
            4: [
                { degree: 5, weight: 5 },
                { degree: 0, weight: 4 },
                { degree: 3, weight: 3 }
            ],
            5: [
                { degree: 3, weight: 4 },
                { degree: 6, weight: 5 },
                { degree: 4, weight: 3 },
                { degree: 2, weight: 2 }
            ],
            6: [
                { degree: 0, weight: 4 },
                { degree: 5, weight: 4 },
                { degree: 3, weight: 3 },
                { degree: 2, weight: 2 }
            ]
        },
        turnarounds: [4, 6, 3, 5]
    }
};

const SHARED_SCALE_POOL = [
    {
        id: 'ivm9_aeolian',
        roman: 'ivm9',
        originScale: 'Eólica (Menor Paralela)',
        forMode: 'major',
        preferredPos: 'turnaround',
        resolvesTo: [0, 4, 5],
        offsets: [-7, 5, 8, 12, 15, 19]
    },
    {
        id: 'bVImaj9_aeolian',
        roman: 'bVImaj9',
        originScale: 'Eólica (Menor Paralela)',
        forMode: 'major',
        preferredPos: 'mid',
        resolvesTo: [4, 3, 0],
        offsets: [-4, 3, 7, 10, 12, 19]
    },
    {
        id: 'bVII9_mixolydian',
        roman: 'bVII9',
        originScale: 'Mixolidia / Backdoor',
        forMode: 'major',
        preferredPos: 'turnaround',
        resolvesTo: [0, 3, 5],
        offsets: [-2, 5, 8, 12, 14, 19]
    },
    {
        id: 'bVIImaj9_dorian',
        roman: 'bVIImaj9',
        originScale: 'Dórica / Mixolidia',
        forMode: 'major',
        preferredPos: 'turnaround',
        resolvesTo: [3, 0, 4],
        offsets: [-2, 5, 9, 12, 14, 19]
    },
    {
        id: 'III7_secdom',
        roman: 'III7',
        originScale: 'Dominante Secundario (V/vi)',
        forMode: 'both',
        preferredPos: 'mid',
        resolvesTo: [5, 3],
        offsets: [-8, 4, 8, 11, 14, 16]
    },
    {
        id: 'VI7sharp9_secdom',
        roman: 'VI7#9',
        originScale: 'Dominante Secundario (V/ii)',
        forMode: 'both',
        preferredPos: 'mid',
        resolvesTo: [1, 3],
        offsets: [-3, 1, 7, 12, 16, 19]
    },
    {
        id: 'II9_lydian',
        roman: 'II9',
        originScale: 'Lidia (Brillo #11)',
        forMode: 'major',
        preferredPos: 'mid',
        resolvesTo: [3, 4],
        offsets: [-10, 2, 6, 9, 12, 16]
    },
    {
        id: 'I9sus4_mixolydian',
        roman: 'I9sus4',
        originScale: 'Mixolidia (Puente a IV)',
        forMode: 'major',
        preferredPos: 'mid',
        resolvesTo: [3],
        offsets: [-12, 0, 5, 7, 10, 14]
    },
    {
        id: 'IVmaj9_dorian',
        roman: 'IVmaj9',
        originScale: 'Dórica (Subdominante Luminosa)',
        forMode: 'minor',
        preferredPos: 'mid',
        resolvesTo: [0, 5, 6],
        offsets: [-7, 5, 9, 12, 16, 19]
    },
    {
        id: 'V7sharp9_harmonic',
        roman: 'V7#9',
        originScale: 'Menor Armónica',
        forMode: 'minor',
        preferredPos: 'turnaround',
        resolvesTo: [0, 5],
        offsets: [-5, -1, 5, 10, 15, 19]
    },
    {
        id: 'bIImaj7sharp11_phrygian',
        roman: 'bIImaj7#11',
        originScale: 'Frigia (Napolitano)',
        forMode: 'both',
        preferredPos: 'turnaround',
        resolvesTo: [0, 4],
        offsets: [-11, 1, 5, 8, 12, 19]
    },
    {
        id: 'Imaj9_picardy',
        roman: 'Imaj9',
        originScale: 'Jónica (Tercera de Picarda)',
        forMode: 'minor',
        preferredPos: 'turnaround',
        resolvesTo: [3, 5, 0],
        offsets: [-12, 0, 4, 7, 11, 14]
    }
];
