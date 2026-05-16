import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AsignacionCita.css';

export default function AsignacionCita({ onNavigate, onLogout, usuario, paciente: loggedPaciente }) {
  const [pacienteIdBusqueda, setPacienteIdBusqueda] = useState(loggedPaciente?.documento || '');
  const [paciente, setPaciente] = useState(loggedPaciente || null);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [errorPaciente, setErrorPaciente] = useState(null);

  const [especialistas, setEspecialistas] = useState([]);
  const [idEspecialista, setIdEspecialista] = useState('');

  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [errorSubmit, setErrorSubmit] = useState(null);

  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [loadingHoras, setLoadingHoras] = useState(false);
  const [diasDisponibles, setDiasDisponibles] = useState([]);

  useEffect(() => {
    if (loggedPaciente) {
      setPaciente(loggedPaciente);
    }
    // Fetch specialists on component mount
    fetch('http://localhost:8080/api/especialista')
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar especialistas');
        return res.json();
      })
      .then((data) => setEspecialistas(data))
      .catch((err) => console.error(err));
  }, [loggedPaciente]);

  useEffect(() => {
    if (idEspecialista) {
      fetch(`http://localhost:8080/api/horario/especialista/${idEspecialista}`)
        .then(res => res.json())
        .then(data => {
           const dias = [...new Set(data.map(h => h.diaSemana))];
           setDiasDisponibles(dias);
        })
        .catch(console.error);
    } else {
      setDiasDisponibles([]);
      setFecha(''); // Resetear fecha si cambia o se quita especialista
    }
  }, [idEspecialista]);

  useEffect(() => {
    if (idEspecialista && fecha) {
      setLoadingHoras(true);
      setHora(''); // Reset hour when specialist or date changes
      fetch(`http://localhost:8080/api/disponibilidad/${idEspecialista}?fecha=${fecha}`)
        .then(res => res.json())
        .then(data => {
          setHorasDisponibles(data);
        })
        .catch(err => console.error("Error fetching availability:", err))
        .finally(() => setLoadingHoras(false));
    } else {
      setHorasDisponibles([]);
    }
  }, [idEspecialista, fecha]);

  const isDayEnabled = (date) => {
    if (!idEspecialista || diasDisponibles.length === 0) return false;
    const day = date.getDay() === 0 ? 7 : date.getDay(); // 1=Lunes ... 7=Domingo
    return diasDisponibles.includes(day);
  };

  const buscarPaciente = async () => {
    if (!pacienteIdBusqueda) return;
    setBuscandoPaciente(true);
    setErrorPaciente(null);
    setPaciente(null);
    try {
      const response = await fetch(`http://localhost:8080/api/paciente/documento/${pacienteIdBusqueda}`);
      if (!response.ok) {
        throw new Error('Paciente no encontrado');
      }
      const data = await response.json();
      setPaciente(data);
    } catch (err) {
      setErrorPaciente(err.message);
    } finally {
      setBuscandoPaciente(false);
    }
  };

  const handleAgendar = async () => {
    if (!paciente || !idEspecialista || !fecha || !hora) {
      setErrorSubmit('Por favor complete todos los campos obligatorios (Especialista, Fecha y Hora).');
      return;
    }

    // Validación de fecha y hora futura
    const ahora = new Date();
    const fechaSeleccionada = new Date(`${fecha}T${hora}`);
    
    if (fechaSeleccionada < ahora) {
      setErrorSubmit('No puedes programar una cita para una fecha u hora que ya pasó.');
      return;
    }

    setLoadingSubmit(true);
    setErrorSubmit(null);
    setMensajeExito(null);

    // Calculate horaFin as 30 minutes after horaInicio
    const [h, m] = hora.split(':').map(Number);
    const endM = (m + 30) % 60;
    const endH = h + Math.floor((m + 30) / 60);
    const horaFin = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
    const horaInicio = `${hora}:00`;

    const payload = {
      paciente: { idPaciente: paciente.idPaciente },
      especialista: { idEspecialista: Number(idEspecialista) },
      fecha: fecha,
      horaInicio: horaInicio,
      horaFin: horaFin,
      motivo: motivo || "Consulta general",
      observaciones: observaciones || "Sin observaciones",
      estado: "activa"
    };

    try {
      const response = await fetch('http://localhost:8080/api/citas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Error al crear la cita');
      }

      setMensajeExito('Cita agendada exitosamente');
      
      // Limpiar formulario
      setPaciente(null);
      setPacienteIdBusqueda('');
      setIdEspecialista('');
      setFecha('');
      setHora('');
      setMotivo('');
      setObservaciones('');

      // Redirigir al inicio después de 1.5 segundos para que vea el mensaje
      setTimeout(() => {
        if (onNavigate) onNavigate('dashboard');
      }, 1500);
    } catch (err) {
      setErrorSubmit(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="asignacion-container">
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
            alt="Doctor Profile" 
            className="header-profile-img" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcuAzia3yJEZilw4ZG2IaneFjvb_HwtULfMEMtX7gwFATJnWE3nOS8g1vSPhC_VR826t4LWh8v99m9Awyl-gJamBewjSnt0E014eikzptI2OxOnTFCIzfF-ub76ZzR0RsrfYPdrXSN9AY3g70TMRbHwjfL-IJfl6nnZWlP2dnsmXx_iCH5A--PZO-QgNt19pA7_QF270yIQFY4NNNBLo6GMp6_-wPmoQiw8ox-QAZnVYpa74hhIjXJG0k4mpRHcrMqHi8vtRLr--0"
          />
        </div>
      </header>

      <main className="main-content">
        <div className="header-text">
          <h2>Nueva Cita</h2>
          <p>Complete los detalles para agendar su próxima consulta.</p>
        </div>

        <div className="form-container">
          <section className="card">
            <div className="card-header">
              <span className="material-symbols-outlined icon-primary">person_search</span>
              <label>Información del Paciente</label>
            </div>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="ID del paciente..." 
                value={pacienteIdBusqueda}
                disabled
              />
              <button className="search-btn material-symbols-outlined" disabled>lock</button>
            </div>
            {paciente && (
              <div className="selected-info">
                <p className="selected-title">Paciente seleccionado</p>
                <p className="selected-data">Nombre: {paciente.nombre} {paciente.apellido}</p>
              </div>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <span className="material-symbols-outlined icon-primary">stethoscope</span>
              <label>Especialista</label>
            </div>
            <select 
              value={idEspecialista} 
              onChange={(e) => setIdEspecialista(e.target.value)}
              className="select-input"
            >
              <option value="">Seleccione un especialista</option>
              {especialistas.map((esp) => (
                <option key={esp.idEspecialista} value={esp.idEspecialista}>
                  {esp.especialidad?.nombre || ''} - {esp.nombre} {esp.apellido}
                </option>
              ))}
            </select>
          </section>

          <section className="card">
            <div className="card-header">
              <span className="material-symbols-outlined icon-primary">event</span>
              <label>Fecha y Hora</label>
            </div>
            <div className="grid-form">
              <div className="input-with-label">
                <label className="sub-label">Fecha</label>
                <DatePicker 
                  selected={fecha ? new Date(fecha + 'T00:00:00') : null}
                  onChange={(date) => {
                    if (date) {
                      setFecha(date.toISOString().split('T')[0]);
                    } else {
                      setFecha('');
                    }
                  }}
                  minDate={new Date()}
                  filterDate={isDayEnabled}
                  className="date-input" 
                  placeholderText="Seleccione una fecha"
                  dateFormat="dd/MM/yyyy"
                  disabled={!idEspecialista}
                />
              </div>
            </div>

            {idEspecialista && fecha && (
              <div className="time-slots-container">
                <label className="sub-label">Horas Disponibles (30 min)</label>
                {loadingHoras ? (
                  <p className="loading-small">Calculando disponibilidad...</p>
                ) : horasDisponibles.length > 0 ? (
                  <div className="slots-grid">
                    {horasDisponibles.map((h) => (
                      <button
                        key={h}
                        type="button"
                        className={`slot-btn ${hora === h ? 'selected' : ''}`}
                        onClick={() => setHora(h)}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="error-small">No hay horarios disponibles para este día.</p>
                )}
              </div>
            )}

            <div className="mt-4">
               <label className="card-header"><span className="material-symbols-outlined icon-primary">description</span> Motivo (Opcional)</label>
               <input 
                 type="text" 
                 placeholder="Ej. Chequeo general" 
                 className="text-input"
                 value={motivo}
                 onChange={(e) => setMotivo(e.target.value)}
               />
            </div>

            <div className="rules-info">
              <span className="material-symbols-outlined icon-primary">info</span>
              <div>
                <p className="rules-title">Reglas de Agendamiento</p>
                <ul className="rules-list">
                  <li>No se permiten citas en horarios ya reservados.</li>
                  <li>Solo una cita activa por especialidad por paciente.</li>
                  <li>Cancelaciones con 24h de antelación.</li>
                </ul>
              </div>
            </div>
          </section>

          {errorSubmit && (
            <div className="error-banner">
              <span className="material-symbols-outlined">warning</span>
              <p>{errorSubmit}</p>
            </div>
          )}

          {mensajeExito && (
            <div className="success-banner">
              <span className="material-symbols-outlined">check_circle</span>
              <p>{mensajeExito}</p>
            </div>
          )}

          <div className="actions">
            <button className="btn-confirm" onClick={handleAgendar} disabled={loadingSubmit}>
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              {loadingSubmit ? 'Confirmando...' : 'Confirmar Cita'}
            </button>
            <button className="btn-cancel" onClick={() => onNavigate && onNavigate('dashboard')}>
              CANCELAR
            </button>
          </div>
        </div>
      </main>

      <nav className="global-bottom-nav">
        <div className="nav-item-standard" onClick={() => onNavigate && onNavigate('dashboard')}>
          <span className="material-symbols-outlined">home</span>
          <span>Inicio</span>
        </div>
        <div className="nav-item-standard" onClick={() => onNavigate && onNavigate('control')}>
          <span className="material-symbols-outlined">event_note</span>
          <span>Citas</span>
        </div>
        <div className="nav-item-standard active" onClick={() => onNavigate && onNavigate('asignacion')}>
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>add_circle</span>
          <span>Agendar</span>
        </div>
      </nav>
    </div>
  );
}
