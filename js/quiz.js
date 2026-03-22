// /js/quiz.js
document.addEventListener('DOMContentLoaded', async () => {
    let preguntas = [];
    let indiceActual = 0;
    let puntaje = 0;
    let tiempoSegundos = 0;
    let intervaloTiempo;

    const elementos = {
        preguntaTexto: document.getElementById('pregunta-actual'),
        contenedorOpciones: document.getElementById('contenedor-opciones'),
        contadorPreguntas: document.getElementById('contador-preguntas'),
        barraProgreso: document.getElementById('barra-progreso'),
        btnSiguiente: document.getElementById('btn-siguiente'),
        pantallaJuego: document.getElementById('pantalla-juego'),
        pantallaResultados: document.getElementById('pantalla-resultados'),
        textoPuntaje: document.getElementById('texto-puntaje'),
        temporizador: document.getElementById('temporizador'),
        mensajeRetro: document.getElementById('mensaje-retroalimentacion')
    };

    // 1. Cargar preguntas desde el JSON
    try {
        const respuesta = await fetch('../data/preguntas.json');
        preguntas = await respuesta.json();
        // Mezclar preguntas aleatoriamente
        preguntas.sort(() => Math.random() - 0.5);
        iniciarJuego();
    } catch (error) {
        elementos.preguntaTexto.textContent = "Error al cargar la base documental. Verifica que preguntas.json exista.";
    }

    function iniciarJuego() {
        intervaloTiempo = setInterval(() => {
            tiempoSegundos++;
            const min = Math.floor(tiempoSegundos / 60).toString().padStart(2, '0');
            const sec = (tiempoSegundos % 60).toString().padStart(2, '0');
            elementos.temporizador.textContent = `Tiempo: ${min}:${sec}`;
        }, 1000);
        mostrarPregunta();
    }

    function mostrarPregunta() {
        elementos.btnSiguiente.style.display = 'none';
        const pregunta = preguntas[indiceActual];
        
        elementos.contadorPreguntas.textContent = `Pregunta ${indiceActual + 1} de ${preguntas.length}`;
        elementos.preguntaTexto.textContent = pregunta.pregunta;
        elementos.contenedorOpciones.innerHTML = '';

        // Actualizar barra de progreso
        const progreso = ((indiceActual) / preguntas.length) * 100;
        elementos.barraProgreso.style.width = `${progreso}%`;

        pregunta.opciones.forEach((opcion, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-opcion';
            btn.textContent = opcion;
            btn.onclick = () => verificarRespuesta(index, btn);
            elementos.contenedorOpciones.appendChild(btn);
        });
    }

    function verificarRespuesta(indiceSeleccionado, botonSeleccionado) {
        const pregunta = preguntas[indiceActual];
        const botones = document.querySelectorAll('.btn-opcion');
        
        // Bloquear todos los botones tras responder
        botones.forEach(btn => btn.disabled = true);

        if (indiceSeleccionado === pregunta.correcta) {
            botonSeleccionado.classList.add('correcta');
            puntaje += 100; // 100 puntos por acierto
        } else {
            botonSeleccionado.classList.add('incorrecta');
            // Resaltar la correcta
            botones[pregunta.correcta].classList.add('correcta');
        }

        elementos.btnSiguiente.style.display = 'inline-block';
    }

    elementos.btnSiguiente.addEventListener('click', () => {
        indiceActual++;
        if (indiceActual < preguntas.length) {
            mostrarPregunta();
        } else {
            finalizarJuego();
        }
    });

    async function finalizarJuego() {
        clearInterval(intervaloTiempo);
        elementos.pantallaJuego.style.display = 'none';
        elementos.pantallaResultados.style.display = 'block';
        
        const porcentaje = Math.round((puntaje / (preguntas.length * 100)) * 100);
        elementos.textoPuntaje.textContent = `${porcentaje}%`;

        if (porcentaje >= 80) elementos.mensajeRetro.textContent = "¡Excelente! Tienes un amplio dominio documental de la historia de la Cruzada.";
        else if (porcentaje >= 50) elementos.mensajeRetro.textContent = "Buen trabajo. Conoces lo básico, pero puedes repasar la sección de Historia.";
        else elementos.mensajeRetro.textContent = "Te invitamos a consultar la IA Documental para reforzar tus conocimientos.";

        // Guardar en la base de datos (Requiere el backend de Node.js corriendo)
        try {
            await fetch('http://localhost:3000/api/resultados', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario_id: 1, // ID temporal hasta que conectemos el Login
                    puntaje: puntaje,
                    respuestas_correctas: puntaje / 100,
                    tiempo_segundos: tiempoSegundos
                })
            });
        } catch (e) {
            console.log("Aviso: El servidor backend no está conectado, el puntaje no se guardó en SQLite.");
        }
    }
});