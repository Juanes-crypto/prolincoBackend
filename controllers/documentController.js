// backend/controllers/documentController.js
const Document = require('../models/Document');
const fs = require('fs');
const path = require('path');

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
        // Podríamos filtrar por rol aquí si quisieras privacidad estricta
        // Por ahora, listamos todos ordenados por fecha
        const docs = await Document.find()
            .populate('uploadedBy', 'documentNumber role') // Ver quién lo subió
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
        } else {
            console.warn(`⚠️ El archivo físico no existía: ${filePath}`);
        }

        // Eliminar registro de BD
        await doc.deleteOne();

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