// backend/checkServiceTools.js
const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const checkServiceTools = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const serviceContent = await Content.findOne({ section: 'servicio' });
        console.log('\n📊 HERRAMIENTAS DE SERVICIO:');
        console.log(`🔧 Número: ${serviceContent.tools.length}`);
        serviceContent.tools.forEach((tool, index) => {
            console.log(`  ${index + 1}. ${tool.name}: ${tool.url || 'VACÍA'}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkServiceTools();