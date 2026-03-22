// /js/ia.js
document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const inputPregunta = document.getElementById('input-pregunta');
    const btnEnviar = document.getElementById('btn-enviar');
    const btnLimpiar = document.getElementById('btn-limpiar');

    // Inicializar historial
    let historial = JSON.parse(sessionStorage.getItem('ia_historial')) || [];
    
    function renderizarHistorial() {
        chatWindow.innerHTML = '';
        if (historial.length === 0) {
            agregarBurbuja('ia', '¡Saludos! Soy el sistema de consulta oficial sobre la Gran Cruzada Nacional de Alfabetización. ¿Qué aspecto de la historia, brigadistas o impacto deseas explorar hoy?', false);
        } else {
            historial.forEach(msg => agregarBurbuja(msg.rol, msg.texto, false));
        }
    }

    function agregarBurbuja(rol, texto, guardar = true) {
        const div = document.createElement('div');
        div.classList.add('mensaje', rol); // Agrega clases 'mensaje' y 'ia' o 'usuario'
        
        // Formateo simple para negritas
        let textoFormateado = texto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        div.innerHTML = textoFormateado;
        
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll hacia abajo

        if (guardar) {
            historial.push({ rol, texto });
            sessionStorage.setItem('ia_historial', JSON.stringify(historial));
        }
    }

    async function procesarPregunta() {
        const pregunta = inputPregunta.value.trim();
        if (!pregunta) return;

        agregarBurbuja('usuario', pregunta);
        inputPregunta.value = '';
        inputPregunta.disabled = true;
        btnEnviar.disabled = true;

        // Añadir indicador de carga
        const divCarga = document.createElement('div');
        divCarga.id = 'indicador-carga';
        divCarga.classList.add('mensaje', 'ia');
        divCarga.innerHTML = '<em>Consultando documentos oficiales...</em>';
        chatWindow.appendChild(divCarga);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        try {
            // Conexión al servidor Node.js
            const respuesta = await fetch('http://localhost:3000/api/ia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pregunta })
            });

            const datos = await respuesta.json();
            divCarga.remove(); // Quitar "Cargando..."
            agregarBurbuja('ia', datos.respuesta);

        } catch (error) {
            divCarga.remove();
            agregarBurbuja('ia', 'Error de red. Asegúrate de que el servidor (node backend/server.js) esté corriendo.');
        } finally {
            inputPregunta.disabled = false;
            btnEnviar.disabled = false;
            inputPregunta.focus();
        }
    }

    // Eventos
    btnEnviar.addEventListener('click', procesarPregunta);
    inputPregunta.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') procesarPregunta();
    });

    btnLimpiar.addEventListener('click', () => {
        if(confirm("¿Borrar el historial de investigación?")) {
            sessionStorage.removeItem('ia_historial');
            historial = [];
            renderizarHistorial();
        }
    });

    // Arrancar
    renderizarHistorial();
});