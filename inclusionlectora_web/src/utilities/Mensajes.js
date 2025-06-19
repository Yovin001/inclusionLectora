import React from 'react';
import { createRoot } from 'react-dom/client';
import Modal from 'react-modal';
import '../css/Mensajes_Style.css';
import { Button } from 'react-bootstrap';
// Configurar el elemento raíz de accesibilidad
Modal.setAppElement('#root');

// Mensaje con recarga de página (accesible)
export const mensajes = (texto, type = 'success', title = 'OK') => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const handleClose = () => {
    root.unmount();
    document.body.removeChild(container);
    window.location.reload();
  };

  root.render(
    <Modal
      isOpen
      onRequestClose={handleClose}
      contentLabel={title}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2>{title}</h2>
      <p>{texto}</p>
      <Button
        onClick={handleClose}
        autoFocus
        className="modal-button"
        aria-label={texto}
      >
        OK
      </Button>
    </Modal>
  );
};

// Mensaje sin recargar la página (accesible)
export const mensajesSinRecargar = (texto, type = 'success', title = 'OK') => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const handleClose = () => {
    root.unmount();
    document.body.removeChild(container);
  };

  root.render(
    <Modal
      isOpen
      onRequestClose={handleClose}
      contentLabel={title}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2>{title}</h2>
      <p>{texto}</p>
      <Button
        onClick={handleClose}
        autoFocus
        className="modal-button"
        aria-label={texto}
      >
        OK
      </Button>
    </Modal>
  );
};