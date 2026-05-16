import React, { useState, useEffect } from 'react';
import './ControlCitas.css';

export default function ControlCitas({ usuario, paciente, especialista, onNavigate, onLogout }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pendientes');
  const [showModal, setShowModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);

  useEffect(() => {
    if (paciente || especialista) {
      cargarCitas();
    }
  }, [paciente, especialista]);

  const cargarCitas = async () => {
    try {
      const id = paciente ? paciente.idPaciente : especialista.idEspecialista;
      const tipo = paciente ? 'paciente' : 'especialista';
      const response = await fetch(`http://localhost:8080/api/citas/${tipo}/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCitas(data);
      }
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!selectedCita) return;
    try {
      const response = await fetch(`http://localhost:8080/api/citas/${selectedCita.idCita}/cancelar`, {
        method: 'PUT'
      });
      if (response.ok) {
        cargarCitas();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error cancelando cita:", error);
    }
  };

  const filtrarCitas = () => {
    switch (activeTab) {
      case 'pendientes':
        return citas.filter(c => c.estado === 'activa');
      case 'pasadas':
        return citas.filter(c => c.estado === 'completada');
      case 'canceladas':
        return citas.filter(c => c.estado === 'cancelada');
      default:
        return citas;
    }
  };

  const citasFiltradas = filtrarCitas().sort((a, b) => {
    return new Date(`${a.fecha}T${a.horaInicio}`) - new Date(`${b.fecha}T${b.horaInicio}`);
  });

  return (
    <div className="control-container">
      <header className="global-header">
        <h1>simonCitas</h1>
        <div className="header-user-actions">
          <button 
            className="logout-btn-header" 
            onClick={onLogout}
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD88cY9euHW48FtcpxzuwLVYzflI7TI23weUjjkSzcbQkh2paLqyhYu5WG3B8Dg6TvWALOG5HfIV1wnBrpVo8N5M_1U6o5for8Ey8f8RO0Dl9xeHY01WJ3-wqWvnqwlze9uXIbijXVupO9dPB6lno6qSpkc3096ZwCLPZkgLaoV1BfcnZjTC4gyNfrn_hOqVvSpqKOSrvgcn15cCj_K4Zx3pS9hYrhZGDrmZBopu9l7a5F3dSc8ZT2x8P3wMjvqapzYXonfLZ3mU2s" 
            alt="Profile" 
            className="header-profile-img" 
          />
        </div>
      </header>

      <main className="control-main">
        <section className="control-header">
          <h2>Mis Citas</h2>
          <p>Gestiona tus consultas y horarios médicos.</p>
        </section>

        <nav className="tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'pendientes' ? 'active' : ''}`}
            onClick={() => setActiveTab('pendientes')}
          >
            Pendientes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pasadas' ? 'active' : ''}`}
            onClick={() => setActiveTab('pasadas')}
          >
            Pasadas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'canceladas' ? 'active' : ''}`}
            onClick={() => setActiveTab('canceladas')}
          >
            Canceladas
          </button>
        </nav>

        <div className="citas-stack">
          {loading ? (
            <p className="text-center py-10">Cargando tus citas...</p>
          ) : citasFiltradas.length > 0 ? (
            citasFiltradas.map(cita => (
              <article key={cita.idCita} className="appointment-article">
                <div className="card-header-top">
                  <div className="doctor-info-flex">
                    <div className="avatar-placeholder bg-slate-100 p-3 rounded-xl flex items-center justify-center" style={{width: 56, height: 56}}>
                       <span className="material-symbols-outlined text-primary text-3xl">medical_services</span>
                    </div>
                    <div className="doctor-text-info">
                      <h3>
                        {usuario?.rol === 'especialista' 
                          ? `${cita.paciente?.nombre} ${cita.paciente?.apellido}` 
                          : `Dr(a). ${cita.especialista?.nombre} ${cita.especialista?.apellido}`}
                      </h3>
                      <p>
                        {usuario?.rol === 'especialista' 
                          ? `Documento: ${cita.paciente?.documento}` 
                          : cita.especialista?.especialidad?.nombre}
                      </p>
                    </div>
                  </div>
                  <span className={`status-badge ${cita.estado}`}>
                    {cita.estado}
                  </span>
                </div>

                <div className="details-grid">
                  <div className="detail-item">
                    <span className="material-symbols-outlined">calendar_month</span>
                    <span>{cita.fecha}</span>
                  </div>
                  <div className="detail-item">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>{cita.horaInicio.substring(0,5)} AM</span>
                  </div>
                </div>

                <div className="card-actions-flex">
                  {cita.estado === 'activa' && usuario?.rol === 'paciente' && (
                    <button 
                      className="btn-cancel"
                      onClick={() => {
                        setSelectedCita(cita);
                        setShowModal(true);
                      }}
                    >
                      CANCELAR CITA
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
              <p className="text-on-surface-variant">No tienes citas en esta categoría.</p>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="warning-icon">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h2>¿Cancelar Cita?</h2>
            <p>Esta acción no se puede deshacer. Se notificará al médico sobre la cancelación.</p>
            <div className="modal-actions">
              <button className="btn-confirm-cancel" onClick={handleCancelar}>
                SÍ, CANCELAR CITA
              </button>
              <button className="btn-keep-cita" onClick={() => setShowModal(false)}>
                MANTENER CITA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BottomNavBar */}
      <nav className="global-bottom-nav">
        <div className="nav-item-standard" onClick={() => onNavigate('dashboard')}>
          <span className="material-symbols-outlined">home</span>
          <span>Inicio</span>
        </div>
        <div className="nav-item-standard active" onClick={() => onNavigate('control')}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>event_note</span>
          <span>Citas</span>
        </div>
        {usuario?.rol === 'paciente' && (
          <div className="nav-item-standard" onClick={() => onNavigate('asignacion')}>
            <span className="material-symbols-outlined">add_circle</span>
            <span>Agendar</span>
          </div>
        )}
      </nav>
    </div>
  );
}
