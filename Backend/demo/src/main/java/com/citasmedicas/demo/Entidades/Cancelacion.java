package com.citasmedicas.demo.Entidades;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "CANCELACION")
public class Cancelacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cancelacion")
    private Integer idCancelacion;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cita", nullable = false, unique = true)
    private Cita cita;

    @Column(name = "motivo_cancelacion", columnDefinition = "TEXT", nullable = false)
    private String motivoCancelacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "cancelado_por", nullable = false)
    private CanceladoPor canceladoPor;

    @Column(name = "fecha_cancelacion")
    private LocalDateTime fechaCancelacion;

    // Constructores
    public Cancelacion() {}

    // Getters y Setters
    public Integer getIdCancelacion() {
        return idCancelacion;
    }

    public void setIdCancelacion(Integer idCancelacion) {
        this.idCancelacion = idCancelacion;
    }

    public Cita getCita() {
        return cita;
    }

    public void setCita(Cita cita) {
        this.cita = cita;
    }

    public String getMotivoCancelacion() {
        return motivoCancelacion;
    }

    public void setMotivoCancelacion(String motivoCancelacion) {
        this.motivoCancelacion = motivoCancelacion;
    }

    public CanceladoPor getCanceladoPor() {
        return canceladoPor;
    }

    public void setCanceladoPor(CanceladoPor canceladoPor) {
        this.canceladoPor = canceladoPor;
    }

    public LocalDateTime getFechaCancelacion() {
        return fechaCancelacion;
    }

    public void setFechaCancelacion(LocalDateTime fechaCancelacion) {
        this.fechaCancelacion = fechaCancelacion;
    }
}