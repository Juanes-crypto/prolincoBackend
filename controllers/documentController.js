// backend/controllers/documentController.js

const Document = require('../models/Document'); // Tu modelo de documento
const fs = require('fs'); // Módulo nativo de Node para manipulación de archivos
const asyncHandler = require('express-async-handler');
const { logAuditAction } = require('../middleware/auditMiddleware'); // ✅ AUDITORÍA


// @desc    Sube un documento y guarda su metadata
// @route   POST /api/documents
// @access  Private (Requiere token JWT)
const uploadDocument = asyncHandler(async (req, res) => {
    // Multer ya ha subido el archivo y adjuntado la información a req.file
    if (!req.file) {
        return res.status(400).json({ message: 'No se proporcionó ningún archivo o el tipo de archivo no es permitido.' });
    }

    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Error de autenticación: Usuario o rol no definidos.' });
    }

    const { 
        originalname: fileName, 
        path: filePath, 
        mimetype: mimeType, 
        size: fileSize 
    } = req.file;

    const uploadedBy = req.user._id;
    const uploaderRole = req.user.role;
    const category = req.body.category || 'General'; 

    try {
        // Crear la entrada en la base de datos
        const newDocument = await Document.create({
            fileName,
            filePath,
            mimeType,
            fileSize,
            uploadedBy,
            uploaderRole,
            category
        });

        if (newDocument) {
             // ✅ AUDITORÍA: DOCUMENTO SUBIDO
            logAuditAction(
                req, 
                'DOC_UPLOAD', 
                `Documento subido: ${newDocument.fileName}. Categoría: ${newDocument.category}.`, 
                newDocument._id
            );
            
            res.status(201).json({
                message: 'Documento subido y metadata guardada con éxito',
                document: {
                    id: newDocument._id,
                    fileName: newDocument.fileName,
                    category: newDocument.category,
                    uploadedAt: newDocument.createdAt
                }
            });
        } else {
             res.status(400);
             throw new Error('Datos de documento no válidos');
        }

    } catch (error) {
        console.error(`Error al guardar metadata del documento: ${error.message}`);
        
        // 🚨 IMPORTANTE: Si falla al guardar en DB, debemos borrar el archivo físico subido por Multer.
        fs.unlink(filePath, (err) => {
            if (err) console.error(`Fallo al borrar el archivo físico: ${err.message}`);
        });

        res.status(500).json({ 
            message: 'Error al procesar el documento. Inténtelo de nuevo.' 
        });
    }
});

// @desc    Obtener todos los documentos con info del usuario que lo subió
// @route   GET /api/documents
// @access  Private (Requiere roles específicos)
const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({})
            .sort({ createdAt: -1 }) // Mostrar los más recientes primero
            .populate('uploadedBy', 'name email documentNumber role'); 
            
        res.status(200).json(documents);

    } catch (error) {
        console.error(`Error al obtener documentos: ${error.message}`);
        res.status(500).json({ message: 'Error al cargar la lista de documentos.' });
    }
};

// @desc    Descarga un documento específico
// @route   GET /api/documents/:id/download
// @access  Private
const downloadDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Documento no encontrado en la base de datos.' });
        }

        const filePath = document.filePath;
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Archivo físico no encontrado en el servidor. La referencia está rota.' });
        }

        res.download(filePath, document.fileName, (err) => {
            if (err) {
                console.error(`Error de descarga para ${document.fileName}: ${err.message}`);
                if (!res.headersSent) {
                    res.status(500).json({ message: 'Fallo en la transferencia del archivo.' });
                }
            }
        });

    } catch (error) {
        console.error(`Error en la descarga del documento: ${error.message}`);
        res.status(500).json({ message: 'Error interno del servidor al intentar descargar.' });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Documento no encontrado en la base de datos.' });
        }
        
        const fileName = document.fileName;
        const filePath = document.filePath;
        
        // 1. ELIMINAR EL ARCHIVO FÍSICO DEL SERVIDOR
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, async (err) => {
                if (err) {
                    console.error(`Fallo al borrar el archivo físico ${filePath}: ${err.message}`);
                }

                // 2. ELIMINAR LA REFERENCIA DE LA BASE DE DATOS
                await Document.deleteOne({ _id: req.params.id });

                // ✅ AUDITORÍA: DOCUMENTO ELIMINADO
                logAuditAction(
                    req, 
                    'DOC_DELETE', 
                    `Documento eliminado: ${fileName} por el usuario ${req.user.name}.`, 
                    document._id
                );

                res.status(200).json({ 
                    message: `Documento "${fileName}" y su registro eliminados con éxito.`
                });
            });
        } else {
            // Si el archivo físico ya no existe, borramos solo el registro de DB para limpiar la referencia.
            await Document.deleteOne({ _id: req.params.id });
            
            // ✅ AUDITORÍA: REGISTRO DE DOCUMENTO LIMPIADO (archivo ausente)
            logAuditAction(
                req, 
                'DOC_DELETE', 
                `Registro de documento eliminado. Archivo físico ya estaba ausente. Nombre: ${fileName}.`, 
                document._id
            );

            res.status(200).json({ 
                message: `Registro de documento eliminado. Archivo físico ya estaba ausente.`
            });
        }


    } catch (error) {
        console.error(`Error en la eliminación del documento: ${error.message}`);
        res.status(500).json({ message: 'Error interno del servidor al intentar eliminar el documento.' });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    downloadDocument,
    deleteDocument,
};