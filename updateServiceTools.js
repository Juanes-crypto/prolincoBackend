// backend/updateServiceTools.js
const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const updateServiceTools = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        // Nuevas herramientas para servicio
        const serviceTools = [
            { name: 'Volantes Digitales', type: 'drive', url: '' },
            { name: 'Carteles Publicitarios', type: 'drive', url: '' },
            { name: 'Formulario de Contacto', type: 'drive', url: '' },
            { name: 'Volantes (Ofertas)', type: 'drive', url: '' },
            { name: 'Ciclo de Servicio', type: 'drive', url: '' },
            { name: 'Chat en Vivo', type: 'drive', url: '' },
            { name: 'WhatsApp Venta', type: 'whatsapp', url: '' },
            { name: 'Estrategias de Marketing', type: 'drive', url: '' },
            { name: 'WhatsApp Soporte', type: 'whatsapp', url: '' },
            { name: 'Instagram', type: 'drive', url: '' },
            { name: 'Encuestas de Satisfacción', type: 'drive', url: '' },
            { name: 'Sección de Soporte (PQRS)', type: 'drive', url: '' }
        ];

        // Actualizar la sección servicio
        const serviceContent = await Content.findOne({ section: 'servicio' });
        
        if (serviceContent) {
            console.log('🔄 Actualizando herramientas de servicio...');
            
            // Mantener las URLs existentes de herramientas que ya estaban configuradas
            const updatedTools = serviceTools.map(newTool => {
                const existingTool = serviceContent.tools.find(tool => 
                    tool.name.toLowerCase().replace(/\s/g, '') === newTool.name.toLowerCase().replace(/\s/g, '')
                );
                
                if (existingTool) {
                    console.log(`✅ Manteniendo URL existente para: ${newTool.name}`);
                    return {
                        ...newTool,
                        url: existingTool.url // Conservar la URL existente
                    };
                }
                
                console.log(`🆕 Agregando nueva herramienta: ${newTool.name}`);
                return newTool;
            });
            
            serviceContent.tools = updatedTools;
            await serviceContent.save();
            console.log('✅ Herramientas de servicio actualizadas correctamente');
        } else {
            console.log('❌ No se encontró la sección servicio');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

updateServiceTools();