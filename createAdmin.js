// backend/createAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Asegúrate de que la ruta al modelo sea correcta

dotenv.config();

const createAdmin = async () => {
    try {
        // 1. Conectar a la base de datos
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Conectado a MongoDB...');

        // 2. Datos del Admin (PUEDES CAMBIARLOS SI QUIERES)
        const adminData = {
            documentNumber: '1036518830',     // Usuario para login
            documentType: 'CC',
            email: 'juanes@gmail.com',
            password: '123456',            // Contraseña simple
            name: 'Super Administrador',
            role: 'admin',              // Rol vital para ver el botón de crear herramientas
            position: 'Gerente',
            area: 'Administración'
        };

        // 3. Verificar si ya existe
        const existingAdmin = await User.findOne({ documentNumber: adminData.documentNumber });
        if (existingAdmin) {
            console.log('⚠️ El usuario admin ya existe. No es necesario crearlo.');
            process.exit();
        }

        // 4. Crear el usuario (El modelo User se encargará de encriptar la contraseña)
        const user = new User(adminData);
        await user.save();

        console.log('✅ ¡Usuario Admin creado con éxito!');
        console.log(`👤 Usuario (documentNumber): ${adminData.documentNumber}`);
        console.log(`🔑 Contraseña: ${adminData.password}`);
        
        process.exit();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

createAdmin();