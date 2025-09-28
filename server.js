// server.js (dentro de backend/)

// 1. Importar librerías
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Carga las variables de entorno del archivo .env

const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const userRoutes = require('./routes/userRoutes');
const documentRoutes = require('./routes/documentRoutes');
const auditRoutes = require('./routes/auditRoutes');
// 2. Inicializar la aplicación Express
const app = express();
// El puerto se toma del .env (4000) o usa 5000 si no está definido
const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

// 3. Middlewares Globales
// Configura CORS para permitir solicitudes desde el frontend (que estará en 5173 con Vite)
app.use(cors({
    origin: 'http://localhost:5173'
}));
// Middleware para manejar datos JSON en las solicitudes
app.use(express.json());

// 4. Conexión a MongoDB Atlas
mongoose.connect(mongoURI)
    .then(() => {
        console.log('✅ Conexión a MongoDB Atlas exitosa para Lácteos Prolinco.');

        // 5. Iniciar el servidor SOLO después de la conexión exitosa
        app.listen(port, () => {
            console.log(`🚀 Servidor de Lácteos Prolinco escuchando en http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('❌ Error de conexión a MongoDB:', error.message);
        console.error('Por favor, revisa tu MONGO_URI en el archivo .env.');
    });

// 6. Rutas de prueba (Endpoint de raíz)
app.get('/', (req, res) => {
    res.json({ message: 'API de Lácteos Prolinco funcionando. Listo para recibir datos.' });
});

// ******* Aquí es donde se agregarán las rutas específicas (Ej: Productos, Clientes, etc.) ******
// app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audit', auditRoutes);
