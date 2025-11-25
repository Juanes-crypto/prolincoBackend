// backend/cleanLegacyFiles.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Document = require('./models/Document');
const Tool = require('./models/Tool');

dotenv.config();

const cleanLegacy = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Conectado a MongoDB...');

        // 1. Limpiar el repositorio de documentos (FilesPage)
        // Borramos los registros que apunten a la carpeta local /uploads/
        const docResult = await Document.deleteMany({ 
            path: { $regex: /^\/uploads\// } 
        });
        console.log(`🗑️ Documentos viejos eliminados: ${docResult.deletedCount}`);

        // 2. Limpiar las herramientas (Cliente, Talento, Admin)
        // Aquí NO borramos la herramienta completa, solo vaciamos el campo del archivo
        // para que el usuario pueda subir uno nuevo correctamente.
        const toolResult = await Tool.updateMany(
            { fileUrl: { $regex: /^\/uploads\// } }, // Condición: archivos locales
            { 
                $set: { 
                    fileUrl: "", 
                    originalFileName: "" 
                } 
            }
        );
        console.log(`🔧 Herramientas limpiadas (archivos desvinculados): ${toolResult.modifiedCount}`);

        console.log('✅ ¡Limpieza completada! Ahora solo quedan los archivos de Cloudinary.');
        process.exit();

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

cleanLegacy();