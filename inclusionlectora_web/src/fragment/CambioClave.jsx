import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Login_Style.css';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { mensajesSinRecargar } from '../utilities/Mensajes';
import { peticionPut } from '../utilities/hooks/Conexion';
import { borrarSesion, getToken, getUser } from '../utilities/Sessionutil';
import logoUNL from '../img/Logo_UNL.png';
import logoCarrera from '../img/LogoCarrera.png';
import { Button } from 'react-bootstrap';

const CambioClave = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { external_id, token } = useParams();
    const [claveCoincide, setClaveCoincide] = useState(false);
    const [mostrarClaveActual, setMostrarClaveActual] = useState(false);
    const [mostrarClave, setMostrarClave] = useState(false);
    const [mostrarConfirmarClave, setMostrarConfirmarClave] = useState(false);

    const nuevaClave = watch('nuevaClave');
    const confirmarClave = watch('confirmarClave');

    useEffect(() => {
        setClaveCoincide(nuevaClave === confirmarClave && nuevaClave?.length > 0);
    }, [nuevaClave, confirmarClave]);

    const onSubmit = async (data) => {
        const datos = token && external_id
            ? { clave_nueva: data.nuevaClave }
            : { clave_vieja: data.claveActual, clave_nueva: data.nuevaClave };

        const endpoint = token && external_id
            ? `cuenta/restablecer/clave/${external_id}`
            : `cuenta/clave/${getUser().external_cuenta}`;

        const response = await peticionPut((token && external_id) ? token : getToken(), endpoint, datos);
        if (response.code === 200) {
            mensajesSinRecargar("La contraseña ha sido actualizada exitosamente", 'success', 'Éxito');
            setTimeout(() => {
                navigate('/login');
                borrarSesion();
            }, 1200);
        } else {
            mensajesSinRecargar(response.msg, 'error');
        }
    };

    return (
        <main className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <section className="p-5 rounded shadow login-form text-center">
                <header>
                    <figure className="d-flex justify-content-center align-items-center gap-3 mb-4">
                        <img src={logoUNL} alt="Logo UNL" style={{ height: '60px' }} />
                        <img src={logoCarrera} alt="Logo Carrera" style={{ height: '60px' }} />
                    </figure>
                    <h1 className="mb-4" style={{ fontWeight: 'bold', color: '#424874' }}>
                        Cambio de Contraseña
                    </h1>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <fieldset>
                        <p className="text-center mb-4">
                            {token && external_id
                                ? 'Establezca su nueva contraseña.'
                                : 'Ingrese su contraseña actual y establezca una nueva.'}
                        </p>

                        {!token || !external_id ? (
                            <div className="mb-3 text-start">
                                <label htmlFor="claveActual" className="form-label">Contraseña Actual</label>
                                <div className="input-group">
                                    <input
                                        type={mostrarClaveActual ? "text" : "password"}
                                        className={`form-control ${errors.claveActual ? 'is-invalid' : ''}`}
                                        id="claveActual"
                                        placeholder="Ingrese su contraseña actual"
                                        {...register('claveActual', { required: 'La contraseña actual es obligatoria' })}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setMostrarClaveActual(!mostrarClaveActual)}
                                    >
                                        <i className={`bi ${mostrarClaveActual ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                    </button>
                                    {errors.claveActual && (
                                        <div className="invalid-feedback">
                                            {errors.claveActual.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        <div className="mb-3 text-start">
                            <label htmlFor="nuevaClave" className="form-label">Nueva Contraseña</label>
                            <div className="input-group">
                                <input
                                    type={mostrarClave ? "text" : "password"}
                                    className={`form-control ${errors.nuevaClave ? 'is-invalid' : ''}`}
                                    id="nuevaClave"
                                    placeholder="Ingrese su nueva contraseña"
                                    {...register('nuevaClave', {
                                        required: "Ingrese una contraseña",
                                        minLength: {
                                            value: 5,
                                            message: "La contraseña debe tener al menos 5 caracteres"
                                        },
                                        pattern: {
                                            value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{}|\\:";'?/.,`~]+$/,
                                            message: "Debe incluir al menos una letra, un número, y no usar < o >"
                                        }
                                    })}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setMostrarClave(!mostrarClave)}
                                >
                                    <i className={`bi ${mostrarClave ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                                {errors.nuevaClave && (
                                    <div className="invalid-feedback">
                                        {errors.nuevaClave.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-3 text-start">
                            <label htmlFor="confirmarClave" className="form-label">Confirmar Contraseña</label>
                            <div className="input-group">
                                <input
                                    type={mostrarConfirmarClave ? "text" : "password"}
                                    className={`form-control ${errors.confirmarClave ? 'is-invalid' : ''}`}
                                    id="confirmarClave"
                                    placeholder="Confirme su nueva contraseña"
                                    {...register('confirmarClave', {
                                        required: "La confirmación de la contraseña es obligatoria",
                                        validate: value => value === nuevaClave || "Las contraseñas no coinciden"
                                    })}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setMostrarConfirmarClave(!mostrarConfirmarClave)}
                                >
                                    <i className={`bi ${mostrarConfirmarClave ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                </button>
                                {claveCoincide && (
                                    <span className="input-group-text text-success">
                                        <i className="bi bi-check-circle-fill"></i>
                                    </span>
                                )}
                            </div>
                            {errors.confirmarClave && (
                                <div className="invalid-feedback">
                                    {errors.confirmarClave.message}
                                </div>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            className="btn btn-login w-100 mb-3"
                            disabled={!claveCoincide}
                        >
                            Cambiar Contraseña
                        </Button>

                        <div className="mt-3">
                            <button
                                type="button"
                                className="btn btn-link"
                                onClick={() => navigate('/login')}
                            >
                                Volver al inicio de sesión
                            </button>
                        </div>
                    </fieldset>
                </form>
            </section>
        </main>
    );
};

export default CambioClave;