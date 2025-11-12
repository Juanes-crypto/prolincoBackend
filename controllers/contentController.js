// controllers/contentController.js

const Content = require('../models/Content');
const User = require('../models/User'); // Para el historial

// Función auxiliar para inicializar el contenido si no existe
const initializeContent = async (section, defaultData = {}) => {
    let content = await Content.findOne({ section });
    if (!content) {
        // Inicializar con herramientas por defecto por sección
        const defaultTools = [];

        if (section === 'admin') {
            defaultTools.push(
                { name: 'Marco Legal', type: 'drive', url: '' },
                { name: 'Matriz DOFA', type: 'drive', url: '' },
                { name: 'Matriz PESTEL', type: 'drive', url: '' },
                { name: 'Matriz EFI', type: 'drive', url: '' },
                { name: 'Matriz EFE', type: 'drive', url: '' }
            );
        } else if (section === 'servicio') {
            // 🌟 CORRECCIÓN CRÍTICA: Agregar TODAS las herramientas que el frontend espera
            defaultTools.push(
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
            );
        } else if (section === 'talento') {
            defaultTools.push(
                { name: 'Organigrama', type: 'drive', url: '' },
                { name: 'Proceso de Inducción', type: 'drive', url: '' }
            );
        }

        content = await Content.create({
            section,
            tools: defaultTools,
            ...defaultData
        });
    }
    return content;
};

// @desc    Obtener contenido de una sección
// @route   GET /api/content/:section
// @access  Público (cualquier usuario logueado puede leer)
// CORRECIÓN EN LA FUNCIÓN getContent - contentController.js
const getContent = async (req, res) => {
    const { section } = req.params;
    
    // Lista de secciones válidas
    const validSections = ['admin', 'servicio', 'talento', 'organizacional'];

    if (!validSections.includes(section)) {
        return res.status(404).json({ message: 'Sección no válida.' });
    }

    try {
        let content = await Content.findOne({ section });
        
        // 🌟 CORRECCIÓN CRÍTICA: Si no existe O si existe pero tools está vacío, inicializar
        if (!content || (content.tools && content.tools.length === 0)) {
            console.log(`🆕 Inicializando/Reinicializando contenido para: ${section}`);
            content = await initializeContent(section);
        }

        // Excluimos el historial para el GET normal
        const responseContent = content.toObject();
        delete responseContent.history;
        
        res.json(responseContent);
    } catch (error) {
        console.error('Error al obtener contenido:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener contenido.' });
    }
};

// @desc    Actualizar contenido de una sección
// @route   PUT /api/content/:section
// @access  Privado (Solo admin o roles específicos)
const updateContent = async (req, res) => {
    const { section } = req.params;
    const updates = req.body;
    const userId = req.user._id; // Obtenido del token por el middleware 'protect'
    const userRole = req.user.role;

    // Definir permisos por sección
    const sectionPermissions = {
        'admin': ['admin'],
        'talento': ['admin', 'talento'],
        'servicio': ['admin', 'servicio'],
        'organizacional': ['admin'] // Solo admin para identidad organizacional
    };

    // Verificar si el usuario tiene permiso para editar esta sección
    if (!sectionPermissions[section] || !sectionPermissions[section].includes(userRole)) {
        return res.status(403).json({ message: `Permiso denegado. No tienes autorización para editar la sección ${section}.` });
    }

    try {
        let content = await Content.findOne({ section });

        if (!content) {
             content = await initializeContent(section);
        }

        const historyRecords = [];

        // Lógica de actualización y registro de historial
        for (const [key, newValue] of Object.entries(updates)) {
            if (key in content && JSON.stringify(content[key]) !== JSON.stringify(newValue)) {
                
                // Si es un campo simple o array de strings
                let oldValue = content[key];
                
                // Actualizar el valor
                content[key] = newValue;
                
                // Registrar el cambio
                historyRecords.push({
                    field: key,
                    oldValue: (typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue)),
                    newValue: (typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue)),
                    changedBy: userId,
                });
            }
        }
        
        // Guardar los registros de historial en el documento
        if (historyRecords.length > 0) {
            content.history.push(...historyRecords);
        }

        await content.save();
        
        res.json({ 
            message: `Contenido de ${section} actualizado correctamente.`,
            content: content
        });

    } catch (error) {
        console.error('Error al actualizar contenido:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar contenido.' });
    }
};

