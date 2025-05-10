// ExtractorUpload.js
import React, { useState, useRef } from 'react';
import { GuardarArchivos, peticionGet, URLBASE } from '../../../utilities/hooks/Conexion';
import { getToken, getUser } from '../../../utilities/Sessionutil';
import mensajes from '../../../utilities/Mensajes';
import swal from 'sweetalert';

const ExtractorUpload = ({ setFileURL, setAudioComplete, navegation }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const beepInterval = useRef(null);

  const playSound = (path) => {
    const audio = new Audio(path);
    audio.play();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    const pdfURL = URL.createObjectURL(selectedFile);
    setFileURL(pdfURL);
  };

  const handleSave = async () => {
    if (!file) {
      mensajes("No se ha seleccionado un archivo", 'error', 'Error');
      return;
    }

    // Verificar si el documento ya existe
    const existingDocumentResponse = await peticionGet(
      getToken(),
      `documento/entidad/${getUser().user.id}/${file.name}`
    );

    if (existingDocumentResponse && existingDocumentResponse.info === true) {
      const confirmOverwrite = await swal({
        title: "Documento ya existe",
        text: `El documento "${file.name}" ya existe. ¿Quieres guardarlo con el mismo nombre?`,
        icon: "warning",
        buttons: {
          cancel: "Cancelar",
          confirm: {
            text: "Guardar",
            value: true,
            visible: true,
            className: "btn-danger",
          },
        },
        dangerMode: true,
      });

      if (!confirmOverwrite) {
        mensajes("Operación cancelada por el usuario.", 'info', 'Información');
        return;
      }
    }

    setLoading(true);
    playSound('/lecyov/audio/cargando.mp3');

    beepInterval.current = setInterval(() => {
      playSound('/lecyov/audio/beepbeepbeep-53921.mp3');
    }, 5000);

    const formData = new FormData();
    formData.append('nombre', file.name);
    formData.append('documento', file);
    formData.append('id', getUser().user.id);

    try {
      const info = await GuardarArchivos(formData, getToken(), "/documento");
      clearInterval(beepInterval.current);

      if (info.code !== 200) {
        mensajes(info.msg, 'error', 'Error');
        setLoading(false);
      } else {
        const nombreAudio = info.info.nombre;
        setAudioComplete(`${URLBASE}audio/completo/${nombreAudio}.mp3`);
        setLoading(false);
        navegation(`/extraer/${info.info}`); // Redirige a la vista del nuevo documento/audio
      }
    } catch (error) {
      clearInterval(beepInterval.current);
      mensajes("Error al guardar el documento", 'error', 'Error');
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-card">
      <h2>Carga tu documento PDF</h2>
      <input type="file" onChange={handleFileChange} accept=".pdf" />
      <button onClick={handleSave} disabled={!file}>
        EXTRAER
      </button>
      {loading && <p>Cargando...</p>}
    </div>
  );
};

export default ExtractorUpload;
