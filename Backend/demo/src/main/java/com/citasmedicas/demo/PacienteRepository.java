package com.citasmedicas.demo;

import com.citasmedicas.demo.Entidades.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Integer> {
    // Métodos personalizados si los necesitas
    java.util.Optional<Paciente> findByDocumento(String documento);
}