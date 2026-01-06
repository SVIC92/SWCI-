package com.inventario.backend_inventario;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendInventarioApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendInventarioApplication.class, args);
	}

}
