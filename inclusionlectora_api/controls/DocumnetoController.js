const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const gtts = require('gtts');
const uuid = require('uuid');
const { exec } = require('child_process');
const models = require('../models');
const axios = require('axios');

const saveAudioWithRetries = async (gttsInstance, filePath, retries = 1) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await new Promise((resolve, reject) => {
                gttsInstance.save(filePath, (err) => {
                    if (err) return reject(new Error("Error al guardar el archivo MP3: " + err.message));
                    resolve();
                });
            });
            return;
        } catch (error) {
            console.error(`Intento ${attempt} de guardar archivo fallido para: ${filePath}. Error: ${error.message}`);
            if (attempt === retries) throw error;
        }
    }
};
const guardarAudioPorLotes = async (chunks, documentoNameCifrado, audioDir, batchSize = 50) => {
    const audioFilePaths = [];

    for (let batchStart = 0; batchStart < chunks.length; batchStart += batchSize) {
        const batchPromises = [];

        for (let index = batchStart; index < Math.min(batchStart + batchSize, chunks.length); index++) {
            const mp3FileName = documentoNameCifrado.replace(/\.pdf$/, `_${index + 1}.mp3`);
            const mp3FilePath = path.join(audioDir, mp3FileName);
            audioFilePaths.push(mp3FilePath);
            const gttsInstance = new gtts(chunks[index], 'es');

            const savePromise = saveAudioWithRetries(gttsInstance, mp3FilePath, 2);
            batchPromises.push(savePromise);
        }

        await Promise.all(batchPromises);
        console.log(`Lote de ${batchPromises.length} archivos completado.`);
    }

    return audioFilePaths;
};

