// ExtrasControls.js
import React from 'react';
import { Button } from 'react-bootstrap';
import { URLBASE } from '../../../utilities/hooks/Conexion';
import '../../../css/Extractor_Style.css';

const ExtrasControls = ({ external_id, audioName, fileURL, showPdf, setShowPdf }) => {
  return (
    <div className="extractor-extras-controls">
      <Button className="verde"
        onClick={() => {
          const link = document.createElement('a');
          link.href = `${URLBASE}api/audio/descargar/${external_id}.mp3`;
          link.download = `${audioName}.mp3`;
          link.click();
        }}
      >
        DESCARGAR AUDIO
      </Button>

      <Button className="verde"
        onClick={() => {
          const link = document.createElement('a');
          link.href = `${URLBASE}api/pdf2docx/${external_id}.pdf`;
          link.download = `${audioName}.docx`;
          link.click();
        }}
      >
        DESCARGAR DOCX
      </Button>

      <Button className="azul" onClick={() => setShowPdf(!showPdf)}>
        {showPdf ? 'OCULTAR PDF' : 'VER PDF'}
      </Button>
    </div>
  );
};

export default ExtrasControls;
