// ExtrasControls.js
import React from 'react';
import { Button } from 'react-bootstrap';
import { URLBASE } from '../../../utilities/hooks/Conexion';
import '../../../css/Extractor_Style.css';

const ExtrasControls = ({ external_id, audioName, fileURL, showPdf, setShowPdf }) => {
  return (
    <section
      className="extractor-extras-controls"
      aria-label="Controles de descarga y visualización"
      role="region"
    >
      <Button
        type="button"
        className="verde"
        aria-label={`Descargar el audio ${audioName}`}
        onClick={() => {
          const link = document.createElement('a');
          link.href = `${URLBASE}api/audio/descargar/${external_id}.mp3`;
          link.download = `${audioName}.mp3`;
          link.click();
        }}
      >
        Descargar audio
      </Button>

      <Button
        type="button"
        className="verde"
        aria-label={`Descargar el documento en formato Word del archivo ${audioName}`}
        onClick={() => {
          const link = document.createElement('a');
          link.href = `${URLBASE}api/pdf2docx/${external_id}.pdf`;
          link.download = `${audioName}.docx`;
          link.click();
        }}
      >
        Descargar DOCX
      </Button>

      <Button
        type="button"
        className="verde"
        aria-label={showPdf ? 'Ocultar PDF' : 'Mostrar PDF'}
        onClick={() => setShowPdf(!showPdf)}
      >
        {showPdf ? 'Ocultar PDF' : 'Ver PDF'}
      </Button>
    </section>
  );
};

export default ExtrasControls;
