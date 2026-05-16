package com.citasmedicas.demo;

import com.citasmedicas.demo.Entidades.Paciente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/paciente")
public class PacienteController {

    @Autowired
    private PacienteRepository pacienteRepository;

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> getPacienteById(@PathVariable Integer id) {
        Optional<Paciente> paciente = pacienteRepository.findById(id);
        return paciente.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/documento/{documento}")
    public ResponseEntity<Paciente> getPacienteByDocumento(@PathVariable String documento) {
        Optional<Paciente> paciente = pacienteRepository.findByDocumento(documento);
        return paciente.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // POST de creacion de paciente
    @PostMapping
    public ResponseEntity<Paciente> createPaciente(@RequestBody Paciente paciente) {
        Paciente savedPaciente = pacienteRepository.save(paciente);
        return ResponseEntity.ok(savedPaciente);
    }
}