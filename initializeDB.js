// backend/initializeDB.js
const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const initializeDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Inicializar todas las secciones
        const sections = [
            {
                section: 'talento',
                tools: [
                    { name: 'Organigrama', type: 'drive', url: '' },
                    { name: 'Mapa de Procesos', type: 'drive', url: '' },
                    { name: 'Perfil del Empleado', type: 'drive', url: '' },
                    { name: 'Manual del Empleado', type: 'drive', url: '' },
                    { name: 'Proceso de Inducción', type: 'drive', url: '' },
                    { name: 'Proceso de Capacitación', type: 'drive', url: '' }
                ]
            },
            {
                section: 'admin', 
                tools: [
                    { name: 'Marco Legal', type: 'drive', url: '' },
                    { name: 'Matriz DOFA', type: 'drive', url: '' },
                    { name: 'Matriz PESTEL', type: 'drive', url: '' },
                    { name: 'Matriz EFI', type: 'drive', url: '' },
                    { name: 'Matriz EFE', type: 'drive', url: '' }
                ]
            },
            {
                section: 'servicio',
                tools: [
                    { name: 'Carteles Publicitarios', type: 'drive', url: '' },
                    { name: 'Volantes digitales', type: 'drive', url: '' },
                    { name: 'Organigrama', type: 'drive', url: '' }
                ]
            }
        ];

        for (const sectionData of sections) {
            let content = await Content.findOne({ section: sectionData.section });
            
            if (!content) {
                console.log(`🆕 Creando sección: ${sectionData.section}`);
                content = await Content.create(sectionData);
            } else if (!content.tools || content.tools.length === 0) {
                console.log(`🔄 Actualizando herramientas vacías para: ${sectionData.section}`);
                content.tools = sectionData.tools;
                await content.save();
            } else {
                console.log(`✅ Sección ${sectionData.section} ya tiene herramientas`);
            }
        }

        console.log('🎉 Base de datos inicializada correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

initializeDatabase();