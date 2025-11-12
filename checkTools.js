// backend/checkTools.js
const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const checkTools = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        const sections = ['talento', 'admin', 'servicio'];
        
        for (const section of sections) {
            const content = await Content.findOne({ section });
            console.log(`\n📊 SECCIÓN: ${section}`);
            console.log(`🔧 Número de herramientas: ${content.tools.length}`);
            console.log(`📝 Herramientas:`, content.tools.map(t => ({
                name: t.name,
                url: t.url,
                configured: !!t.url && t.url !== ''
            })));
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkTools();