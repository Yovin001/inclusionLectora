import '../css/ConfiguracionGlobal_Style.css';
import '../css/Perfil_Style.css';
import React, { useRef, useState, useEffect } from 'react';
import MenuBar from './MenuBar';
import { Button } from 'react-bootstrap';
import SkipToContent from './component/skipToContent/SkipToContent';
import LiveRegion from './component/skipToContent/LiveRegion';
import { peticionPostFormData } from '../utilities/hooks/Conexion';
import { getToken } from '../utilities/Sessionutil';
import { mensajesSinRecargar } from '../utilities/Mensajes';

const ProcesarImagen = () => {
    const mainContentRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [utterance, setUtterance] = useState(null);
    const [pausado, setPausado] = useState(false);

    const [imagen, setImagen] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [cargando, setCargando] = useState(false);
    const [leyendo, setLeyendo] = useState(false);
    const [usandoCamara, setUsandoCamara] = useState(false);

    useEffect(() => {
        if (usandoCamara && videoRef.current && navigator.mediaDevices?.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    videoRef.current.srcObject = stream;
                })
                .catch(err => {
                    console.error("No se pudo acceder a la cámara:", err);
                    setUsandoCamara(false);
                });
        }
    }, [usandoCamara]);

    const detenerCamara = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
    const capturarImagen = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);

        canvas.toBlob(blob => {
            const file = new File([blob], 'ImagenCapturada.jpg', { type: 'image/jpeg' });
            setImagen(file);
            setDescripcion('');
            detenerCamara(); // Apagar la cámara luego de capturar
            setUsandoCamara(false); // Ocultar interfaz de cámara
        }, 'image/jpeg');
    };


    const handleFileChange = (e) => {
        setImagen(e.target.files[0]);
        setDescripcion('');
    };

    const handleProcesar = async () => {
        if (!imagen) {
            mensajesSinRecargar('No se ha seleccionado una imagen', 'error', 'Error');
            return;
        }
        setCargando(true);
        const formData = new FormData();
        formData.append('image', imagen);

        try {
            const data = await peticionPostFormData(getToken(), `procesar`, formData);
            if (data.info) {
                setDescripcion(data.info);
            } else {
                setDescripcion('No se pudo obtener una descripción.');
            }
        } catch (error) {
            setDescripcion('Error al procesar imagen.');
        } finally {
            setCargando(false);
        }
    };

    const leerFrases = () => {
        if (!descripcion || !window.speechSynthesis) return;

        // Detener cualquier lectura en curso antes de iniciar una nueva
        window.speechSynthesis.cancel();

        const u = new SpeechSynthesisUtterance(descripcion);
        u.lang = 'es-ES';
        u.onend = () => {
            setLeyendo(false);
            setPausado(false);
            setUtterance(null);
        };
        u.onerror = () => {
            setLeyendo(false);
            setPausado(false);
            setUtterance(null);
        };

        window.speechSynthesis.speak(u);
        setUtterance(u);
        setLeyendo(true);
        setPausado(false);
    };

    useEffect(() => {
        return () => {
          window.speechSynthesis.cancel();
          setLeyendo(false);
          setPausado(false);
          setUtterance(null);
        };
      }, []);
      useEffect(() => {
        if (descripcion && !leyendo && !pausado) {
            leerFrases();
        }
    }, [descripcion]);
    
      

    return (
        <>
            <SkipToContent targetId="main-content" label="Procesar imagen para obtener descripción" />
            <LiveRegion />
            <header>
                <MenuBar />
            </header>
            <main
                ref={mainContentRef}
                id="main-content"
                tabIndex="-1"
                aria-labelledby="descripcion-titulo"
                className="contenedor-centro"
            >
                <section className="cconfig-container">
                    <h1 className="titulo-primario" style={{ textAlign: 'center' }}>
                        Descripción de Imagen con IA
                    </h1>

                    {/* Subida o toma de imagen */}
                    <section aria-labelledby="subida-imagen" className="config-card">
                        <h2 id="subida-imagen">Cargar o Capturar Imagen</h2>
                        <div className="config-form-group">
                            <div
                                className={`file-upload-dropzone ${usandoCamara ? 'dragging' : ''}`}
                                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setUsandoCamara(true); }}
                                onDragOver={(e) => e.preventDefault()}
                                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setUsandoCamara(false); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setUsandoCamara(false);
                                    const droppedFile = e.dataTransfer.files[0];
                                    if (droppedFile && droppedFile.type.startsWith("image/")) {
                                        setImagen(droppedFile);
                                        setDescripcion('');
                                    }
                                }}
                            >
                                <label
                                    htmlFor="uploadImage"
                                    className="file-upload-label"
                                    tabIndex="0"
                                    role="button"
                                    aria-label="Seleccionar imagen"
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('uploadImage').click(); }}
                                    onClick={(e) => { e.preventDefault(); document.getElementById('uploadImage').click(); }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">
                                        <title>Ícono de nube con flecha de subida</title>
                                        <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
                                        <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
                                    </svg>
                                    {imagen ? `Imagen seleccionada: ${imagen.name}` : 'Arrastra y suelta o haz clic para subir imagen'}
                                </label>

                                <input
                                    id="uploadImage"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        setImagen(e.target.files[0]);
                                        setDescripcion('');
                                    }}
                                    aria-label="Subir imagen"
                                />
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <Button
                                    type="button"
                                    className="btn-config-azul"
                                    onClick={() => setUsandoCamara(prev => {
                                        if (prev) detenerCamara();
                                        return !prev;
                                    })}
                                >
                                    {usandoCamara ? 'Cerrar cámara' : 'Usar cámara'}
                                </Button>
                            </div>

                            {usandoCamara && (
                                <div style={{ marginTop: '1rem' }}>
                                    <video ref={videoRef} autoPlay playsInline style={{ maxWidth: '100%' }} />
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                    <div className="config-controls">
                                        <Button
                                            className="btn-config-verde"
                                            onClick={capturarImagen}
                                            aria-label="Capturar imagen desde la cámara"
                                        >
                                            Capturar Imagen
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="config-controls" style={{ marginTop: '1rem' }}>
                                <Button
                                    type="button"
                                    className="btn-config-verde"
                                    onClick={handleProcesar}
                                    aria-label="Procesar imagen con IA"
                                >
                                    {cargando ? 'Procesando...' : 'Procesar imagen'}
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Resultado de descripción */}
                    {descripcion && (
                        <section aria-labelledby="resultado-ia" className="config-card">
                            <h2 id="resultado-ia">Resultado generado por IA</h2>
                            <div className="config-form-group">
                                <p>{descripcion}</p>
                                <div className="config-controls">
                                    <Button
                                        type="button"
                                        className={ "btn-config-azul"}
                                        onClick={() => {
                                            if (leyendo) {
                                                window.speechSynthesis.cancel();
                                                setLeyendo(false);
                                                setPausado(false);
                                                setUtterance(null);
                                            } else {
                                                leerFrases();
                                            }
                                        }}
                                        aria-label={leyendo ? "Detener lectura" : "Leer descripción generada"}
                                    >
                                        {leyendo ? 'Detener' : 'Leer en voz alta'}
                                    </Button>
                                </div>

                            </div>
                        </section>
                    )}
                </section>
            </main>
        </>
    );
};

export default ProcesarImagen;
