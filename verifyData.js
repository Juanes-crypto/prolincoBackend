// backend/verifyData.js
const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        const talentContent = await Content.findOne({ section: 'talento' });
        console.log('\n📊 CONTENIDO TALENTO HUMANO:');
        console.log('🔧 Número de herramientas:', talentContent.tools.length);
        console.log('📝 Todas las herramientas:');
        talentContent.tools.forEach((tool, index) => {
            console.log(`  ${index + 1}. ${tool.name}: ${tool.url} (${tool.url ? 'CONFIGURADA' : 'VACÍA'})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

verifyData();