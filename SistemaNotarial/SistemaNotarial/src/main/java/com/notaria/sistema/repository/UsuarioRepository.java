package com.notaria.sistema.repository;

import com.notaria.sistema.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para {@link Usuario}.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    boolean existsByCorreo(String correo);

    Optional<Usuario> findByCorreo(String correo);

    List<Usuario> findByActivoTrue();

    List<Usuario> findByRol(Usuario.RolUsuario rol);
}
