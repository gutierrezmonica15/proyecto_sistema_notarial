package com.notaria.sistema.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad JPA que mapea la tabla {@code escrituras}.
 * Representa un instrumento público notarial radicado en la notaría.
 */
@Entity
@Table(name = "escrituras")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Escritura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /** Número único de escritura. Ej: ESC-2025-0418 */
    @Column(nullable = false, unique = true, length = 20)
    @NotBlank(message = "El número de escritura es obligatorio")
    private String numero;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "El tipo de acto es obligatorio")
    private String acto;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "El protocolista es obligatorio")
    private String protocolista;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @NotNull
    private EstadoEscritura estado = EstadoEscritura.Escaneado;

    @Column(name = "ced_comprador", length = 20)
    private String cedComprador;

    @Column(name = "ced_vendedor", length = 20)
    private String cedVendedor;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "fecha_radicacion", nullable = false)
    @NotNull(message = "La fecha de radicación es obligatoria")
    private LocalDate fechaRadicacion;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /** Estados del flujo de una escritura */
    public enum EstadoEscritura {
        Validado_por_Notario,
        Escaneado,
        Devuelto;

        /** Serializa el enum a JSON con espacios: "Validado por Notario" */
        @com.fasterxml.jackson.annotation.JsonValue
        public String toValue() {
            return this.name().replace('_', ' ');
        }

        /** Deserializa desde JSON (acepta espacios) */
        @com.fasterxml.jackson.annotation.JsonCreator
        public static EstadoEscritura fromValue(String val) {
            return EstadoEscritura.valueOf(val.replace(' ', '_'));
        }
    }
}
