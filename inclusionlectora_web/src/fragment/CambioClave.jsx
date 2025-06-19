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
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        mode: 'onBlur'
    });
    const navigate = useNavigate();
    const { external_id, token } = useParams();
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(null);
    const [confirmTouched, setConfirmTouched] = useState(false);

    const nuevaClave = watch('nuevaClave');

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        setPasswordMatch(confirmPassword === nuevaClave);
    }, [confirmPassword, nuevaClave]);

    const onSubmit = async (data) => {
        if (!passwordMatch) {
            setConfirmTouched(true); // Esto activará el mensaje de error que ya tienes
            return;
        }
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
                        <img src={logoUNL} alt="Logo de la Universidad Nacional de Loja" style={{ height: '60px' }} />
                        <img src={logoCarrera} alt="Logo de la Carrera de Computación" style={{ height: '60px' }} />
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
                                <label htmlFor="claveActual" className="form-label">Contraseña Actual*</label>
                                <div className="input-group">
                                    <input
                                        id="claveActual"
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${errors.claveActual ? 'is-invalid' : ''}`}
                                        {...register("claveActual", {
                                            required: "La contraseña actual es obligatoria"
                                        })}
                                        aria-invalid={errors.claveActual ? "true" : "false"}
                                        aria-required="true"
                                        aria-describedby={errors.claveActual ? "claveActual-error" : undefined}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        aria-controls="claveActual"
                                        aria-expanded={showPassword}
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                                                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                                                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                                            </svg>
                                        )}
                                    </button>
                                    {errors.claveActual && (
                                        <div id="claveActual-error" className="invalid-feedback" role="alert">
                                            {errors.claveActual.message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        <div className="mb-3 text-start">
                            <label htmlFor="nuevaClave" className="form-label">Nueva Contraseña*</label>
                            <div className="input-group">
                                <input
                                    id="nuevaClave"
                                    type={showPassword ? "text" : "password"}
                                    className={`form-control ${errors.nuevaClave ? 'is-invalid' : ''}`}
                                    {...register("nuevaClave", {
                                        required: "Ingrese una contraseña",
                                        minLength: {
                                            value: 5,
                                            message: "Mínimo 5 caracteres"
                                        },
                                        pattern: {
                                            value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{}|\\:";'?/.,`~]+$/,
                                            message: "Debe contener letras y números"
                                        }
                                    })}
                                    aria-invalid={errors.nuevaClave ? "true" : "false"}
                                    aria-required="true"
                                    aria-describedby={errors.nuevaClave ? "nuevaClave-error" : undefined}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    aria-controls="nuevaClave"
                                    aria-expanded={showPassword}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                                            <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                                            <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                                        </svg>
                                    )}
                                </button>
                                {errors.nuevaClave && (
                                    <div id="nuevaClave-error" className="invalid-feedback" role="alert">
                                        {errors.nuevaClave.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-3 text-start">
                            <label htmlFor="confirmarClave" className="form-label">Confirmar Contraseña*</label>
                            <div className="input-group">
                                <input
                                    id="confirmarClave"
                                    type={showPassword ? "text" : "password"}
                                    className={`form-control ${(confirmPassword && !passwordMatch) || (errors.nuevaClave && nuevaClave === '') ? 'is-invalid' : ''}`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => setConfirmTouched(true)}
                                    aria-invalid={(confirmPassword && !passwordMatch) || (errors.nuevaClave && nuevaClave === '') ? "true" : "false"}
                                    aria-required="true"
                                    aria-describedby={
                                        (confirmPassword && !passwordMatch)
                                            ? "confirm-error"
                                            : (errors.nuevaClave && nuevaClave === '')
                                                ? "nuevaClave-valid-error"
                                                : undefined
                                    }
                                />
                                <span className="input-group-text" aria-hidden="true">
                                    {passwordMatch === null ? '' : passwordMatch ? '✔️' : '❌'}
                                </span>
                            </div>

                            <div className="visually-hidden" aria-live="polite" role="status">
                                {
                                    confirmPassword === '' ? '' :
                                        passwordMatch === null ? '' :
                                            passwordMatch ? 'Las contraseñas coinciden.' : 'Las contraseñas no coinciden.'
                                }
                            </div>

                            {(confirmPassword && !passwordMatch) && (
                                <div id="confirm-error" className="invalid-feedback d-block" role="alert">
                                    Las contraseñas no coinciden
                                </div>
                            )}
                            {errors.nuevaClave && nuevaClave === '' && (
                                <div id="nuevaClave-valid-error" className="invalid-feedback d-block" role="alert">
                                    Primero ingrese una contraseña válida
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="btn btn-login w-100 mb-3"
                        >
                            Cambiar Contraseña
                        </Button>

                        <div className="mt-3">
                            <button
                                type="button"
                                className="btn btn-link"
                                onClick={() => navigate('/login')}
                            >
                                Volver
                            </button>
                        </div>
                    </fieldset>
                </form>
            </section>
        </main>
    );
};

export default CambioClave;