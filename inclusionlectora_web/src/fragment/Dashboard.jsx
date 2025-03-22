import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, FormControl, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { peticionGet, peticionDelete } from '../utilities/hooks/Conexion';
import { getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import MenuBar from './MenuBar';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [documentos, setDocumentos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    const cargarDocumentos = () => {
        setLoading(true);
        peticionGet('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHRlcm5hbCI6IjU5NDc2MGYxLTkwN2UtMTFlZi04ZjRkLTMwZTM3YTJhYTgyZCIsImVtYWlsIjoieW92aW4udXJyZWdvQHVubC5lZHUuZWMiLCJjaGVjayI6dHJ1ZSwiaWF0IjoxNzQyNjA0MTI0LCJleHAiOjE3NDI2NDczMjR9.nLcVbBOKXLjLuvcjJvd3PlFV2HthjJm8lCx7tfHyMxY', `documento/1`)
            .then((info) => {
                if (info.code === 200) {
                    setDocumentos(info.info);
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
        peticionDelete('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHRlcm5hbCI6IjU5NDc2MGYxLTkwN2UtMTFlZi04ZjRkLTMwZTM3YTJhYTgyZCIsImVtYWlsIjoieW92aW4udXJyZWdvQHVubC5lZHUuZWMiLCJjaGVjayI6dHJ1ZSwiaWF0IjoxNzQyNjA0MTI0LCJleHAiOjE3NDI2NDczMjR9.nLcVbBOKXLjLuvcjJvd3PlFV2HthjJm8lCx7tfHyMxY', `documento/${docId}`)
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
        <div>
            <header>
                <MenuBar />
            </header>
            <div className='container-fluid'>
                <div className='contenedor-centro'>
                    <div className='contenedor-carta'>
                        <div className='contenedor-filo'>
                            <Button className='btn-normal mb-3' onClick={handleShowUploadModal}>
                                <FontAwesomeIcon icon={faPlus} /> Cargar documento
                            </Button>
                        </div>
                        <p className='titulo-primario'>Lista de Documentos</p>

                        <InputGroup className='mb-3'>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faSearch} />
                            </InputGroup.Text>
                            <FormControl
                                placeholder='Buscar por: Título'
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>

                        <div className='table-responsive'>
                            <table className='table table-striped'>
                                <thead>
                                    <tr>
                                        <th className='text-center'>Título</th>
                                        <th className='text-center'>Fecha</th>
                                        <th className='text-center'>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDocumentos.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center">No hay documentos disponibles.</td>
                                        </tr>
                                    ) : (
                                        filteredDocumentos
                                           
                                            .map((documento) => (
                                                <tr key={documento.external_id}>
                                                    <td>
                                                        <Button 
                                                            variant="link" 
                                                            onClick={() => navigate(`/extraer/${documento.external_id}`)}
                                                        >
                                                            {documento.nombre}
                                                        </Button>
                                                    </td>
                                                    <td className="text-center">
                                                        {new Date(documento.createdAt).toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </td>
                                                    <td className="text-center">
                                                        <Button
                                                            variant="btn btn-outline-danger btn-rounded"
                                                            onClick={() => eliminarDocumento(documento.external_id)}
                                                            className="btn-icon"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} /> Eliminar
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
