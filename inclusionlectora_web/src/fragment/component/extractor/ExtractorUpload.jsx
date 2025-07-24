import React, { useState, useRef, useCallback } from 'react';
import { GuardarArchivos, peticionGet, URLBASE } from '../../../utilities/hooks/Conexion';
import { getToken, getUser } from '../../../utilities/Sessionutil';
import Modal from 'react-modal';
import '../../../css/Extractor_Style.css';
import '../../../css/ExtractorModal_Style.css';
import { Button } from 'react-bootstrap';
import { mensajesSinRecargar } from '../../../utilities/Mensajes';

const BASE_PATH = '/lecyov';

Modal.setAppElement('#root');

const ExtractorUpload = ({ setFileURL, setAudioComplete, navegation }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const beepInterval = useRef(null);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const playSound = (path) => {
    const audio = new Audio(path);
    audio.play();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      const pdfURL = URL.createObjectURL(selectedFile);
      setFileURL(pdfURL);
    }
  };

  const validateFile = (file) => {
    if (!file) return false;
    
    // Validar que sea PDF
    if (file.type !== 'application/pdf') {
      mensajesSinRecargar('Solo se permiten archivos PDF', 'error', 'Error');
      return false;
    }
    
    return true;
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const selectedFile = files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        const pdfURL = URL.createObjectURL(selectedFile);
        setFileURL(pdfURL);
      }
    }
  }, [setFileURL]);

  const handleKeyboardUpload = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      fileInputRef.current.click();
    }
  };

  const openModal = (title, text, type = 'info', onConfirm) => {
    setModalContent({
      title,
      text,
      type,
      onConfirm
    });
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSave = async () => {
    if (!file) {
      mensajesSinRecargar('No se ha seleccionado un archivo', 'error', 'Error');
      return;
    }

    const existingDocumentResponse = await peticionGet(
      getToken(),
      `documento/entidad/${getUser().user.id}/${file.name}`
    );

    if (existingDocumentResponse && existingDocumentResponse.info === true) {
      openModal(
        'Documento ya existe',
        `El documento "${file.name}" ya existe. ¿Quieres guardarlo con el mismo nombre?`,
        'warning',
        async () => {
          await proceedWithUpload();
        }
      );
      return;
    }

    await proceedWithUpload();
  };
  const handleLabelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current.click();
  };
  const proceedWithUpload = async () => {
    setLoading(true);
    setSubmitted(true);
    playSound(BASE_PATH+'/audio/cargando.mp3');

    beepInterval.current = setInterval(() => {
      playSound(BASE_PATH+'/audio/beepbeepbeep-53921.mp3');
    }, 5000);

    const formData = new FormData();
    formData.append('nombre', file.name);
    formData.append('documento', file);
    formData.append('id', getUser().user.id);

    try {
      const info = await GuardarArchivos(formData, getToken(), "/documento");
    
      if (info.code === 200) {
        const nombreAudio = info.info.nombre;
        setAudioComplete(`${URLBASE}audio/completo/${nombreAudio}.mp3`);
        setLoading(false);
        clearInterval(beepInterval.current);
        navegation(`/extraer/${info.info}`);
      } else {
        mensajesSinRecargar(info.msg || 'Error inesperado', 'error', 'Error');
        setLoading(false);
        clearInterval(beepInterval.current);
      }
    
    } catch (error) {
      clearInterval(beepInterval.current);
      setLoading(false);
    
      if (error.response && error.response.status === 413) {
        mensajesSinRecargar(error.response.msg, 'error', 'Error');
      } else {
        mensajesSinRecargar('Error al guardar el documento', 'error', 'Error');
      }
    }
    
  };

  return (
    <section className="file-upload-card">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="react-modal-content"
        overlayClassName="react-modal-overlay"
        contentLabel={modalContent.title}
        ariaHideApp={false}
        role="alertdialog"
      >
        <h2 className="modal-title">{modalContent.title}</h2>
        <p className="modal-description">{modalContent.text}</p>
        <div className="modal-button-container">
          <button
            onClick={() => {
              if (modalContent.onConfirm) modalContent.onConfirm();
              closeModal();
            }}
            className={`modal-button ${modalContent.type === 'warning' ? 'modal-button-confirm-warning' : 'modal-button-confirm'}`}
            autoFocus
            aria-label="Confirmar acción"
          >
            {modalContent.type === 'warning' ? 'Guardar' : 'Aceptar'}
          </button>
          {modalContent.type === 'warning' && (
            <button
              onClick={closeModal}
              className="modal-button modal-button-cancel"
              aria-label="Cancelar operación"
            >
              Cancelar
            </button>
          )}
        </div>
      </Modal>

      {!loading ? (
        <>
          <h2 className='titulo-primario'>Carga tu documento PDF</h2>

          <div 
            className={`file-upload-dropzone ${isDragging ? 'dragging' : ''}`}
            ref={dropAreaRef}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <label
              htmlFor="uploadFile1"
              className="file-upload-label"
              tabIndex="0"
              role="button"
              aria-label="Seleccionar archivo PDF"
              onKeyDown={handleKeyboardUpload}
              onClick={handleLabelClick}  // Manejador modificado
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
              {isDragging ? 'Suelta el archivo aquí' : 'Arrastra y suelta o haz clic para subir archivo'}
            </label>
            
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
          </div>

          <p aria-live="polite">
            {file
              ? <alert  role="alert" >Archivo seleccionado: {file.name}</alert>
              : <strong>No se ha seleccionado un archivo</strong>
            }
          </p>

          <Button
            className='verde'
            onClick={handleSave}
            aria-label="Botón para cargar el archivo PDF"
          >
            CARGAR
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