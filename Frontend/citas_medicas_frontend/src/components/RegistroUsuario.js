import React, { useState } from 'react';
import './RegistroUsuario.css';

export default function RegistroUsuario({ onNavigate }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    telefono: '',
    email: '',
    fechaNacimiento: '',
    direccion: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Solo permitir números en documento y teléfono
    if (id === 'documento' || id === 'telefono') {
      const cleanValue = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [id]: cleanValue });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Crear el Usuario para el Login
      const usuarioRes = await fetch('http://localhost:8080/api/usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento: formData.documento,
          contrasena: formData.password,
          rol: 'paciente',
          activo: true
        })
      });

      if (!usuarioRes.ok) throw new Error('Error al crear el usuario de acceso.');

      // 2. Crear el perfil de Paciente
      const pacienteRes = await fetch('http://localhost:8080/api/paciente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          documento: formData.documento,
          telefono: formData.telefono,
          email: formData.email,
          fechaNacimiento: formData.fechaNacimiento,
          direccion: formData.direccion
        })
      });

      if (!pacienteRes.ok) throw new Error('Error al crear el perfil médico.');

      setSuccess(true);
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <header className="register-header">
        <div className="back-group" onClick={() => onNavigate('login')}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="brand-name">simonCitas</span>
        </div>
      </header>

      <main className="register-main">
        <div className="register-intro">
          <h1>Registro de Paciente</h1>
          <p>Únete a nuestra red de salud digital.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input 
                type="text" id="nombre" placeholder="Ej. Juan" 
                required value={formData.nombre} onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input 
                type="text" id="apellido" placeholder="Ej. Pérez" 
                required value={formData.apellido} onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" id="email" placeholder="juan@ejemplo.com" 
              required value={formData.email} onChange={handleChange} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="documento">Documento de Identidad</label>
              <input 
                type="text" id="documento" placeholder="12345678" 
                required value={formData.documento} onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input 
                type="tel" id="telefono" placeholder="300 000 0000" 
                required value={formData.telefono} onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
            <input 
              type="date" id="fechaNacimiento" 
              required value={formData.fechaNacimiento} onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección de Residencia</label>
            <input 
              type="text" id="direccion" placeholder="Calle 123 #45-67" 
              required value={formData.direccion} onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-wrapper">
              <input 
                type="password" id="password" placeholder="••••••••" 
                required value={formData.password} onChange={handleChange} 
              />
              <span className="material-symbols-outlined pass-icon">visibility</span>
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">¡Registro exitoso! Redirigiendo...</p>}

          <button className="btn-register" type="submit" disabled={loading}>
            {loading ? 'Procesando...' : 'Registrarse'}
          </button>

          <div className="login-link">
            ¿Ya tienes una cuenta? <span onClick={() => onNavigate('login')}>Iniciar Sesión</span>
          </div>
        </form>

      </main>
    </div>
  );
}
