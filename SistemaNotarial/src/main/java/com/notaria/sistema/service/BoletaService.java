package com.notaria.sistema.service;

import com.notaria.sistema.model.Boleta;
import com.notaria.sistema.repository.BoletaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Lógica de negocio para el módulo de Boletas de Rentas.
 */
@Service
@Transactional(readOnly = true)
public class BoletaService {

    private final BoletaRepository boletaRepo;

    public BoletaService(BoletaRepository boletaRepo) {
        this.boletaRepo = boletaRepo;
    }

    /** Devuelve todas las boletas ordenadas por fecha de liquidación DESC */
    public List<Boleta> listarTodas() {
        return boletaRepo.findAll();
    }

    /**
     * Busca boletas cuyo número de escritura contenga el texto indicado.
     * Si el query está vacío, devuelve todas.
     */
    public List<Boleta> buscar(String query) {
        if (query == null || query.isBlank()) {
            return listarTodas();
        }
        return boletaRepo.findByNumEscrituraContainingIgnoreCase(query.trim());
    }

    /** Crea una boleta nueva */
    @Transactional
    public Boleta crear(Boleta boleta) {
        return boletaRepo.save(boleta);
    }

    /** Cambia el estado de una boleta a "Pagado" */
    @Transactional
    public Boleta marcarPagada(Integer id) {
        Boleta boleta = boletaRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Boleta no encontrada: " + id));
        boleta.setEstado(Boleta.EstadoBoleta.Pagado);
        return boletaRepo.save(boleta);
    }

    /** Estadísticas rápidas para las tarjetas de resumen del dashboard */
    public record ResumenBoletas(long total, long porVencer, double totalPendiente) {}

    public ResumenBoletas obtenerResumen() {
        List<Boleta> todas = listarTodas();
        long activas = todas.stream()
                .filter(b -> b.getEstado() == Boleta.EstadoBoleta.Liquidado)
                .count();
        double pendiente = todas.stream()
                .filter(b -> b.getEstado() == Boleta.EstadoBoleta.Liquidado)
                .mapToDouble(b -> b.getValor().doubleValue())
                .sum();
        // "Por vencer" = boletas liquidadas con fecha <= 5 días desde hoy
        long porVencer = todas.stream()
                .filter(b -> b.getEstado() == Boleta.EstadoBoleta.Liquidado)
                .filter(b -> {
                    long dias = java.time.temporal.ChronoUnit.DAYS
                            .between(java.time.LocalDate.now(), b.getFechaLiquidacion());
                    return dias >= 0 && dias <= 5;
                })
                .count();
        return new ResumenBoletas(activas, porVencer, pendiente);
    }
}
