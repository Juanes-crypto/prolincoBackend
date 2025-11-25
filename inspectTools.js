// backend/inspectTools.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tool = require('./models/Tool');

dotenv.config();

const fs = require('fs');

const inspectTools = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Conectado a MongoDB...');

        const tools = await Tool.find({});
        fs.writeFileSync('tools_dump.json', JSON.stringify(tools, null, 2));
        console.log('✅ Dump guardado en tools_dump.json');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

inspectTools();
