import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Login_Style.css';
import { InicioSesion } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { saveCorreo, saveRolApi, saveToken, saveUser } from '../utilities/Sessionutil';
import { mensajesSinRecargar } from '../utilities/Mensajes';
import logoUNL from '../img/Logo_UNL.png';
import logoCarrera from '../img/LogoCarrera.png';
import { Button } from 'react-bootstrap';

const Login = () => {
    const navigate = useNavigate();
    const { register, formState: { errors, isValid }, handleSubmit, watch } = useForm({ mode: 'onBlur' });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const correo = watch('correo');
    const clave = watch('clave');

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);
    
    const onSubmit = (data) => {
        setIsSubmitting(true);
        const datos = {
            correo: data.correo,
            clave: data.clave
        };

        InicioSesion(datos)
            .then((info) => {
                if (info.code !== 200) {
                    mensajesSinRecargar(info.msg, "error", "Error");
                } else {
                    const infoAux = info.info;
                    saveToken(infoAux.token);
                    saveUser(infoAux.user);
                    saveCorreo(infoAux.user.correo);
                    saveRolApi(infoAux.user.rol);
                    mensajesSinRecargar(info.msg);
                    navigate("/dashboard");
                }
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <main className="d-flex justify-content-center align-items-center min-vh-100 bg-light">

            <section 
                className="p-5 rounded shadow login-form text-center" 
                aria-labelledby="login-title"
                aria-live="polite"
            >
                <header>
                    <figure className="d-flex justify-content-center align-items-center gap-3 mb-4">
                        <img 
                            src={logoUNL} 
                            alt="Logo de la Universidad Nacional de Loja" 
                            style={{ height: '60px' }} 
                            aria-hidden="true"
                        />
                        <img 
                            src={logoCarrera} 
                            alt="Logo de la carrera de Computación" 
                            style={{ height: '60px' }} 
                            aria-hidden="true"
                        />
                    </figure>
                    <h1 id="login-title" className="mb-4" style={{ fontWeight: 'bold', color: '#424874' }}>
                        Inicio de Sesión
                    </h1>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <fieldset>
                        <legend className="visually-hidden">Formulario de inicio de sesión</legend>

                        <div className="mb-3 text-start">
                            <label htmlFor="email" className="form-label">
                                Correo electrónico <span className="required-asterisk" aria-hidden="true">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                                {...register("correo", {
                                    required: "Ingrese un correo",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/,
                                        message: "Ingrese un correo válido"
                                    }
                                })}
                                aria-required="true"
                                aria-invalid={errors.correo ? "true" : "false"}
                                aria-describedby="email-help"
                                autoComplete="username"
                            />
                            {errors.correo && (
                                <div id="email-help" className="invalid-feedback" role="alert">
                                    {errors.correo.message}
                                </div>
                            )}
                        </div>

                        <div className="mb-3 text-start">
                            <label htmlFor="password" className="form-label">
                                Contraseña <span className="required-asterisk" aria-hidden="true">*</span>
                            </label>
                            <div className="input-group has-validation">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className={`form-control ${errors.clave ? 'is-invalid' : ''}`}
                                    {...register("clave", {
                                        required: "Ingrese una contraseña"
                                    })}
                                    aria-required="true"
                                    aria-invalid={errors.clave ? "true" : "false"}
                                    aria-describedby="password-help"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    aria-controls="password"
                                    tabIndex="0"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                                            <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                                        </svg>
                                    )}
                                </button>
                                {errors.clave && (
                                    <div id="password-help" className="invalid-feedback" role="alert">
                                        {errors.clave.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="btn btn-login w-100 mb-3"                                
                        >
                            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                        </Button>
                    </fieldset>

                    <nav aria-label="Opciones secundarias de autenticación">
                        <div className="d-grid gap-2">
                            <button
                                type="button"
                                className="btn btn-link text-decoration-none"
                                onClick={() => navigate("/olvidar/clave")}
                                aria-label="Recuperar contraseña"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                            
                            <button
                                type="button"
                                className="btn btn-link text-decoration-none"
                                onClick={() => navigate("/registrar")}
                                aria-label="Registrarse como nuevo usuario"
                            >
                                ¿No tienes cuenta? Regístrate
                            </button>
                        </div>
                    </nav>
                </form>
            </section>
        </main>
    );
};

export default Login;