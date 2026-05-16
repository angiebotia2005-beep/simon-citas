import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess, onNavigate }) {
  const [documento, setDocumento] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: true });

    try {
        // LOGIN FLOW
        const response = await fetch(`http://localhost:8080/api/usuario/${documento}`);
        
        if (response.status === 404) {
          setMessage({ text: 'El usuario no existe. ¿Deseas registrarte?', isError: true });
        } else if (response.ok) {
          const user = await response.json();
          // Nota: En un sistema real usaríamos el campo 'contrasena' o 'password' del objeto devuelto
          if (user.password === password || user.contrasena === password) {
            setMessage({ text: '¡Inicio de sesión exitoso!', isError: false });
            setTimeout(() => {
              onLoginSuccess(user);
            }, 1000);
          } else {
            setMessage({ text: 'Contraseña incorrecta.', isError: true });
          }
        } else {
          setMessage({ text: 'Error al conectar con el servidor.', isError: true });
        }
    } catch (error) {
      setMessage({ text: 'No se pudo conectar con el backend.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <span className="material-symbols-outlined">medical_services</span>
        <h1>simonCitas</h1>
      </header>

      <main className="login-main">
        <div className="login-card">
          <div className="login-card-header">
            <div className="login-icon-container">
              <span className="material-symbols-outlined">account_circle</span>
            </div>
            <h2>Bienvenido</h2>
            <p>Ingresa tu documento para acceder</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-field">
              <label htmlFor="documento">Documento de Identidad</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined">badge</span>
                <input 
                  id="documento"
                  type="text" 
                  placeholder="Número de documento"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="input-field">
              <label htmlFor="password">Contraseña</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined">lock</span>
                <input 
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            {message.text && (
              <div className={`message-banner ${message.isError ? 'message-error' : 'message-success'}`}>
                {message.text}
              </div>
            )}

            <button className="submit-btn" type="submit" disabled={loading}>
              <span>{loading ? 'Procesando...' : 'Iniciar Sesión'}</span>
              <span className="material-symbols-outlined">login</span>
            </button>
          </form>

          <div className="login-footer">
            <p>
              ¿No tienes una cuenta? 
              <button className="toggle-btn" onClick={() => onNavigate('registro')}>
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer className="footer-legal">
        <p>Seguro • Privado • Confiable</p>
      </footer>
    </div>
  );
}
