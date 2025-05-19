import '../css/Perfil_Style.css';
import { getUser } from '../utilities/Sessionutil';
import React, { useEffect, useState } from 'react';
import { URLBASE } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import { Button } from 'react-bootstrap';

const Perfil = () => {
    const usuario = getUser();
    const navigate = useNavigate();
    const [nombreUsuario, setNombreUsuario] = useState('');

    useEffect(() => {
        if (usuario && usuario.user.nombres) {
            setNombreUsuario(usuario.user.nombres);
        }
    }, [usuario]);

    const obtenerFechaFormateada = (fechaString) => {
        const fecha = new Date(fechaString);
        fecha.setDate(fecha.getDate() + 1);
        const year = fecha.getFullYear();
        const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
        const day = ('0' + fecha.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    return (
        <>
            <header>
                <MenuBar />
            </header>

            <main className="contenedor-centro" aria-labelledby="perfil-titulo">
                <h1 id="perfil-titulo" className="sr-only">Perfil de usuario</h1>

                <section className="main-body">
                    <div className="row gutters-sm">
                        <section className="col-md-4 mb-3">
                            <article className="card" aria-labelledby="info-usuario-titulo">
                                <div className="card-body">
                                    <h2 id="info-usuario-titulo" className="sr-only">Información básica del usuario</h2>
                                    <figure className="d-flex flex-column align-items-center text-center">
                                        <img
                                            src={usuario.user.foto ? `${URLBASE}/images/users/${usuario.user.foto}` : '/img/logo512.png'}
                                            alt={`Foto de perfil de ${usuario.nombres} ${usuario.apellidos}`}
                                            className="img-fluid"
                                            style={{ maxWidth: '300px', height: 'auto', borderRadius: '0.2rem' }}
                                        />
                                        <figcaption className="mt-3">
                                            <h3 style={{ fontWeight: 'bold' }}>{usuario.nombres + " " + usuario.apellidos}</h3>
                                        </figcaption>
                                    </figure>
                                </div>
                            </article>

                            <article className="card mt-3" aria-labelledby="acciones-titulo">
                                <Button
                                    className='azul'
                                    onClick={() => navigate('/cambio/clave')}
                                    aria-label="Cambiar contraseña"
                                >
                                    Cambiar Clave
                                </Button>
                            </article>
                        </section>

                        <section className="col-md-8" style={{ marginTop: '85px' }}>
                            <article className="card-body p-4" aria-labelledby="detalles-personales-titulo">
                                <h2 id="detalles-personales-titulo" style={{ fontWeight: 'bold' }}>Información personal</h2>
                                <hr className="mt-0 mb-4" />
                                <div className="row pt-1">
                                    <section className="col-md-6 col-12 mb-3">
                                        <h3>Correo electrónico</h3>
                                        <p 
                                            aria-label={`Correo electrónico: ${usuario.correo}`}
                                            className="text-break"
                                        >
                                            {usuario.correo}
                                        </p>
                                    </section>
                                    <section className="col-md-6 col-12 mb-3">
                                        <h3>Fecha de nacimiento</h3>
                                        <p aria-label={`Fecha de nacimiento: ${obtenerFechaFormateada(usuario.user.fecha_nacimiento)}`}>
                                            {obtenerFechaFormateada(usuario.user.fecha_nacimiento)}
                                        </p>
                                    </section>
                                </div>
                                <hr className="mt-0 mb-4" />
                                <div className="row pt-1">
                                    <section className="col-md-6 col-12 mb-3">
                                        <h3>Número de contacto</h3>
                                        <p aria-label={`Número de contacto: ${usuario.user.telefono}`}>{usuario.user.telefono}</p>
                                    </section>
                                </div>
                            </article>
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Perfil;