class DocumentoController {
    async guardar(req, res) {
        let transaction = await models.sequelize.transaction();

        try {
            const documentoNameCifrado = req.file.filename;
            const pdfFilePath = path.join(__dirname, '../public/documentos', documentoNameCifrado);
            const fileBuffer = fs.readFileSync(pdfFilePath);
            const pdfData = await pdfParse(fileBuffer);

            // Eliminar los saltos de línea y espacion duplicados del texto plano y caracteres repetitivos
            let textoPlano = pdfData.text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' '.replace(/(.)\1{5,}/g, '$1$1$1$1$1'));

            const txtFileName = documentoNameCifrado.replace(/\.pdf$/, '.txt');
            const carpetaName = documentoNameCifrado.replace(/\.pdf$/, '');
            const txtFilePath = path.join(__dirname, '../public/documentos/', txtFileName);
                   // Convertir archivo PDF a Base64 para enviarlo a la API
        const base64File = fileBuffer.toString('base64');
        const docxFilePath = pdfFilePath.replace(/\.pdf$/, '.docx');

        // Llamar a la API de ConvertApi para transformar PDF a DOCX
        const convertApiResponse = await axios.post(
            'https://us-v2.convertapi.com/convert/pdf/to/docx',
            {
                Parameters: [
                    {
                        Name: 'File',
                        FileValue: {
                            Name: documentoNameCifrado,
                            Data: base64File
                        }
                    },
                    {
                        Name: 'StoreFile',
                        Value: true
                    }
                ]
            },
            {
                headers: {
                    Authorization: 'Bearer secret_07jR9q8gUxorWxpS',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!convertApiResponse.data || !convertApiResponse.data.Files || convertApiResponse.data.Files.length === 0) {
            throw new Error('Error en la conversión del archivo PDF a DOCX.');
        }

        const docxUrl = convertApiResponse.data.Files[0].Url;

        // Descargar el archivo DOCX generado
        const docxResponse = await axios.get(docxUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(docxFilePath, docxResponse.data);

        console.log('Archivo convertido a DOCX en:', docxFilePath);

            const audioDir = path.join(__dirname, `../public/audio/partes/${carpetaName}`);
            // Recorta el nombre si tiene más de 80 caracteres
            if (req.body.nombre.length > 80) {
                req.body.nombre = req.body.nombre.substring(0, 76) + ".pdf";
            }

            if (!fs.existsSync(audioDir)) {
                fs.mkdirSync(audioDir, { recursive: true });
            }

            const chunks = [];
            for (let i = 0; i < textoPlano.length; i += 4000) {
                chunks.push(textoPlano.substring(i, i + 4000));
            }

            const audioFilePaths = await guardarAudioPorLotes(chunks, documentoNameCifrado, audioDir);

            console.log(audioFilePaths);

            const combinedAudioPath = path.join(__dirname, "../public/audio/completo", `${carpetaName}.mp3`);
            const fileListPath = path.join(__dirname, `../public/audio/partes/${carpetaName}_filelist.txt`);
            fs.writeFileSync(fileListPath, audioFilePaths.map(filePath => `file '${filePath}'`).join('\n'));

            await new Promise((resolve, reject) => {
                const ffmpegCommand = `ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy "${combinedAudioPath}"`;
                exec(ffmpegCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Error al combinar audios:', error.message);
                        return reject(new Error('Error al combinar audios con ffmpeg'));
                    }
                    console.log('Audio combinado creado en:', combinedAudioPath);
                    resolve();
                });
            });

            const data = {
                id_entidad: req.body.id,
                nombre: req.body.nombre,
                external_id: carpetaName,
                audio: {
                    external_id: carpetaName,
                    tiempo_reproduccion: 0.0
                },
            };
            await models.documento.create(data, {
                include: [{ model: models.audio, as: "audio" }],
                transaction
            });
            await transaction.commit();

            if (fs.existsSync(audioDir)) {
                fs.rmdirSync(audioDir, { recursive: true });
                console.log(`Carpeta de audio eliminada: ${audioDir}`);
            }
            if (fs.existsSync(fileListPath)) fs.unlinkSync(fileListPath);
            if (fs.existsSync(txtFilePath)) fs.unlinkSync(txtFilePath);
            return res.status(200).json({
                msg: "SE HA GUARDADO CON ÉXITO",
                code: 200, info: carpetaName
            });

        } catch (error) {
            try {
                if (req.file && req.file.path) {
                    fs.unlinkSync(path.join(__dirname, '../public/documentos', req.file.filename));
                    const txtFileName = req.file.filename.replace(/\.pdf$/, '.txt');
                    fs.unlinkSync(path.join(__dirname, '../public/documentos', txtFileName));

                    const SAFE_ROOT = path.resolve(__dirname, '../public/audio/partes');
                    const audioDir = path.resolve(SAFE_ROOT, req.file.filename.replace(/\.pdf$/, ''));
                    if (!audioDir.startsWith(SAFE_ROOT)) {
                        throw new Error('Invalid audio directory path');
                    }
                    if (fs.existsSync(audioDir)) {
                        fs.rmdirSync(audioDir, { recursive: true });
                        console.log(`Carpeta de audio eliminada: ${audioDir}`);
                    }
                }
            } catch (cleanupError) {
                console.error("Error al limpiar archivos y carpetas:", cleanupError.message);
            }

            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }

            return res.status(400).json({
                msg: error.message || "Ha ocurrido un error en el servidor",
                code: 400
            });
        }
    }

    async eliminarTodos(req, res) {
        let transaction;
        require('dotenv').config();
        const key = req.body.key;
        const keyEnv = process.env.KEY_DELETING;
        console.log(process.env.KEY_DELETING);
        if (!keyEnv) {
            return res.status(500).json({ msg: "Configuración del servidor incompleta", code: 500 });
        }

        if (key !== keyEnv) {
            return res.status(403).json({ msg: "Clave no autorizada", code: 403 });
        }
        try {
            transaction = await models.sequelize.transaction();

            const documentos = await models.documento.findAll();
            for (const documento of documentos) {
                const documentoNameCifrado = documento.external_id;

                const pdfPath = path.join(__dirname, '../public/documentos/', `${documentoNameCifrado}.pdf`);
                const combinedAudioPath = path.join(__dirname, "../public/audio/completo/", `${documentoNameCifrado}.mp3`);

                await documento.destroy({ transaction });
                if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
                if (fs.existsSync(combinedAudioPath)) fs.unlinkSync(combinedAudioPath);
            }

            await transaction.commit();
            return res.status(200).json({ msg: "Documentos eliminados con éxito", code: 200 });

        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(`Error en la eliminación: ${error.message}`);
            return res.status(500).json({ msg: "Error al eliminar los documentos", code: 500 });
        }
    }

    async obtener(req, res) {
        try {
            const externalId = req.params.external_id;
            const documentos = await models.documento.findAll({
                where: { id_entidad: externalId },
                attributes: ['nombre', 'external_id', 'createdAt'],
                order: [['id', 'DESC']],
            });

            if (!documentos || documentos.length === 0) {
                return res.status(404).json({
                    msg: "No se encontraron documentos",
                    code: 404
                });
            }

            return res.status(200).json({
                msg: "Documentos obtenidos con éxito",
                code: 200,
                info: documentos
            });
        } catch (error) {
            return res.status(500).json({
                msg: "Error al obtener los documentos",
                code: 500
            });
        }
    }

    async obtenerOneDoc(req, res) {
        try {
            const externalId = req.params.external_id;
            const documentos = await models.documento.findOne({
                where: { external_id: externalId },
                attributes: ['nombre'],
            });

            if (!documentos) {
                return res.status(404).json({
                    msg: "No se encontraron documento",
                    code: 404
                });
            }
            return res.status(200).json({
                msg: "Documento obtenidos con éxito",
                code: 200,
                info: documentos
            });
        } catch (error) {
            return res.status(500).json({
                msg: "Error al obtener los documentos",
                code: 500
            });
        }
    }

    async eliminar(req, res) {
        let transaction = await models.sequelize.transaction();

        try {
            const externalId = req.params.external_id;
            const documento = await models.documento.findOne({
                where: { external_id: externalId }
            });
            const audio = await models.audio.findOne({
                where: { external_id: externalId }
            })

            if (!documento || !audio) {
                return res.status(404).json({
                    msg: "Documento no encontrado",
                    code: 404
                });
            }

            const documentoNameCifrado = documento.external_id;
            const pdfPath = path.join(__dirname, '../public/documentos/', `${documentoNameCifrado}.pdf`);
            const txtPath = path.join(__dirname, '../public/documentos/', `${documentoNameCifrado}.txt`);
            const combinedAudioPath = path.join(__dirname, "../public/audio/completo/", `${documentoNameCifrado}.mp3`);
            await documento.destroy({ transaction });
            await audio.destroy({ transaction });
            if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
            if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
            if (fs.existsSync(combinedAudioPath)) fs.unlinkSync(combinedAudioPath);

            await transaction.commit();

            return res.status(200).json({
                msg: "Documento eliminado con éxito",
                code: 200
            });
        } catch (error) {
            if (transaction && !transaction.finished) {
                await transaction.rollback();
            }

            return res.status(500).json({
                msg: "Error al eliminar el documento",
                code: 500
            });
        }
    }

    async exist(req, res) {
        const id_entidad = req.params.id_entidad;
        var nombre = req.params.nombre;

        if (nombre.length > 80) {
            nombre = nombre.substring(0, 76) + ".pdf";
        }
        try {
            const documento = await models.documento.findOne({
                where: { id_entidad, nombre }
            });
            if (documento) {
                return res.status(200).json({
                    code: 200, info: true
                });
            } else {
                return res.status(404).json({
                    code: 404, info: false
                });
            }

        } catch (error) {
            return res.status(500).json({
                msg: "Error al buscar el documento",
                code: 500
            });
        }
    }
}

module.exports = DocumentoController;
