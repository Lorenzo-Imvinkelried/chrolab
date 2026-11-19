/**
 * Responsabilidad: Motor algorítmico de generación inteligente y humanizada de progresiones (Markov + Escalas Compartidas + Voice Leading).
 */
let lastGeneratedSignature = '';

function pickWeightedRandom(items) {
    const totalWeight = items.reduce((acc, it) => acc + (it.weight || 1), 0);
    let r = Math.random() * totalWeight;
    for (const item of items) {
        r -= (item.weight || 1);
        if (r <= 0) return item;
    }
    return items[items.length - 1];
}

function isMinorFamilyScale(scaleKey) {
    const intervals = (SCALES[scaleKey] || SCALES.major).intervals;
    return intervals.includes(3) && !intervals.includes(4);
}

function sanitizeVoicingNotes(midiNotes) {
    const sorted = Array.from(new Set(midiNotes)).sort((a, b) => a - b);
    if (sorted.length <= 1) return sorted;

    const clean = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
        let cand = sorted[i];
        if (hasHarmonicClash(cand, clean)) {
            const shiftedUp = cand + 12;
            const shiftedWhole = cand + 2;
            if (!clean.includes(shiftedUp) && !hasHarmonicClash(shiftedUp, clean) && shiftedUp <= 84) {
                cand = shiftedUp;
            } else if (!clean.includes(shiftedWhole) && !hasHarmonicClash(shiftedWhole, clean)) {
                cand = shiftedWhole;
            } else {
                continue;
            }
        }
        clean.push(cand);
    }
    return Array.from(new Set(clean)).sort((a, b) => a - b);
}

function buildSharedChordInstance(spec, rootPc, baseOctave) {
    const baseMidi = (baseOctave + 1) * 12 + rootPc;
    const rawNotes = spec.offsets.map(o => baseMidi + o).sort((a, b) => a - b);
    const notes = sanitizeVoicingNotes(rawNotes);
    const analysis = analyzeChordNotes(notes, rootPc);

    return {
        roman: `${spec.roman}`,
        name: analysis.name,
        qualityDesc: `Escala ${spec.originScale}`,
        originScale: spec.originScale,
        notes: [...notes],
        originalNotes: [...notes],
        beats: 4,
        isCustom: false,
        isBorrowed: true
    };
}

