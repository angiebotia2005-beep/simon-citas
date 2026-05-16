package com.citasmedicas.demo;

import com.citasmedicas.demo.Entidades.Cita;
import com.citasmedicas.demo.Entidades.EstadoCita;
import com.citasmedicas.demo.Entidades.Usuario;
import com.citasmedicas.demo.Entidades.RolUsuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.citasmedicas.demo.dto.UsuarioDTO;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private EspecialistaRepository especialistaRepository;

    @PostMapping
    public ResponseEntity<Usuario> crearUsuario(@RequestBody Usuario usuario) {
        Usuario nuevoUsuario = usuarioRepository.save(usuario);
        return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> obtenerUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<UsuarioDTO> dtoList = new ArrayList<>();
        for (Usuario u : usuarios) {
            UsuarioDTO dto = new UsuarioDTO();
            dto.setDocumento(u.getDocumento());
            dto.setRol(u.getRol());
            dto.setActivo(u.getActivo());
            dto.setFechaCreacion(u.getFechaCreacion());
            // intentar obtener nombre y apellido del paciente si existe
            pacienteRepository.findByDocumento(u.getDocumento()).ifPresent(p -> {
                dto.setNombre(p.getNombre());
                dto.setApellido(p.getApellido());
            });
            // si el usuario es especialista, obtener datos del especialista
            especialistaRepository.findByDocumento(u.getDocumento()).ifPresent(e -> {
                dto.setNombre(e.getNombre());
                dto.setApellido(e.getApellido());
            });
            dtoList.add(dto);
        }
        return new ResponseEntity<>(dtoList, HttpStatus.OK);
    }

    @GetMapping("/{documento}")
    public ResponseEntity<Usuario> obtenerUsuarioPorDocumento(@PathVariable String documento) {
        return usuarioRepository.findById(documento)
                .map(usuario -> new ResponseEntity<>(usuario, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{documento}")
    public ResponseEntity<Usuario> actualizarUsuario(@PathVariable String documento, @RequestBody Usuario usuarioDetalles) {
        return usuarioRepository.findById(documento)
                .map(usuario -> {
                    RolUsuario rolAnterior = usuario.getRol();
                    RolUsuario rolNuevo = usuarioDetalles.getRol();
                    
                    // Si el rol cambia, cancelar citas pendientes
                    if (rolAnterior != rolNuevo) {
                        // 1. Si era paciente y ya no lo es (o cambia de rol)
                        if (rolAnterior == RolUsuario.paciente) {
                            pacienteRepository.findByDocumento(documento).ifPresent(p -> {
                                List<Cita> citas = citaRepository.findByPaciente_IdPaciente(p.getIdPaciente());
                                for (Cita c : citas) {
                                    if (c.getEstado() == EstadoCita.activa) {
                                        c.setEstado(EstadoCita.cancelada);
                                        c.setObservaciones(c.getObservaciones() + " (Cancelada por cambio de rol de usuario)");
                                        citaRepository.save(c);
                                    }
                                }
                            });
                        }
                        
                        // 2. Si era especialista y ya no lo es
                        if (rolAnterior == RolUsuario.especialista) {
                            especialistaRepository.findByDocumento(documento).ifPresent(e -> {
                                List<Cita> citas = citaRepository.findByEspecialista_IdEspecialista(e.getIdEspecialista());
                                for (Cita c : citas) {
                                    if (c.getEstado() == EstadoCita.activa) {
                                        c.setEstado(EstadoCita.cancelada);
                                        c.setObservaciones(c.getObservaciones() + " (Cancelada por cambio de rol de especialista)");
                                        citaRepository.save(c);
                                    }
                                }
                            });
                        }
                    }

                    usuario.setRol(rolNuevo);
                    usuario.setActivo(usuarioDetalles.getActivo());
                    if (usuarioDetalles.getContrasena() != null && !usuarioDetalles.getContrasena().isEmpty()) {
                        usuario.setContrasena(usuarioDetalles.getContrasena());
                    }
                    Usuario usuarioActualizado = usuarioRepository.save(usuario);
                    return new ResponseEntity<>(usuarioActualizado, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
