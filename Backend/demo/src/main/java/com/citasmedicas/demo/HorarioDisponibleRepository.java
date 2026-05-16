package com.citasmedicas.demo;

import com.citasmedicas.demo.Entidades.HorarioDisponible;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioDisponibleRepository extends JpaRepository<HorarioDisponible, Integer> {
    List<HorarioDisponible> findByEspecialista_IdEspecialistaAndDiaSemana(Integer idEspecialista, Integer diaSemana);
    List<HorarioDisponible> findByEspecialista_IdEspecialista(Integer idEspecialista);

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Modifying
    void deleteByEspecialista_IdEspecialista(Integer idEspecialista);
}
