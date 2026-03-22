// /js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const formAuth = document.getElementById('form-auth');
    const btnToggle = document.getElementById('link-toggle');
    const msgError = document.getElementById('mensaje-error');
    const btnLogout = document.getElementById('btn-logout');
    
    let modoRegistro = false;

    // Alternar entre Login y Registro UI
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            modoRegistro = !modoRegistro;
            document.getElementById('auth-titulo').textContent = modoRegistro ? 'Registro de Brigadista' : 'Iniciar Sesión';
            document.getElementById('grupo-nombre').style.display = modoRegistro ? 'block' : 'none';
            document.getElementById('btn-submit').textContent = modoRegistro ? 'Crear Cuenta' : 'Entrar';
            document.getElementById('texto-toggle').textContent = modoRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
            btnToggle.textContent = modoRegistro ? 'Inicia sesión aquí' : 'Regístrate aquí';
            if (msgError) msgError.style.display = 'none';
        });
    }

    // Procesar Formulario
    if (formAuth) {
        formAuth.addEventListener('submit', async (e) => {
            e.preventDefault();
            const correo = document.getElementById('correo').value;
            const contrasena = document.getElementById('contrasena').value;
            
            const url = modoRegistro ? 'http://localhost:3000/api/auth/registro' : 'http://localhost:3000/api/auth/login';
            const body = { correo, contrasena };
            
            if (modoRegistro) {
                body.nombre = document.getElementById('nombre').value;
            }

            try {
                const respuesta = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                
                const data = await respuesta.json();

                if (!respuesta.ok) {
                    msgError.textContent = data.error;
                    msgError.style.display = 'block';
                    return;
                }

                // Guardar sesión y redirigir
                if (!modoRegistro) {
                    sessionStorage.setItem('cna_usuario', JSON.stringify(data.usuario));
                } else {
                    alert("Registro exitoso. Por favor, inicia sesión.");
                    window.location.reload();
                    return;
                }
                
                window.location.href = 'perfil.html';

            } catch (error) {
                msgError.textContent = 'Error de conexión con el servidor.';
                msgError.style.display = 'block';
            }
        });
    }

    // Cerrar sesión
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('cna_usuario');
            window.location.href = 'login.html';
        });
    }
});