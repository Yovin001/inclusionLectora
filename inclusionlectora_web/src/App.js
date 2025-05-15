import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './fragment/Login';
import Registrar from './fragment/Registrar';
import Perfil from './fragment/Perfil';
import ListaUsuarios from './fragment/ListaUsuarios';
import Extractor from './fragment/Extractor';
import Dashboard from './fragment/Dashboard';
import SobreNosotros from './fragment/SobreNosotros';
import ConfiguracionGlobal from './fragment/ConfiguracionGlobal';
import { getToken } from './utilities/Sessionutil';
import OlvidoClave from './fragment/OlvidoClave';
import CambioClave from './fragment/CambioClave';
import VerPeticionesClave from './fragment/VerPeticionesClave';

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
    <main className="App">
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
        <Route path='/usuarios' element={<MiddewareSesion><ListaUsuarios /></MiddewareSesion>} />
        <Route path='/dashboard' element={<MiddewareSesion><Dashboard /></MiddewareSesion>} />
        <Route path='/contactanos' element={<MiddewareSesion><SobreNosotros/></MiddewareSesion>} />
        <Route path='/configuracion' element={<MiddewareSesion><ConfiguracionGlobal/></MiddewareSesion>} />
      </Routes>
    </main>
  );
} 

export default App;
