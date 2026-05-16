import React, { useState, useEffect } from 'react';
import './ConsultaAgendas.css';

export default function ConsultaAgendas({ usuario, especialista, onNavigate }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    if (especialista) {
      cargarCitas();
    }
  }, [especialista]);

  const cargarCitas = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/citas/especialista/${especialista.idEspecialista}`);
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDaysInMonth = new Date(year, month, 0).getDate();
    
    const startingDay = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];

    // Días del mes anterior
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ day: prevDaysInMonth - i, current: false });
    }
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, current: true });
    }
    return days;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const calendarDays = getDaysInMonth(viewDate);
  
  // Horarios de ejemplo para la visualización
  const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];

  const getSlotStatus = (time) => {
    const cita = citas.find(c => c.fecha === selectedDate && c.horaInicio.startsWith(time));
    if (cita) return { status: 'ocupado', label: 'Reservado', icon: 'lock' };
    if (time === "10:30") return { status: 'bloqueado', label: 'Bloqueado', icon: 'block' };
    return { status: 'disponible', label: 'Libre', icon: 'add_circle' };
  };

  return (
    <div className="agenda-container">
      <header className="agenda-header">
        <span className="material-symbols-outlined">menu</span>
        <h1 className="brand-title">simonCitas</h1>
        <div className="profile-avatar-wrapper">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOEiEPHz75U3wemDS0ehm84Ymi01VfQ5jUV9k-La9y2Hbc_HHgt8VukSiJsf_0RTA_HSQfoGEbYNdG0CZlHrewJzzoHRRPU367VCWYo4-z3qvZia1yGGKZgVQCF8wJa1eFI8lzxN_VBVkYx6U2gl0XMRP7XBf5G7-ch5nQrZqq1KXDNNTJQkSFP4BteGbrRihvduLhxalmzHlLLcuo1ZpzTpv6S4ZRHE4A1OetXH7C32e9B-GtI6p70CGAIdh9hfw2XfxF65aMMys" alt="Doctor" />
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
              <button className="arrow-btn" onClick={() => changeMonth(-1)}>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="arrow-btn" onClick={() => changeMonth(1)}>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          
          <div className="calendar-grid">
            {['L','M','X','J','V','S','D'].map(d => <span key={d} className="day-label">{d}</span>)}
            {calendarDays.map((d, i) => {
              const dateStr = `${viewDate.getFullYear()}-${(viewDate.getMonth() + 1).toString().padStart(2, '0')}-${d.day.toString().padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr && d.current;
              
              return (
                <button 
                  key={i} 
                  className={`calendar-day ${!d.current ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => d.current && setSelectedDate(dateStr)}
                >
                  {d.day}
                  {isSelected && <span className="day-dot"></span>}
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
            {timeSlots.map(time => {
              const info = getSlotStatus(time);
              return (
                <div key={time} className={`slot-card ${info.status}`}>
                  <div className="slot-info">
                    <h4>{time}</h4>
                    <span className="slot-status">{info.label}</span>
                  </div>
                  <span className="material-symbols-outlined">{info.icon}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="reserve-btn-container">
          <button className="reserve-action-btn">
            <span className="material-symbols-outlined">calendar_today</span>
            Reservar Cita
          </button>
        </div>
      </main>

      <nav className="bottom-nav-modern">
        <button className="nav-btn" onClick={() => onNavigate('agenda')}>
          <span className="material-symbols-outlined">home</span>
          <span>Inicio</span>
        </button>
        <button className="nav-btn active">
          <span className="material-symbols-outlined">calendar_month</span>
          <span>Calendario</span>
        </button>
        <button className="nav-btn" onClick={() => onNavigate('control')}>
          <span className="material-symbols-outlined">description</span>
          <span>Citas</span>
        </button>
        <button className="nav-btn">
          <span className="material-symbols-outlined">person_search</span>
          <span>Médicos</span>
        </button>
      </nav>
    </div>
  );
}
