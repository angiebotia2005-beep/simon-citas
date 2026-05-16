-- 1. Insertar Especialidades
INSERT INTO ESPECIALIDAD (nombre, descripcion) VALUES
('Medicina General', 'Atención médica primaria, preventiva y diagnóstico inicial.'),
('Cardiología', 'Especialidad médica en el diagnóstico y tratamiento de enfermedades del corazón.'),
('Pediatría', 'Atención médica integral de bebés, niños y adolescentes.');

-- 2. Insertar Pacientes
INSERT INTO PACIENTE (nombre, apellido, documento, telefono, email, fecha_nacimiento, direccion) VALUES
('Carlos', 'Pérez', '1010101010', '3001234567', 'carlos.perez@email.com', '1985-05-15', 'Calle Falsa 123'),
('María', 'Gómez', '2020202020', '3109876543', 'maria.gomez@email.com', '1990-08-22', 'Avenida Central 45'),
('Luis', 'Rodríguez', '3030303030', '3205554433', 'luis.rodriguez@email.com', '1978-11-10', 'Carrera 12 #34-56'),
('Ana', 'Díaz', '4040404040', '3156667788', 'ana.diaz@email.com', '2015-02-28', 'Diagonal 89 #12-3');

-- 3. Insertar Especialistas
INSERT INTO ESPECIALISTA (nombre, apellido, documento, telefono, email, id_especialidad) VALUES
('Andrea', 'López', '9090909090', '3151112233', 'andrea.lopez@clinica.com', 1), -- Medicina General
('Jorge', 'Martínez', '8080808080', '3184445566', 'jorge.martinez@clinica.com', 2), -- Cardiología
('Sofía', 'Castro', '7070707070', '3197778899', 'sofia.castro@clinica.com', 3); -- Pediatría

-- 4. Insertar Horarios Disponibles (Ejemplo de turnos)
-- Nota: dia_semana (1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes)
INSERT INTO HORARIO_DISPONIBLE (id_especialista, dia_semana, hora_inicio, hora_fin) VALUES
(1, 1, '08:00:00', '12:00:00'), -- Dra. Andrea: Lunes en la mañana
(1, 2, '08:00:00', '12:00:00'), -- Dra. Andrea: Martes en la mañana
(2, 3, '14:00:00', '18:00:00'), -- Dr. Jorge: Miércoles en la tarde
(3, 4, '09:00:00', '13:00:00'); -- Dra. Sofía: Jueves en la mañana

-- 5. Insertar Citas Médicas
-- Se incluyen citas en diferentes estados para que puedas probar tu interfaz
INSERT INTO CITA (id_paciente, id_especialista, fecha, hora_inicio, hora_fin, estado, motivo, observaciones) VALUES
-- Cita Completada
(1, 1, '2026-05-04', '08:00:00', '08:30:00', 'completada', 'Dolor de cabeza recurrente', 'Se recetó analgésico y descanso.'),

-- Citas Activas (Sin solapamiento: Diferentes horas o diferentes especialistas)
(2, 2, '2026-06-10', '14:00:00', '14:45:00', 'activa', 'Palpitaciones fuertes', 'El paciente debe traer electrocardiograma previo.'),
(3, 1, '2026-06-16', '09:00:00', '09:30:00', 'activa', 'Chequeo anual de rutina', 'Ninguna observación previa.'),
(4, 3, '2026-06-18', '10:00:00', '10:45:00', 'activa', 'Control de talla y peso', 'Traer carnet de vacunación.'),

-- Cita Cancelada (Servirá para la tabla de cancelación)
(1, 2, '2026-06-24', '15:00:00', '15:45:00', 'cancelada', 'Revisión de exámenes', 'Se canceló por cruce de horarios del paciente.');

-- 6. Insertar Cancelaciones
-- Relacionada con la cita ID 5 (que tiene estado 'cancelada')
INSERT INTO CANCELACION (id_cita, motivo_cancelacion, cancelado_por) VALUES
(5, 'El paciente tuvo una emergencia laboral y no podrá asistir', 'paciente');