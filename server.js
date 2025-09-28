// server.js (dentro de backend/)

// 1. Importar librerías
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const path = require('path'); // ❌ Ya no se necesita
require('dotenv').config(); 

const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const auditRoutes = require('./routes/auditRoutes');

// 2. Inicializar la aplicación Express
const app = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

// 3. Middlewares Globales
// 🌟 CORRECCIÓN CRÍTICA: Configuración de CORS para aceptar el dominio de Render 🌟
const allowedOrigins = [
    'http://localhost:5173', 
    'https://lacteos-prolinco.onrender.com' // ✅ Dominio de tu Frontend
];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir solicitudes sin 'origin' (ej. Postman)
        if (!origin) return callback(null, true); 
        
        // Permitir solo orígenes listados
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'La política CORS no permite el acceso desde el origen especificado.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
// Middleware para manejar datos JSON en las solicitudes
app.use(express.json());

// ******* Rutas de API *******
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit', auditRoutes);

// Ruta de prueba de raíz (sin el bloque de producción)
app.get('/', (req, res) => {
    res.json({ message: 'API de Lácteos Prolinco funcionando. Listo para recibir datos.' });
});


// ❌ ELIMINAR ESTE BLOQUE COMPLETO:
/*
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.resolve(__dirname, '..', 'frontend', 'dist');
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
        if (!req.url.startsWith('/api')) {
            res.sendFile(path.resolve(frontendPath, 'index.html'));
        }
    });
}
*/


// 4. Conexión a MongoDB Atlas
mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ Conexión a MongoDB Atlas exitosa para Lácteos Prolinco.');
        app.listen(port, () => {
            console.log(`🚀 Servidor de Lácteos Prolinco escuchando en http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('❌ Error de conexión a MongoDB:', error.message);
        console.error('Por favor, revisa tu MONGO_URI en el archivo .env.');
    });