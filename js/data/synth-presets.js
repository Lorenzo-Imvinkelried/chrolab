/**
 * Responsabilidad: Catálogo estático de patches de sintetizador profesionales (Serum Supersaw, Glass Pluck, Deadmau5 Pluck, Warm Pad y Studio Rhodes).
 */
const SYNTH_PATCHES = {
    edm_supersaw: {
        id: 'edm_supersaw',
        name: '🌈 Future Bass / EDM Supersaw (Serum 7x)',
        badge: 'Stereo Unison + Swell',
        defaults: {
            volume: 82,
            bell: 65,      // En Supersaw controla Brillo / Apertura de Filtro (Cutoff)
            tremolo: 40,   // En Supersaw controla Ancho Unison / Detune
            release: 18,   // 1.8s
            strum: 18,
            crystal: 70    // Reverb Hall Estéreo + Aire
        }
    },
    nina_glass_pluck: {
        id: 'nina_glass_pluck',
        name: '💎 Ninajirachi / Porter Glass Pluck',
        badge: 'Cristal + Pluck Estéreo',
        defaults: {
            volume: 85,
            bell: 72,
            tremolo: 35,
            release: 16,
            strum: 22,
            crystal: 75
        }
    },
    prog_house_pluck: {
        id: 'prog_house_pluck',
        name: '🔥 Progressive House Pluck (Deadmau5 / Prydz)',
        badge: 'Filtro Analógico + Delay',
        defaults: {
            volume: 85,
            bell: 58,
            tremolo: 30,
            release: 12,
            strum: 8,
            crystal: 65
        }
    },
    ukg_warm_pad: {
        id: 'ukg_warm_pad',
        name: '🌊 Fred again.. / UKG Warm Analog Pad',
        badge: 'Lush Pad + Reese Bass',
        defaults: {
            volume: 84,
            bell: 45,
            tremolo: 45,
            release: 24,
            strum: 20,
            crystal: 70
        }
    },
    studio_rhodes: {
        id: 'studio_rhodes',
        name: '🎹 Studio Rhodes MKII + Shimmer Hall',
        badge: 'Neo-Soul / Keys',
        defaults: {
            volume: 82,
            bell: 50,
            tremolo: 35,
            release: 16,
            strum: 25,
            crystal: 55
        }
    }
};
