import React, { useState, useEffect } from 'react';
import './DashboardInicio.css';
import './ConsultaAgendas.css'; // Reutilizamos los estilos premium para el especialista

export default function DashboardInicio({ usuario, paciente, especialista, onNavigate, onLogout }) {
  const [citas, setCitas] = useState([]);
  const [todasLasCitas, setTodasLasCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);

  const [horariosConfig, setHorariosConfig] = useState([]);

  useEffect(() => {
    if (paciente || especialista) {
      cargarCitas();
      if (especialista) cargarConfiguracionHorarios();
    }
  }, [paciente, especialista]);

  const cargarConfiguracionHorarios = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/horario/especialista/${especialista.idEspecialista}`);
      if (res.ok) {
        const data = await res.json();
        setHorariosConfig(data);
      }
    } catch (e) { console.error("Error cargando config horarios", e); }
  };

  const cargarCitas = async () => {
    try {
      const id = paciente ? paciente.idPaciente : especialista?.idEspecialista;
      const tipo = paciente ? 'paciente' : 'especialista';
      
      console.log(`Cargando citas para ${tipo} con ID: ${id}`);
      
      if (!id) return;

      const response = await fetch(`http://localhost:8080/api/citas/${tipo}/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Citas recibidas del servidor:", data);
        setTodasLasCitas(data);
        
        const filtradas = data
          .filter(c => c.estado === 'activa')
          .sort((a, b) => new Date(`${a.fecha}T${a.horaInicio}`) - new Date(`${b.fecha}T${b.horaInicio}`));
        
        setCitas(filtradas);
      }
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSlotsParaDia = () => {
    const diaSemanaJS = new Date(selectedDate + 'T00:00:00').getDay();
    const diaSemanaDB = diaSemanaJS === 0 ? 7 : diaSemanaJS;
    
    let config = horariosConfig.find(h => h.diaSemana === diaSemanaDB);
    if (!config) config = { horaInicio: '08:00', horaFin: '12:00' };

    const slots = [];
    let current = new Date(`1970-01-01T${config.horaInicio}`);
    const end = new Date(`1970-01-01T${config.horaFin}`);

    while (current < end) {
      const startStr = current.toTimeString().substring(0, 5);
      current.setMinutes(current.getMinutes() + 30);
      const endStr = current.toTimeString().substring(0, 5);
      
      slots.push({ inicio: startStr, fin: endStr });
    }
    return slots;
  };

  const getSlotStatus = (timeObj) => {
    // Definimos el inicio y fin del slot actual como objetos Date para comparar fácilmente
    const slotInicio = new Date(`1970-01-01T${timeObj.inicio}:00`);
    const slotFin = new Date(`1970-01-01T${timeObj.fin}:00`);

    // Buscamos si hay una cita que se traslape con este rango de 30 min
    const cita = todasLasCitas.find(c => {
      // Normalizamos fechas
      const fechaCita = new Date(c.fecha + 'T00:00:00').toISOString().split('T')[0];
      const fechaSeleccionada = new Date(selectedDate + 'T00:00:00').toISOString().split('T')[0];
      
      if (fechaCita !== fechaSeleccionada || c.estado !== 'activa') return false;

      // Convertimos horas de la cita a Date para comparar traslapes
      const citaInicio = new Date(`1970-01-01T${c.horaInicio}`);
      const citaFin = new Date(`1970-01-01T${c.horaFin}`);

      // Lógica de traslape: (InicioCita < FinSlot) Y (FinCita > InicioSlot)
      return (citaInicio < slotFin && citaFin > slotInicio);
    });
    
    if (cita) {
      return { 
        status: 'ocupado', 
        label: 'Reservado', 
        icon: 'lock',
        paciente: `${cita.paciente?.nombre} ${cita.paciente?.apellido}`
      };
    }
    
    return { status: 'disponible', label: 'Libre', icon: 'add_circle' };
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

  const stats = {
    totales: todasLasCitas.filter(c => c.estado === 'activa').length,
    completadas: todasLasCitas.filter(c => c.estado === 'completada').length,
    todas: todasLasCitas.length
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDaysInMonth = new Date(year, month, 0).getDate();
    const startingDay = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    for (let i = startingDay - 1; i >= 0; i--) days.push({ day: prevDaysInMonth - i, current: false });
    for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, current: true });
    return days;
  };

  const changeMonth = (offset) => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const calendarDays = getDaysInMonth(viewDate);

  // --- VISTA PARA PACIENTE ---
  if (usuario?.rol === 'paciente') {
    return (
      <div className="dashboard-container">
        <header className="global-header">
          <h1>simonCitas</h1>
          <div className="header-user-actions">
            <button className="logout-btn-header" onClick={onLogout}><span className="material-symbols-outlined">logout</span></button>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD88cY9euHW48FtcpxzuwLVYzflI7TI23weUjjkSzcbQkh2paLqyhYu5WG3B8Dg6TvWALOG5HfIV1wnBrpVo8N5M_1U6o5for8Ey8f8RO0Dl9xeHY01WJ3-wqWvnqwlze9uXIbijXVupO9dPB6lno6qSpkc3096ZwCLPZkgLaoV1BfcnZjTC4gyNfrn_hOqVvSpqKOSrvgcn15cCj_K4Zx3pS9hYrhZGDrmZBopu9l7a5F3dSc8ZT2x8P3wMjvqapzYXonfLZ3mU2s" alt="Profile" className="header-profile-img" />
          </div>
        </header>

        <main className="dashboard-main">
          <section className="welcome-section">
            <p>PANEL DEL PACIENTE</p>
            <h2>¡Hola, {paciente?.nombre}!</h2>
          </section>

          <div className="bento-grid">
            <div className="stats-card">
              <div className="stats-header">
                <h3>Tus Citas</h3>
                <span className="stats-date">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="stats-row">
                <div className="stat-item stat-activas">
                  <span className="stat-value">{stats.totales}</span>
                  <span className="stat-label">ACTIVAS</span>
                </div>
                <div className="stat-item stat-pasadas">
                  <span className="stat-value">{stats.completadas}</span>
                  <span className="stat-label">PASADAS</span>
                </div>
                <div className="stat-item stat-todas">
                  <span className="stat-value">{stats.todas}</span>
                  <span className="stat-label">TODAS</span>
                </div>
              </div>
            </div>

            <button className="action-btn" onClick={() => onNavigate('asignacion')}>
              <span className="material-symbols-outlined">add_circle</span>
              <span className="btn-title">Nueva Cita</span>
              <span className="btn-desc">Agendar ahora</span>
            </button>
          </div>

          <div className="content-grid">
            <div className="appointments-column">
              <div className="section-header">
                <h3>Próximas Citas</h3>
                <button className="view-all" onClick={() => onNavigate('control')}>Ver todas</button>
              </div>

              {loading ? (
                <p>Cargando...</p>
              ) : citas.length > 0 ? (
                citas.slice(0, 3).map(cita => (
                  <div key={cita.idCita} className="appointment-card">
                    <div className="card-accent"></div>
                    <div className="card-body">
                      <div className="avatar-placeholder">
                        <span className="material-symbols-outlined">medical_services</span>
                      </div>
                      <div className="patient-info">
                        <h4>Dr(a). {cita.especialista?.nombre} {cita.especialista?.apellido}</h4>
                        <p className="appointment-type">{cita.especialista?.especialidad?.nombre}</p>
                        <p className="appointment-date">{cita.fecha} • {cita.horaInicio.substring(0,5)}</p>
                      </div>
                      <button className="cancel-btn-dashboard" onClick={() => {setSelectedCita(cita); setShowModal(true);}}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-citas-msg">No tienes citas próximas.</p>
              )}
            </div>

            <div className="sidebar-column">
              <div className="sidebar-card">
                <h3>Accesos Rápidos</h3>
                <button className="sidebar-btn" onClick={() => onNavigate('control')}>
                  <span className="material-symbols-outlined">event_note</span>
                  <span>Mi Historial</span>
                </button>
              </div>
              <div className="sidebar-card reminders">
                <h3>Recordatorios</h3>
                <ul>
                  <li>Llega 15 min antes a tu cita.</li>
                  <li>Trae tu documento original.</li>
                </ul>
              </div>
            </div>
          </div>
        </main>

        <nav className="global-bottom-nav">
          <div className="nav-item-standard active"><span className="material-symbols-outlined">home</span><span>Inicio</span></div>
          <div className="nav-item-standard" onClick={() => onNavigate('control')}><span className="material-symbols-outlined">event_note</span><span>Citas</span></div>
          <div className="nav-item-standard" onClick={() => onNavigate('asignacion')}><span className="material-symbols-outlined">add_circle</span><span>Agendar</span></div>
        </nav>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>¿Cancelar Cita?</h2>
              <p>Se notificará al médico sobre esta cancelación.</p>
              <div className="modal-actions">
                <button className="btn-confirm-cancel" onClick={handleCancelar}>SÍ, CANCELAR</button>
                <button className="btn-keep-cita" onClick={() => setShowModal(false)}>MANTENER</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VISTA PARA ESPECIALISTA ---
  return (
    <div className="agenda-container">
      <header className="global-header">
        <h1>simonCitas</h1>
        <div className="header-user-actions">
          <button className="logout-btn-header" onClick={onLogout} title="Cerrar sesión">
            <span className="material-symbols-outlined">logout</span>
          </button>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOEiEPHz75U3wemDS0ehm84Ymi01VfQ5jUV9k-La9y2Hbc_HHgt8VukSiJsf_0RTA_HSQfoGEbYNdG0CZlHrewJzzoHRRPU367VCWYo4-z3qvZia1yGGKZgVQCF8wJa1eFI8lzxN_VBVkYx6U2gl0XMRP7XBf5G7-ch5nQrZqq1KXDNNTJQkSFP4BteGbrRihvduLhxalmzHlLLcuo1ZpzTpv6S4ZRHE4A1OetXH7C32e9B-GtI6p70CGAIdh9hfw2XfxF65aMMys" alt="Doctor" className="header-profile-img" />
        </div>
      </header>

      <main className="agenda-main">
        <h2 className="section-title">Especialista</h2>
        <div className="specialist-selector-card">
          <span className="material-symbols-outlined">search</span>
          <span>Dr(a). {especialista?.nombre} {especialista?.apellido} - {especialista?.especialidad?.nombre}</span>
          <span className="material-symbols-outlined">expand_more</span>
        </div>

        <section className="calendar-card">
          <div className="calendar-header">
            <h3>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</h3>
            <div className="nav-arrows">
              <button className="arrow-btn" onClick={() => changeMonth(-1)}><span className="material-symbols-outlined">chevron_left</span></button>
              <button className="arrow-btn" onClick={() => changeMonth(1)}><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
          <div className="calendar-grid">
            {['L','M','X','J','V','S','D'].map(d => <span key={d} className="day-label">{d}</span>)}
            {calendarDays.map((d, i) => {
              const today = new Date();
              today.setHours(0,0,0,0);
              const dayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d.day);
              const isPast = dayDate < today && d.current;
              const dateStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${d.day.toString().padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr && d.current;
              const tieneCitas = d.current && todasLasCitas.some(c => new Date(c.fecha + 'T00:00:00').toISOString().split('T')[0] === dateStr && c.estado === 'activa');
              return (
                <button key={i} className={`calendar-day ${!d.current ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'disabled' : ''}`} onClick={() => d.current && !isPast && setSelectedDate(dateStr)}>
                  {d.day}
                  {tieneCitas && <span className={`day-dot ${isSelected ? 'selected-dot' : 'has-citas-dot'}`}></span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="status-legend">
          <div className="legend-item"><span className="dot disponible"></span><span>Disponible</span></div>
          <div className="legend-item"><span className="dot ocupado"></span><span>Ocupado</span></div>
          <div className="legend-item"><span className="dot bloqueado"></span><span>Bloqueado</span></div>
        </section>

        <section className="slots-container">
          <div className="slots-header">
            <h3>Horarios Disponibles</h3>
            <p>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="slots-grid">
            {getSlotsParaDia().length > 0 ? (
              getSlotsParaDia().map((timeObj, idx) => {
                const info = getSlotStatus(timeObj);
                return (
                  <div key={idx} className={`slot-card ${info.status}`}>
                    <div className="slot-info">
                      <h4>{timeObj.inicio} - {timeObj.fin}</h4>
                      <span className="slot-status">{info.label}</span>
                      {info.paciente && <p style={{fontSize: '0.75rem', marginTop: '4px', color: '#475569'}}>Pac: {info.paciente}</p>}
                    </div>
                    <span className="material-symbols-outlined">{info.icon}</span>
                  </div>
                );
              })
            ) : (
              <p className="full-width no-citas-msg">No tienes horario configurado para este día.</p>
            )}
          </div>
        </section>
      </main>

      <nav className="global-bottom-nav">
        <div className="nav-item-standard active" onClick={() => onNavigate('dashboard')}>
          <span className="material-symbols-outlined">home</span>
          <span>Inicio</span>
        </div>
        <div className="nav-item-standard" onClick={() => onNavigate('control')}>
          <span className="material-symbols-outlined">event_note</span>
          <span>Citas</span>
        </div>
      </nav>
    </div>
  );
}
