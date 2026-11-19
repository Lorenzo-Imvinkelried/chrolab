/**
 * Responsabilidad: Formateo y copia en texto plano del cifrado de la progresión al portapapeles.
 */
function copyProgressionText() {
    if (state.sequence.length === 0) return;
    const summary = state.sequence
        .map((c, idx) => `${idx + 1}. ${c.name} (${c.roman}) [${c.notes.map(midiToNoteName).join('-')}]`)
        .join('  |  ');

    const textArea = document.createElement('textarea');
    textArea.value = summary;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Progresión y notas copiadas al portapapeles');
}
