/**
 * Responsabilidad: Análisis armónico e identificación de cifrado, grados romanos e intervalos de notas MIDI.
 */
function analyzeChordNotes(midiNotes, scaleRootPc = state.rootPitchClass) {
    if (!midiNotes || midiNotes.length === 0) {
        return { name: 'Silencio', roman: '-', qualityDesc: 'Sin notas' };
    }

    const sorted = [...midiNotes].sort((a, b) => a - b);
    const bassPc = ((sorted[0] % 12) + 12) % 12;
    const uniquePcs = Array.from(new Set(sorted.map(m => ((m % 12) + 12) % 12)));

    let bestFit = {
        rootPc: bassPc,
        suffix: '',
        quality: 'major',
        qualityDesc: 'Personalizado',
        score: -999
    };

    for (const candidateRoot of uniquePcs) {
        const intervals = uniquePcs.map(pc => (pc - candidateRoot + 12) % 12);
        for (const tpl of CHORD_TEMPLATES) {
            const hasAllReq = tpl.req.every(r => intervals.includes(r));
            if (!hasAllReq) continue;

            const extraNotes = intervals.filter(i => !tpl.req.includes(i) && !tpl.opt.includes(i));
            let score = tpl.req.length * 12 - extraNotes.length * 10;
            if (candidateRoot === bassPc) score += 8;

            if (score > bestFit.score) {
                bestFit = {
                    rootPc: candidateRoot,
                    suffix: tpl.suffix,
                    quality: tpl.quality,
                    qualityDesc: tpl.desc,
                    score
                };
            }
        }
    }

    let chordName = `${NOTE_NAMES[bestFit.rootPc]}${bestFit.suffix}`;
    if (bestFit.rootPc !== bassPc && uniquePcs.length >= 3) {
        chordName += `/${NOTE_NAMES[bassPc]}`;
    }

    const relSemi = (bestFit.rootPc - scaleRootPc + 12) % 12;
    let roman = ROMAN_MAP[relSemi] || 'I';
    if (bestFit.quality === 'minor') roman = roman.toLowerCase();
    if (bestFit.quality === 'dim') roman = roman.toLowerCase() + '°';
    if (bestFit.quality === 'aug') roman = roman + '+';

    return {
        name: chordName,
        roman,
        qualityDesc: bestFit.qualityDesc
    };
}

function getNoteIntervalLabel(midi, chordRootPc) {
    const pc = ((midi % 12) + 12) % 12;
    const semi = (pc - chordRootPc + 12) % 12;
    return INTERVAL_LABELS[semi] || '';
}

function refreshChordMetadata(chord) {
    chord.notes = Array.from(new Set(chord.notes)).sort((a, b) => a - b);
    const info = analyzeChordNotes(chord.notes, state.rootPitchClass);
    chord.name = info.name;
    chord.roman = info.roman;
    chord.qualityDesc = info.qualityDesc;

    const sameLength = chord.notes.length === chord.originalNotes.length;
    const isIdentical = sameLength && chord.notes.every((v, i) => v === chord.originalNotes[i]);
    chord.isCustom = !isIdentical;
}
