package com.citasmedicas.demo;

import com.citasmedicas.demo.Entidades.Especialidad;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/especialidad")
public class EspecialidadController {

    @Autowired
    private EspecialidadRepository especialidadRepository;

    @GetMapping
    public ResponseEntity<List<Especialidad>> obtenerEspecialidades() {
        return new ResponseEntity<>(especialidadRepository.findAll(), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Especialidad> crearEspecialidad(@RequestBody Especialidad especialidad) {
        Especialidad nueva = especialidadRepository.save(especialidad);
        return new ResponseEntity<>(nueva, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Especialidad> actualizarEspecialidad(@PathVariable Integer id, @RequestBody Especialidad especialidad) {
        if (!especialidadRepository.existsById(id)) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        especialidad.setIdEspecialidad(id);
        Especialidad actualizada = especialidadRepository.save(especialidad);
        return new ResponseEntity<>(actualizada, HttpStatus.OK);
    }
}
