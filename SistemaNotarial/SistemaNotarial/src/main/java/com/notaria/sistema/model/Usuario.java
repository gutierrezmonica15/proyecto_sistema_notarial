package com.notaria.sistema.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

/**
 * Entidad JPA que mapea la tabla {@code usuarios}.
 * Representa a los empleados de la notaría con acceso al sistema.
 */
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "El nombre es obligatorio")
    private String nombres;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;

    @Column(nullable = false, unique = true, length = 150)
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene formato válido")
    private String correo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @NotNull(message = "El rol es obligatorio")
    private RolUsuario rol;

    @Column(nullable = false, length = 32)
    @JsonIgnore   // nunca se expone la contraseña en la API REST
    private String password = "e740a4cff24ec5be7296cb210dc983b4"; // MD5 de 'Monik2026@'

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ── Constructores ────────────────────────────────────────
    public Usuario() {}

    // ── Lifecycle ────────────────────────────────────────────
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Getters ──────────────────────────────────────────────
    public Integer getId()          { return id; }
    public String getNombres()      { return nombres; }
    public String getApellidos()    { return apellidos; }
    public String getCorreo()       { return correo; }
    public RolUsuario getRol()      { return rol; }
    public String getPassword()     { return password; }
    public Boolean getActivo()      { return activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // ── Setters ──────────────────────────────────────────────
    public void setId(Integer id)           { this.id = id; }
    public void setNombres(String nombres)  { this.nombres = nombres; }
    public void setApellidos(String a)      { this.apellidos = a; }
    public void setCorreo(String correo)    { this.correo = correo; }
    public void setRol(RolUsuario rol)      { this.rol = rol; }
    public void setPassword(String p)       { this.password = p; }
    public void setActivo(Boolean activo)   { this.activo = activo; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }

    // ── Campos transient ─────────────────────────────────────
    /** Obtiene las iniciales del usuario para el avatar */
    @Transient
    public String getIniciales() {
        String n = (nombres != null && !nombres.isEmpty()) ? String.valueOf(nombres.charAt(0)) : "";
        String a = (apellidos != null && !apellidos.isEmpty()) ? String.valueOf(apellidos.charAt(0)) : "";
        return (n + a).toUpperCase();
    }

    /** Nombre completo */
    @Transient
    public String getNombreCompleto() {
        return nombres + " " + apellidos;
    }

    /** Roles disponibles en el sistema notarial */
    public enum RolUsuario {
        Notario,
        Liquidador,
        Protocolista,

        @com.fasterxml.jackson.annotation.JsonProperty("Operador de Escáner")
        Operador_de_Escaner;

        @com.fasterxml.jackson.annotation.JsonValue
        public String toValue() {
            return this.name().replace('_', ' ');
        }

        @com.fasterxml.jackson.annotation.JsonCreator
        public static RolUsuario fromValue(String val) {
            return RolUsuario.valueOf(val.replace(' ', '_'));
        }
    }
}
