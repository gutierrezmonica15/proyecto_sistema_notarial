package com.notaria.sistema.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad JPA que mapea la tabla {@code boletas}.
 * Cada boleta representa el valor a pagar por una escritura notarial
 * ante la Dirección de Rentas.
 */
@Entity
@Table(name = "boletas")
public class Boleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /** Número de escritura asociada. Referencia a escrituras.numero */
    @Column(name = "num_escritura", nullable = false, length = 20)
    @NotBlank(message = "El número de escritura es obligatorio")
    private String numEscritura;

    @Column(name = "fecha_liquidacion", nullable = false)
    @NotNull(message = "La fecha de liquidación es obligatoria")
    private LocalDate fechaLiquidacion;

    @Column(nullable = false, precision = 15, scale = 2)
    @NotNull(message = "El valor es obligatorio")
    @DecimalMin(value = "0.01", message = "El valor debe ser mayor que cero")
    private BigDecimal valor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @NotNull
    private EstadoBoleta estado = EstadoBoleta.Liquidado;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ── Constructores ────────────────────────────────────────
    public Boleta() {}

    // ── Lifecycle ────────────────────────────────────────────
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Getters ──────────────────────────────────────────────
    public Integer getId()               { return id; }
    public String getNumEscritura()      { return numEscritura; }
    public LocalDate getFechaLiquidacion() { return fechaLiquidacion; }
    public BigDecimal getValor()         { return valor; }
    public EstadoBoleta getEstado()      { return estado; }
    public LocalDateTime getCreatedAt()  { return createdAt; }

    // ── Setters ──────────────────────────────────────────────
    public void setId(Integer id)                      { this.id = id; }
    public void setNumEscritura(String n)              { this.numEscritura = n; }
    public void setFechaLiquidacion(LocalDate d)       { this.fechaLiquidacion = d; }
    public void setValor(BigDecimal v)                 { this.valor = v; }
    public void setEstado(EstadoBoleta e)              { this.estado = e; }
    public void setCreatedAt(LocalDateTime t)          { this.createdAt = t; }

    /** Estados posibles de una boleta de rentas */
    public enum EstadoBoleta {
        Liquidado,
        Pagado
    }
}
