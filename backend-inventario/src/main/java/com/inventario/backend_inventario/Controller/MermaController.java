package com.inventario.backend_inventario.Controller;

import com.inventario.backend_inventario.Dto.MermaRequestDto;
import com.inventario.backend_inventario.Model.Merma;
import com.inventario.backend_inventario.Service.MermaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mermas")
@CrossOrigin(origins = "*") // Permite la comunicación con el puerto de Vite/React
public class MermaController {

    @Autowired
    private MermaService mermaService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarMerma(@RequestBody MermaRequestDto request) {
        try {
            Merma nuevaMerma = mermaService.registrarMerma(request);
            return new ResponseEntity<>(nuevaMerma, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // Retorna el mensaje exacto de error (ej: "Stock insuficiente") para capturarlo en el frontend
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}