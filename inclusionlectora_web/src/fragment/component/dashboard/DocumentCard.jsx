import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import '../../../css/Dashboard.css';
import { Button } from 'react-bootstrap';

const DocumentCard = ({ documento, onClick, onDelete }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const handleDeleteKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDelete();
    }
  };

  const fechaFormateada = new Date(documento.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article
      className="document-card"
      role="group"
      aria-label={`Documento: ${documento.nombre}`}
    >
      <header className="document-card-content">
        {/* BOTÓN VER */}
        <button
          type="button"
          className="document-view"
          onClick={onClick}
          onKeyDown={handleKeyDown}
          aria-label={`Ver documento: ${documento.nombre}`}
        >
          <div className="document-text">
            <h3 className="document-title">{documento.nombre}</h3>
            <time
              className="document-date"
              dateTime={new Date(documento.createdAt).toISOString()}
              aria-label={`Fecha de creación: ${fechaFormateada}`}
            >
              {fechaFormateada}
            </time>
          </div>
        </button>

        {/* BOTÓN ELIMINAR */}
        <Button
          type="button"
          className="document-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onKeyDown={handleDeleteKeyDown}
          aria-label={`Eliminar documento: ${documento.nombre}`}
        >
          <FontAwesomeIcon icon={faTrash} className="icon-trash" aria-hidden="true" />
        </Button>

      </header>
    </article>

  );
};

export default DocumentCard;
