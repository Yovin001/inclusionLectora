// SobreNosotros.js
import React, { useEffect, useRef, useState } from 'react';
import '../css/Sobre_Nosotros.css';
import MenuBar from './MenuBar';
import SkipToContent from './component/skipToContent/SkipToContent';
import LiveRegion from './component/skipToContent/LiveRegion';
import { peticionGet, URLBASE } from '../utilities/hooks/Conexion';
import { mensajesSinRecargar } from '../utilities/Mensajes';
import { getToken } from '../utilities/Sessionutil';

const SobreNosotros = () => {
  const mainContentRef = useRef(null);
  const [licencia, setLicencia] = useState(null);
  useEffect(() => {

    peticionGet(getToken(), `licencia`)
      .then((info) => {
        if (info.code === 200) {
          setLicencia(`${URLBASE}${info.info.rutaRelativa}`);
        } else {
          mensajesSinRecargar("No se encontró la licencia", 'error', 'Error');
        }
      })
      .catch(() => {
        mensajesSinRecargar("Error al buscar la licencia", 'error', 'Error');
      });

  });
  return (
    <>
      <SkipToContent
        targetId="main-content"
        label="Area de informacion"
      />

      <LiveRegion />
      <header>
        <MenuBar />
      </header>
      <main ref={mainContentRef}
        id="main-content"
        tabIndex="-1"
        aria-labelledby="page-title" className="sobre-nosotros">
        <section className="hero">
          <div className="hero-content">
            <h1 className="titulo-principal">Inclusión Lectora</h1>
            <p className="descripcion">
              Transformamos documentos PDF en archivos de audio MP3 para promover la inclusión de personas con discapacidad visual.
            </p>
          </div>
        </section>

        <div className="main-content">
          <section className=" info">
            <div className="contenedor">
              <h2 className="titulo-secundario">¿Qué es Inclusión Lectora?</h2>
              <p className="texto-normal">
                Inclusión Lectora es una aplicación que convierte documentos PDF a formato MP3, ayudando a personas con discapacidad visual a acceder a contenidos de forma práctica e inclusiva. Nuestro objetivo es derribar barreras y garantizar igualdad de acceso a la información.
              </p>
            </div>
          </section>

          <section className="equipo">
            <div className="contenedor">
              <h2 className="titulo-secundario">Equipo del Proyecto</h2>
              <ul className="lista-detallada">
                <li><strong>Desarrollador:</strong> Yovin Stiven Urrego Gómez - <a href="mailto:yovin.urrego@unl.edu.ec">yovin.urrego@unl.edu.ec</a></li>
                <li><strong>Docente Involucrado:</strong> Oscar Miguel Cumbicus Pineda - <a href="mailto:oscar.cumbicus@unl.edu.ec">oscar.cumbicus@unl.edu.ec</a></li>
                <li><strong>Docente Involucrado:</strong> Pablo Fernando Ordoñez Ordoñez - <a href="mailto:fjalvarez@unl.edu.ec">pfordonez@unl.edu.ec</a></li>
                <li><strong>Docente Involucrado:</strong> Hernán Leonardo Torres Carrión - <a href="mailto:fjalvarez@unl.edu.ec">hltorres@unl.edu.ec</a></li>
                <li><strong>Docente Involucrado:</strong> Francisco Javier Alvarez Pineda - <a href="mailto:fjalvarez@unl.edu.ec">fjalvarez@unl.edu.ec</a></li>
              </ul>
            </div>
          </section>
          {licencia && (
            <section className="equipo">
              <div className="contenedor">
                <h2 className="titulo-secundario">Licencia</h2>
                <a
                  href={licencia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="boton-ver-licencia"
                >
                  Ver Licencia (PDF)
                </a>
              </div>
            </section>
          )}
        </div>
      </main>
      <footer className="footer">
        <div className="contenedor">
          <p className="descripcion">© {new Date().getFullYear()} Inclusión Lectora. Todos los derechos reservados.</p>
        </div>
      </footer>

    </>
  );
};

export default SobreNosotros;