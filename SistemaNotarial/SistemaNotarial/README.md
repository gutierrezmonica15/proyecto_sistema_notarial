# Sistema Notarial — Java + Spring Boot + MySQL

Sistema de gestión notarial con módulos de **Boletas de Rentas**, **Escrituras** y **Usuarios**.

---

## 📋 Requisitos previos

Instala las siguientes herramientas antes de compilar el proyecto:

| Herramienta | Versión mínima | Descarga |
|-------------|----------------|----------|
| **Java JDK** | 17 | https://adoptium.net/ |
| **Apache Maven** | 3.9 | https://maven.apache.org/download.cgi |
| **MySQL Server** | 8.0 | https://dev.mysql.com/downloads/ |

### Verificar instalación
```powershell
java -version     # debe mostrar 17 o superior
mvn -version      # debe mostrar 3.x
mysql --version   # debe mostrar 8.x
```

---

## 🗄️ Configurar la base de datos

### 1. Crear la base de datos y las tablas

Abre MySQL Workbench o la terminal y ejecuta:

```bash
mysql -u root -p < src/main/resources/schema.sql
```

### 2. Insertar datos iniciales (opcional)

```bash
mysql -u root -p < src/main/resources/data.sql
```

---

## ⚙️ Configurar credenciales MySQL

Edita el archivo `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sistema_notarial?useSSL=false&serverTimezone=America/Bogota&allowPublicKeyRetrieval=true
spring.datasource.username=root       # ← tu usuario de MySQL
spring.datasource.password=root       # ← tu contraseña de MySQL
```

---

## 🚀 Compilar y ejecutar

Desde la carpeta `SistemaNotarial/`:

```bash
# Compilar
mvn clean compile

# Ejecutar (levanta Tomcat embebido en puerto 8080)
mvn spring-boot:run
```

Luego abre en el navegador: **http://localhost:8080**

---

## 🌐 API REST

La aplicación expone los siguientes endpoints:

### Boletas
| Método | URL | Descripción |
|--------|-----|-------------|
| `GET`  | `/api/boletas` | Listar todas |
| `GET`  | `/api/boletas?q=ESC-2025` | Buscar por número |
| `GET`  | `/api/boletas/resumen` | Estadísticas del dashboard |
| `POST` | `/api/boletas` | Crear nueva boleta |
| `PUT`  | `/api/boletas/{id}/pagar` | Marcar como pagada |

### Escrituras
| Método | URL | Descripción |
|--------|-----|-------------|
| `GET`  | `/api/escrituras` | Listar todas |
| `GET`  | `/api/escrituras/buscar?numero=&anio=&proto=&cedula=` | Búsqueda avanzada |
| `POST` | `/api/escrituras` | Radicar nueva escritura |
| `PUT`  | `/api/escrituras/{id}/estado` | Actualizar estado |

### Usuarios
| Método | URL | Descripción |
|--------|-----|-------------|
| `GET`  | `/api/usuarios` | Listar todos |
| `POST` | `/api/usuarios` | Crear usuario |
| `PUT`  | `/api/usuarios/{id}/toggle` | Activar/Desactivar |
| `GET`  | `/api/usuarios/{id}` | Obtener por ID |

---

## 🏗️ Estructura del proyecto

```
SistemaNotarial/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/notaria/sistema/
    │   │   ├── SistemaNotarialApp.java    ← Main
    │   │   ├── controller/               ← REST endpoints
    │   │   ├── service/                  ← Lógica de negocio
    │   │   ├── repository/               ← Acceso a datos (JPA)
    │   │   └── model/                    ← Entidades MySQL
    │   └── resources/
    │       ├── application.properties    ← Configuración
    │       ├── schema.sql                ← Crear tablas
    │       ├── data.sql                  ← Datos iniciales
    │       └── static/                   ← Frontend HTML/CSS/JS
    └── test/
        ├── java/.../SistemaNotarialAppTest.java
        └── resources/application-test.properties
```

---

## 🧪 Ejecutar tests

```bash
mvn test
```

Los tests usan H2 en memoria y **no requieren MySQL**.

---

## 📦 Generar JAR para producción

```bash
mvn clean package
java -jar target/sistema-notarial-1.0.0.jar
```
