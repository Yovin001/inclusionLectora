import React, { useState, useEffect, useRef } from 'react';
import MenuBar from './MenuBar';
import Modal from 'react-modal'; // Importar react-modal
import { Button } from 'react-bootstrap';
import { peticionGet, peticionPost, peticionPostFormData, URLBASE } from '../utilities/hooks/Conexion';
import { mensajesSinRecargar } from '../utilities/Mensajes';
import { borrarSesion, getToken } from '../utilities/Sessionutil';
import { useNavigate } from 'react-router-dom';
import '../css/ConfiguracionGlobal_Style.css';
import '../css/ExtractorModal_Style.css';
import LiveRegion from './component/skipToContent/LiveRegion';
import SkipToContent from './component/skipToContent/SkipToContent';

// Configurar el elemento root para accesibilidad
Modal.setAppElement('#root');

const ConfiguracionGlobal = () => {
  const [tamano, setTamano] = useState(0);
  const [nuevoTamano, setNuevoTamano] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [clave, setClave] = useState('');
  const [claveError, setClaveError] = useState(false);
  const navigate = useNavigate();
  const [mostrarCargaLicencia, setMostrarCargaLicencia] = useState(false);
  const mainContentRef = useRef(null);
  const [licencia, setLicencia] = useState(null);
  const [licenciaPath, setLicenciaPath] = useState(null);

  useEffect(() => {
    peticionGet(getToken(), `config/tamano`).then((info) => {
      if (info.code === 200) {
        setTamano(info.info);
        setNuevoTamano(info.info);
      } else if (
        info.msg.toLowerCase().includes('token') ||
        info.msg === 'Acceso denegado: No tiene permisos de administrador'
      ) {
        borrarSesion();
        navigate('/login');
      }
    });
      peticionGet(getToken(), `licencia`)
          .then((info) => {
            if (info.code === 200) {
              setLicenciaPath(`${URLBASE}${info.info.rutaRelativa}`);
            } else {
              mensajesSinRecargar("No se encontró la licencia", 'error', 'Error');
            }
          })
          .catch(() => {
            mensajesSinRecargar("Error al buscar la licencia", 'error', 'Error');
          });
  }, [navigate]);

  const handleActualizarTamano = () => {
    if (nuevoTamano > 0 && nuevoTamano <= 5) {
      peticionGet(getToken(), `config/tamano/${nuevoTamano}`).then((info) => {
        if (info.code === 200) {
          setTamano(info.info);
          mensajesSinRecargar('Tamaño actualizado con éxito', 'success');
        } else {
          mensajesSinRecargar(`Error al actualizar el tamaño: ${info.msg}`, "error", "Error");
        }
      });
    } else {
      mensajesSinRecargar('Ingrese un valor válido (entre 1 y 5 MB)', "error", "Error");
    }
  };
     const handleGuardarLicencia = async () => {
          if (!licencia) {
              mensajesSinRecargar('No se ha seleccionado una licencia', 'error', 'Error');
              return;
          }
          const formData = new FormData();
          formData.append('licencia', licencia);
  
          try {
              const data = await peticionPostFormData(getToken(), `licencia`, formData);
              if (data.code === 200) {
                  mensajesSinRecargar('Licencia guardada correctamente', 'success');
                  setLicenciaPath(`${URLBASE}${data.info.rutaRelativa}`);
                  setMostrarCargaLicencia(false);
              } else {
                 mensajesSinRecargar('Error al guardar la licencia', 'error', 'Error');
              }
          } catch (error) {
              mensajesSinRecargar('Error al guardar la licencia', 'error', 'Error');
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
      mensajesSinRecargar(`Error al eliminar documentos: ${response.msg}`, "error", "Error");
    }
  };
  const handleCambiarLicencia = () => {
    setMostrarCargaLicencia((prev) => !prev);
  };

  return (
    <>
      <SkipToContent
        targetId="main-content"
        label="Configuraciones globales"
      />

      <LiveRegion />
      <header>
        <MenuBar />
      </header>
      <main ref={mainContentRef}
        id="main-content"
        tabIndex="-1"
        aria-labelledby="page-title"
        className="contenedor-centro">
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
                <Button
                  type="button"
                  className="btn-config-verde"
                  onClick={handleActualizarTamano}
                  aria-label="Aplicar nuevo tamaño de archivo"
                >
                  Cambiar tamaño
                </Button>
              </div>
            </div>
          </section>

          {/* Eliminación de documentos */}
          <section aria-labelledby="eliminar-titulo" className="config-card">
            <h2 id="eliminar-titulo">Eliminación de documentos</h2>
            <div className="config-warning-box" role="region" aria-live="polite">
              <p>Esta acción eliminará todos los archivos del sistema. Proceda con precaución.</p>
            </div>
            <div className="config-controls">
              <Button
                className="btn-config-azul"
                onClick={handleEliminarTodos}
                aria-describedby="eliminar-advertencia"
                aria-label="Iniciar proceso de eliminación de todos los documentos"
              >
                Eliminar Archivos
              </Button>
              <p id="eliminar-advertencia" className="sr-only">
                Se abrirá un cuadro de diálogo para confirmar la clave antes de eliminar.
              </p>
            </div>
          </section>

          {/* Licencia de la plataforma */}
          <section aria-labelledby="licencia-titulo" className="config-card">
            <h2 id="licencia-titulo">Licencia de la plataforma web</h2>

            <div className="config-form-group">
              {/* Mostrar botón Cambiar Licencia solo si NO está visible la zona de carga */}
              {!mostrarCargaLicencia && (
                <Button
                  className="btn-config-azul"
                  onClick={handleCambiarLicencia}
                  aria-expanded={mostrarCargaLicencia}
                  aria-controls="licencia-carga"
                >
                  Cambiar Licencia
                </Button>
              )}

              {mostrarCargaLicencia && (
                <div id="licencia-carga" className="config-subcard">
                  <div
                    className="file-upload-dropzone"
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const droppedFile = e.dataTransfer.files[0];
                      if (droppedFile && droppedFile.type.startsWith("application/pdf")) {
                        setLicencia(droppedFile);
                      }
                    }}
                  >
                    <label
                      htmlFor="licencia-pdf"
                      className="file-upload-label"
                      tabIndex="0"
                      role="button"
                      aria-label="Seleccionar archivo PDF"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          document.getElementById('licencia-pdf').click();
                        }
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('licencia-pdf').click();
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">
                        <title>Ícono de nube con flecha de subida</title>
                        <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
                        <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
                      </svg>
                      {licencia ? `Licencia seleccionada: ${licencia.name}` : 'Arrastra y suelta o haz clic para subir licencia'}
                    </label>


                    <input
                      id="licencia-pdf"
                      type="file"
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        setLicencia(e.target.files[0]);
                      }}
                      aria-label="Subir licencia"
                    />
                  </div>

                  {/* Botones: Subir y Cancelar */}
                  <div className="d-flex justify-content-between mt-4">
                    <Button
                      className="btn-config-azul"
                      onClick={handleGuardarLicencia}
                      aria-label="Confirmar carga de nueva licencia"
                    >
                      Subir nueva licencia
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() => setMostrarCargaLicencia(false)}
                      aria-label="Cancelar carga de licencia"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Siempre visible: Enlace a archivo actual */}
              <span className="config-current-value" style={{ marginTop: '1rem' }}>
                Archivo actual:{' '}
                <a
                  href={licenciaPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton-ver-licencia"
                >
                  Ver Licencia (PDF)
                </a>
              </span>
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

            <Button
              className="modal-button modal-button-confirm-warning"
              onClick={confirmarEliminacion}
              disabled={!clave.trim()}
              aria-label="Confirmar eliminación de documentos"
            >
              Eliminar
            </Button>
            <Button
              className="modal-button modal-button-cancel"
              onClick={() => setModalIsOpen(false)}
              aria-label="Cancelar eliminación"
            >
              Cancelar
            </Button>
          </div>
        </Modal>
      </main>
    </>
  );
};

export default ConfiguracionGlobal;
