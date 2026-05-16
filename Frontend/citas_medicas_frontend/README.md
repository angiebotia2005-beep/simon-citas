# 🏥 simonCitas - Frontend (React)

Esta es la interfaz de usuario para la plataforma de gestión de citas médicas **simonCitas**. Está construida como una Single Page Application (SPA) utilizando React.js y proporciona portales dedicados para Pacientes, Especialistas y Administradores.

## 🎨 Características Principales
- Interfaz moderna e intuitiva.
- Agendamiento visual de citas en tiempo real.
- Panel de administración para gestión de usuarios.
- Calendarios dinámicos para especialistas.

## 🛠️ Tecnologías Utilizadas
- **React.js**
- **HTML5 & CSS3** (Vanilla CSS para mantener control total del diseño)
- **Fetch API** (para comunicación asíncrona con el backend)

## ⚙️ Requisitos Previos
1. Tener instalado [Node.js](https://nodejs.org/) (versión 16+ recomendada).
2. Tener el **Backend de simonCitas (Spring Boot)** ejecutándose en el puerto 8080.

## 🚀 Cómo ejecutar el proyecto localmente

### 1. Instalar dependencias
Abre una terminal en esta carpeta (`c:\Proyecto\Frontend\citas_medicas_frontend`) y ejecuta el comando para descargar todas las librerías necesarias:
```bash
npm install
```

### 2. Iniciar el servidor de desarrollo
Una vez instaladas las dependencias, inicia la aplicación ejecutando:
```bash
npm start
```

### 3. Acceder a la plataforma
El servidor de desarrollo se abrirá automáticamente en tu navegador predeterminado. Si no lo hace, puedes acceder manualmente ingresando a:
**http://localhost:3000**

---
*Nota: Si experimentas problemas de conexión o errores en la consola (CORS o "Failed to fetch"), asegúrate de que el Backend de Spring Boot esté corriendo simultáneamente en una terminal separada.*
