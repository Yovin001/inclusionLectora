import React, { useState, useEffect } from 'react';
import MenuBar from './MenuBar';
import swal from 'sweetalert';
import { peticionGet, peticionPost } from '../utilities/hooks/Conexion';
import mensajes from '../utilities/Mensajes';
import { borrarSesion, getToken } from '../utilities/Sessionutil';
import { useNavigate } from 'react-router-dom';

const ConfiguracionGlobal = () => {
    const [tamano, setTamano] = useState(0);
    const [nuevoTamano, setNuevoTamano] = useState(0);
   const navigate = useNavigate();
    useEffect(() => {
        peticionGet(getToken(), `config/tamano`).then((info) => {
            if (info.code === 200) {
                const currentSize = info.info;
                setTamano(currentSize);
                setNuevoTamano(currentSize); // Inicializar con el tamaño actual
            } else if (
                info.msg.toLowerCase().includes("token")||
                info.msg ==="Acceso denegado: No tiene permisos de administrador"
            ) {
                borrarSesion();
                navigate('/login');
            }

        });
    }, []);

    // Manejar el cambio de tamaño
    const handleActualizarTamano = () => {
        if (nuevoTamano > 0 && nuevoTamano <= 10) {
            peticionGet(getToken(), `config/tamano/${nuevoTamano}`).then((info) => {
                if (info.code === 200) {
                    setTamano(info.info);  // Actualizar tamaño
                    mensajes('Tamaño actualizado con éxito', 'success');
                } else {
                    mensajes(`Error al actualizar el tamaño: ${info.msg}`, 'error');
                }
            });
        } else {
            mensajes('Ingrese un valor válido (entre 1 y 10 MB)', 'error');
        }
    };

    // Manejar la eliminación de documentos
    const handleEliminarTodos = () => {
        let swalInputValue = ""; // Estado temporal para manejar el valor ingresado

        swal({
            title: "Confirmar eliminación",
            text: "Por favor, ingrese la clave para confirmar la eliminación de todos los documentos. Esta acción no se puede deshacer.",
            content: {
                element: "input",
                attributes: {
                    placeholder: "Ingrese la clave",
                    type: "password",
                    maxLength: 100,
                    oninput: function (e) {
                        swalInputValue = e.target.value;
                        const eliminarButton = document.querySelector(".swal-button--confirm");
                        if (eliminarButton) {
                            eliminarButton.disabled = !swalInputValue.trim();
                        }
                    },
                },
            },
            buttons: {
                cancel: {
                    text: "Cancelar",
                    visible: true,
                    className: "btn-negativo",
                },
                confirm: {
                    text: "Eliminar",
                    visible: true,
                    className: "btn-positivo text-white",
                    closeModal: false,
                },
            },
        }).then(async (clave) => {
            if (clave && clave.trim()) {
                const data = { key: clave };
                const response = await peticionPost(getToken(), `documentos/eliminar/todos`, data);
                if (response.code === 200) {
                    mensajes('Eliminación completada con éxito', 'success');
                    swal.close(); // Cerrar modal en caso de éxito
                } else {
                    mensajes(`Error al eliminar documentos: ${response.msg}`, 'error');
                }
            }
        });

        // Deshabilitar el botón inicialmente
        setTimeout(() => {
            const eliminarButton = document.querySelector(".swal-button--confirm");
            if (eliminarButton) eliminarButton.disabled = true;
        }, 0);
    };

    return (
        <div>
            <MenuBar />
            <div className="container-fluid">
                <div className="contenedor-centro">
                    <div className="contenedor-carta d-flex flex-column align-items-start">
                        {/* Cambiar tamaño */}
                        <div className="d-flex align-items-center w-100 mb-4">
                            <div className="me-3">
                                <label htmlFor="tamanoMaximo">
                                    <strong>Cambio de tamaño:</strong>
                                    <br />
                                    <small className="text-muted">Ingrese un tamaño en MB (máx: 10).</small>
                                </label>
                            </div>
                            <input
                                type="number"
                                className="form-control me-3"
                                id="tamanoMaximo"
                                value={nuevoTamano}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (value >= 0 && value <= 10) {
                                        setNuevoTamano(value);
                                    }
                                }}
                                style={{ maxWidth: '150px' }}
                            />

                            <button className="btn-positivo text-white" type="submit" onClick={handleActualizarTamano}>
                                Cambiar tamaño
                            </button>
                        </div>

                        {/* Tamaño actual */}
                        <div className="d-flex align-items-center w-100 mb-4">
                            <div className="me-3">
                                <label><strong>Tamaño actual:</strong></label>
                                <p>{tamano} MB</p>
                            </div>
                        </div>

                        {/* Eliminar documentos */}
                        <div className="d-flex align-items-center w-100">
                            <div className="me-3">
                                <strong>Eliminación de documentos:</strong>
                                <br />
                                <small className="text-danger fw-bold">
                                    Esta acción eliminará todos los archivos del sistema.
                                    Proceda con precaución.
                                </small>
                            </div>
                            <button className="btn-positivo text-white" type="submit" onClick={handleEliminarTodos}>
                                Eliminar Archivos
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracionGlobal;
