package com.notaria.sistema.service;

import com.notaria.sistema.model.Escritura;
import com.notaria.sistema.repository.EscrituraRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * Lógica de negocio para el módulo de Escrituras.
 */
@Service
@Transactional(readOnly = true)
public class EscrituraService {

    private final EscrituraRepository escrituraRepo;

    public EscrituraService(EscrituraRepository escrituraRepo) {
        this.escrituraRepo = escrituraRepo;
    }

    /** Devuelve todas las escrituras ordenadas por fecha DESC */
    public List<Escritura> listarTodas() {
        return escrituraRepo.findAll();
    }

    /**
     * Búsqueda avanzada con criterios opcionales.
     * Cualquier parámetro nulo o vacío es ignorado.
     */
    public List<Escritura> buscarAvanzado(String numero, String anio, String proto, String cedula) {
        return escrituraRepo.buscarAvanzado(
                emptyToNull(numero),
                emptyToNull(anio),
                emptyToNull(proto),
                emptyToNull(cedula)
        );
    }

    /**
     * Radica (crea) una nueva escritura.
     * Auto-genera el número correlativo si no viene en el request.
     */
    @Transactional
    public Escritura radicar(Escritura escritura) {
        if (escritura.getNumero() == null || escritura.getNumero().isBlank()) {
            escritura.setNumero(generarNumero());
        }
        if (escritura.getFechaRadicacion() == null) {
            escritura.setFechaRadicacion(LocalDate.now());
        }
        escritura.setEstado(Escritura.EstadoEscritura.Escaneado);
        return escrituraRepo.save(escritura);
    }

    /**
     * Cambia el estado de una escritura existente.
     */
    @Transactional
    public Escritura actualizarEstado(Integer id, Escritura.EstadoEscritura nuevoEstado) {
        Escritura e = escrituraRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Escritura no encontrada: " + id));
        e.setEstado(nuevoEstado);
        return escrituraRepo.save(e);
    }

    // ── Privados ─────────────────────────────────────────────

    private String generarNumero() {
        int anio = Year.now().getValue();
        String prefix = "ESC-" + anio + "-";
        return escrituraRepo.findMaxNumero()
                .map(maxNum -> {
                    // Extraer el correlativo numérico y sumar 1
                    String[] parts = maxNum.split("-");
                    int correlativo = Integer.parseInt(parts[parts.length - 1]) + 1;
                    return prefix + String.format("%04d", correlativo);
                })
                .orElse(prefix + "0001");
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
