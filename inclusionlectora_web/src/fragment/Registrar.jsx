import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Login_Style.css';
import { GuardarArchivos } from '../utilities/hooks/Conexion';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { borrarSesion, getToken } from '../utilities/Sessionutil';
import { mensajesSinRecargar } from '../utilities/Mensajes';
import logoUNL from '../img/Logo_UNL.png';
import logoCarrera from '../img/LogoCarrera.png';
import { Button } from 'react-bootstrap';
import Modal from 'react-modal';
import '../css/ExtractorModal_Style.css';

Modal.setAppElement('#root');

const Registrar = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        mode: 'onBlur'
    });
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState({});
    const [confirmTouched, setConfirmTouched] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        setPasswordMatch(confirmPassword === watch('clave'));
    }, [confirmPassword, watch('clave')]);

    const openModal = (title, text, type = 'info', onConfirm) => {
        setModalContent({
            title,
            text,
            type,
            onConfirm
        });
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const onSubmit = data => {
        if (!passwordMatch) {
            setConfirmTouched(true); // Esto activará el mensaje de error que ya tienes
            return;
        }
        const formData = new FormData();
        formData.append('nombres', data.nombres.toUpperCase());
        formData.append('apellidos', data.apellidos.toUpperCase());
        formData.append('correo', data.correo);
        formData.append('fecha_nacimiento', data.fecha_nacimiento);
        formData.append('telefono', data.telefono);
        formData.append('clave', data.clave);
        formData.append('foto', `${process.env.PUBLIC_URL}/img/USUARIO_ICONO.png`);

        GuardarArchivos(formData, getToken(), "/entidad/guardar").then(info => {
            if (info.code !== 200) {
                mensajesSinRecargar(info.msg, 'error', 'Error');
                borrarSesion();
            } else {
                mensajesSinRecargar(info.msg);
                navigate('/login');
            }
        });
    };

    const handleCancelClick = () => {
        openModal(
            'Cancelar Registro',
            '¿Está seguro de cancelar el registro?',
            'warning',
            () => {
                navigate('/login');
            }
        );
    };

    return (
        <main className="d-flex justify-content-center align-items-center min-vh-100 bg-light py-3" aria-label="Página de registro de usuario">
            <section className="p-3 p-md-5 rounded shadow login-form mx-2" style={{ maxWidth: '100%', width: '500px' }} aria-labelledby="registro-heading">
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    className="react-modal-content"
                    overlayClassName="react-modal-overlay"
                    contentLabel={modalContent.title}
                    ariaHideApp={false}
                    role="alertdialog"
                    aria-modal="true"
                >
                    <h2 id="modal-title" className="modal-title">{modalContent.title}</h2>
                    <p id="modal-description" className="modal-description">{modalContent.text}</p>
                    <div className="modal-button-container">
                    <button
                            onClick={() => {
                                if (modalContent.onConfirm) modalContent.onConfirm();
                                closeModal();
                            }}
                            className={`modal-button ${modalContent.type === 'warning' ? 'modal-button-confirm-warning' : 'modal-button-confirm'}`}
                            autoFocus
                            aria-label={`Confirmar ${modalContent.type === 'warning' ? 'cancelación de registro' : 'acción'}`}
                        >
                            {modalContent.type === 'warning' ? 'Confirmar' : 'Aceptar'}
                        </button>
                        {modalContent.type === 'warning' && (
                            <button
                                onClick={closeModal}
                                className="modal-button modal-button-cancel"
                                aria-label="Cancelar operación de registro"
                            >
                                Cancelar
                            </button>
                        )}
                   
                    </div>
                </Modal>

                <header className="mb-4">
                    <figure className="d-flex justify-content-center align-items-center gap-3 mb-4 flex-wrap" aria-label="Logotipos institucionales">
                        <img
                            src={logoUNL}
                            alt="Logo de la Universidad Nacional de Loja"
                            className="img-fluid"
                            style={{ height: 'auto', maxHeight: '60px', width: 'auto' }}
                            aria-hidden="true"
                        />
                        <img
                            src={logoCarrera}
                            alt="Logo de la Carrera de Computación"
                            className="img-fluid"
                            style={{ height: 'auto', maxHeight: '60px', width: 'auto' }}
                            aria-hidden="true"
                        />
                    </figure>
                    <h1 id="registro-heading" className="text-center mb-4" style={{ fontWeight: 'bold', color: '#424874', fontSize: 'calc(1.2rem + 0.5vw)' }}>
                        Registro de Usuario
                    </h1>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Formulario de registro">
                    <fieldset aria-labelledby="registro-heading">
                        <legend className="visually-hidden">Datos personales</legend>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="nombres" className="form-label">Nombres*</label>
                                <input
                                    id="nombres"
                                    type="text"
                                    className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                                    {...register("nombres", {
                                        required: "Ingrese sus nombres",
                                        pattern: {
                                            value: /^(?!\s*$)[a-zA-Z\s]+$/,
                                            message: "Ingrese un nombre válido"
                                        }
                                    })}
                                    aria-invalid={errors.nombres ? "true" : "false"}
                                    aria-required="true"
                                    aria-describedby={errors.nombres ? "nombres-error" : undefined}
                                />
                                {errors.nombres && (
                                    <div id="nombres-error" className="invalid-feedback" role="alert">
                                        {errors.nombres.message}
                                    </div>
                                )}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="apellidos" className="form-label">Apellidos*</label>
                                <input
                                    id="apellidos"
                                    type="text"
                                    className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`}
                                    {...register("apellidos", {
                                        required: "Ingrese sus apellidos",
                                        pattern: {
                                            value: /^(?!\s*$)[a-zA-Z\s]+$/,
                                            message: "Ingrese un apellido válido"
                                        }
                                    })}
                                    aria-invalid={errors.apellidos ? "true" : "false"}
                                    aria-required="true"
                                    aria-describedby={errors.apellidos ? "apellidos-error" : undefined}
                                />
                                {errors.apellidos && (
                                    <div id="apellidos-error" className="invalid-feedback" role="alert">
                                        {errors.apellidos.message}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="fecha_nacimiento" className="form-label">Fecha de Nacimiento*</label>
                                <input
                                    id="fecha_nacimiento"
                                    type="date"
                                    className={`form-control ${errors.fecha_nacimiento ? 'is-invalid' : ''}`}
                                    {...register("fecha_nacimiento", {
                                        required: "Ingrese su fecha de nacimiento",
                                        validate: (value) => {
                                            const fechaNacimiento = new Date(value);
                                            const fechaActual = new Date();
                                            const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
                                            return edad >= 16 || "Debe ser mayor de 16 años"
                                        }
                                    })}
                                    aria-invalid={errors.fecha_nacimiento ? "true" : "false"}
                                    aria-required="true"
                                    aria-describedby={errors.fecha_nacimiento ? "fecha-error" : undefined}
                                />
                                {errors.fecha_nacimiento && (
                                    <div id="fecha-error" className="invalid-feedback" role="alert">
                                        {errors.fecha_nacimiento.message}
                                    </div>
                                )}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="telefono" className="form-label">Teléfono*</label>
                                <input
                                    id="telefono"
                                    type="text"
                                    className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                                    {...register("telefono", {
                                        required: "Ingrese su teléfono",
                                        pattern: {
                                            value: /^[0-9]+$/,
                                            message: "Ingrese solo números"
                                        },
                                        minLength: {
                                            value: 5,
                                            message: "Mínimo 5 caracteres"
                                        },
                                        maxLength: {
                                            value: 10,
                                            message: "Máximo 10 caracteres"
                                        }
                                    })}
                                    aria-invalid={errors.telefono ? "true" : "false"}
                                    aria-required="true"
                                    aria-describedby={errors.telefono ? "telefono-error" : undefined}
                                    inputMode="numeric"
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Elimina todo lo que no sea número
                                    }}
                                />
                                {errors.telefono && (
                                    <div id="telefono-error" className="invalid-feedback" role="alert">
                                        {errors.telefono.message}
                                    </div>
                                )}
                            </div>

                        </div>

                        <div className="mb-3">
                            <label htmlFor="correo" className="form-label">Correo Electrónico*</label>
                            <input
                                id="correo"
                                type="email"
                                className={`form-control ${errors.correo ? 'is-invalid' : ''}`}
                                {...register("correo", {
                                    required: "Ingrese su correo electrónico",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/,
                                        message: "Ingrese un correo válido"
                                    }
                                })}
                                aria-invalid={errors.correo ? "true" : "false"}
                                aria-required="true"
                                aria-describedby={errors.correo ? "correo-error" : undefined}
                                inputMode="email"
                            />
                            {errors.correo && (
                                <div id="correo-error" className="invalid-feedback" role="alert">
                                    {errors.correo.message}
                                </div>
                            )}
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="clave" className="form-label">Contraseña*</label>
                                <div className="input-group">
                                    <input
                                        id="clave"
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${errors.clave ? 'is-invalid' : ''}`}
                                        {...register("clave", {
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
                                        aria-invalid={errors.clave ? "true" : "false"}
                                        aria-required="true"
                                        aria-describedby={errors.clave ? "clave-error" : undefined}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                        aria-controls="clave"
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
                                    {errors.clave && (
                                        <div id="clave-error" className="invalid-feedback" role="alert">
                                            {errors.clave.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña*</label>
                                <div className="input-group">
                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        className={`form-control ${(confirmPassword && !passwordMatch) || (errors.clave && watch('clave') === '') ? 'is-invalid' : ''
                                            }`}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onBlur={() => setConfirmTouched(true)}
                                        aria-invalid={
                                            (confirmPassword && !passwordMatch) || (errors.clave && watch('clave') === '') ? "true" : "false"
                                        }
                                        aria-required="true"
                                        aria-describedby={
                                            (confirmPassword && !passwordMatch)
                                                ? "confirm-error"
                                                : (errors.clave && watch('clave') === '')
                                                    ? "clave-valid-error"
                                                    : undefined
                                        }
                                    />
                                    <span className="input-group-text" aria-hidden="true">
                                        {passwordMatch === null ? '' : passwordMatch ? '✔️' : '❌'}
                                    </span>
                                </div>

                                {/* Mensaje en vivo para lectores de pantalla */}
                                <div
                                    className="visually-hidden"
                                    aria-live="polite"
                                    role="status"
                                >
                                    {
                                        confirmPassword === '' ? '' :
                                            passwordMatch === null ? '' :
                                                passwordMatch ? 'Las contraseñas coinciden.' : 'Las contraseñas no coinciden.'
                                    }
                                </div>

                                {/* Mensaje de error visual y para lectores de pantalla */}
                                {(confirmPassword && !passwordMatch) && (
                                    <div id="confirm-error" className="invalid-feedback d-block" role="alert">
                                        Las contraseñas no coinciden
                                    </div>
                                )}
                                {errors.clave && watch('clave') === '' && (
                                    <div id="clave-valid-error" className="invalid-feedback d-block" role="alert">
                                        Primero ingrese una contraseña válida
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="d-flex justify-content-between mt-4">
                            <Button
                                type="submit"
                                className="btn-login"
                                aria-label="Enviar formulario de registro"
                            >
                                Registrarse
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={handleCancelClick}
                                aria-label="Cancelar registro de usuario"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </fieldset>
                </form>
            </section>
        </main>
    );
};

export default Registrar;