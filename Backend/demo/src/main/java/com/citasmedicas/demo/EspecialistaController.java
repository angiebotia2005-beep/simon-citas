package com.citasmedicas.demo;

import com.citasmedicas.demo.Entidades.Especialista;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/especialista")
public class EspecialistaController {

    @Autowired
    private EspecialistaRepository especialistaRepository;

    @GetMapping
    public ResponseEntity<List<Especialista>> getAllEspecialistas() {
        List<Especialista> especialistas = especialistaRepository.findAll();
        return ResponseEntity.ok(especialistas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Especialista> getEspecialistaById(@PathVariable Integer id) {
        Optional<Especialista> especialista = especialistaRepository.findById(id);
        return especialista.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/documento/{documento}")
    public ResponseEntity<Especialista> getEspecialistaByDocumento(@PathVariable String documento) {
        Optional<Especialista> especialista = especialistaRepository.findByDocumento(documento);
        return especialista.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // post create especialista
    @PostMapping
    public ResponseEntity<Especialista> createEspecialista(@RequestBody Especialista especialista) {
        Especialista savedEspecialista = especialistaRepository.save(especialista);
        return ResponseEntity.ok(savedEspecialista);
    }

    // Put especialista

    @PutMapping("/{id}")
    public ResponseEntity<Especialista> updateEspecialista(@PathVariable Integer id,
            @RequestBody Especialista especialistaDetails) {
        Optional<Especialista> optionalEspecialista = especialistaRepository.findById(id);

        if (optionalEspecialista.isPresent()) {
            Especialista especialista = optionalEspecialista.get();
            especialista.setNombre(especialistaDetails.getNombre());
            especialista.setApellido(especialistaDetails.getApellido());
            especialista.setDocumento(especialistaDetails.getDocumento());
            especialista.setTelefono(especialistaDetails.getTelefono());
            especialista.setEmail(especialistaDetails.getEmail());
            especialista.setEspecialidad(especialistaDetails.getEspecialidad());

            Especialista updatedEspecialista = especialistaRepository.save(especialista);
            return ResponseEntity.ok(updatedEspecialista);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete especialista
    @DeleteMapping("/{id}")
    public ResponseEntity<Especialista> deleteEspecialista(@PathVariable Integer id) {
        Optional<Especialista> optionalEspecialista = especialistaRepository.findById(id);

        if (optionalEspecialista.isPresent()) {
            especialistaRepository.delete(optionalEspecialista.get());
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}