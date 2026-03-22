document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const inputPregunta = document.getElementById('input-pregunta');
    const btnEnviar = document.getElementById('btn-enviar');

    // Función para buscar en los documentos sin servidor (Lógica de Cliente)
    async function buscarEnDocumentos(pregunta) {
        try {
            const p = pregunta.toLowerCase();
            
            // Cargamos los archivos JSON directamente desde la carpeta data
            const resHistoria = await fetch('../data/historia.json');
            const resBrigadistas = await fetch('../data/brigadistas.json');
            
            const historia = await resHistoria.json();
            const brigadistas = await resBrigadistas.json();
            
            const baseCompleta = [...historia, ...brigadistas];

            // Buscamos coincidencia por palabras clave
            const hallazgo = baseCompleta.find(item => 
                item.keywords.some(k => p.includes(k.toLowerCase()))
            );

            if (hallazgo) {
                return hallazgo.contenido || hallazgo.relato;
            } else {
                return "Lo siento, Rousbel. No encuentro información específica sobre eso. Intenta preguntar sobre el 50.35%, Carlos Fonseca, el EPA o la medalla de la UNESCO.";
            }
        } catch (error) {
            console.error("Error al leer JSON:", error);
            return "Error al acceder a la base documental. Verifica que los archivos JSON estén en la carpeta data.";
        }
    }

    async function procesarMensaje() {
        const texto = inputPregunta.value.trim();
        if (!texto) return;

        // Mostrar mensaje del usuario
        agregarBurbuja('usuario', texto);
        inputPregunta.value = "";

        // Mostrar "Pensando..."
        const loadingDiv = agregarBurbuja('ia', 'Consultando archivos históricos...');

        // Buscar respuesta
        const respuesta = await buscarEnDocumentos(texto);
        
        // Reemplazar "Pensando" por la respuesta real
        loadingDiv.textContent = respuesta;
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function agregarBurbuja(rol, texto) {
        const div = document.createElement('div');
        div.className = `mensaje ${rol}`;
        div.textContent = texto;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return div;
    }

    btnEnviar.addEventListener('click', procesarMensaje);
    inputPregunta.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') procesarMensaje();
    });
});