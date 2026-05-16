import React, { useState, useEffect } from 'react';
import './App.css';
import AsignacionCita from './components/AsignacionCita';
import ControlCitas from './components/ControlCitas';
import Login from './components/Login';
import RegistroUsuario from './components/RegistroUsuario';
import ConsultaAgendas from './components/ConsultaAgendas';
import DashboardInicio from './components/DashboardInicio';
import GestionUsuarios from './components/GestionUsuarios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  // Recuperar sesión al cargar la app
  useEffect(() => {
    const savedUsuario = localStorage.getItem('usuario');
    const savedPaciente = localStorage.getItem('paciente');
    const savedView = localStorage.getItem('currentView');

    if (savedUsuario && savedPaciente) {
      setUsuario(JSON.parse(savedUsuario));
      setPaciente(JSON.parse(savedPaciente));
      setIsLoggedIn(true);
      if (savedView) setCurrentView(savedView);
    }
  }, []);

  // Guardar vista actual cuando cambie
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('currentView', currentView);
    }
  }, [currentView, isLoggedIn]);

  const handleLoginSuccess = async (userData) => {
    try {
      let profileData = null;
      let targetView = 'dashboard';

      if (userData.rol === 'paciente') {
        const response = await fetch(`http://localhost:8080/api/paciente/documento/${userData.documento}`);
        if (response.ok) {
          profileData = await response.json();
          targetView = 'dashboard';
        }
      } else if (userData.rol === 'especialista') {
        const response = await fetch(`http://localhost:8080/api/especialista/documento/${userData.documento}`);
        if (response.ok) {
          profileData = await response.json();
        } else {
          // Si el especialista no tiene perfil aún (ej. recién ascendido por admin)
          profileData = { nombre: 'Especialista', apellido: userData.documento, documento: userData.documento };
        }
        targetView = 'dashboard';
      } else if (userData.rol === 'administrador') {
        profileData = { nombre: 'Administrador', apellido: '' }; // Perfil genérico
        targetView = 'gestion-usuarios';
      }

      if (profileData) {
        setUsuario(userData);
        setPaciente(profileData);
        setIsLoggedIn(true);
        setCurrentView(targetView);
        
        // Guardar en localStorage
        localStorage.setItem('usuario', JSON.stringify(userData));
        localStorage.setItem('paciente', JSON.stringify(profileData));
        localStorage.setItem('currentView', targetView);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('paciente');
    localStorage.removeItem('currentView');
    setIsLoggedIn(false);
    setUsuario(null);
    setPaciente(null);
  };

  if (!isLoggedIn) {
    if (currentView === 'registro') {
      return <RegistroUsuario onNavigate={setCurrentView} />;
    }
    return <Login onLoginSuccess={handleLoginSuccess} onNavigate={setCurrentView} />;
  }

  const renderView = () => {
    const props = { 
      usuario, 
      paciente: usuario?.rol === 'paciente' ? paciente : null,
      especialista: usuario?.rol === 'especialista' ? paciente : null,
      onNavigate: setCurrentView,
      onLogout: handleLogout 
    };

    switch (currentView) {
      case 'dashboard':
        return <DashboardInicio {...props} />;
      case 'asignacion':
        return <AsignacionCita {...props} />;
      case 'agenda':
        return <ConsultaAgendas {...props} />;
      case 'control':
        return <ControlCitas {...props} />;
      case 'gestion-usuarios':
        return <GestionUsuarios {...props} />;
      default:
        return <DashboardInicio {...props} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;
