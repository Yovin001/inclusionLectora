import React, { useRef, useState, useEffect } from 'react';
import {  Button } from 'react-bootstrap';
import '../../../css/Extractor_Style.css';

const AudioPlayer = ({ audioComplete, audioName, external_id }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

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

        <Button
          onClick={() => skipTime(-10)}
          aria-label="Retroceder 10 segundos"
        >
          -10s
        </Button>

        <Button
          onClick={togglePlayPause}
          aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
        >
          {isPlaying ? 'Pausa' : 'Play'}
        </Button>

        <Button
          onClick={() => skipTime(10)}
          aria-label="Avanzar 10 segundos"
        >
          +10s
        </Button>
        <select
          id="playbackRate"
          onChange={changePlaybackRate}
          value={playbackRate}
          aria-label="Seleccionar velocidad de reproducción"
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
