package com.notaria.sistema.controller;

import com.notaria.sistema.model.Usuario;
import com.notaria.sistema.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller para el módulo de Usuarios.
 * Base URL: /api/usuarios
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    /**
     * GET /api/usuarios
     * Devuelve todos los usuarios del sistema.
     */
    @GetMapping
    public ResponseEntity<List<Usuario>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    /**
     * POST /api/usuarios
     * Crea un nuevo usuario.
     * Body JSON: { "nombres":"Laura","apellidos":"Martínez","correo":"...","rol":"Protocolista" }
     */
    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Usuario usuario) {
        try {
            Usuario creado = usuarioService.crear(usuario);
            return ResponseEntity.status(201).body(creado);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * PUT /api/usuarios/{id}/toggle
     * Activa o desactiva un usuario.
     */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<Usuario> toggle(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.toggleActivo(id));
    }

    /**
     * GET /api/usuarios/{id}
     * Obtiene un usuario específico por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    /**
     * PUT /api/usuarios/{id}
     * Actualiza los datos de un usuario (nombres, apellidos, correo, rol).
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id,
                                        @Valid @RequestBody Usuario datos) {
        try {
            return ResponseEntity.ok(usuarioService.actualizar(id, datos));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * DELETE /api/usuarios/{id}
     * Elimina un usuario permanentemente.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable Integer id) {
        usuarioService.eliminar(id);
        return ResponseEntity.ok(Map.of("mensaje", "Usuario eliminado correctamente"));
    }

    // ── Manejo de errores local ───────────────────────────────

    @ExceptionHandler(java.util.NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(java.util.NoSuchElementException ex) {
        return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
    }
}
