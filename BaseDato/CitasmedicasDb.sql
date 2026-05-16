-- 1. Crear la base de datos y usarla
CREATE DATABASE IF NOT EXISTS citas_medicas_db;
USE citas_medicas_db;



-- 2. Eliminar tablas si ya existen (en orden inverso a las dependencias para evitar errores)
DROP TABLE IF EXISTS CANCELACION;       -- Depende de: CITA
DROP TABLE IF EXISTS CITA;              -- Depende de: PACIENTE, ESPECIALISTA
DROP TABLE IF EXISTS HORARIO_DISPONIBLE; -- Depende de: ESPECIALISTA
DROP TABLE IF EXISTS ESPECIALISTA;      -- Depende de: ESPECIALIDAD, USUARIO
DROP TABLE IF EXISTS ESPECIALIDAD;      -- No depende de nadie
DROP TABLE IF EXISTS PACIENTE;          -- Depende de: USUARIO
DROP TABLE IF EXISTS USUARIO;           -- No depende de nadie (se elimina de último)

-- 3. Creación de Tablas (Ordenadas por jerarquía de dependencias)

-- Tabla USUARIO (No depende de nadie)
-- Tabla USUARIO
CREATE TABLE USUARIO (
    documento VARCHAR(50) PRIMARY KEY,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('paciente', 'administrador','especialista') NOT NULL DEFAULT 'paciente',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla PACIENTE (Depende de USUARIO)
CREATE TABLE PACIENTE (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    fecha_nacimiento DATE,
    direccion VARCHAR(255),
    FOREIGN KEY (documento) REFERENCES USUARIO(documento)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);


-- Tabla ESPECIALIDAD (No depende de nadie)
CREATE TABLE ESPECIALIDAD (
    id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla ESPECIALISTA (Depende de ESPECIALIDAD)
CREATE TABLE ESPECIALISTA (
    id_especialista INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    id_especialidad INT NOT NULL,
    FOREIGN KEY (id_especialidad) REFERENCES ESPECIALIDAD(id_especialidad)
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

-- Agregar FK de USUARIO en ESPECIALISTA (igual que en PACIENTE)
ALTER TABLE ESPECIALISTA
    ADD CONSTRAINT fk_especialista_usuario
    FOREIGN KEY (documento) REFERENCES USUARIO(documento)
        ON UPDATE CASCADE
        ON DELETE RESTRICT;

-- Tabla HORARIO_DISPONIBLE (Depende de ESPECIALISTA)
CREATE TABLE HORARIO_DISPONIBLE (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_especialista INT NOT NULL,
    dia_semana INT NOT NULL COMMENT '1=Lunes, 7=Domingo',
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    FOREIGN KEY (id_especialista) REFERENCES ESPECIALISTA(id_especialista)
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

-- Tabla CITA (Depende de PACIENTE y ESPECIALISTA)
CREATE TABLE CITA (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_especialista INT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado ENUM('activa', 'cancelada', 'completada') NOT NULL DEFAULT 'activa',
    motivo TEXT,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Llaves foráneas
    FOREIGN KEY (id_paciente) REFERENCES PACIENTE(id_paciente)
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    FOREIGN KEY (id_especialista) REFERENCES ESPECIALISTA(id_especialista)
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
        
    -- Restricciones Únicas (Para evitar cruces exactos de horario en la DB)
    UNIQUE KEY uk_paciente_horario (id_paciente, fecha, hora_inicio),
    UNIQUE KEY uk_especialista_horario (id_especialista, fecha, hora_inicio)
);

-- Tabla CANCELACION (Depende de CITA)
CREATE TABLE CANCELACION (
    id_cancelacion INT AUTO_INCREMENT PRIMARY KEY,
    id_cita INT NOT NULL UNIQUE, -- Unique hace que sea una relación 1 a 1 estricta
    motivo_cancelacion TEXT NOT NULL,
    cancelado_por ENUM('paciente', 'administrador') NOT NULL,
    fecha_cancelacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cita) REFERENCES CITA(id_cita)
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

-- ==========================================
-- 4. INSERCIÓN DE DATOS DE PRUEBA (DUMMY DATA)
-- ==========================================

-- A. Crear Usuarios (Deben crearse primero por las llaves foráneas)
INSERT INTO USUARIO (documento, contrasena, rol, activo) VALUES 
('1000000000', 'admin123', 'administrador', TRUE),
('2000000000', 'doctor123', 'especialista', TRUE),
('3000000000', 'paciente123', 'paciente', TRUE);

-- B. Crear Especialidades
INSERT INTO ESPECIALIDAD (nombre, descripcion) VALUES 
('Cardiología', 'Especialidad médica del corazón y aparato circulatorio.'),
('Dermatología', 'Estudio de la estructura y función de la piel.'),
('Pediatría', 'Atención médica de bebés, niños y adolescentes.');

-- C. Crear Especialista (Depende de USUARIO y ESPECIALIDAD)
-- Insertamos al doctor con documento '2000000000' en Cardiología (id 1)
INSERT INTO ESPECIALISTA (nombre, apellido, documento, telefono, email, id_especialidad) VALUES 
('Evelyn', 'Botia', '2000000000', '3001234567', 'evelyn@hospital.com', 1);

-- D. Crear Paciente (Depende de USUARIO)
-- Insertamos al paciente con documento '3000000000'
INSERT INTO PACIENTE (nombre, apellido, documento, telefono, email, fecha_nacimiento, direccion) VALUES 
('German', 'Botia', '3000000000', '3109876543', 'german@correo.com', '1990-05-15', 'Calle Falsa 123');

-- E. Asignar Horarios Disponibles al Especialista (Depende de ESPECIALISTA)
-- El especialista con id 1 trabajará Lunes (1), Miércoles (3) y Viernes (5) de 8:00 AM a 12:00 PM
INSERT INTO HORARIO_DISPONIBLE (id_especialista, dia_semana, hora_inicio, hora_fin) VALUES 
(1, 1, '08:00:00', '12:00:00'),
(1, 3, '08:00:00', '12:00:00'),
(1, 5, '08:00:00', '12:00:00');
