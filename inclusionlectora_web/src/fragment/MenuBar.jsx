import React, { useState, useEffect } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { borrarSesion, getRolApi, getToken, getUser } from '../utilities/Sessionutil';
import { URLBASE } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router-dom';
import logoWhite from '../img/logo-white.png';
import '../css/MenuBar_Style.css';

const MenuBar = () => {
    const [fotoUsuario, setFotoUsuario] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [idRol, setIdRol] = useState('');
    const token = getToken();
    const navigate = useNavigate();

    useEffect(() => {
        const usuario = getUser();
        if (usuario) {
            setFotoUsuario("USUARIO_ICONO.png");
            setIdRol('1');
        }
    }, []);

    const handleCerrarSesion = () => {
        borrarSesion();
        navigate('/login');
    };

    return (
        <>
            {/* Primer renglón: logos y usuario */}
            <nav className="custom-navbar" role="navigation" aria-label="Barra superior">
                <button
                    className="menu-toggle"
                    aria-label="Abrir menú"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-expanded={menuOpen}
                >
                    ☰
                </button>
                <div className="navbar-left">
                    <img
                        src={logoWhite}
                        alt="Logo de la Universidad Nacional de Loja"
                        className="logo-unl"
                        onClick={() => navigate('/dashboard')}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
             
                    <Dropdown align="end" className="navbar-user-dropdown">
                        <Dropdown.Toggle
                            variant="link"
                            id="dropdown-user"
                            className="user-avatar-btn"
                            aria-label="Opciones de usuario"
                            aria-haspopup="true"
                        >
                            <img
                                src={`${URLBASE}/images/users/USUARIO_ICONO.png`}
                                alt={`Foto de perfil de ${getUser()?.user?.nombre || 'usuario'}`}
                                className="user-avatar"
                            />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end" role="menu" aria-labelledby="dropdown-user">
                            <Dropdown.Item
                                as="button"
                                onClick={() => navigate('/perfil')}
                                role="menuitem"
                            >
                                Perfil
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item
                                as="button"
                                onClick={handleCerrarSesion}
                                role="menuitem"
                            >
                                Cerrar sesión
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
              
            </nav>

            {/* Segundo renglón: botones de navegación */}
        
                <nav
                    className={`custom-navbar-secondary ${menuOpen ? 'open' : ''}`}
                    role="navigation"
                    aria-label="Menú de navegación principal"
                >
                    <div className="navbar-center">
                    
                            <Button
                                as="button"
                                onClick={() => navigate('/configuracion')}
                                className="nav-button"
                                aria-label="Configuraciones del sistema"
                            >
                                Configuraciones
                            </Button>
                      
                        <Button
                            as="button"
                            onClick={() => {
                                navigate('/reload-helper'); // ruta temporal para desmontar
                                setTimeout(() => navigate('/extraer/new'), 0); // redirige de inmediato
                            }}
                            className="nav-button"
                            aria-label="Extraer contenido de PDF"
                        >
                            Extraer PDF
                        </Button>

                        <Button
                            as="button"
                            onClick={() => navigate('/dashboard')}
                            className="nav-button"
                            aria-label="Ver documentos procesados"
                        >
                            Documentos
                        </Button>
                        <Button
                            as="button"
                            onClick={() => navigate('/contactanos')}
                            className="nav-button"
                            aria-label="Información y contacto"
                        >
                            Información
                        </Button>
                    </div>
                </nav>
         
        </>
    );
};

export default MenuBar; 