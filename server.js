// server.js (dentro de backend/)

// 1. Importar librerías
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar NUEVAS Rutas
const authRoutes = require('./routes/authRoutes');
const toolRoutes = require('./routes/toolRoutes');             // ✅ Rutas de Herramientas
const pageContentRoutes = require('./routes/pageContentRoutes'); // ✅ Rutas de Textos (Diagnóstico/Misión)
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const auditRoutes = require('./routes/auditRoutes');

// 2. VALIDACIÓN CRÍTICA DE VARIABLES DE ENTORNO
if (!process.env.MONGO_URI) {
  console.error('❌ ERROR CRÍTICO: MONGO_URI no está definida en el archivo .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR CRÍTICO: JWT_SECRET no está definida en el archivo .env');
  process.exit(1);
}

// 3. Inicializar la aplicación Express
const app = express();
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

// 4. Middlewares Globales
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://lacteos-prolinco.onrender.com'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); 
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'La política CORS no permite el acceso desde el origen especificado.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(express.json());

// Carpeta pública para descargas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ******* Rutas de API *******
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);            // ✅ API de Herramientas
app.use('/api/page-content', pageContentRoutes); // ✅ API de Textos
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit', auditRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Lácteos Prolinco funcionando v2.0.' });
});

// 5. Conexión a MongoDB Atlas
mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ Conexión a MongoDB Atlas exitosa para Lácteos Prolinco.');
        app.listen(port, () => {
            console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('❌ Error de conexión a MongoDB:', error.message);
    });