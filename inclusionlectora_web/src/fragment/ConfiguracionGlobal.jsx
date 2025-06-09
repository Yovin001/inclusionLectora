import React, { useState, useEffect } from 'react';
import MenuBar from './MenuBar';
import Modal from 'react-modal'; // Importar react-modal
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import { mensajesSinRecargar } from '../utilities/Mensajes';
import { borrarSesion, getToken } from '../utilities/Sessionutil';
import { useNavigate } from 'react-router-dom';
import '../css/ConfiguracionGlobal_Style.css';
import '../css/ExtractorModal_Style.css';

// Configurar el elemento root para accesibilidad
Modal.setAppElement('#root');

const ConfiguracionGlobal = () => {
  const [tamano, setTamano] = useState(0);
  const [nuevoTamano, setNuevoTamano] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clave, setClave] = useState('');
  const [claveError, setClaveError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    peticionGet(getToken(), `config/tamano`).then((info) => {
      if (info.code === 200) {
        setTamano(info.info);
        setNuevoTamano(info.info);
      } 
    });
  }, [navigate]);

  const handleActualizarTamano = () => {
    if (nuevoTamano > 0 && nuevoTamano <= 5) {
      peticionGet(getToken(), `config/tamano/${nuevoTamano}`).then((info) => {
        if (info.code === 200) {
          setTamano(info.info);
          mensajesSinRecargar('Tamaño actualizado con éxito', 'success');
        } else {
          mensajesSinRecargar(`Error al actualizar el tamaño: ${info.msg}`, 'error');
        }
      });
    } else {
      mensajesSinRecargar('Ingrese un valor válido (entre 1 y 5 MB)', 'error');
    }
  };

  const handleEliminarTodos = () => {
    setClave('');
    setClaveError(false);
    setModalIsOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!clave.trim()) {
      setClaveError(true);
      return;
    }
    const data = { key: clave };
    const response = await peticionPost(getToken(), `documentos/eliminar/todos`, data);
    if (response.code === 200) {
      mensajesSinRecargar('Eliminación completada con éxito', 'success');
      setModalIsOpen(false);
    } else {
      mensajesSinRecargar(`Error al eliminar documentos: ${response.msg}`, 'error');
    }
  };

  return (
    <>
      <header>
        <MenuBar />
      </header>
      <main className="contenedor-centro">
        <section className="cconfig-container">
          <h1 className="titulo-primario" style={{ textAlign: 'center' }}>
            Configuraciones del Sistema
          </h1>

          {/* Cambio de tamaño */}
          <section aria-labelledby="tamano-titulo" className="config-card">
            <h2 id="tamano-titulo">Cambio de tamaño de archivo</h2>
            <div className="config-form-group">
              <label htmlFor="tamanoArchivo" className="config-label">
                Tamaño en MB (máx: 5)
              </label>
              <select
                id="tamanoArchivo"
                className="config-form-control"
                value={nuevoTamano}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value >= 1 && value <= 5) {
                    setNuevoTamano(value);
                  }
                }}
                aria-describedby="tamanoDescripcion"
              >
                {[1, 2, 3, 4, 5].map((size) => (
                  <option key={size} value={size}>
                    {size} MB
                  </option>
                ))}
              </select>
              <small id="tamanoDescripcion" className="config-text-muted">
                Ingrese un tamaño permitido entre 1 y 5 MB.
              </small>
              <span className="config-current-value">
                Tamaño actual:{' '}
                <span aria-live="polite" aria-atomic="true">
                  {tamano} MB
                </span>
              </span>
              <div className="config-controls">
                <button
                  type="button"
                  className="btn-config-verde"
                  onClick={handleActualizarTamano}
                  aria-label="Aplicar nuevo tamaño de archivo"
                >
                  Cambiar tamaño
                </button>
              </div>
            </div>
          </section>

          {/* Eliminación de documentos */}
          <section aria-labelledby="eliminar-titulo" className="config-card">
            <h2 id="eliminar-titulo">Eliminación de documentos</h2>
            <div className="config-warning-box" role="alert">
              <p>Esta acción eliminará todos los archivos del sistema. Proceda con precaución.</p>
            </div>
            <div className="config-controls">
              <button
                className="btn-config-azul"
                onClick={handleEliminarTodos}
                aria-describedby="eliminar-advertencia"
                aria-label="Iniciar proceso de eliminación de todos los documentos"
              >
                Eliminar Archivos
              </button>
              <p id="eliminar-advertencia" className="sr-only">
                Se abrirá un cuadro de diálogo para confirmar la clave antes de eliminar.
              </p>
            </div>
          </section>
        </section>

        {/* Modal de confirmación */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          contentLabel="Confirmar eliminación de documentos"
          className="react-modal-content"
          overlayClassName="react-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-desc"
        >
          <h2 id="modal-title" className="modal-title">
            Confirmar eliminación
          </h2>
          <p id="modal-desc" className="modal-description">
            Por favor, ingrese la clave para confirmar la eliminación de todos los documentos. Esta acción no se puede deshacer.
          </p>
          <input
            type="password"
            aria-label="Clave de confirmación"
            aria-invalid={claveError}
            placeholder="Ingrese la clave"
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              setClaveError(false);
            }}
            className={claveError ? 'input-error' : ''}
            style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', marginBottom: '1rem' }}
          />
          {claveError && (
            <p style={{ color: 'red', fontSize: '0.9rem' }} role="alert">
              La clave es obligatoria.
            </p>
          )}
          <div className="modal-button-container">
            <button
              className="modal-button modal-button-cancel"
              onClick={() => setModalIsOpen(false)}
              aria-label="Cancelar eliminación"
            >
              Cancelar
            </button>
            <button
              className="modal-button modal-button-confirm-warning"
              onClick={confirmarEliminacion}
              disabled={!clave.trim()}
              aria-label="Confirmar eliminación de documentos"
            >
              Eliminar
            </button>
          </div>
        </Modal>
      </main>
    </>
  );
};

export default ConfiguracionGlobal;
