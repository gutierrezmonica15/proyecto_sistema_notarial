package com.notaria.sistema.repository;

import com.notaria.sistema.model.Escritura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para {@link Escritura}.
 */
@Repository
public interface EscrituraRepository extends JpaRepository<Escritura, Integer> {

    Optional<Escritura> findByNumero(String numero);

    /** Búsqueda avanzada combinada: número, año, protocolista, cédula */
    @Query("""
        SELECT e FROM Escritura e
        WHERE (:numero    IS NULL OR e.numero       LIKE %:numero%)
          AND (:anio      IS NULL OR e.numero       LIKE %:anio%)
          AND (:proto     IS NULL OR LOWER(e.protocolista) LIKE LOWER(CONCAT('%',:proto,'%')))
          AND (:cedula    IS NULL OR e.cedComprador  LIKE %:cedula%
                                 OR e.cedVendedor   LIKE %:cedula%)
        ORDER BY e.fechaRadicacion DESC
        """)
    List<Escritura> buscarAvanzado(
            @Param("numero") String numero,
            @Param("anio")   String anio,
            @Param("proto")  String proto,
            @Param("cedula") String cedula
    );

    /** Siguiente número disponible para auto-generar el correlativo */
    @Query("SELECT MAX(e.numero) FROM Escritura e WHERE e.numero LIKE 'ESC-2025-%'")
    Optional<String> findMaxNumero();
}
