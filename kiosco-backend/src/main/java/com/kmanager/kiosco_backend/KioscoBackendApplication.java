package com.kmanager.kiosco_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KioscoBackendApplication {

	/**
	 * Método main que inicia la aplicación.
	 *
	 * Cuando ejecutes esto:
	 * 1. Spring Boot inicia un servidor Tomcat embebido en el puerto 8080
	 * 2. Escanea todas las clases del paquete com.kiosco.kmanager
	 * 3. Registra automáticamente todos los @Controller, @Service, @Repository
	 * 4. Conecta con MySQL y crea/actualiza las tablas
	 * 5. Expone todos los endpoints REST
	 *
	 * Verás en la consola:
	 * "Started KManagerApplication in X seconds"
	 */
	public static void main(String[] args) {
		SpringApplication.run(KioscoBackendApplication.class, args);
	}

}
