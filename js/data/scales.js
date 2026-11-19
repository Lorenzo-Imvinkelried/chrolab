/**
 * Responsabilidad: Catálogo estático de escalas musicales y sus intervalos en semitonos.
 */
const SCALES = {
    major: {
        name: 'Mayor (Jónica — Pop / EDM Luminoso)',
        intervals: [0, 2, 4, 5, 7, 9, 11]
    },
    lydian: {
        name: 'Lidia (Ninajirachi / Soñadora / #11)',
        intervals: [0, 2, 4, 6, 7, 9, 11]
    },
    natural_minor: {
        name: 'Menor Natural (Eólica — Melódica / Club)',
        intervals: [0, 2, 3, 5, 7, 8, 10]
    },
    dorian: {
        name: 'Dórica (UK Garage / House / Neo-Soul)',
        intervals: [0, 2, 3, 5, 7, 9, 10]
    },
    mixolydian: {
        name: 'Mixolidia (Eufórica / Festival / Electro)',
        intervals: [0, 2, 4, 5, 7, 9, 10]
    },
    harmonic_minor: {
        name: 'Menor Armónica (Dramática / Trap / Oscura)',
        intervals: [0, 2, 3, 5, 7, 8, 11]
    },
    melodic_minor: {
        name: 'Menor Melódica (Jazz / Cine Moderno)',
        intervals: [0, 2, 3, 5, 7, 9, 11]
    },
    phrygian: {
        name: 'Frigia (Bass House / Techno / Flamenco)',
        intervals: [0, 1, 3, 5, 7, 8, 10]
    },
    phrygian_dominant: {
        name: 'Frigia Dominante (Exótica / Festival)',
        intervals: [0, 1, 4, 5, 7, 8, 10]
    },
    pentatonic_major: {
        name: 'Pentatónica Mayor (Cristalina / Abierta)',
        intervals: [0, 2, 4, 7, 9]
    },
    pentatonic_minor: {
        name: 'Pentatónica Menor (Lo-Fi / Directa)',
        intervals: [0, 3, 5, 7, 10]
    },
    blues: {
        name: 'Escala de Blues (Soul / Carácter)',
        intervals: [0, 3, 5, 6, 7, 10]
    },
    hirajoshi: {
        name: 'Hirajoshi (Japonesa / Kawaii / Plucks)',
        intervals: [0, 2, 3, 7, 8]
    }
};
