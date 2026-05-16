# 🏥 simonCitas - Backend (Spring Boot)

Este es el servidor y la API RESTful para la plataforma de gestión de citas médicas **simonCitas**. Está construido utilizando Java con el framework Spring Boot y se conecta a una base de datos MySQL.

## 🛠️ Tecnologías Utilizadas
- **Java 17+**
- **Spring Boot** (Spring Web, Spring Data JPA)
- **MySQL Connector**
- **Maven**

## ⚙️ Requisitos Previos
1. Tener instalado [Java JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) o superior.
2. Tener instalado [Maven](https://maven.apache.org/).
3. Tener un servidor **MySQL** (XAMPP, Workbench, o Docker) ejecutándose localmente.

## 🚀 Cómo ejecutar el proyecto localmente

### 1. Configurar la Base de Datos
Asegúrate de tener creada la base de datos en tu servidor MySQL local. Por defecto, el proyecto espera que se llame `citasmedicasdb`.
Puedes importar el script SQL inicial ubicado en `c:\Proyecto\BaseDato\CitasmedicasDb.sql`.

Si necesitas cambiar las credenciales de la base de datos (usuario/contraseña), edita el siguiente archivo:
`src/main/resources/application.properties`

### 2. Compilar dependencias
Abre una terminal en esta misma carpeta (`c:\Proyecto\Backend\demo`) y ejecuta:
```bash
mvn clean install
```

### 3. Ejecutar el servidor
Para iniciar la aplicación, ejecuta el siguiente comando:
```bash
mvn spring-boot:run
```
El servidor se iniciará y estará escuchando peticiones en **http://localhost:8080**.

---
*Nota: Asegúrate de tener el Backend corriendo antes de intentar hacer login o agendar citas desde el Frontend.*
# citas_medicas_backend
