/**
 * Responsabilidad: Registro de listeners globales de teclado (atajos de reproducción y grados) y ratón.
 */
function setupGlobalEvents() {
    window.addEventListener('mouseup', handlePianoRollMouseUp);

    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        } else if (e.key >= '1' && e.key <= '7') {
            const idx = parseInt(e.key, 10) - 1;
            if (state.paletteChords[idx]) {
                previewPaletteChord(idx);
            }
        }
    });

    setTimeout(() => {
        const container = document.getElementById('pianoRollScrollContainer');
        if (container) {
            container.scrollTop = 360;
        }
    }, 100);
}
