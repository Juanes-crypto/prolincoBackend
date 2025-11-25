// backend/cleanAllFiles.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tool = require('./models/Tool');

dotenv.config();

const cleanAllFiles = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Conectado a MongoDB...');

        // Vaciar fileUrl y originalFileName de TODAS las herramientas
        const result = await Tool.updateMany(
            { fileUrl: { $ne: "" } }, // Donde fileUrl no esté vacío
            { 
                $set: { 
                    fileUrl: "", 
                    originalFileName: "" 
                } 
            }
        );

        console.log(`✨ Se limpiaron ${result.modifiedCount} herramientas. La base de datos está lista para nuevas pruebas.`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

cleanAllFiles();
