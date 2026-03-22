// /backend/server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // Para contraseñas seguras

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// --- CONFIGURACIÓN DE BASE DE DATOS AVANZADA ---
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error crítico: No se pudo conectar a SQLite.", err.message);
        process.exit(1);
    }
    console.log("Conexión estable con SQLite (database.db).");
});

// Inicialización de esquema relacional
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        nombre TEXT NOT NULL, 
        correo TEXT UNIQUE NOT NULL, 
        contrasena TEXT NOT NULL, 
        rol TEXT DEFAULT 'estudiante',
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP, 
        idioma TEXT DEFAULT 'es', 
        tema TEXT DEFAULT 'claro'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS resultados (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        usuario_id INTEGER, 
        puntaje INTEGER NOT NULL, 
        respuestas_correctas INTEGER,
        tiempo_segundos INTEGER,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS referencias_audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        fecha_consulta DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// --- SISTEMA DE AUTENTICACIÓN BÁSICO ---
const hashPassword = (pwd) => crypto.createHash('sha256').update(pwd).digest('hex');

app.post('/api/auth/registro', (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    if (!nombre || !correo || !contrasena) return res.status(400).json({ error: "Datos incompletos" });

    const hash = hashPassword(contrasena);
    db.run(`INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)`, 
        [nombre, correo, hash], function(err) {
        if (err) return res.status(500).json({ error: "El correo ya está registrado o hubo un error." });
        res.status(201).json({ success: true, usuario_id: this.lastID, mensaje: "Registro exitoso." });
    });
});

app.post('/api/auth/login', (req, res) => {
    const { correo, contrasena } = req.body;
    const hash = hashPassword(contrasena);
    
    db.get(`SELECT id, nombre, rol, idioma, tema FROM usuarios WHERE correo = ? AND contrasena = ?`, 
        [correo, hash], (err, row) => {
        if (err) return res.status(500).json({ error: "Error interno del servidor." });
        if (!row) return res.status(401).json({ error: "Credenciales inválidas." });
        res.json({ success: true, usuario: row });
    });
});

// --- CARGA Y VALIDACIÓN DE BASE DOCUMENTAL (REQUISITO CRÍTICO) ---
function cargarDocumentos() {
    try {
        const h = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/historia.json'), 'utf8'));
        const b = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/brigadistas.json'), 'utf8'));
        const t = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/testimonios.json'), 'utf8'));
        const c = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cronologia.json'), 'utf8'));
        return [...h, ...b, ...t, ...c];
    } catch (e) {
        console.warn("Advertencia: Algunos archivos JSON documentales no están disponibles aún.", e.message);
        return [];
    }
}

// --- MÓDULO DE IA TEMÁTICO Y RESTRINGIDO ---
app.post('/api/ia', (req, res) => {
    const preguntaRaw = req.body.pregunta;
    if (!preguntaRaw || typeof preguntaRaw !== 'string') {
        return res.status(400).json({ error: "Formato de pregunta inválido." });
    }

    const pregunta = preguntaRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Quitar acentos para mejor match
    const baseDocumental = cargarDocumentos();
    let respuestaEncontrada = null;
    let fuentesAplicadas = [];

    // Algoritmo de coincidencia por peso de palabras clave
    let mejorPuntaje = 0;

    baseDocumental.forEach(doc => {
        let puntaje = 0;
        doc.keywords.forEach(kw => {
            const kwNormalizado = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (pregunta.includes(kwNormalizado)) {
                puntaje += kw.length; // Palabras más largas dan más peso
            }
        });

        if (puntaje > mejorPuntaje) {
            mejorPuntaje = puntaje;
            respuestaEncontrada = doc.contenido;
            fuentesAplicadas = doc.fuentes || ["Fuentes oficiales del proyecto"];
        }
    });

    // Umbral de rigor documental (si no hay suficiente coincidencia, se rechaza)
    if (mejorPuntaje > 3) {
        const respuestaFinal = `${respuestaEncontrada}\n\n*[Respuesta elaborada con base en las fuentes documentales del proyecto: ${fuentesAplicadas.join(", ")}]*`;
        res.json({ respuesta: respuestaFinal, estado: "exito" });
    } else {
        res.json({ 
            respuesta: "No encontré información suficiente en las fuentes documentales autorizadas (MINED, Viva Nicaragua, Gaceta Sandinista) para responder a esa consulta. Recuerda que solo respondo sobre la Gran Cruzada Nacional de Alfabetización.", 
            estado: "fuera_de_contexto" 
        });
    }
});

// --- API DE RESULTADOS Y RANKING ---
app.get('/api/ranking', (req, res) => {
    const query = `
        SELECT u.nombre, r.puntaje, r.tiempo_segundos, r.fecha 
        FROM resultados r 
        INNER JOIN usuarios u ON r.usuario_id = u.id 
        ORDER BY r.puntaje DESC, r.tiempo_segundos ASC 
        LIMIT 20
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error al consultar el ranking." });
        res.json(rows);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[SISTEMA ACTIVO] Servidor backend operando en el puerto ${PORT}`);
    console.log(`[RESTRICCIÓN] IA Documental anclada exclusivamente a fuentes autorizadas.`);
});