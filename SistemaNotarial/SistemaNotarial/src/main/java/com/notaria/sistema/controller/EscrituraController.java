package com.notaria.sistema.controller;

import com.notaria.sistema.model.Escritura;
import com.notaria.sistema.service.EscrituraService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller para el módulo de Escrituras.
 * Base URL: /api/escrituras
 */
@RestController
@RequestMapping("/api/escrituras")
@CrossOrigin(origins = "*")
public class EscrituraController {

    private final EscrituraService escrituraService;

    public EscrituraController(EscrituraService escrituraService) {
        this.escrituraService = escrituraService;
    }

    /**
     * GET /api/escrituras
     * Devuelve todas las escrituras.
     */
    @GetMapping
    public ResponseEntity<List<Escritura>> listar() {
        return ResponseEntity.ok(escrituraService.listarTodas());
    }

    /**
     * GET /api/escrituras/buscar?numero=&anio=&proto=&cedula=
     * Búsqueda avanzada con parámetros opcionales.
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<Escritura>> buscar(
            @RequestParam(required = false) String numero,
            @RequestParam(required = false) String anio,
            @RequestParam(required = false) String proto,
            @RequestParam(required = false) String cedula) {

        List<Escritura> resultado = escrituraService.buscarAvanzado(numero, anio, proto, cedula);

        if (resultado.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(resultado);
    }

    /**
     * POST /api/escrituras
     * Radica una nueva escritura. El número se auto-genera si no se envía.
     */
    @PostMapping
    public ResponseEntity<Escritura> radicar(@Valid @RequestBody Escritura escritura) {
        return ResponseEntity.status(201).body(escrituraService.radicar(escritura));
    }

    /**
     * PUT /api/escrituras/{id}/estado
     * Actualiza el estado de una escritura.
     * Body: { "estado": "Validado por Notario" }
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<Escritura> actualizarEstado(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {

        String estadoStr = body.get("estado");
        if (estadoStr == null || estadoStr.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        Escritura.EstadoEscritura estado = Escritura.EstadoEscritura.fromValue(estadoStr);
        return ResponseEntity.ok(escrituraService.actualizarEstado(id, estado));
    }

    // ── Manejo de errores local ───────────────────────────────

    @ExceptionHandler(java.util.NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(java.util.NoSuchElementException ex) {
        return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
