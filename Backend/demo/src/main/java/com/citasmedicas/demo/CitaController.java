package com.citasmedicas.demo;

import com.citasmedicas.demo.Entidades.Cita;
import com.citasmedicas.demo.Entidades.Especialista;
import com.citasmedicas.demo.Entidades.EstadoCita;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/fix-db")
    public String fixDatabase() {
        try {
            // 1. Crear índices normales para satisfacer las FKs
            jdbcTemplate.execute("CREATE INDEX idx_paciente_fk ON CITA(id_paciente)");
            jdbcTemplate.execute("CREATE INDEX idx_especialista_fk ON CITA(id_especialista)");
            
            // 2. Ahora sí podemos borrar los índices únicos sin que MySQL se queje por las FKs
            jdbcTemplate.execute("ALTER TABLE CITA DROP INDEX uk_paciente_horario");
            jdbcTemplate.execute("ALTER TABLE CITA DROP INDEX uk_especialista_horario");
            
            return "Base de datos reparada con éxito. Ya puedes agendar en horarios cancelados.";
        } catch (Exception e) {
            return "Error al reparar la base de datos: " + e.getMessage();
        }
    }

    @GetMapping
    public List<Cita> getAllCitas() {
        return citaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cita> getCitaById(@PathVariable Long id) {
        Optional<Cita> cita = citaRepository.findById(id);
        return cita.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<Cita>> getCitasByPacienteId(@PathVariable Integer pacienteId) {
        List<Cita> citas = citaRepository.findByPaciente_IdPaciente(pacienteId);
        if (citas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        actualizarEstadosCitas(citas);
        return ResponseEntity.ok(citas);
    }

    @GetMapping("/especialista/{especialistaID}")
    public ResponseEntity<List<Cita>> getCitasByEspecialistaId(@PathVariable Integer especialistaID) {
        List<Cita> citas = citaRepository.findByEspecialista_IdEspecialista(especialistaID);
        if (citas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        actualizarEstadosCitas(citas);
        return ResponseEntity.ok(citas);
    }

    private void actualizarEstadosCitas(List<Cita> citas) {
        java.time.LocalDate hoy = java.time.LocalDate.now();
        java.time.LocalTime ahora = java.time.LocalTime.now();
        boolean huboCambios = false;

        for (Cita cita : citas) {
            if (cita.getEstado() == EstadoCita.activa) {
                // Si la fecha ya pasó O si es hoy pero la hora de fin ya pasó
                if (cita.getFecha().isBefore(hoy) || 
                   (cita.getFecha().equals(hoy) && cita.getHoraFin().isBefore(ahora))) {
                    cita.setEstado(EstadoCita.completada);
                    citaRepository.save(cita);
                    huboCambios = true;
                }
            }
        }
    }

    @PostMapping
    public ResponseEntity<?> createCita(@RequestBody Cita cita) {
        java.time.LocalDate hoy = java.time.LocalDate.now();
        java.time.LocalTime ahora = java.time.LocalTime.now();

        // 1. Validaciones de tiempo básico
        if (cita.getFecha().isBefore(hoy)) {
            return ResponseEntity.badRequest().body("No se pueden programar citas para fechas pasadas.");
        }
        
        if (cita.getFecha().equals(hoy) && cita.getHoraInicio().isBefore(ahora)) {
            return ResponseEntity.badRequest().body("No se pueden programar citas para una hora que ya pasó.");
        }

        // 2. Validar disponibilidad del Especialista (Solo bloquear si hay una cita ACTIVA o COMPLETADA)
        List<Cita> crucesEspecialista = citaRepository.findByEspecialista_IdEspecialistaAndFechaAndHoraInicioAndEstadoNot(
            cita.getEspecialista().getIdEspecialista(), 
            cita.getFecha(), 
            cita.getHoraInicio(), 
            EstadoCita.cancelada
        );

        if (!crucesEspecialista.isEmpty()) {
            return ResponseEntity.badRequest().body("El especialista ya tiene una cita programada en este horario.");
        }

        // 3. Validar disponibilidad del Paciente
        List<Cita> crucesPaciente = citaRepository.findByPaciente_IdPacienteAndFechaAndHoraInicioAndEstadoNot(
            cita.getPaciente().getIdPaciente(), 
            cita.getFecha(), 
            cita.getHoraInicio(), 
            EstadoCita.cancelada
        );

        if (!crucesPaciente.isEmpty()) {
            return ResponseEntity.badRequest().body("Usted ya tiene una cita programada en este horario.");
        }

        return ResponseEntity.ok(citaRepository.save(cita));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cita> updateCita(@PathVariable Long id, @RequestBody Cita citaDetails) {
        Optional<Cita> optionalCita = citaRepository.findById(id);
        if (optionalCita.isPresent()) {
            Cita cita = optionalCita.get();
            cita.setPaciente(citaDetails.getPaciente());
            cita.setEspecialista(citaDetails.getEspecialista());
            cita.setFecha(citaDetails.getFecha());
            cita.setHoraInicio(citaDetails.getHoraInicio());
            cita.setHoraFin(citaDetails.getHoraFin());
            cita.setMotivo(citaDetails.getMotivo());
            cita.setObservaciones(citaDetails.getObservaciones());
            return ResponseEntity.ok(citaRepository.save(cita));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // put cancelar cita
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Cita> cancelarCita(@PathVariable Long id) {
        Optional<Cita> optionalCita = citaRepository.findById(id);
        if (optionalCita.isPresent()) {
            Cita cita = optionalCita.get();
            cita.setEstado(EstadoCita.cancelada);
            return ResponseEntity.ok(citaRepository.save(cita));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}