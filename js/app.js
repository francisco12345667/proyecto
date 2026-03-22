// /js/app.js
document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA PARA LA PÁGINA DE HISTORIA ---
    const contenedorHistoria = document.getElementById('contenido-historia');
    
    if (contenedorHistoria) {
        cargarHistoria();
    }

    async function cargarHistoria() {
        try {
            // Reutilizamos la base documental de la IA para mostrar la historia en pantalla
            const respuesta = await fetch('../data/historia.json');
            const historiaData = await respuesta.json();
            
            contenedorHistoria.innerHTML = ''; // Limpiar el contenedor

            historiaData.forEach(bloque => {
                const seccion = document.createElement('div');
                seccion.className = 'historia-bloque';
                
                // Formatear el ID para que parezca un título (ej: "contexto_general" -> "Contexto General")
                const tituloFormateado = bloque.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                seccion.innerHTML = `
                    <h3>${tituloFormateado}</h3>
                    <p>${bloque.contenido}</p>
                `;
                contenedorHistoria.appendChild(seccion);
            });

        } catch (error) {
            console.error("Error al cargar historia:", error);
            contenedorHistoria.innerHTML = '<p>Error al cargar el contenido documental. Asegúrese de estar ejecutando el proyecto desde un servidor local.</p>';
        }
    }
});