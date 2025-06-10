import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import '../../../css/Extractor_Style.css';
import { peticionPut, peticionGet } from '../../../utilities/hooks/Conexion';
import { getToken } from '../../../utilities/Sessionutil';

const AudioPlayer = ({ audioComplete, audioName, external_id }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [lastPlaybackTime, setLastPlaybackTime] = useState(0);

  useEffect(() => {
    if (external_id && external_id !== "new") {
      peticionGet(getToken(), `audio/${external_id}`)
        .then((info) => {
          if (info.code === 200 && info.info.tiempo_reproduccion) {
            setLastPlaybackTime(parseFloat(info.info.tiempo_reproduccion));
          }
        })
        .catch((err) => {
          console.error("Error al obtener el tiempo de reproducción:", err);
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
      // Solo guardar si el audio se está reproduciendo
      if (audioRef.current && !audioRef.current.paused) {
        savePlaybackTime();
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [audioComplete, audioRef, external_id]);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);


  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const changePlaybackRate = (e) => {
    const rate = parseFloat(e.target.value);
    setPlaybackRate(rate);
    audioRef.current.playbackRate = rate;
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

  return (
    <section className="extractor-audio-card" aria-labelledby="audio-title">
    <h2 id="audio-title" tabIndex="0">{audioName || 'Reproductor de audio'}</h2>
      <audio
        ref={audioRef}
        src={audioComplete}
        controls
        autoPlay
        aria-label={`Reproduciendo el audio: ${audioName || 'sin nombre'}`}
      />

      <fieldset className="extractor-audio-controls" aria-label="Controles de reproducción">
        <legend className="sr-only">Controles de reproducción</legend>

        <Button className='btn-normal mb-3'
          onClick={() => skipTime(-10)}
          aria-label="Retroceder 10 segundos"
        >
          -10s
        </Button>

        <Button className='btn-normal mb-3'
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
        >
          {isPlaying ? 'Pausa' : 'Play'}
        </Button>

        <Button className='btn-normal mb-3'
          onClick={() => skipTime(10)}
          aria-label="Avanzar 10 segundos"
        >
          +10s
        </Button>
        <label htmlFor="playbackRate" className="sr-only">Velocidad de reproducción</label>
        <select
          className='btn-normal mb-3'
          id="playbackRate"
          onChange={changePlaybackRate}
          value={playbackRate}
        >
          <option value="0.25">x0.25</option>
          <option value="0.5">x0.50</option>
          <option value="0.75">x0.75</option>
          <option value="1">Normal</option>
          <option value="1.25">x1.25</option>
          <option value="1.5">x1.50</option>
          <option value="1.75">x1.75</option>
          <option value="2">x2</option>
        </select>

      </fieldset>
    </section>

  );
};

export default AudioPlayer;
