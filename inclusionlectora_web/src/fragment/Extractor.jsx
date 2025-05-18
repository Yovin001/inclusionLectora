import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import ExtractorUpload from './component/extractor/ExtractorUpload';
import AudioPlayer from './component/extractor/AudioPlayer';
import ExtrasControls from './component/extractor/ExtrasControls';
import { URLBASE, peticionGet } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';
import {mensajesSinRecargar}  from '../utilities/Mensajes';
import '../css/Extractor_Style.css';

const Extractor = () => {
  const [fileURL, setFileURL] = useState(null);
  const [audioComplete, setAudioComplete] = useState(null);
  const [audioName, setAudioName] = useState('');
  const [showPdf, setShowPdf] = useState(false);
  const { external_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (external_id && external_id !== "new") {
      const audioPath = `${URLBASE}audio/completo/${external_id}.mp3`;
      setAudioComplete(audioPath);
      setFileURL(`${URLBASE}documentos/${external_id}.pdf`);

      peticionGet(getToken(), `documento/one/${external_id}`)
        .then((info) => {
          if (info.code === 200) {
            setAudioName(info.info.nombre);
          } else {
            mensajesSinRecargar("No se encontró el documento", 'error', 'Error');
            navigate('/dashboard');
          }
        })
        .catch(() => {
          mensajesSinRecargar("Error al buscar el documento", 'error', 'Error');
          navigate('/dashboard');
        });
    }
  }, [external_id, navigate]);

  return (
    <>
      <MenuBar />
      <div className="extractor-container"  aria-labelledby="page-title">
        <h1 id="page-title" className="visually-hidden">Extractor de Audios y Documentos</h1>

        {(!audioComplete && (!external_id || external_id === "new")) ? (
          <section aria-label="Subida de archivo de audio o documento">
            <ExtractorUpload 
              setFileURL={setFileURL} 
              setAudioComplete={setAudioComplete} 
              navegation={navigate} 
            />
          </section>
        ) : (
          <>
            <section aria-label="Reproductor de Audio">
              <AudioPlayer 
                audioComplete={audioComplete} 
                audioName={audioName} 
                external_id={external_id}
              />
            </section>

            <section aria-label="Controles adicionales">
              <ExtrasControls
                external_id={external_id}
                audioName={audioName}
                fileURL={fileURL}
                showPdf={showPdf}
                setShowPdf={setShowPdf}
              />
            </section>

            {showPdf && (
              <section aria-label="Visualización del Documento PDF">
                <iframe src={fileURL} title={`Documento PDF: ${audioName || 'sin título'}`}>
                  {/* Mensaje alternativo para navegadores que no soportan iframe */}
                  Este navegador no soporta la vista previa de documentos. Puedes descargar el PDF aquí: 
                  <a href={fileURL} download>Descargar PDF</a>.
                </iframe>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Extractor;
