package com.citasmedicas.demo;

import com.citasmedicas.demo.Entidades.HorarioDisponible;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horario")
public class HorarioController {

    @Autowired
    private HorarioDisponibleRepository horarioRepository;

    @PostMapping("/batch")
    public ResponseEntity<List<HorarioDisponible>> crearHorarios(@RequestBody List<HorarioDisponible> horarios) {
        List<HorarioDisponible> guardados = horarioRepository.saveAll(horarios);
        return new ResponseEntity<>(guardados, HttpStatus.CREATED);
    }

    @GetMapping("/especialista/{idEspecialista}")
    public ResponseEntity<List<HorarioDisponible>> obtenerHorariosPorEspecialista(@PathVariable Integer idEspecialista) {
        List<HorarioDisponible> horarios = horarioRepository.findByEspecialista_IdEspecialista(idEspecialista);
        return new ResponseEntity<>(horarios, HttpStatus.OK);
    }

    @DeleteMapping("/especialista/{idEspecialista}")
    public ResponseEntity<Void> eliminarHorariosPorEspecialista(@PathVariable Integer idEspecialista) {
        horarioRepository.deleteByEspecialista_IdEspecialista(idEspecialista);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
