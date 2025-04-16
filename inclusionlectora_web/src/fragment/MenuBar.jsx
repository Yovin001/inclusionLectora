import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Dropdown, Container } from 'react-bootstrap';
import { borrarSesion, getRolApi, getToken, getUser } from '../utilities/Sessionutil';
import { URLBASE } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router-dom';
import logoWhite from '../img/logo-white.png';
import '../css/style.css';

const MenuBar = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [fotoUsuario, setFotoUsuario] = useState('');
    const [idRol, setIdRol] = useState('');
    const token = getToken();
    const navigate = useNavigate();

    useEffect(() => {
        const usuario = getUser();
        if (usuario) {
            setNombreUsuario(usuario.nombres ? `${usuario.nombres.toUpperCase()} ${usuario.apellidos.toUpperCase()}` : usuario.username);
            setFotoUsuario(usuario.user.foto);
            setIdRol(getRolApi());
        }
    }, []);

    const handleCerrarSesion = () => {
        borrarSesion();
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="navbar">
            <Container fluid className="navbar-custom-container">
                <Navbar.Brand href="#">
                    <img src={logoWhite} alt="Universidad Nacional de Loja" className="img-fluid me-2 header-logo" style={{ width: '200px' }} />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarNav" />
                <Navbar.Collapse id="navbarNav">
                    <Nav className="me-auto">
                        {token && (
                            <>
                                {idRol === '1' && (
                                    <>
                                    <Nav.Link href="/lecyov/configuracion" className="text-white">Configuraciones</Nav.Link>
                                    <Nav.Link href="/lecyov/peticiones/clave" className="text-white">Peticiones Claves</Nav.Link>
                                    </>
                                )}
                                <Nav.Link href="/lecyov/extraer/new" className="text-white">Extraer PDF</Nav.Link>
                                <Nav.Link href="/lecyov/dashboard" className="text-white">Documentos</Nav.Link>
                                <Nav.Link href="/lecyov/contactanos" className="text-white">Información</Nav.Link>
                            </>
                        )}
                    </Nav>
                    {token && (
                        <Dropdown align="end" className="ms-auto">
                            <Dropdown.Toggle variant="link" id="dropdown-user" className="d-flex align-items-center p-0">
                                <img
                                    src={`${URLBASE}images/users/${fotoUsuario}`}
                                    alt="FotoUsuario"
                                    className="rounded-circle"
                                    style={{ width: '40px', height: '40px', marginRight: '10px' }}
                                />
                                <span className="text-white">{nombreUsuario}</span>
                            </Dropdown.Toggle>

                            <Dropdown.Menu align="end">
                            <Dropdown.Item href="/lecyov/perfil">Perfil</Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={handleCerrarSesion}>Cerrar sesión</Dropdown.Item>
                         </Dropdown.Menu>
                        </Dropdown>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default MenuBar;