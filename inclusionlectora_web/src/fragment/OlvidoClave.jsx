import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Login_Style.css';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { mensajesSinRecargar } from '../utilities/Mensajes';
import { peticionPut } from '../utilities/hooks/Conexion';
import logoUNL from '../img/Logo_UNL.png';
import logoCarrera from '../img/LogoCarrera.png';
import { Button } from 'react-bootstrap';

const OlvidoClave = () => {
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm({
        mode: 'onChange' // Para validar en tiempo real
    });
    const navigate = useNavigate();
    const correo = watch('correo'); // Observamos el campo de correo

    const onSubmit = (data) => {
        peticionPut('', '/cuenta/solicitud/cambio/clave', { correo: data.correo })
            .then((info) => {
                if (info.code === 200) {
                    mensajesSinRecargar(`Se ha enviado un enlace de restablecimiento a ${data.correo}`, 'success', 'Éxito');
                    navigate('/login');
                } else {
                    mensajesSinRecargar('Error al enviar el correo para restablecer contraseña', 'error', 'Error');
                }
            })
            .catch(() => {
                mensajesSinRecargar('Error al enviar el correo para restablecer contraseña', 'error', 'Error');
            });
    };

    return (
        <main 
            className="d-flex justify-content-center align-items-center vh-100 bg-light"
            aria-labelledby="titulo-restablecer"
        >
            <section 
                className="p-5 rounded shadow login-form text-center"
                aria-live="polite"
            >
                <header>
                    <figure 
                        className="d-flex justify-content-center align-items-center gap-3 mb-4"
                        aria-label="Logotipos institucionales"
                    >
                        <img 
                            src={logoUNL} 
                            alt="Logo de la Universidad Nacional de Loja" 
                            style={{ height: '60px' }}
                            aria-hidden="true"
                        />
                        <img 
                            src={logoCarrera} 
                            alt="Logo de la Carrera de Computación" 
                            style={{ height: '60px' }}
                            aria-hidden="true"
                        />
                    </figure>
                    <h1 
                        id="titulo-restablecer"
                        className="mb-4" 
                        style={{ fontWeight: 'bold', color: '#424874' }}
                    >
                        Restablecer Contraseña
                    </h1>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <fieldset>
                        <p 
                            className="text-center mb-4"
                            id="instrucciones-restablecer"
                        >
                            Introduzca la dirección de correo electrónico verificada de su cuenta.
                        </p>

                        <div className="mb-3 text-start">
                            <label htmlFor="correo" className="form-label">
                                Correo electrónico
                            </label>
                            <input
                                id="correo"
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                                aria-describedby="instrucciones-restablecer ayuda-correo"
                                aria-invalid={errors.correo ? "true" : "false"}
                                aria-required="true"
                                {...register('correo', {
                                    required: 'El correo electrónico es obligatorio',
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/,
                                        message: 'Ingrese un correo válido'
                                    }
                                })}
                            />
                            {errors.correo && (
                                <div 
                                    id="ayuda-correo"
                                    className="invalid-feedback"
                                    role="alert"
                                >
                                    {errors.correo.message}
                                </div>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            className="btn btn-login w-100"
                            disabled={!correo || !isValid}
                            aria-disabled={!correo || !isValid}
                            aria-label="Enviar enlace de restablecimiento de contraseña"
                        >
                            Enviar enlace de restablecimiento
                        </Button>

                        <div className="mt-3">
                            <button
                                type="button"
                                className="btn btn-link"
                                onClick={() => navigate('/login')}
                                aria-label="Volver a la página de inicio de sesión"
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

export default OlvidoClave;