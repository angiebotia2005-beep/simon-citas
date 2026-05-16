import React, { useState, useEffect } from 'react';
import './GestionUsuarios.css';

export default function GestionUsuarios({ usuario, onLogout }) {
  const [usuarios, setUsuarios] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estado para las pestañas (Usuarios / Especialidades)
  const [activeTab, setActiveTab] = useState('usuarios');

  // Estado para el modal de asignación de especialidad
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEspecialidadId, setSelectedEspecialidadId] = useState('');

  // Estado para el modal de crear especialidad
  const [showEspModal, setShowEspModal] = useState(false);
  const [nuevaEspNombre, setNuevaEspNombre] = useState('');
  const [nuevaEspDesc, setNuevaEspDesc] = useState('');

  // Estado para el modal de Crear Especialista desde cero
  const [showNewEspModal, setShowNewEspModal] = useState(false);
  
  // Estado para el modal de Editar Especialista
  const [showEditEspModal, setShowEditEspModal] = useState(false);
  const [editingEsp, setEditingEsp] = useState(null);
  const [editEspForm, setEditEspForm] = useState({
    idEspecialista: '', nombre: '', apellido: '', email: '', telefono: '', idEspecialidad: '',
    dias: [], horaInicio: '08:00', horaFin: '12:00'
  });
  const [newEspForm, setNewEspForm] = useState({
    documento: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    contrasena: '',
    idEspecialidad: '',
    dias: [],
    horaInicio: '08:00',
    horaFin: '12:00'
  });
  const [newEmailError, setNewEmailError] = useState('');
  const [editEmailError, setEditEmailError] = useState('');

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/usuario');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      } else {
        setError('Error al cargar los usuarios.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    }
  };

  const fetchEspecialidades = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/especialidad');
      if (response.ok) {
        const data = await response.json();
        setEspecialidades(data);
      }
    } catch (err) {
      console.error("Error cargando especialidades:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchUsuarios(), fetchEspecialidades()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleUpdateRolClick = (u, nuevoRol) => {
    if (nuevoRol === 'especialista') {
      setSelectedUser(u);
      setShowModal(true);
    } else {
      handleUpdateRol(u.documento, nuevoRol);
    }
  };

  const handleUpdateRol = async (doc, nuevoRol, idEsp = null) => {
    try {
      setSuccess('');
      setError('');
      
      const response = await fetch(`http://localhost:8080/api/usuario/${doc}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: nuevoRol, activo: true })
      });

      if (response.ok) {
        if (nuevoRol === 'especialista' && idEsp) {
          let datosPerfil = {
            nombre: 'Especialista',
            apellido: 'Nuevo',
            documento: doc,
            especialidad: { idEspecialidad: parseInt(idEsp) }
          };

          try {
            const pacRes = await fetch(`http://localhost:8080/api/paciente/documento/${doc}`);
            if (pacRes.ok) {
              const pac = await pacRes.json();
              datosPerfil = {
                ...datosPerfil,
                nombre: pac.nombre,
                apellido: pac.apellido,
                telefono: pac.telefono,
                email: pac.email
              };
            }
          } catch (e) { console.error("No se pudo obtener datos del paciente"); }

          await fetch('http://localhost:8080/api/especialista', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPerfil)
          });
        }

        setSuccess(`Rol de ${doc} actualizado con éxito.`);
        setShowModal(false);
        fetchUsuarios();
      } else {
        setError('Error al actualizar el rol.');
      }
    } catch (err) {
      setError('Error de conexión.');
    }
  };

  const handleCrearEspecialidad = async (e) => {
    e.preventDefault();
    if (!nuevaEspNombre) return;

    try {
      const response = await fetch('http://localhost:8080/api/especialidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevaEspNombre, descripcion: nuevaEspDesc })
      });

      if (response.ok) {
        setSuccess('Especialidad creada con éxito.');
        setNuevaEspNombre('');
        setNuevaEspDesc('');
        setShowEspModal(false);
        fetchEspecialidades();
      } else {
        setError('Error al crear la especialidad.');
      }
    } catch (err) {
      setError('Error de conexión.');
    }
  };

  const handleCreateFullSpecialist = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // 1. Crear el Usuario
      const userRes = await fetch('http://localhost:8080/api/usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento: newEspForm.documento,
          contrasena: newEspForm.contrasena,
          rol: 'especialista',
          activo: true
        })
      });

      if (!userRes.ok) {
        setError('El documento ya existe o hubo un error al crear el usuario.');
        return;
      }

      // 2. Crear el Perfil de Especialista
      const espRes = await fetch('http://localhost:8080/api/especialista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento: newEspForm.documento,
          nombre: newEspForm.nombre,
          apellido: newEspForm.apellido,
          email: newEspForm.email,
          telefono: newEspForm.telefono,
          especialidad: { idEspecialidad: parseInt(newEspForm.idEspecialidad) }
        })
      });

      if (!espRes.ok) {
        setError('Usuario creado pero hubo un error en el perfil de especialista.');
        return;
      }

      const espData = await espRes.json();

      // 3. Crear los Horarios
      const horarios = newEspForm.dias.map(dia => ({
        especialista: { idEspecialista: espData.idEspecialista },
        diaSemana: parseInt(dia),
        horaInicio: newEspForm.horaInicio + ":00",
        horaFin: newEspForm.horaFin + ":00"
      }));

      const horarioRes = await fetch('http://localhost:8080/api/horario/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(horarios)
      });

      if (horarioRes.ok) {
        setSuccess('Especialista y horarios creados con éxito.');
        setShowNewEspModal(false);
        setNewEspForm({
          documento: '', nombre: '', apellido: '', email: '', telefono: '', contrasena: '', idEspecialidad: '',
          dias: [], horaInicio: '08:00', horaFin: '12:00'
        });
        fetchUsuarios();
      } else {
        setError('Especialista creado pero hubo un error al asignar los horarios.');
      }
    } catch (err) {
      setError('Error de conexión.');
    }
  };

  const handleOpenEditModal = async (u) => {
    try {
      const res = await fetch(`http://localhost:8080/api/especialista/documento/${u.documento}`);
      if (res.ok) {
        const esp = await res.json();
        const hRes = await fetch(`http://localhost:8080/api/horario/especialista/${esp.idEspecialista}`);
        const horarios = hRes.ok ? await hRes.json() : [];
        
        setEditingEsp(esp);
        setEditEspForm({
          idEspecialista: esp.idEspecialista,
          nombre: esp.nombre,
          apellido: esp.apellido,
          email: esp.email,
          telefono: esp.telefono,
          idEspecialidad: esp.especialidad?.idEspecialidad || '',
          dias: horarios.map(h => h.diaSemana.toString()),
          horaInicio: horarios.length > 0 ? horarios[0].horaInicio.substring(0,5) : '08:00',
          horaFin: horarios.length > 0 ? horarios[0].horaFin.substring(0,5) : '12:00'
        });
        setShowEditEspModal(true);
      }
    } catch (e) { setError('Error al cargar datos del especialista'); }
  };

  const handleEditSpecialist = async (e) => {
    e.preventDefault();
    try {
      // 1. Actualizar Especialista
      const res = await fetch(`http://localhost:8080/api/especialista/${editEspForm.idEspecialista}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editEspForm.nombre,
          apellido: editEspForm.apellido,
          email: editEspForm.email,
          telefono: editEspForm.telefono,
          documento: editingEsp.documento,
          especialidad: { idEspecialidad: parseInt(editEspForm.idEspecialidad) }
        })
      });

      if (res.ok) {
        // 2. Actualizar Horarios (Borrar y Crear)
        await fetch(`http://localhost:8080/api/horario/especialista/${editEspForm.idEspecialista}`, { method: 'DELETE' });
        
        const horarios = editEspForm.dias.map(dia => ({
          especialista: { idEspecialista: editEspForm.idEspecialista },
          diaSemana: parseInt(dia),
          horaInicio: editEspForm.horaInicio + ":00",
          horaFin: editEspForm.horaFin + ":00"
        }));

        await fetch('http://localhost:8080/api/horario/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(horarios)
        });

        setSuccess('Perfil y horarios actualizados correctamente.');
        setShowEditEspModal(false);
        fetchUsuarios();
      }
    } catch (e) { setError('Error al actualizar'); }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="material-symbols-outlined">admin_panel_settings</span>
          <h1>Panel de Administración</h1>
        </div>
        <div className="admin-user-info">
          <span>Admin: {usuario.documento}</span>
          <button onClick={onLogout} className="admin-logout-btn">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-stats">
          <div className="stat-box">
            <span className="stat-count">{usuarios.length}</span>
            <span className="stat-label">Usuarios Totales</span>
          </div>
          <div className="stat-box">
            <span className="stat-count">{usuarios.filter(u => u.rol === 'paciente').length}</span>
            <span className="stat-label">Pacientes</span>
          </div>
          <div className="stat-box">
            <span className="stat-count">{especialidades.length}</span>
            <span className="stat-label">Especialidades</span>
          </div>
        </section>

        <div className="admin-tabs" style={{display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '0 20px'}}>
          <button 
            onClick={() => setActiveTab('usuarios')}
            style={{padding: '10px 20px', border: 'none', background: activeTab === 'usuarios' ? '#0369a1' : '#e2e8f0', color: activeTab === 'usuarios' ? 'white' : '#475569', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.3s'}}
          >
            Gestión de Usuarios
          </button>
          <button 
            onClick={() => setActiveTab('especialidades')}
            style={{padding: '10px 20px', border: 'none', background: activeTab === 'especialidades' ? '#0369a1' : '#e2e8f0', color: activeTab === 'especialidades' ? 'white' : '#475569', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.3s'}}
          >
            Lista de Especialidades
          </button>
        </div>

        {activeTab === 'usuarios' && (
        <div className="admin-table-container">
          <div className="table-header-actions">
            <h2>Gestión de Usuarios</h2>
            <div className="header-buttons">
              {success && <span className="success-inline">{success}</span>}
              {error && <span className="error-inline">{error}</span>}
              <button className="add-esp-btn blue-btn" onClick={() => setShowNewEspModal(true)}>
                <span className="material-symbols-outlined">person_add</span>
                Nuevo Especialista
              </button>
            </div>
          </div>
          
          <table className="users-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre y Apellido</th>
                <th>Rol Actual</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.filter(u => u.rol !== 'administrador').map(u => (
                <tr key={u.documento}>
                  <td>
                    <div className="user-doc-cell">
                      <span className="material-symbols-outlined">person</span>
                      {u.documento}
                    </div>
                  </td>
                  <td>{u.nombre ? u.nombre + ' ' + u.apellido : ''}</td>
                  <td>
                    <span className={`role-badge ${u.rol}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`status-dot ${u.activo ? 'active' : 'inactive'}`}></span>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </td>
                  <td>{u.fechaCreacion ? new Date(u.fechaCreacion).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="action-select-group" style={{display:'flex', gap:'8px'}}>
                      <select 
                        value={u.rol} 
                        onChange={(e) => handleUpdateRolClick(u, e.target.value)}
                        className="role-select"
                      >
                        <option value="paciente">Paciente</option>
                        <option value="especialista">Especialista</option>
                      </select>
                      {u.rol === 'especialista' && (
                        <button className="edit-icon-btn" onClick={() => handleOpenEditModal(u)}>
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {activeTab === 'especialidades' && (
        <div className="admin-table-container">
          <div className="table-header-actions">
            <h2>Especialidades Médicas</h2>
            <div className="header-buttons">
              <button className="add-esp-btn" onClick={() => setShowEspModal(true)}>
                <span className="material-symbols-outlined">add_circle</span>
                Añadir Especialidad
              </button>
            </div>
          </div>
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {especialidades.map(esp => (
                <tr key={esp.idEspecialidad}>
                  <td>
                    <div className="user-doc-cell" style={{fontWeight: 'bold'}}>
                      <span className="material-symbols-outlined" style={{color: '#0369a1'}}>medical_services</span>
                      #{esp.idEspecialidad}
                    </div>
                  </td>
                  <td><strong>{esp.nombre}</strong></td>
                  <td>{esp.descripcion || <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Sin descripción</span>}</td>
                </tr>
              ))}
              {especialidades.length === 0 && (
                <tr>
                  <td colSpan="3" style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>No hay especialidades registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </main>

      {/* Modal para Especialidad */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Asignar Especialidad</h3>
            <p>Para convertir a <strong>{selectedUser.documento}</strong> en especialista, selecciona su área médica:</p>
            
            <select 
              value={selectedEspecialidadId} 
              onChange={(e) => setSelectedEspecialidadId(e.target.value)}
              className="modal-select"
            >
              <option value="">-- Seleccionar --</option>
              {especialidades.map(esp => (
                <option key={esp.idEspecialidad} value={esp.idEspecialidad}>
                  {esp.nombre}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancelar</button>
              <button 
                className="confirm-btn" 
                disabled={!selectedEspecialidadId}
                onClick={() => handleUpdateRol(selectedUser.documento, 'especialista', selectedEspecialidadId)}
              >
                Confirmar Cambio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Nueva Especialidad */}
      {showEspModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Nueva Especialidad</h3>
            <form onSubmit={handleCrearEspecialidad}>
              <div className="modal-form-group">
                <label>Nombre de la Especialidad</label>
                <input 
                  type="text" 
                  value={nuevaEspNombre} 
                  onChange={(e) => setNuevaEspNombre(e.target.value)}
                  placeholder="Ej. Neurología"
                  required
                  className="modal-input"
                />
              </div>
              <div className="modal-form-group">
                <label>Descripción (Opcional)</label>
                <textarea 
                  value={nuevaEspDesc} 
                  onChange={(e) => setNuevaEspDesc(e.target.value)}
                  placeholder="Descripción de la especialidad..."
                  className="modal-textarea"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEspModal(false)}>Cancelar</button>
                <button type="submit" className="confirm-btn">Crear Especialidad</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Crear Especialista desde cero */}
      {showNewEspModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal wide-modal">
            <h3>Crear Nuevo Especialista</h3>
            <form onSubmit={handleCreateFullSpecialist} className="modal-grid-form">
              <div className="modal-form-group">
                <label>Documento de Identidad</label>
                <input 
                  type="text" 
                  required
                  value={newEspForm.documento}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setNewEspForm({...newEspForm, documento: value});
                  }}
                  className="modal-input"
                  placeholder="Solo números"
                  maxLength={10}
                />
              </div>
              <div className="modal-form-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  required
                  value={newEspForm.nombre}
                  onChange={(e) => setNewEspForm({...newEspForm, nombre: e.target.value})}
                  className="modal-input"
                />
              </div>
              <div className="modal-form-group">
                <label>Apellido</label>
                <input 
                  type="text" 
                  required
                  value={newEspForm.apellido}
                  onChange={(e) => setNewEspForm({...newEspForm, apellido: e.target.value})}
                  className="modal-input"
                />
              </div>
              <div className="modal-form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  required
                  value={newEspForm.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewEspForm({...newEspForm, email: val});
                    setNewEmailError(val && !validarEmail(val) ? 'Ingresa un correo electrónico válido (ej. usuario@dominio.com)' : '');
                  }}
                  className={`modal-input ${newEmailError ? 'input-error' : ''}`}
                  placeholder="usuario@dominio.com"
                />
                {newEmailError && <span style={{color:'#dc2626', fontSize:'0.78rem', marginTop:'4px', display:'block'}}>{newEmailError}</span>}
              </div>
              <div className="modal-form-group">
                <label>Teléfono</label>
                <input 
                  type="text" 
                  required
                  value={newEspForm.telefono}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    setNewEspForm({...newEspForm, telefono: value});
                  }}
                  className="modal-input"
                  placeholder="Solo números"
                  maxLength={10}
                />
              </div>
              <div className="modal-form-group">
                <label>Contraseña</label>
                <input 
                  type="password" 
                  required
                  value={newEspForm.contrasena}
                  onChange={(e) => setNewEspForm({...newEspForm, contrasena: e.target.value})}
                  className="modal-input"
                />
              </div>
              <div className="modal-form-group full-width">
                <label>Especialidad</label>
                <select 
                  required
                  value={newEspForm.idEspecialidad}
                  onChange={(e) => setNewEspForm({...newEspForm, idEspecialidad: e.target.value})}
                  className="modal-select"
                >
                  <option value="">-- Seleccionar --</option>
                  {especialidades.map(esp => (
                    <option key={esp.idEspecialidad} value={esp.idEspecialidad}>{esp.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group full-width">
                <label style={{color: '#0369a1', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px', display: 'block'}}>
                  Configuración de Horarios
                </label>
                <div className="days-selector">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <label key={d} className={`day-checkbox ${newEspForm.dias.includes((i+1).toString()) ? 'checked' : ''}`}>
                      <input 
                        type="checkbox" 
                        value={i+1}
                        checked={newEspForm.dias.includes((i+1).toString())}
                        onChange={(e) => {
                          const dia = e.target.value;
                          const nuevosDias = newEspForm.dias.includes(dia)
                            ? newEspForm.dias.filter(d => d !== dia)
                            : [...newEspForm.dias, dia];
                          setNewEspForm({...newEspForm, dias: nuevosDias});
                        }}
                      />
                      {d}
                    </label>
                  ))}
                </div>
                <div className="time-range-group" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem', padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                  <div>
                    <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '8px'}}>Hora Inicio</label>
                    <input 
                      type="time" 
                      value={newEspForm.horaInicio}
                      onChange={(e) => setNewEspForm({...newEspForm, horaInicio: e.target.value})}
                      className="modal-input"
                      style={{width: '100%'}}
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '8px'}}>Hora Fin</label>
                    <input 
                      type="time" 
                      value={newEspForm.horaFin}
                      onChange={(e) => setNewEspForm({...newEspForm, horaFin: e.target.value})}
                      className="modal-input"
                      style={{width: '100%'}}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions full-width">
                <button type="button" className="cancel-btn" onClick={() => setShowNewEspModal(false)}>Cancelar</button>
                <button type="submit" className="confirm-btn blue-btn">Crear Especialista</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal para Editar Especialista */}
      {showEditEspModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal wide-modal">
            <h3>Editar Especialista</h3>
            <form onSubmit={handleEditSpecialist} className="modal-grid-form">
              <div className="modal-form-group">
                <label>Nombre</label>
                <input 
                  type="text" 
                  required
                  value={editEspForm.nombre}
                  onChange={(e) => setEditEspForm({...editEspForm, nombre: e.target.value})}
                  className="modal-input"
                />
              </div>
              <div className="modal-form-group">
                <label>Apellido</label>
                <input 
                  type="text" 
                  required
                  value={editEspForm.apellido}
                  onChange={(e) => setEditEspForm({...editEspForm, apellido: e.target.value})}
                  className="modal-input"
                />
              </div>
              <div className="modal-form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  required
                  value={editEspForm.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditEspForm({...editEspForm, email: val});
                    setEditEmailError(val && !validarEmail(val) ? 'Ingresa un correo electrónico válido (ej. usuario@dominio.com)' : '');
                  }}
                  className={`modal-input ${editEmailError ? 'input-error' : ''}`}
                  placeholder="usuario@dominio.com"
                />
                {editEmailError && <span style={{color:'#dc2626', fontSize:'0.78rem', marginTop:'4px', display:'block'}}>{editEmailError}</span>}
              </div>
              <div className="modal-form-group">
                <label>Teléfono</label>
                <input 
                  type="text" 
                  required
                  value={editEspForm.telefono}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setEditEspForm({...editEspForm, telefono: value});
                  }}
                  className="modal-input"
                />
              </div>
              <div className="modal-form-group full-width">
                <label>Especialidad</label>
                <select 
                  required
                  value={editEspForm.idEspecialidad}
                  onChange={(e) => setEditEspForm({...editEspForm, idEspecialidad: e.target.value})}
                  className="modal-select"
                >
                  <option value="">-- Seleccionar --</option>
                  {especialidades.map(esp => (
                    <option key={esp.idEspecialidad} value={esp.idEspecialidad}>{esp.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group full-width">
                <label style={{color: '#0369a1', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px', display: 'block'}}>
                  Configuración de Horarios
                </label>
                <div className="days-selector">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
                    <label key={d} className={`day-checkbox ${editEspForm.dias.includes((i+1).toString()) ? 'checked' : ''}`}>
                      <input 
                        type="checkbox" 
                        value={i+1}
                        checked={editEspForm.dias.includes((i+1).toString())}
                        onChange={(e) => {
                          const dia = e.target.value;
                          const nuevosDias = editEspForm.dias.includes(dia)
                            ? editEspForm.dias.filter(d => d !== dia)
                            : [...editEspForm.dias, dia];
                          setEditEspForm({...editEspForm, dias: nuevosDias});
                        }}
                      />
                      {d}
                    </label>
                  ))}
                </div>
                <div className="time-range-group" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem', padding: '1.2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                  <div>
                    <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '8px'}}>Hora Inicio</label>
                    <input 
                      type="time" 
                      value={editEspForm.horaInicio}
                      onChange={(e) => setEditEspForm({...editEspForm, horaInicio: e.target.value})}
                      className="modal-input"
                      style={{width: '100%'}}
                    />
                  </div>
                  <div>
                    <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '8px'}}>Hora Fin</label>
                    <input 
                      type="time" 
                      value={editEspForm.horaFin}
                      onChange={(e) => setEditEspForm({...editEspForm, horaFin: e.target.value})}
                      className="modal-input"
                      style={{width: '100%'}}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions full-width">
                <button type="button" className="cancel-btn" onClick={() => setShowEditEspModal(false)}>Cancelar</button>
                <button type="submit" className="confirm-btn blue-btn">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