// @desc    Obtener historial de una sección
// @route   GET /api/content/:section/history
// @access  Privado (Solo admin)
const getHistory = async (req, res) => {
    const { section } = req.params;
    const userRole = req.user.role;

    if (userRole !== 'admin') {
        return res.status(403).json({ message: 'Permiso denegado. Solo administradores pueden ver el historial.' });
    }

    try {
        const content = await Content.findOne({ section })
            .populate({
                path: 'history.changedBy',
                model: 'User',
                select: 'documentNumber role' // Solo mostramos estos campos del usuario
            });

        if (!content) {
            return res.status(404).json({ message: 'Contenido no encontrado para esta sección.' });
        }

        // Devolvemos el historial ordenado por fecha descendente
        res.json(content.history.sort((a, b) => b.changeDate - a.changeDate));
        
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener historial.' });
    }
};

// @desc    Actualizar URL de una herramienta específica
// @route   PUT /api/content/:section/tool/:toolName
// @access  Privado (Solo admin)
const updateToolUrl = async (req, res) => {
    const { section, toolName } = req.params;
    const { url } = req.body;
    const userId = req.user ? req.user._id : null;

    console.log(`🔧 updateToolUrl llamado: section=${section}, toolName=${toolName}, url=${url}, userId=${userId}`);

    try {
        let content = await Content.findOne({ section });
        
        console.log(`📊 Contenido encontrado para sección ${section}:`, content ? 'Sí' : 'No');
        
        if (!content) {
            console.log(`🆕 Inicializando contenido para sección: ${section}`);
            content = await initializeContent(section);
        }

        // 🌟 CORRECCIÓN: Buscar herramienta de forma más flexible
        const toolIndex = content.tools.findIndex(tool => {
            const toolNameNormalized = tool.name.toLowerCase().replace(/\s/g, '');
            const searchNameNormalized = toolName.toLowerCase().replace(/\s/g, '');
            console.log(`🔍 Buscando herramienta: ${toolNameNormalized} vs ${searchNameNormalized}`);
            return toolNameNormalized === searchNameNormalized;
        });
        
        console.log(`📊 Índice de herramienta encontrado: ${toolIndex}`);
        
        if (toolIndex === -1) {
            console.log(`❌ Herramienta no encontrada: ${toolName}`);
            console.log(`📋 Herramientas disponibles:`, content.tools.map(t => t.name));
            return res.status(404).json({ message: `Herramienta '${toolName}' no encontrada en la sección ${section}.` });
        }

        const oldUrl = content.tools[toolIndex].url;
        console.log(`📊 URL anterior: ${oldUrl}, Nueva URL: ${url}`);
        
        // Actualizar la URL
        content.tools[toolIndex].url = url;

        // Registrar en el historial
        content.history.push({
            field: `tool_${toolName}`,
            oldValue: oldUrl,
            newValue: url,
            changedBy: userId,
        });

        await content.save();
        console.log(`✅ Herramienta actualizada y guardada exitosamente`);
        
        res.json({ 
            message: `URL de ${toolName} actualizada correctamente.`,
            tool: content.tools[toolIndex]
        });

    } catch (error) {
        console.error('❌ Error en updateToolUrl:', error);
        res.status(500).json({ message: 'Error interno del servidor: ' + error.message });
    }
};

module.exports = {
    getContent,
    updateContent,
    getHistory,
    updateToolUrl
};