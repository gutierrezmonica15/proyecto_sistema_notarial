package com.notaria.sistema;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Test de contexto básico — verifica que la aplicación arranca correctamente.
 * Usa perfil "test" con H2 en memoria (no requiere MySQL).
 */
@SpringBootTest
@ActiveProfiles("test")
class SistemaNotarialAppTest {

    @Test
    void contextLoads() {
        // Si llega aquí, el contexto de Spring se cargó correctamente
    }
}
