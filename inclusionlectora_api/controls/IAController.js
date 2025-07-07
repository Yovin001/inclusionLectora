'use strict';

const { enviarAGemini } = require('../services/GeminiService'); 

class IAController {
    async procesarImagenConGemini(req, res) {
        try {
            if (!req.file || !req.file.buffer) {
                res.status(400);
                res.json({ msg: 'Se requiere una imagen', code: 400 });
                return;
            }

            const imageBuffer = req.file.buffer;
            const prompt = req.body.prompt || 
            'Si hay texto en la imagen, extráelo exactamente tal como aparece. Si no hay texto, describe con detalle lo que muestra la imagen. No digas que no hay texto, simplemente describe. No incluyas explicaciones, justificaciones ni comentarios adicionales.';
          
            const resultado = await enviarAGemini(imageBuffer, prompt);

            res.status(200);
            res.json({ msg: 'Procesamiento exitoso', code: 200, info: resultado });

        } catch (error) {
            console.error('Error al procesar imagen con Gemini:', error);
            res.status(500);
            res.json({
                msg: 'Error interno al procesar la imagen',
                code: 500,
                info: error.message || error
            });
        }
    }
}

module.exports = IAController;
