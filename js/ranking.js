document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('tabla-ranking-body');
    
    try {
        const respuesta = await fetch('http://localhost:3000/api/ranking');
        const datos = await respuesta.json();
        
        tbody.innerHTML = '';
        
        if (datos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Aún no hay registros. ¡Sé el primero en jugar!</td></tr>';
            return;
        }

        datos.forEach((registro, index) => {
            const tr = document.createElement('tr');
            let medalla = '';
            if (index === 0) medalla = '🥇 ';
            if (index === 1) medalla = '🥈 ';
            if (index === 2) medalla = '🥉 ';

            tr.innerHTML = `
                <td>${medalla} #${index + 1}</td>
                <td>${registro.nombre}</td>
                <td style="font-weight: bold;">${registro.puntaje} pts</td>
                <td>${new Date(registro.fecha).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" style="color: red; text-align: center;">Error al conectar con la base de datos central.</td></tr>';
    }
});