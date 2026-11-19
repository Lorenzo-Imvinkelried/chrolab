/**
 * Responsabilidad: Presentación y temporización de notificaciones emergentes (Toast) en pantalla.
 */
let toastTimeout = null;

function showToast(msg) {
    const toast = document.getElementById('toastMessage');
    const text = document.getElementById('toastText');
    text.textContent = msg;
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-2');
    }, 2600);
}
