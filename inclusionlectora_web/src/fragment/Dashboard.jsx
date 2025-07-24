import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, FormControl, InputGroup, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import { peticionGet, peticionDelete } from '../utilities/hooks/Conexion';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import { mensajesSinRecargar } from '../utilities/Mensajes';
import MenuBar from './MenuBar';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';
import '../css/ExtractorModal_Style.css';
import DocumentCard from './component/dashboard/DocumentCard';
import Modal from 'react-modal'; // Importamos react-modal como en ConfiguracionGlobal
import LiveRegion from './component/skipToContent/LiveRegion';
import SkipToContent from './component/skipToContent/SkipToContent';

// Configurar el elemento root para accesibilidad (igual que en ConfiguracionGlobal)
Modal.setAppElement('#root');

const Dashboard = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();
    const [documentos, setDocumentos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchResultsCount, setSearchResultsCount] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [documentoAEliminar, setDocumentoAEliminar] = useState(null);
    const liveRegionRef = useRef(null);
    const mainContentRef = useRef(null);
    const cargarDocumentos = () => {
        setLoading(true);
        peticionGet(getToken(), `documento/${getUser().user.id}`)
            .then((info) => {
                if (info.code === 200) {
                    setDocumentos(info.info);
                } else if (info.msg.toLowerCase().includes("token")) {
                    borrarSesion();
                    navigate('/login');
                }
            })
            .catch((error) => {
                console.error('Error al cargar documentos:', error);
                mensajesSinRecargar('Error al cargar documentos', 'error', 'Error');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDeleteClick = (docId) => {
        setDocumentoAEliminar(docId);
        setModalIsOpen(true);
    };

    const confirmarEliminacion = () => {
        if (isDeleting || !documentoAEliminar) return;

        setIsDeleting(true); // Bloquea otros clics
        if (documentoAEliminar) {
            peticionDelete(getToken(), `documento/${documentoAEliminar}`)
                .then((info) => {
                    if (info.code === 200) {
                        mensajesSinRecargar('Documento eliminado con éxito', 'success', 'Éxito');
                        setDocumentos(prevDocs => prevDocs.filter(doc => doc.external_id !== documentoAEliminar));
                    } else {
                        mensajesSinRecargar('Error al eliminar el documento', 'error', 'Error');
                    }
                })
                .catch((error) => {
                    console.error('Error al eliminar el documento:', error);
                    mensajesSinRecargar('Error al eliminar el documento', 'error', 'Error');
                })
                .finally(() => {
                    setIsDeleting(false); // Desbloquea
                    setModalIsOpen(false);
                    setDocumentoAEliminar(null);
                });
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredDocumentos = documentos.filter((documento) =>
        documento.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setSearchResultsCount(filteredDocumentos.length);

        if (searchTerm && liveRegionRef.current) {
            const message = filteredDocumentos.length === 0
                ? 'No se encontraron documentos con ese criterio'
                : `Se encontraron ${filteredDocumentos.length} documentos. Desplácese hacia abajo para verlos`;

            liveRegionRef.current.textContent = message;
        }
    }, [filteredDocumentos, searchTerm]);

    const handleShowUploadModal = () => {
        navigate("/extraer/new");
    };

    useEffect(() => {
        cargarDocumentos();
    }, []);

    return (
        <>          <SkipToContent
            targetId="main-content"
            label="Area de documentos"
        />
            <LiveRegion />
            <header>
                <MenuBar />
            </header>

            <main ref={mainContentRef}
                id="main-content"
                tabIndex="-1"
                aria-labelledby="page-title"
                className='contenedor-centro'>
                <section className='contenedor-carta'>
                    <div className='contenedor-filo'>
                        <Button className='btn-normal' onClick={handleShowUploadModal}>
                            <FontAwesomeIcon icon={faPlus} aria-label="Cargar documento" /> Cargar documento
                        </Button>
                    </div>

                    <h1 className='titulo-primario'>Lista de Documentos</h1>

                    <div
                        ref={liveRegionRef}
                        aria-live="polite"
                        aria-atomic="true"
                        className="visually-hidden"
                    />

                    <Form.Label htmlFor="busqueda-documentos" className="visually-hidden">Buscar documentos</Form.Label>
                    <InputGroup className='mb-3'>
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
                        </InputGroup.Text>
                        <FormControl
                            id="busqueda-documentos"
                            placeholder='Buscar por: Título'
                            value={searchTerm}
                            onChange={handleSearchChange}
                            aria-describedby="search-results-count"
                        />
                    </InputGroup>

                    {searchTerm && (
                        <p id="search-results-count" className="mb-3">
                            {filteredDocumentos.length === 0
                                ? 'No se encontraron documentos con ese criterio'
                                : `Documentos encontrados: ${filteredDocumentos.length}`}
                        </p>
                    )}

                    <section className="document-grid">
                        {loading ? (
                            <p className="text-muted">Cargando documentos...</p>
                        ) : filteredDocumentos.length === 0 ? (
                            <p className="text-muted">
                                {'No hay documentos disponibles.'}
                            </p>
                        ) : (
                            filteredDocumentos.map((documento) => (
                                <DocumentCard
                                    key={documento.external_id}
                                    documento={documento}
                                    onClick={() => navigate(`/extraer/${documento.external_id}`)}
                                    onDelete={() => handleDeleteClick(documento.external_id)}
                                />
                            ))
                        )}
                    </section>
                </section>
            </main>

            {/* Modal de confirmación para eliminar documento - Estilo igual a ConfiguracionGlobal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Confirmar eliminación de documento"
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
                    ¿Estás seguro que deseas eliminar este documento? Esta acción no se puede deshacer.
                </p>

                <div className="modal-button-container">
                    <button
                        className="modal-button modal-button-confirm-warning"
                        onClick={confirmarEliminacion}
                        aria-label="Confirmar eliminación de documento"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                    <button
                        className="modal-button modal-button-cancel"
                        onClick={() => setModalIsOpen(false)}
                        aria-label="Cancelar eliminación"
                        disabled={isDeleting} // opcional: evitar cerrar durante proceso
                    >
                        Cancelar
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Dashboard;