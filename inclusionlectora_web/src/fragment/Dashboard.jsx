import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, FormControl, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import { peticionGet, peticionDelete } from '../utilities/hooks/Conexion';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import MenuBar from './MenuBar';
import { useNavigate } from 'react-router-dom';
import '../css/style.css';
import DocumentCard from './component/dashboard/DocumentCard';

const Dashboard = () => {
    const navigate = useNavigate();
    const [documentos, setDocumentos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const cargarDocumentos = () => {
        setLoading(true);
        peticionGet(getToken(), `documento/${getUser().user.id}`)
            .then((info) => {
                if (info.code === 200) {
                    setDocumentos(info.info);
                } else if (
                    info.msg.toLowerCase().includes("token")
                ) {
                    borrarSesion();
                    navigate('/login');
                }
                
            })
            .catch((error) => {
                console.error('Error al cargar documentos:', error);
                mensajes('Error al cargar documentos', 'error', 'Error');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const eliminarDocumento = (docId) => {
        peticionDelete(getToken(), `documento/${docId}`)
            .then((info) => {
                if (info.code === 200) {
                    mensajes('Documento eliminado con éxito', 'success', 'Éxito');
                    setDocumentos((prevDocs) => prevDocs.filter((doc) => doc.external_id !== docId));
                } else {
                    mensajes('Error al eliminar el documento', 'error', 'Error');
                }
            })
            .catch((error) => {
                console.error('Error al eliminar el documento:', error);
                mensajes('Error al eliminar el documento', 'error', 'Error');
            });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredDocumentos = documentos.filter((documento) =>
        documento.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShowUploadModal = () => {
        navigate("/extraer/new");
    };

    useEffect(() => {
        cargarDocumentos();
    }, []);

    return (
        <>
            <header>
                <MenuBar />
            </header>

            <main className='contenedor-centro'>
                <section className='contenedor-carta'>
                    <div className='contenedor-filo'>
                        <Button className='btn-normal' onClick={handleShowUploadModal}>
                            <FontAwesomeIcon icon={faPlus} aria-label="Cargar documento" /> Cargar documento
                        </Button>
                       
                    </div>
                    <p className='titulo-primario m-0'>Lista de Documentos</p>
                    <InputGroup className='mb-3'>
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} aria-label="Buscar" />
                        </InputGroup.Text>
                        <FormControl
                            placeholder='Buscar por: Título'
                            value={searchTerm}
                            onChange={handleSearchChange}
                            aria-label="Campo de búsqueda de documentos"
                        />
                    </InputGroup>

                    <section className="document-grid ">
                        {loading ? (
                            <p className="text-muted">Cargando documentos...</p>
                        ) : filteredDocumentos.length === 0 ? (
                            <p className="text-muted">No hay documentos disponibles.</p>
                        ) : (
                            filteredDocumentos.map((documento) => (
                                <DocumentCard
                                    key={documento.external_id}
                                    documento={documento}
                                    onClick={() => navigate(`/extraer/${documento.external_id}`)}
                                    onDelete={() => eliminarDocumento(documento.external_id)}
                                />
                            ))
                        )}
                    </section>
                </section>
            </main>
        </>
    );
};

export default Dashboard;
