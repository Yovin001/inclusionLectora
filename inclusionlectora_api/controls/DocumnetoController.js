const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const gtts = require('gtts');
const { exec } = require('child_process');
const models = require('../models');
const { PythonShell } = require('python-shell');
const { info } = require('console');

const docxExpirations = new Map(); 

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
function runPythonScript(pdfPath, docxPath, scriptPath) {
    const options = {
        mode: 'text',
        pythonOptions: ['-u'],
        args: [pdfPath, docxPath]
    };

    PythonShell.run(scriptPath, options, (err, results) => {
        if (err) {
            console.error("Error en PythonShell:", err);
        } else {
            console.log("Python script finalizó:", results);
        }
    });
}

// Verifica periódicamente si existe el archivo
function esperarArchivo(filePath, callback, timeout = 90000, intervalo = 500) {
    const startTime = Date.now();

    const intervalId = setInterval(() => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (!err) {
                clearInterval(intervalId);
                return callback(null, true);
            }

            if (Date.now() - startTime > timeout) {
                clearInterval(intervalId);
                return callback(new Error("Archivo no encontrado a tiempo"), false);
            }
        });
    }, intervalo);
}
function programarEliminacion(filePath, tiempoMs = 1 * 60 * 1000) {
    if (docxExpirations.has(filePath)) return; // Ya programado

    const timeoutId = setTimeout(() => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error eliminando archivo:", filePath, err);
            } else {
                console.log("Archivo eliminado automáticamente:", filePath);
            }
            docxExpirations.delete(filePath);
        });
    }, tiempoMs);

    docxExpirations.set(filePath, timeoutId);
}

class DocumentoController {


    async guardarLicencia(req, res) {
        try {
          const file = req.file;
      
          if (!file) {
            return res.status(400).json({ msg: "No se ha proporcionado un archivo", code: 400 });
          }
          const rutaRelativa = `licencia/${file.filename}`;
          // En este punto el archivo ya fue guardado por multer, solo limpiamos lo anterior
          return res.status(200).json({
            msg: "Licencia guardada correctamente",
            code: 200, info: { rutaRelativa, nombreArchivo: file.filename }
          });
      
        } catch (error) {
          console.error(error);
          return res.status(500).json({ msg: "Error al guardar la licencia", error: error.message });
        }
      }

      async obtenerLicencia(req, res) {
        try {
          const carpetaLicencias = path.join(__dirname, '..', 'public', 'licencia');
      
          // Verificar que la carpeta existe
          if (!fs.existsSync(carpetaLicencias)) {
            return res.status(404).json({ msg: 'No se encontró la carpeta de licencias', code: 404 });
          }
      
          const archivos = fs.readdirSync(carpetaLicencias);
      
          // Verifica si hay al menos un archivo
          if (archivos.length === 0) {
            return res.status(404).json({ msg: 'No hay ninguna licencia guardada', code: 404 });
          }
      
          const nombreArchivo = archivos[0]; 
          const rutaRelativa = `licencia/${nombreArchivo}`;
      
          return res.status(200).json({
            msg: 'Licencia encontrada',
            code: 200, 
            info: {rutaRelativa, nombreArchivo}
          });
      
        } catch (error) {
          console.error(error);
          return res.status(500).json({ msg: 'Error al obtener la licencia', error: error.message });
        }
      }


    async convertirPdfADocx(req, res) {
        try {
            if (!req.params.filename) {
                return res.status(400).json({ msg: "No se ha proporcionado un PDF", code: 400 });
            }
            const pdfPath = path.join(__dirname, '../public/documentos/', req.params.filename);
            const docxPath = pdfPath.replace(/\.pdf$/, '.docx');
            const pythonScriptPath = path.join(__dirname, '../scripts/convert_pdf_to_docx.py');
            // Si el archivo ya existe, saltamos la conversión y lo servimos
            fs.access(docxPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    console.log("Archivo ya existe, descargando sin reconvertir:", docxPath);
                    return res.download(docxPath);
                }
                // No existe, lo generamos
                runPythonScript(pdfPath, docxPath, pythonScriptPath);

                // Esperamos que se genere
                esperarArchivo(docxPath, (err) => {
                    if (err) {
                        console.error("Archivo .docx no encontrado:", err);
                        return res.status(500).json({ msg: "Error: el archivo no se generó a tiempo", error: err.message });
                    }

                    res.download(docxPath, (err) => {
                        if (err) {
                            console.error("Error al descargar:", err);
                        }
                        programarEliminacion(docxPath); // Se programa la eliminación
                    });
                });
            });
        } catch (error) {
            console.error("Error general:", error);
            return res.status(500).json({ msg: "Error interno del servidor", error: error.message });
        }
    }

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
