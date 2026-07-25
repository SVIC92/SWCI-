package com.inventario.backend_inventario.Service;

import com.inventario.backend_inventario.Dto.GenerarConteoRequestDto;
import com.inventario.backend_inventario.Dto.HojaConteoResponseDto;
import com.inventario.backend_inventario.Dto.RegistrarConteoRequestDto;

import java.util.List;

public interface ConteoInventarioService {

    HojaConteoResponseDto generarHoja(GenerarConteoRequestDto dto, Integer usuarioId);

    HojaConteoResponseDto registrarConteo(Long hojaId, RegistrarConteoRequestDto dto, Integer usuarioId);

    List<HojaConteoResponseDto> listarTodas();

    List<HojaConteoResponseDto> listarPendientesAprobacion();

    List<HojaConteoResponseDto> listarHistorialAprobacion();

    HojaConteoResponseDto obtenerDetalle(Long hojaId);

    void aprobarHoja(Long hojaId, Integer usuarioId);

    void rechazarHoja(Long hojaId, String motivo, Integer usuarioId);
}
