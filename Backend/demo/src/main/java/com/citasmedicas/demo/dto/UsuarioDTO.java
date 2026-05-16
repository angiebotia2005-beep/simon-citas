package com.citasmedicas.demo.dto;

import com.citasmedicas.demo.Entidades.RolUsuario;
import java.time.LocalDateTime;

public class UsuarioDTO {
    private String documento;
    private String nombre;
    private String apellido;
    private RolUsuario rol;
    private Boolean activo;
    private LocalDateTime fechaCreacion;

    // Getters and Setters
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public RolUsuario getRol() { return rol; }
    public void setRol(RolUsuario rol) { this.rol = rol; }
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
