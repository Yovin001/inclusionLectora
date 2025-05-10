import React, { useState, useRef } from 'react';
import { GuardarArchivos, peticionGet, URLBASE } from '../../../utilities/hooks/Conexion';
import { getToken, getUser } from '../../../utilities/Sessionutil';
import mensajes from '../../../utilities/Mensajes';
import swal from 'sweetalert';
import '../../../css/Extractor_Style.css';
import { Button } from 'react-bootstrap';

const ExtractorUpload = ({ setFileURL, setAudioComplete, navegation }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false); // nuevo estado para ocultar el componente
  const beepInterval = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleKeyboardUpload = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      fileInputRef.current.click();
    }
  };

  const handleSave = async () => {
    if (!file) {
      mensajes("No se ha seleccionado un archivo", 'error', 'Error');
      return;
    }

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
    setSubmitted(true); // Ocultar el área de carga
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
        navegation(`/extraer/${info.info}`);
      }
    } catch (error) {
      clearInterval(beepInterval.current);
      mensajes("Error al guardar el documento", 'error', 'Error');
      setLoading(false);
    }
  };

  return (
    <section className="file-upload-card">
      {!loading ? (
        <>
          <h2 className='titulo-primario'>Carga tu documento PDF</h2>
  
          <label
            htmlFor="uploadFile1"
            className="file-upload-label"
            tabIndex="0"
            role="button"
            aria-label="Subir archivo PDF"
            onKeyDown={handleKeyboardUpload}
            onClick={() => fileInputRef.current.click()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              aria-hidden="true"
              role="img"
              focusable="false"
            >
              <title>Ícono de nube con flecha de subida</title>
              <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
              <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
            </svg>
            Subir archivo
  
            <input
              type="file"
              id="uploadFile1"
              className="file-upload-input"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              style={{ display: 'none' }}
              aria-label="Seleccionar archivo PDF"
            />
          </label>
  
          <p aria-live="polite">
            {file
              ? <>📄 <strong>Archivo seleccionado:</strong> {file.name}</>
              : <strong>No se ha seleccionado un archivo</strong>
            }
          </p>
  
          <Button
            className='verde'
            onClick={handleSave}
            disabled={!file}
            aria-disabled={!file}
            aria-label="Botón para extraer el contenido del archivo PDF"
          >
            EXTRAER
          </Button>
        </>
      ) : (
        <section className="loading-container" aria-live="assertive">
          <p className="loading-text">Cargando...</p>
          <div className="loading-spinner" role="status" aria-label="Cargando, por favor espera"></div>
        </section>
      )}
    </section>
  );
  
  
  
};

export default ExtractorUpload;
