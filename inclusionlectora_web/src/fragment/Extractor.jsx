import React, { useState, useRef, useEffect } from 'react';
import '../css/style.css';
import { GuardarArchivos, peticionGet, peticionPut, URLBASE } from '../utilities/hooks/Conexion';
import { getToken, getUser } from '../utilities/Sessionutil';
import mensajes from '../utilities/Mensajes';
import MenuBar from './MenuBar';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router';
import swal from 'sweetalert';

const Extractor = () => {
    const navegation = useNavigate();
    const { external_id } = useParams();
    const [file, setFile] = useState(null);
    const [fileURL, setFileURL] = useState(null);
    const [loading, setLoading] = useState(false);
    const [audioComplete, setAudioComplete] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showPdf, setShowPdf] = useState(false);
    const [lastPlaybackTime, setLastPlaybackTime] = useState(0);
    const audioRef = useRef(null);
    const beepInterval = useRef(null);
    const [audioName, setAudioName] = useState('');
    const [audioNotFound, setAudioNotFound] = useState(false);

    const playSound = (path) => {
        const audio = new Audio(path);
        audio.play();
    };

    useEffect(() => {
        if (external_id && external_id !== "new") {
            const audioPath = `${URLBASE}audio/completo/${external_id}.mp3`;
            setAudioComplete(audioPath);
            setFileURL(`${URLBASE}documentos/${external_id}.pdf`);
            
            peticionGet(getToken(), `documento/one/${external_id}`).then((info) => {
                if (info.code === 200) {
                    setAudioName(info.info.nombre);
                }
            });

            peticionGet(getToken(), `audio/${external_id}`)
                .then((info) => {
                    if (info.code === 200) {
                        setLastPlaybackTime(parseFloat(info.info.tiempo_reproduccion));
                    }
                })
                .catch(() => {
                    setAudioNotFound(true); // Establece el estado si no se encuentra el audio
                });
        }
    }, [external_id]);

    useEffect(() => {
        if (audioRef.current && lastPlaybackTime > 0) {
            audioRef.current.currentTime = lastPlaybackTime;
        }
    }, [audioComplete, lastPlaybackTime]);

    useEffect(() => {
        if (!audioComplete) return;

        const intervalId = setInterval(() => {
            if (audioRef.current) {
                savePlaybackTime();
            }
        }, 10000);

        return () => clearInterval(intervalId);
    }, [audioComplete, audioRef, external_id]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        const pdfURL = URL.createObjectURL(selectedFile);
        setFileURL(pdfURL);
        setShowPdf(false);
    };
    const handleSave = async () => {
        if (!file) {
            mensajes("No se ha seleccionado un archivo", 'error', 'Error');
            return;
        }

        // Verificar si el documento ya existe
        const existingDocumentResponse = await peticionGet(
            getToken(),
            `documento/entidad/${getUser().user.id}/${file.name}`
        );

        if (existingDocumentResponse && existingDocumentResponse.info === true) {
            const confirmOverwrite = await swal({
                title: "Documento ya existe",
                text: `El documento "${file.name}" ya existe. ¿Quieres guardarlo con el mismo nombre?`,
                icon: "warning",
                buttons: {
                    cancel: "Cancelar",
                    confirm: {
                        text: "Guardar",
                        value: true,
                        visible: true,
                        className: "btn-danger",
                    },
                },
                dangerMode: true,
            });

            if (!confirmOverwrite) {
                mensajes("Operación cancelada por el usuario.", 'info', 'Información');
                return;
            }
        }
        setLoading(true);
        playSound('/audio/cargando.mp3');

        beepInterval.current = setInterval(() => {
            playSound('/audio/beepbeepbeep-53921.mp3');
        }, 5000);

        const formData = new FormData();
        formData.append('nombre', file.name);
        formData.append('documento', file);
        formData.append('id', getUser().user.id);

        GuardarArchivos(formData, getToken(), "/documento")
            .then(info => {
                clearInterval(beepInterval.current);

                if (info.code !== 200) {
                    mensajes(info.msg, 'error', 'Error');
                    setLoading(false);
                } else {
                    setAudioComplete(`${URLBASE}audio/completo/${info.info.nombre}.mp3`);
                    setLoading(false);
                    navegation(`/extraer/${info.info}`);
                }
            })
            .catch(error => {
                clearInterval(beepInterval.current);
                mensajes("Error al guardar el documento", 'error', 'Error');
                setLoading(false);
            });
    };
    const togglePlayPause = () => {
        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
        setIsPlaying(!isPlaying);
    };

    const changePlaybackRate = (event) => {
        const newRate = parseFloat(event.target.value);
        setPlaybackRate(newRate);
        if (audioRef.current) {
            audioRef.current.playbackRate = newRate;
        }
    };

    const skipTime = (seconds) => {
        audioRef.current.currentTime += seconds;
    };

    const savePlaybackTime = () => {
        const currentTime = audioRef.current.currentTime;
        const data = {
            tiempo_reproduccion: currentTime
        };
        peticionPut(getToken(), `audio/${external_id}`, data);
    };
    if (audioNotFound) {
        return (
            <div>
                <header>
                    <MenuBar />
                </header>
                <main className="contenedor-centro">
                    <section className="cart">
                        <h2>Audio no encontrado</h2>
                        <p>El audio solicitado ya no está disponible o fue eliminado.</p>
                        <button className="btn-positivo text-white" onClick={() => navegation('/dashboard')}>
                            Regresar al inicio
                        </button>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div>
            <header>
                <MenuBar />
            </header>
            <main className="contenedor-centro">
                {loading ? (
                    <section className="cart">
                        <div className="loading">
                            <div className="pelotas"></div>
                            <div className="pelotas"></div>
                            <div className="pelotas"></div>
                            <span className="loading-text">Cargando...</span>
                        </div>
                    </section>
                ) : (
                    <section className="contenedor-carta-columna">
                        {audioComplete && (
                            <div className="audio-section">
                                <div className="card audio-card">
                                    <header className="titulo-primario">
                                        <h2>{audioName}</h2>
                                    </header>
                                    <div className="card-body">
                                        <div className="audio-container">
                                            <audio
                                                ref={audioRef}
                                                src={audioComplete}
                                                controls
                                                autoPlay
                                                style={{ width: '70%' }}
                                            />

                                        </div>

                                        <div className="audio-controls">
                                            <button className="btn-positivoazul text-white" onClick={() => skipTime(-10)}>
                                                -10 segundos
                                            </button>
                                            <button className="btn-positivoazul text-white" onClick={togglePlayPause}>
                                                {isPlaying ? "Play" : "Pausa"}
                                            </button>
                                            <button className="btn-positivoazul text-white" onClick={() => skipTime(10)}>
                                                +10 segundos
                                            </button>
                                            <div className="playback-rate">
                                                <label htmlFor="playbackRate">Velocidad:</label>
                                                <select className="btn-positivoazul text-white" id="playbackRate" onChange={changePlaybackRate} value={playbackRate}>
                                                    <option value="0.25">x0.25</option>
                                                    <option value="0.5">x0.50</option>
                                                    <option value="0.75">x0.75</option>
                                                    <option value="1">Normal</option>
                                                    <option value="1.25">x1.25</option>
                                                    <option value="1.5">x1.50</option>
                                                    <option value="1.75">x1.75</option>
                                                    <option value="2">x2</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!audioComplete && (
                            <div className="file-upload-card">
                                <header className="titulo-primario">
                                    <h2>Carga tu documento PDF</h2>
                                </header>
                                <div className="card-body">
                                    <input type="file" onChange={handleFileChange} accept=".pdf" />
                                    <button className="btn-positivo text-white" type="submit" onClick={handleSave} disabled={!file}>
                                        EXTRAER
                                    </button>
                                </div>
                            </div>
                        )}

                        {fileURL && (
                            <div className="botones-container">
                                <button className="btn-positivo text-white" onClick={() => setShowPdf(!showPdf)}>
                                    {showPdf ? "OCULTAR PDF" : "VER PDF"}
                                </button>
                                {audioComplete && (
                                    <div>
                                        <button
                                            className="btn-positivo text-white"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = `${URLBASE}api/audio/descargar/${external_id}.mp3`;
                                                link.download = audioName ? `${audioName}.mp3` : "audio.mp3";
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            DESCARGAR AUDIO
                                        </button>
                                        <button
                                            className="btn-positivo text-white"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = `${URLBASE}api/pdf2docx/${external_id}.pdf`;
                                                link.download = audioName ? `${audioName}.docx` : "doc.docx";
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            DESCARGAR DOCX
                                        </button>
                                    </div>
                                )
                                }
                            </div>
                        )}


                        {showPdf && fileURL && (
                            <div className="contenedor-carta">
                                <header className="titulo-primario">
                                    <h2>Vista previa del PDF</h2>
                                </header>
                                <div className="card-body">
                                    <iframe
                                        src={fileURL}
                                        title="Vista previa del PDF"
                                        width="100%"
                                        height="500px"
                                    ></iframe>
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default Extractor;
