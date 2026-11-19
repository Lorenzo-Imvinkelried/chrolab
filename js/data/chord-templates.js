/**
 * Responsabilidad: Plantillas de reconocimiento de acordes, grados romanos, intervalos y préstamos modales.
 */
const CHORD_TEMPLATES = [
    { req: [0, 4, 7], opt: [], suffix: '', quality: 'major', desc: 'Mayor' },
    { req: [0, 3, 7], opt: [], suffix: 'm', quality: 'minor', desc: 'Menor' },
    { req: [0, 3, 6], opt: [], suffix: 'dim', quality: 'dim', desc: 'Disminuido' },
    { req: [0, 4, 8], opt: [], suffix: 'aug', quality: 'aug', desc: 'Aumentado' },
    { req: [0, 2, 7], opt: [], suffix: 'sus2', quality: 'sus', desc: 'Suspendido 2' },
    { req: [0, 5, 7], opt: [], suffix: 'sus4', quality: 'sus', desc: 'Suspendido 4' },
    { req: [0, 7], opt: [], suffix: '5', quality: 'power', desc: 'Quinta (Power)' },
    { req: [0, 4, 7, 11], opt: [], suffix: 'maj7', quality: 'major', desc: 'Séptima Mayor' },
    { req: [0, 3, 7, 10], opt: [], suffix: 'm7', quality: 'minor', desc: 'Menor 7ma' },
    { req: [0, 4, 7, 10], opt: [], suffix: '7', quality: 'dom', desc: 'Dominante 7ma' },
    { req: [0, 5, 7, 10], opt: [2], suffix: '7sus4', quality: 'sus', desc: 'Séptima Sus4' },
    { req: [0, 3, 6, 10], opt: [], suffix: 'm7b5', quality: 'dim', desc: 'Semidisminuido' },
    { req: [0, 3, 6, 9], opt: [], suffix: 'dim7', quality: 'dim', desc: 'Disminuido 7ma' },
    { req: [0, 3, 7, 11], opt: [], suffix: 'm(maj7)', quality: 'minor', desc: 'Menor Maj7' },
    { req: [0, 4, 7, 9], opt: [], suffix: '6', quality: 'major', desc: 'Sexta Mayor' },
    { req: [0, 3, 7, 9], opt: [], suffix: 'm6', quality: 'minor', desc: 'Menor Sexta' },
    { req: [0, 4, 7, 9, 2], opt: [], suffix: '6/9', quality: 'major', desc: 'Sexta y Novena' },
    { req: [0, 4, 7, 2], opt: [], suffix: 'add9', quality: 'major', desc: 'Mayor add9' },
    { req: [0, 3, 7, 2], opt: [], suffix: 'm(add9)', quality: 'minor', desc: 'Menor add9' },
    { req: [0, 4, 11, 2], opt: [7], suffix: 'maj9', quality: 'major', desc: 'Novena Mayor' },
    { req: [0, 3, 10, 2], opt: [7], suffix: 'm9', quality: 'minor', desc: 'Menor Novena' },
    { req: [0, 3, 10, 5], opt: [7, 2], suffix: 'm11', quality: 'minor', desc: 'Menor Onceava' },
    { req: [0, 4, 10, 2], opt: [7], suffix: '9', quality: 'dom', desc: 'Novena Dominante' },
    { req: [0, 4, 10, 9], opt: [7, 2], suffix: '13', quality: 'dom', desc: 'Treceava Dominante' },
    { req: [0, 4, 11, 6], opt: [7, 2], suffix: 'maj7#11', quality: 'major', desc: 'Maj7 #11 (Lidio)' },
    { req: [0, 4, 10, 3], opt: [7], suffix: '7#9', quality: 'dom', desc: 'Dominante #9' },
    { req: [0, 4, 10, 1], opt: [7, 8], suffix: '7b9', quality: 'dom', desc: 'Dominante b9' }
];

const ROMAN_MAP = {
    0: 'I', 1: 'bII', 2: 'II', 3: 'bIII', 4: 'III', 5: 'IV',
    6: '#IV', 7: 'V', 8: 'bVI', 9: 'VI', 10: 'bVII', 11: 'VII'
};

const INTERVAL_LABELS = {
    0: 'Tónica (1)',
    1: 'b9 / 2da m',
    2: '9na / 2da M',
    3: '3ra Menor',
    4: '3ra Mayor',
    5: '11na / 4ta',
    6: '#11 / b5',
    7: '5ta Justa',
    8: 'b13 / #5',
    9: '13na / 6ta',
    10: '7ma Dom/m',
    11: '7ma Mayor'
};

const BORROWED_CHORD_SPECS = [
    {
        tag: 'ivm9 (Subdom. Menor)',
        flavor: 'Nostalgia Ninajirachi / Porter',
        offsets: [-7, 5, 8, 12, 15, 19]
    },
    {
        tag: 'bVImaj9 (Épico Flotante)',
        flavor: 'Intercambio Eólico Luminoso',
        offsets: [-4, 3, 7, 10, 12, 19]
    },
    {
        tag: 'bVII9 (Backdoor / EDM)',
        flavor: 'Cadencia Mágica Subiente',
        offsets: [-2, 5, 8, 12, 14, 19]
    },
    {
        tag: 'III7 (Dom. Secundario)',
        flavor: 'Tirón Emotivo hacia el 6to',
        offsets: [-8, 4, 8, 11, 14, 16]
    },
    {
        tag: 'bIImaj7#11 (Napolitano)',
        flavor: 'Color Lidio Oscuro / Cristal',
        offsets: [-11, 1, 5, 8, 12, 19]
    },
    {
        tag: 'Iadd9/3 (Slash Brillante)',
        flavor: 'Bajo en 3ra + Pedal Agudo',
        offsets: [-8, 0, 4, 7, 14, 19]
    }
];
