package com.notaria.sistema.controller;

import com.notaria.sistema.model.Boleta;
import com.notaria.sistema.service.BoletaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller para el módulo de Boletas de Rentas.
 * Base URL: /api/boletas
 */
@RestController
@RequestMapping("/api/boletas")
@CrossOrigin(origins = "*")  // Permite llamadas desde el frontend
public class BoletaController {

    private final BoletaService boletaService;

    public BoletaController(BoletaService boletaService) {
        this.boletaService = boletaService;
    }

    /**
     * GET /api/boletas
     * Devuelve todas las boletas. Acepta parámetro opcional ?q= para buscar.
     */
    @GetMapping
    public ResponseEntity<List<Boleta>> listar(@RequestParam(required = false) String q) {
        List<Boleta> resultado = (q != null && !q.isBlank())
                ? boletaService.buscar(q)
                : boletaService.listarTodas();
        return ResponseEntity.ok(resultado);
    }

    /**
     * GET /api/boletas/resumen
     * Devuelve estadísticas para las tarjetas del dashboard.
     */
    @GetMapping("/resumen")
    public ResponseEntity<BoletaService.ResumenBoletas> resumen() {
        return ResponseEntity.ok(boletaService.obtenerResumen());
    }

    /**
     * POST /api/boletas
     * Crea una nueva boleta.
     */
    @PostMapping
    public ResponseEntity<Boleta> crear(@Valid @RequestBody Boleta boleta) {
        return ResponseEntity.status(201).body(boletaService.crear(boleta));
    }

    /**
     * PUT /api/boletas/{id}/pagar
     * Marca una boleta como pagada.
     */
    @PutMapping("/{id}/pagar")
    public ResponseEntity<Boleta> pagar(@PathVariable Integer id) {
        return ResponseEntity.ok(boletaService.marcarPagada(id));
    }

    // ── Manejo de errores local ───────────────────────────────

    @ExceptionHandler(java.util.NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(java.util.NoSuchElementException ex) {
        return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
    }
}
