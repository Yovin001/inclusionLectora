import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './fragment/Login';
import Registrar from './fragment/Registrar';
import Perfil from './fragment/Perfil';
import Extractor from './fragment/Extractor';
import Dashboard from './fragment/Dashboard';
import SobreNosotros from './fragment/SobreNosotros';
import ConfiguracionGlobal from './fragment/ConfiguracionGlobal';
import { getToken } from './utilities/Sessionutil';
import OlvidoClave from './fragment/OlvidoClave';
import CambioClave from './fragment/CambioClave';
import VerPeticionesClave from './fragment/VerPeticionesClave';
import ProcesarImagen from './fragment/ProcesarImagen';

function App() {
  const MiddewareSesion = ({ children }) => {
    const autenticado = getToken();
    if (autenticado) {
      return children;
    } else {
      return <Navigate to='/login' />;
    }
  };

  return (
      <Routes>
        <Route path='*' element={ <Navigate to='/login' />} />
        <Route path='/registrar' element={<Registrar />} />
        <Route path='/login' element={<Login />} />
        <Route path='/olvidar/clave' element={<OlvidoClave />} />
        <Route path='/cambio/clave/restablecer/:external_id/:token' element={<CambioClave />} />
        <Route path='/peticiones/clave' element={<MiddewareSesion><VerPeticionesClave /></MiddewareSesion>} />
        <Route path='/cambio/clave' element={<MiddewareSesion><CambioClave /></MiddewareSesion>} />
        <Route path='/extraer/:external_id' element={<MiddewareSesion><Extractor /> </MiddewareSesion>} />
        <Route path='/perfil' element={<MiddewareSesion><Perfil /></MiddewareSesion>} />
        <Route path='/dashboard' element={<MiddewareSesion><Dashboard /></MiddewareSesion>} />
        <Route path='/contactanos' element={<MiddewareSesion><SobreNosotros/></MiddewareSesion>} />
        <Route path='/configuracion' element={<MiddewareSesion><ConfiguracionGlobal/></MiddewareSesion>} />
        <Route path='/procesar' element={<MiddewareSesion><ProcesarImagen/></MiddewareSesion>} />
      </Routes>
  );
} 

export default App;
