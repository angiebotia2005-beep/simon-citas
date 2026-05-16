package com.citasmedicas.demo;

import com.citasmedicas.demo.Entidades.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByPaciente_IdPaciente(Integer idPaciente);

    List<Cita> findByEspecialista_IdEspecialista(Integer idEspecialista);

    List<Cita> findByEspecialista_IdEspecialistaAndFechaAndHoraInicioAndEstadoNot(Integer idEspecialista, java.time.LocalDate fecha, java.time.LocalTime horaInicio, com.citasmedicas.demo.Entidades.EstadoCita estado);
    
    List<Cita> findByPaciente_IdPacienteAndFechaAndHoraInicioAndEstadoNot(Integer idPaciente, java.time.LocalDate fecha, java.time.LocalTime horaInicio, com.citasmedicas.demo.Entidades.EstadoCita estado);
}
