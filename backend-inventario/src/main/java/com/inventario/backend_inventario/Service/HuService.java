package com.inventario.backend_inventario.Service;

import java.util.List;
import com.inventario.backend_inventario.Dto.HuDto;
import com.inventario.backend_inventario.Model.Hu;

public interface HuService {
    Hu crearHu(HuDto huDto);
    List<Hu> listarHuDisponibles(Integer idAlmacen); 
    Hu actualizarHu(Long idHu, HuDto huDto);
    List<Hu> historialHu();
    Hu solicitarHu(Long idHu, HuDto huDto);
    Hu obtenerPorId(Long id);
    List<Hu> listarPorSedeDestino(Integer idSedeDestino);
    void eliminarHu(Long id);
}