function applyStyleAndVoiceLeading(chords, voicingStyle, rootPc, baseOctave) {
    if (chords.length === 0) return chords;

    // 1. Si el estilo es Lush o Pedal o Neo-Soul, enriquece acordes simples manteniendo préstamos intactos
    if (voicingStyle === 'lush_voice_leading' || voicingStyle === 'pedal_crystal') {
        chords.forEach(ch => {
            if (!ch.isBorrowed && ch.notes.length < 5) {
                ch.notes = buildLushVoicingFromNotes(ch.notes);
            }
        });
    }

    // 2. Si el estilo es Cinemático / Slash Chords, aplica inversión de 3ra en el bajo en acordes de enlace
    if (voicingStyle === 'cinematic_slash') {
        for (let i = 0; i < chords.length; i++) {
            const shouldSlash = (i === 1 || (i === chords.length - 1 && Math.random() > 0.45));
            if (shouldSlash && chords[i].notes.length >= 3) {
                const sorted = [...chords[i].notes].sort((a, b) => a - b);
                const chordRootPc = ((sorted[0] % 12) + 12) % 12;
                const pcs = new Set(sorted.map(m => ((m % 12) + 12) % 12));
                const thirdSemi = pcs.has((chordRootPc + 3) % 12) ? 3 : 4;
                const slashBass = Math.max(38, baseOctave * 12 + ((chordRootPc + thirdSemi) % 12));
                if (!hasHarmonicClash(slashBass, sorted.slice(1))) {
                    sorted[0] = slashBass;
                    chords[i].notes = sanitizeVoicingNotes(sorted);
                }
            }
        }
    }

    // 3. Conducción de voces humana (Voice Leading suave respecto al centro gravitacional del primer acorde)
    const targetCenter = voicingStyle === 'neosoul_close'
        ? (baseOctave + 1) * 12 + rootPc + 5
        : chords[0].notes.slice(1).reduce((a, b) => a + b, 0) / Math.max(1, chords[0].notes.length - 1);

    for (let i = 0; i < chords.length; i++) {
        if (i === 0 && voicingStyle !== 'neosoul_close') continue;
        const chord = chords[i];
        if (chord.notes.length < 2) continue;

        const sorted = [...chord.notes].sort((a, b) => a - b);
        const bass = sorted[0];
        const upper = [];

        for (const m of sorted.slice(1)) {
            let bestMidi = m;
            let bestDist = Math.abs(m - targetCenter);
            for (let shift = -12; shift <= 12; shift += 12) {
                const cand = m + shift;
                if (
                    cand >= bass + 4 &&
                    cand <= 81 &&
                    !upper.includes(cand) &&
                    !hasHarmonicClash(cand, [bass, ...upper]) &&
                    Math.abs(cand - targetCenter) < bestDist
                ) {
                    bestMidi = cand;
                    bestDist = Math.abs(cand - targetCenter);
                }
            }
            upper.push(bestMidi);
        }

        chord.notes = sanitizeVoicingNotes([bass, ...upper]);
    }

    // 4. Si el estilo es Pedal Cristalino, ancla Tónica y 5ta agudas arriba sin choques
    if (voicingStyle === 'pedal_crystal') {
        const highTonic = (baseOctave + 2) * 12 + rootPc;
        const highFifth = highTonic + 7;
        const pedalNotes = [highTonic, highFifth];

        chords.forEach(chord => {
            const filtered = chord.notes.filter(m =>
                m < highTonic - 1 &&
                !hasHarmonicClash(m, pedalNotes)
            );
            filtered.push(highTonic, highFifth);
            chord.notes = sanitizeVoicingNotes(filtered);
        });
    }

    // 5. Recalcula cifrado final de cada acorde
    chords.forEach(chord => {
        chord.originalNotes = [...chord.notes];
        refreshChordMetadata(chord);
        if (chord.originScale) {
            chord.roman = `${chord.roman}`;
        }
    });

    return chords;
}

function applyRhythmPattern(chords, rhythmMode) {
    if (rhythmMode !== 'passing' || chords.length < 3) {
        chords.forEach(c => { c.beats = 4; });
        return;
    }

    // Asigna duraciones humanas: acordes principales de 4 tiempos y acordes de paso/puente de 2 tiempos
    chords.forEach((c, idx) => {
        if (chords.length === 4) {
            c.beats = (idx === 2 || idx === 3) ? 2 : 4;
        } else if (chords.length >= 6) {
            c.beats = (idx % 3 === 1 || idx % 3 === 2) ? 2 : 4;
        } else {
            c.beats = 4;
        }
    });
}

