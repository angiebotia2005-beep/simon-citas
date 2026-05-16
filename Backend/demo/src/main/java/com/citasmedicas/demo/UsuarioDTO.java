package com.citasmedicas.demo;

import java.time.LocalDateTime;

public class UsuarioDTO {
    private String documento;
    private String nombre;
    private String apellido;
    private String rol;
    private Boolean activo;
    private LocalDateTime fechaCreacion;

    public UsuarioDTO() {}

    public UsuarioDTO(String documento, String nombre, String apellido, String rol, Boolean activo, LocalDateTime fechaCreacion) {
        this.documento = documento;
        this.nombre = nombre;
        this.apellido = apellido;
        this.rol = rol;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
    }

    // Getters and Setters
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
