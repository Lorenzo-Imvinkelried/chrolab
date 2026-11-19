/**
 * Responsabilidad: Generación de acordes diatónicos de la escala, préstamos modales y comprobación de pertenencia a la escala.
 */
function getScalePitchClasses(rootPc, scaleKey) {
    const scale = SCALES[scaleKey] || SCALES.major;
    return scale.intervals.map(semi => (rootPc + semi) % 12);
}

/**
 * Comprueba si una nota candidata produce un choque duro de semitono (1 st) o novena menor (13 / 25 st)
 * contra cualquiera de las notas ya presentes en el acorde.
 */
function hasHarmonicClash(candidateMidi, existingNotes) {
    return existingNotes.some(n => {
        const diff = Math.abs(candidateMidi - n);
        return diff === 1 || diff === 13 || diff === 25;
    });
}

/**
 * Selecciona la primera nota candidata que no produzca choque de 1, 13 o 25 semitonos ni duplicados.
 */
function pickConsonantNote(candidates, existingNotes) {
    for (const cand of candidates) {
        if (!existingNotes.includes(cand) && !hasHarmonicClash(cand, existingNotes)) {
            return cand;
        }
    }
    return null;
}

function buildScaleChord(rootPc, scaleKey, degreeIdx, extensionType, baseOctave) {
    const scale = SCALES[scaleKey] || SCALES.major;
    const intervals = scale.intervals;
    const len = intervals.length;
    const baseMidiRoot = (baseOctave + 1) * 12 + rootPc;

    function getDegreeMidi(degIndex) {
        const octaveShift = Math.floor(degIndex / len);
        const idxInScale = ((degIndex % len) + len) % len;
        return baseMidiRoot + intervals[idxInScale] + octaveShift * 12;
    }

    const chordRootMidi = getDegreeMidi(degreeIdx);
    let notes = [];

    if (extensionType === 'power') {
        notes = [chordRootMidi - 12, chordRootMidi, chordRootMidi + 7, chordRootMidi + 12];
    } else if (extensionType === 'sus2') {
        notes = [chordRootMidi - 12, chordRootMidi, chordRootMidi + 2, chordRootMidi + 7, chordRootMidi + 12];
    } else if (extensionType === 'sus4') {
        notes = [chordRootMidi - 12, chordRootMidi, chordRootMidi + 5, chordRootMidi + 7, chordRootMidi + 12];
    } else if (extensionType === 'add9') {
        const thirdMidi = getDegreeMidi(degreeIdx + 2);
        const fifthMidi = getDegreeMidi(degreeIdx + 4);
        notes = [chordRootMidi - 12, chordRootMidi, thirdMidi, fifthMidi];
        const ext = pickConsonantNote([
            getDegreeMidi(degreeIdx + 8),
            getDegreeMidi(degreeIdx + 10),
            getDegreeMidi(degreeIdx + 9),
            chordRootMidi + 14,
            chordRootMidi + 12
        ], notes);
        if (ext !== null) notes.push(ext);
    } else if (len >= 7) {
        notes = [
            getDegreeMidi(degreeIdx),
            getDegreeMidi(degreeIdx + 2),
            getDegreeMidi(degreeIdx + 4)
        ];
        if (extensionType === '7th' || extensionType === '9th') {
            const seventhCand = pickConsonantNote([
                getDegreeMidi(degreeIdx + 6),
                getDegreeMidi(degreeIdx + 5),
                chordRootMidi + 10
            ], notes);
            if (seventhCand !== null) notes.push(seventhCand);
        }
        if (extensionType === '9th') {
            notes.unshift(chordRootMidi - 12);
            const ninthCand = pickConsonantNote([
                getDegreeMidi(degreeIdx + 8),
                getDegreeMidi(degreeIdx + 10),
                getDegreeMidi(degreeIdx + 9),
                chordRootMidi + 14,
                chordRootMidi + 12
            ], notes);
            if (ninthCand !== null) notes.push(ninthCand);
        }
    } else {
        // Escalas pentatónicas, blues o hirajoshi (5-6 notas)
        notes = [chordRootMidi];
        const stepCandidates = [2, 3, 4, 5, 6, 7, 8];
        const targetCount = extensionType === 'triad' ? 3 : 4;

        for (const step of stepCandidates) {
            if (notes.length >= targetCount) break;
            const cand = getDegreeMidi(degreeIdx + step);
            if (!notes.includes(cand) && !hasHarmonicClash(cand, notes)) {
                notes.push(cand);
            }
        }

        if (extensionType === '9th') {
            notes.unshift(chordRootMidi - 12);
            const extCand = pickConsonantNote([
                getDegreeMidi(degreeIdx + 6),
                getDegreeMidi(degreeIdx + 7),
                chordRootMidi + 14,
                chordRootMidi + 12
            ], notes);
            if (extCand !== null) notes.push(extCand);
        }
    }

    notes = Array.from(new Set(notes)).sort((a, b) => a - b);

    const analysis = analyzeChordNotes(notes, rootPc);
    return {
        degreeIndex: degreeIdx,
        roman: analysis.roman,
        name: analysis.name,
        qualityDesc: analysis.qualityDesc,
        notes: [...notes],
        originalNotes: [...notes],
        beats: 4,
        isCustom: false,
        isBorrowed: false
    };
}

function buildBorrowedChords(rootPc, baseOctave) {
    const baseMidi = (baseOctave + 1) * 12 + rootPc;

    return BORROWED_CHORD_SPECS.map(sp => {
        const notes = sp.offsets.map(o => baseMidi + o).sort((a, b) => a - b);
        const analysis = analyzeChordNotes(notes, rootPc);
        return {
            roman: sp.tag.split(' ')[0],
            name: analysis.name,
            qualityDesc: sp.flavor,
            notes: [...notes],
            originalNotes: [...notes],
            beats: 4,
            isCustom: false,
            isBorrowed: true
        };
    });
}

function hasOutOfScaleNotes(midiNotes) {
    const scalePcs = new Set(getScalePitchClasses(state.rootPitchClass, state.scaleKey));
    return midiNotes.some(m => !scalePcs.has(((m % 12) + 12) % 12));
}

function isHighPedalNote(midi) {
    const pc = ((midi % 12) + 12) % 12;
    const fifthPc = (state.rootPitchClass + 7) % 12;
    return midi >= (state.baseOctave + 2) * 12 && (pc === state.rootPitchClass || pc === fifthPc);
}