function generateSmartProgression(options = {}) {
    const length = options.length || 4;
    const sharedMode = options.sharedMode || 'balanced';
    const voicingStyle = options.voicingStyle || 'lush_voice_leading';
    const rhythmMode = options.rhythmMode || 'even';

    const rootPc = state.rootPitchClass;
    const scaleKey = state.scaleKey;
    const baseOctave = state.baseOctave;
    const extType = voicingStyle === 'neosoul_close' ? '9th' : state.extensionType;

    const isMinor = isMinorFamilyScale(scaleKey);
    const modeKey = isMinor ? 'minor' : 'major';
    const grammar = HARMONIC_TRANSITIONS[modeKey];
    const numScaleDegrees = SCALES[scaleKey].intervals.length;

    const eligibleShared = SHARED_SCALE_POOL.filter(
        sp => sp.forMode === 'both' || sp.forMode === modeKey
    );

    let maxAttempts = 8;
    let builtChords = [];
    let usedSharedScales = new Set();

    while (maxAttempts-- > 0) {
        builtChords = [];
        usedSharedScales = new Set();

        // 1. Determina cuántos acordes de escalas compartidas insertar
        let targetSharedCount = 0;
        if (sharedMode === 'subtle') {
            targetSharedCount = 1;
        } else if (sharedMode === 'balanced') {
            targetSharedCount = length >= 6 ? 2 : (Math.random() > 0.35 ? 1 : 2);
        } else if (sharedMode === 'adventurous') {
            targetSharedCount = Math.max(2, Math.floor(length * 0.5));
        }

        // Selecciona índices donde irán los préstamos de escalas compartidas (preferiblemente mitad y turnaround)
        const sharedIndices = new Set();
        if (targetSharedCount > 0 && length >= 2) {
            const candidatePositions = [];
            if (length >= 2) candidatePositions.push({ idx: length - 1, weight: 5 });
            if (length >= 4) candidatePositions.push({ idx: length - 2, weight: 4 }, { idx: 1, weight: 3 });
            if (length >= 6) candidatePositions.push({ idx: 2, weight: 3 }, { idx: 3, weight: 4 });
            if (length >= 8) candidatePositions.push({ idx: 5, weight: 4 });

            let guard = 15;
            while (sharedIndices.size < Math.min(targetSharedCount, candidatePositions.length) && guard-- > 0) {
                const pick = pickWeightedRandom(candidatePositions);
                sharedIndices.add(pick.idx);
            }
        }

        // 2. Construye paso a paso siguiendo gramática funcional y resoluciones dirigidas
        let currentDegree = pickWeightedRandom(grammar.starters).degree % numScaleDegrees;
        const firstDegree = currentDegree;
        let forcedNextDegree = null;

        for (let step = 0; step < length; step++) {
            const isLastStep = step === length - 1;

            if (sharedIndices.has(step) && eligibleShared.length > 0) {
                const posType = isLastStep ? 'turnaround' : 'mid';
                const poolForPos = eligibleShared.filter(sp =>
                    isLastStep ? sp.preferredPos === 'turnaround' : true
                );
                const chosenPool = poolForPos.length > 0 ? poolForPos : eligibleShared;
                const weightedPool = chosenPool.map(sp => ({
                    ...sp,
                    weight: sp.preferredPos === posType ? 4 : 2
                }));

                const pickedSpec = pickWeightedRandom(weightedPool);
                const sharedChord = buildSharedChordInstance(pickedSpec, rootPc, baseOctave);
                builtChords.push(sharedChord);
                usedSharedScales.add(pickedSpec.originScale);

                // Si este acorde compartido tiene resolución dirigida (ej. III7 -> vi), fuerza el siguiente grado
                if (pickedSpec.resolvesTo && pickedSpec.resolvesTo.length > 0) {
                    forcedNextDegree = pickedSpec.resolvesTo[Math.floor(Math.random() * pickedSpec.resolvesTo.length)] % numScaleDegrees;
                }
            } else {
                let degreeToUse = currentDegree;

                if (step === 0) {
                    degreeToUse = firstDegree;
                } else if (forcedNextDegree !== null) {
                    degreeToUse = forcedNextDegree;
                    forcedNextDegree = null;
                } else if (isLastStep) {
                    const turnCandidates = grammar.turnarounds
                        .map(d => d % numScaleDegrees)
                        .filter(d => d !== currentDegree);
                    if (turnCandidates.length > 0) {
                        degreeToUse = turnCandidates[Math.floor(Math.random() * turnCandidates.length)];
                    }
                } else {
                    const transitions = grammar.nextMap[currentDegree % 7] || grammar.starters;
                    const validTransitions = transitions.filter(t => (t.degree % numScaleDegrees) !== currentDegree);
                    const picked = pickWeightedRandom(validTransitions.length > 0 ? validTransitions : transitions);
                    degreeToUse = picked.degree % numScaleDegrees;
                }

                currentDegree = degreeToUse;
                const scaleChord = buildScaleChord(rootPc, scaleKey, degreeToUse, extType, baseOctave);
                builtChords.push(scaleChord);
            }
        }

        const signature = builtChords.map(c => c.name).join('-');
        if (signature !== lastGeneratedSignature) {
            lastGeneratedSignature = signature;
            break;
        }
    }

    applyStyleAndVoiceLeading(builtChords, voicingStyle, rootPc, baseOctave);
    applyRhythmPattern(builtChords, rhythmMode);

    return {
        sequence: builtChords,
        usedSharedScales: Array.from(usedSharedScales)
    };
}
