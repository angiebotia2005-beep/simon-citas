package com.citasmedicas.demo.Entidades;

import jakarta.persistence.*;

@Entity
@Table(name = "ESPECIALISTA")
public class Especialista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_especialista")
    private Integer idEspecialista;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, length = 50, unique = true)
    private String documento;

    @Column(length = 20)
    private String telefono;

    @Column(length = 150)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_especialidad", nullable = false)
    private Especialidad especialidad;

    // Relaciones con HorarioDisponible y Cita
    // @OneToMany(mappedBy = "especialista", cascade = CascadeType.ALL)
    // private List<HorarioDisponible> horariosDisponibles;

    // @OneToMany(mappedBy = "especialista", cascade = CascadeType.ALL)
    // private List<Cita> citas;

    // Constructores
    public Especialista() {}

    // Getters y Setters
    public Integer getIdEspecialista() {
        return idEspecialista;
    }

    public void setIdEspecialista(Integer idEspecialista) {
        this.idEspecialista = idEspecialista;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Especialidad getEspecialidad() {
        return especialidad;
    }

    public void setEspecialidad(Especialidad especialidad) {
        this.especialidad = especialidad;
    }
}