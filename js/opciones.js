// /js/opciones.js
document.addEventListener('DOMContentLoaded', () => {
    const toggleTema = document.getElementById('toggle-tema');
    const rangoTexto = document.getElementById('rango-texto');
    const selectorIdioma = document.getElementById('selector-idioma');
    const btnCompartir = document.getElementById('btn-compartir');

    // 1. Cargar preferencias guardadas
    const temaGuardado = localStorage.getItem('cna_tema');
    if (temaGuardado === 'oscuro') {
        document.body.classList.add('dark-mode');
        if(toggleTema) toggleTema.checked = true;
    }

    const tamanoGuardado = localStorage.getItem('cna_texto');
    if (tamanoGuardado) {
        document.documentElement.style.fontSize = `${tamanoGuardado}px`;
        if(rangoTexto) rangoTexto.value = tamanoGuardado;
    }

    // 2. Event Listeners
    if(toggleTema) {
        toggleTema.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('cna_tema', 'oscuro');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('cna_tema', 'claro');
            }
        });
    }

    if(rangoTexto) {
        rangoTexto.addEventListener('input', (e) => {
            const size = e.target.value;
            document.documentElement.style.fontSize = `${size}px`;
            localStorage.setItem('cna_texto', size);
        });
    }

    // 3. Compartir API (Web Share API)
    if(btnCompartir) {
        btnCompartir.addEventListener('click', async () => {
            const shareData = {
                title: 'Cruzada Nacional de Alfabetización',
                text: 'Aprende sobre la epopeya educativa de Nicaragua en esta plataforma documental.',
                url: window.location.href
            };
            if (navigator.share) {
                try { await navigator.share(shareData); } 
                catch (err) { console.log('Error al compartir', err); }
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert("¡Enlace copiado al portapapeles!");
            }
        });
    }
});