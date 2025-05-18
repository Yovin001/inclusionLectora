import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Login_Style.css';
import { InicioSesion } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { saveCorreo, saveRolApi, saveToken, saveUser } from '../utilities/Sessionutil';
import {mensajesSinRecargar}  from '../utilities/Mensajes';
import logoUNL from '../img/Logo_UNL.png';
import logoCarrera from '../img/LogoCarrera.png';
import { Button } from 'react-bootstrap';

const Login = () => {
    const navigate = useNavigate();
    const { register, formState: { errors }, handleSubmit } = useForm();
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(prev => !prev);
    // Verifica si ya hay sesión activa
    useEffect(() => {
        const token = localStorage.getItem("token"); // O usa getToken() si la tienes
        if (token) {
            navigate("/dashboard");
        }
    }, [navigate]);
    
    const onSubmit = (data) => {
        const datos = {
            correo: data.correo,
            clave: data.clave
        };

        InicioSesion(datos).then((info) => {
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
        });
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light" role="div">
            <section className="p-5 rounded shadow login-form text-center" aria-labelledby="login-title">
                <header>
                    <figure className="d-flex justify-content-center align-items-center gap-3 mb-4">
                        <img src={logoUNL} alt="Logo de la Universidad Nacional de Loja" style={{ height: '60px' }} />
                        <img src={logoCarrera} alt="Logo de la carrera universitaria" style={{ height: '60px' }} />
                    </figure>
                    <h1 id="login-title" className="mb-4" style={{ fontWeight: 'bold', color: '#424874' }}>
                        Inicio de Sesión
                    </h1>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <fieldset>
                        <legend className="visually-hidden">Formulario de inicio de sesión</legend>

                        <section className="mb-3">
                            <label htmlFor="email" className="form-label">Correo electrónico</label>
                            <input
                                id="email"
                                type="email"
                                className="form-control"
                                {...register("correo", {
                                    required: "Ingrese un correo",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/,
                                        message: "Ingrese un correo válido"
                                    }
                                })}
                                aria-required="true"
                                aria-invalid={errors.correo ? "true" : "false"}
                            />
                            {errors.correo && (
                                <p className="mensajeerror" role="alert">
                                    {errors.correo.message}
                                </p>
                            )}
                        </section>

                        <section className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <div className="input-group">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    {...register("clave", {
                                        required: "Ingrese una contraseña"
                                    })}
                                    aria-required="true"
                                    aria-invalid={errors.clave ? "true" : "false"}
                                />
                                 <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={togglePasswordVisibility}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                                            </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                                                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                                                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                                            </svg>}
                                </button>
                            </div>
                            {errors.clave && (
                                <p className="mensajeerror" role="alert">
                                    {errors.clave.message}
                                </p>
                            )}
                        </section>
                    </fieldset>

                     <Button type="submit" className="btn btn-login w-100 mb-3">
                        Ingresar
                    </Button>

                    <nav className="mt-4" aria-label="Enlaces secundarios">
                        <p className="text-muted mb-2" style={{ color: 'var(--color-cuarto)' }}>
                            ¿Has olvidado tu contraseña?
                        </p>
                         <button
                            type="button"
                            className="btn boton-custom mb-2"
                            onClick={() => navigate("/olvidar/clave")}
                        >
                            Recuperar contraseña
                        </button>

                        <p className="text-muted mb-0" style={{ color: 'var(--color-cuarto)' }}>
                            ¿No tienes una cuenta?
                        </p>
                         <button
                            type="button"
                            className="btn boton-custom"
                            onClick={() => navigate("/registrar")}
                        >
                            Regístrate
                        </button>
                    </nav>
                </form>
            </section>
        </div>
    );
};

export default Login;
