// backend/controllers/documentController.js
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');
const logAction = require('../utils/auditLogger'); // 👈 IMPORTACIÓN DEL LOGGER

// @desc    Subir un nuevo documento al repositorio
// @route   POST /api/documents
// @access  Privado
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
        }

        // Crear registro en BD
        const newDoc = new Document({
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`, // Ruta pública
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user._id,
            category: req.body.category || 'General'
        });

        const savedDoc = await newDoc.save();

        // 🕵️‍♂️ AUDITORÍA: SUBIDA DE DOCUMENTO
        await logAction(
            req.user, 
            'DOC_UPLOAD', 
            `Subió archivo al repositorio: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`, 
            savedDoc._id, 
            req
        );

        res.status(201).json(savedDoc);

    } catch (error) {
        console.error('Error subiendo documento:', error);
        res.status(500).json({ message: 'Error al procesar la subida.' });
    }
};

// @desc    Obtener lista de documentos
// @route   GET /api/documents
// @access  Privado
const getDocuments = async (req, res) => {
    try {
        const docs = await Document.find()
            .populate('uploadedBy', 'documentNumber role') 
            .sort({ createdAt: -1 });
            
        res.json(docs);
    } catch (error) {
        console.error('Error obteniendo documentos:', error);
        res.status(500).json({ message: 'Error al listar documentos.' });
    }
};

// @desc    Eliminar documento
// @route   DELETE /api/documents/:id
// @access  Privado
const deleteDocument = async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }

        // Eliminar archivo físico del servidor
        const filePath = path.join(__dirname, '..', 'uploads', doc.filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Borrado físico
        }

        // Guardamos datos para el log
        const docName = doc.originalName;
        const docId = doc._id;

        // Eliminar registro de BD
        await doc.deleteOne();

        // 🕵️‍♂️ AUDITORÍA: ELIMINACIÓN DE DOCUMENTO
        await logAction(
            req.user, 
            'DOC_DELETE', 
            `Eliminó archivo del repositorio: ${docName}`, 
            docId, 
            req
        );

        res.json({ message: 'Documento eliminado correctamente' });

    } catch (error) {
        console.error('Error eliminando documento:', error);
        res.status(500).json({ message: 'Error al eliminar el documento.' });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    deleteDocument
};