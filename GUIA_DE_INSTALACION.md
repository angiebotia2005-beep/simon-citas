# 🚀 Guía de Instalación y Ejecución - simonCitas

Bienvenido/a al proyecto **simonCitas**. Este documento es la guía oficial paso a paso para configurar y ejecutar todo el sistema desde cero en un entorno local. El proyecto está dividido en tres componentes principales: Base de Datos, Backend y Frontend.

---

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado el siguiente software en tu computadora:

1. **MySQL Server** (Puede ser a través de XAMPP, MySQL Workbench o Docker).
2. **Java JDK 17** o superior.
3. **Maven** (Para compilar el Backend).
4. **Node.js** (Versión 16+ recomendada, para ejecutar el Frontend).

---

## Paso 1: Configurar la Base de Datos (MySQL)

El primer paso es crear las tablas y datos iniciales para que el backend pueda conectarse sin errores.

1. Abre tu gestor de base de datos preferido (ej. DBeaver, phpMyAdmin, MySQL Workbench).
2. Localiza el script de creación incluido en este proyecto:
   `c:\Proyecto\BaseDato\CitasmedicasDb.sql`
3. Abre este archivo y **ejecuta todo el script**.
   *Este script se encargará automáticamente de:*
   * Crear la base de datos llamada `citas_medicas_db`.
   * Crear todas las tablas necesarias con sus relaciones (Usuario, Paciente, Especialista, Cita, etc.).
   * Insertar algunos datos iniciales (especialidades, por ejemplo).
4. **Importante:** Asegúrate de que las credenciales (usuario y contraseña) configuradas en el archivo del backend (`c:\Proyecto\Backend\demo\src\main\resources\application.properties`) coincidan con las de tu servidor MySQL local. Por defecto suele ser usuario `root` y contraseña vacía o la que hayas definido.

---

## Paso 2: Ejecutar el Backend (Spring Boot / Java)

Una vez que la base de datos esté lista, levantaremos el servidor.

1. Abre una terminal (o consola de comandos).
2. Navega hasta la carpeta del backend:
   ```bash
   cd c:\Proyecto\Backend\demo
   ```
3. Ejecuta el comando para compilar e instalar las dependencias:
   ```bash
   mvn clean install
   ```
4. Ejecuta el servidor:
   ```bash
   mvn spring-boot:run
   ```
5. Espera a ver el mensaje que indica que Tomcat ha iniciado. El servidor estará escuchando y listo en **http://localhost:8080**.

---

## Paso 3: Ejecutar el Frontend (React.js)

Con el backend en funcionamiento, el último paso es levantar la interfaz de usuario.

1. Abre una **nueva** ventana de terminal (mantén la del backend abierta).
2. Navega hasta la carpeta del frontend:
   ```bash
   cd c:\Proyecto\Frontend\citas_medicas_frontend
   ```
3. Instala las dependencias necesarias de Node.js:
   ```bash
   npm install
   ```
4. Inicia la aplicación web:
   ```bash
   npm start
   ```
5. Se abrirá automáticamente tu navegador. Si no lo hace, ingresa a **http://localhost:3000**.

---

## 🎉 ¡Listo para probar!

Ya puedes utilizar **simonCitas**. Al ejecutar el script de la base de datos, se han cargado automáticamente tres usuarios de prueba para que el evaluador pueda navegar por todos los perfiles de la plataforma sin necesidad de registrarse previamente:

### 🔑 Credenciales de Prueba Incluidas:

**1. Administrador (Control Total)**
*   **Documento:** `1000000000`
*   **Contraseña:** `admin123`

**2. Especialista (Maria Antonia Caceres - Cardiología)**
*   **Documento:** `2000000000`
*   **Contraseña:** `doctor123`

**3. Paciente (Joaquin Zambrano)**
*   **Documento:** `3000000000`
*   **Contraseña:** `paciente123`

*(Nota: Todos los usuarios tienen el estado activo. Puedes crear nuevos desde la opción "Registrarse" o utilizar estas cuentas predeterminadas).*
