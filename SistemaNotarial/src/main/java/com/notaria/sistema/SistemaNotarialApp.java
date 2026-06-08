package com.notaria.sistema;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada del Sistema Notarial.
 * Levanta el servidor embebido Tomcat en el puerto 8080.
 * Acceder desde el navegador: http://localhost:8080
 */
@SpringBootApplication
public class SistemaNotarialApp {

    public static void main(String[] args) {
        SpringApplication.run(SistemaNotarialApp.class, args);
    }
}
