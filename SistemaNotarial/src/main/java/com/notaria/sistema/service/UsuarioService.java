package com.notaria.sistema.service;

import com.notaria.sistema.model.Usuario;
import com.notaria.sistema.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * Lógica de negocio para el módulo de Usuarios.
 */
@Service
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepo;

    public UsuarioService(UsuarioRepository usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }

    /** Devuelve todos los usuarios */
    public List<Usuario> listarTodos() {
        return usuarioRepo.findAll();
    }

    /**
     * Autentica un usuario por correo y contraseña.
     * Lanza {@link IllegalArgumentException} si las credenciales son inválidas.
     */
    public Usuario login(String correo, String password) {
        Usuario u = usuarioRepo.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException("Correo o contraseña incorrectos."));
        if (!u.getActivo()) {
            throw new IllegalArgumentException("El usuario está inactivo. Contacta al administrador.");
        }
        if (!u.getPassword().equals(password)) {
            throw new IllegalArgumentException("Correo o contraseña incorrectos.");
        }
        return u;
    }

    /**
     * Crea un nuevo usuario.
     * Valida que el correo no esté duplicado.
     */
    @Transactional
    public Usuario crear(Usuario usuario) {
        if (usuarioRepo.existsByCorreo(usuario.getCorreo())) {
            throw new IllegalArgumentException(
                    "El correo " + usuario.getCorreo() + " ya está registrado.");
        }
        usuario.setActivo(true);
        // Asignar contraseña por defecto si no se proporcionó una
        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            usuario.setPassword("Monik2026@");
        }
        return usuarioRepo.save(usuario);
    }

    /**
     * Activa o desactiva un usuario (toggle).
     *
     * @param id ID del usuario
     * @return Usuario actualizado
     */
    @Transactional
    public Usuario toggleActivo(Integer id) {
        Usuario u = usuarioRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado: " + id));
        u.setActivo(!u.getActivo());
        return usuarioRepo.save(u);
    }

    /**
     * Obtiene un usuario por ID.
     */
    public Usuario obtenerPorId(Integer id) {
        return usuarioRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado: " + id));
    }

    /**
     * Actualiza los datos de un usuario (nombres, apellidos, correo, rol).
     * Si el correo cambia, valida que el nuevo no esté duplicado.
     */
    @Transactional
    public Usuario actualizar(Integer id, Usuario datos) {
        Usuario u = usuarioRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado: " + id));

        // Si el correo cambió, verificar que no esté en uso por otro usuario
        if (!u.getCorreo().equalsIgnoreCase(datos.getCorreo())
                && usuarioRepo.existsByCorreo(datos.getCorreo())) {
            throw new IllegalArgumentException(
                    "El correo " + datos.getCorreo() + " ya está en uso.");
        }

        u.setNombres(datos.getNombres());
        u.setApellidos(datos.getApellidos());
        u.setCorreo(datos.getCorreo());
        u.setRol(datos.getRol());
        return usuarioRepo.save(u);
    }

    /**
     * Elimina un usuario permanentemente por ID.
     */
    @Transactional
    public void eliminar(Integer id) {
        if (!usuarioRepo.existsById(id)) {
            throw new NoSuchElementException("Usuario no encontrado: " + id);
        }
        usuarioRepo.deleteById(id);
    }
}
