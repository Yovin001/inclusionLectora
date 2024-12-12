import '../css/Perfil_Style.css';
import { getUser } from '../utilities/Sessionutil';
import React, { useEffect, useState } from 'react';
import { URLBASE } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';

const Perfil = () => {
    const usuario = getUser();
    const navigate = useNavigate();
    const [nombreUsuario, setNombreUsuario] = useState('');


    useEffect(() => {
        if (usuario && usuario.user.nombres) {
            setNombreUsuario(usuario.user.nombres);
        }
    });

    const obtenerFechaFormateada = (fechaString) => {
        const fecha = new Date(fechaString);
        fecha.setDate(fecha.getDate() + 1);
        const year = fecha.getFullYear();
        const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
        const day = ('0' + fecha.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    return (
        <> <header>
        <MenuBar />
    </header>
            <div className='container-fluid'>
                <div className='contenedor-centro'>
                    <div className="main-body " style={{ backgroundColor: '#F4EEFF' }}>
                        <div className="row gutters-sm">
                            <div className="col-md-4 mb-3">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex flex-column align-items-center text-center">
                                            <img
                                                src={usuario.user.foto ? `${URLBASE}/images/users/${usuario.user.foto}` : '/img/logo512.png'}
                                                alt="FotoUsuario"
                                                className="img-fluid"
                                                style={{ maxWidth: '300px', height: 'auto', borderRadius: '0.2rem' }} // Mantén la altura automática
                                            />
                                            <div className="mt-3">
                                                <h4 style={{ fontWeight: 'bold' }}>{usuario.nombres + " " + usuario.apellidos}</h4>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                                <div className="card mt-3">
                                    <ul className="list-group list-group-flush">
                                
                                        <li className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                            <button
                                                className="btn btn-link p-0"
                                                onClick={() => navigate('/cambio/clave')}
                                                style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold', border: 'none', background: 'none' }}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="feather feather-key mr-2 icon-inline"
                                                >
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="2" y1="12" x2="22" y2="12"></line>
                                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                                </svg>
                                                Cambiar Clave
                                            </button>
                                        </li>

                                    </ul>
                                </div>
                            </div>
                            <div class="col-md-8" style={{ marginTop: '85px' }}>
                                <div class="card-body p-4">
                                    <h6 style={{ fontWeight: 'bold' }}>Información personal</h6>
                                    <hr class="mt-0 mb-4" />
                                    <div class="row pt-1">
                                        <div class="col-6 mb-3">
                                            <h6>Correo electrónico</h6>
                                            <p class="text-muted">{usuario.correo}</p>
                                        </div>
                                        <div class="col-6 mb-3">
                                            <h6>Fecha de nacimiento</h6>
                                            <p class="text-muted">{obtenerFechaFormateada(usuario.user.fecha_nacimiento)}</p>
                                        </div>
                                    </div>
                                    <hr class="mt-0 mb-4" />
                                    <div class="row pt-1">
                                        <div class="col-6 mb-3">
                                            <h6>Número de contacto</h6>
                                            <p class="text-muted">{usuario.user.telefono}</p>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div></div></>


    );
};

export default Perfil;