package com.notaria.sistema.repository;

import com.notaria.sistema.model.Boleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio JPA para {@link Boleta}.
 * Spring Data genera automáticamente la implementación en tiempo de ejecución.
 */
@Repository
public interface BoletaRepository extends JpaRepository<Boleta, Integer> {

    /** Buscar boletas por número de escritura (exacto) */
    List<Boleta> findByNumEscritura(String numEscritura);

    /** Buscar boletas cuyo número de escritura contiene el texto dado (insensible a mayúsculas) */
    List<Boleta> findByNumEscrituraContainingIgnoreCase(String query);

    /** Filtrar por estado */
    List<Boleta> findByEstado(Boleta.EstadoBoleta estado);
}
