package com.citasmedicas.demo;

import com.citasmedicas.demo.Entidades.Cita;
import com.citasmedicas.demo.Entidades.HorarioDisponible;
import com.citasmedicas.demo.Entidades.EstadoCita;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/disponibilidad")
public class DisponibilidadController {

    @Autowired
    private HorarioDisponibleRepository horarioRepository;

    @Autowired
    private CitaRepository citaRepository;

    @GetMapping("/{idEspecialista}")
    public List<String> obtenerHorasDisponibles(
            @PathVariable Integer idEspecialista,
            @RequestParam String fecha) {
        
        System.out.println("[DEBUG] Buscando disponibilidad para Especialista ID: " + idEspecialista + " en fecha: " + fecha);
        
        LocalDate localDate = LocalDate.parse(fecha);
        int diaSemana = localDate.getDayOfWeek().getValue();
        System.out.println("[DEBUG] Día de la semana calculado (1=Lunes, 7=Dom): " + diaSemana);

        // 1. Obtener rangos de horario del especialista para ese día
        List<HorarioDisponible> rangos = horarioRepository.findByEspecialista_IdEspecialistaAndDiaSemana(idEspecialista, diaSemana);
        System.out.println("[DEBUG] Rangos encontrados en DB: " + rangos.size());

        // 2. Obtener citas ya ocupadas para ese día
        List<Cita> citasOcupadas = citaRepository.findByEspecialista_IdEspecialista(idEspecialista)
                .stream()
                .filter(c -> c.getFecha().equals(localDate) && c.getEstado() != EstadoCita.cancelada)
                .collect(Collectors.toList());
        System.out.println("[DEBUG] Citas ya ocupadas para este día: " + citasOcupadas.size());

        List<String> horasDisponibles = new ArrayList<>();

        for (HorarioDisponible rango : rangos) {
            LocalTime actual = rango.getHoraInicio();
            while (actual.plusMinutes(30).isBefore(rango.getHoraFin()) || actual.plusMinutes(30).equals(rango.getHoraFin())) {
                LocalTime finalActual = actual;
                
                // Verificar si este slot (actual a actual+30) está ocupado
                boolean ocupado = citasOcupadas.stream().anyMatch(c -> 
                    (c.getHoraInicio().equals(finalActual)) ||
                    (c.getHoraInicio().isBefore(finalActual.plusMinutes(30)) && c.getHoraFin().isAfter(finalActual))
                );

                if (!ocupado) {
                    horasDisponibles.add(actual.toString().substring(0, 5));
                }
                
                actual = actual.plusMinutes(30);
            }
        }

        return horasDisponibles;
    }
}
