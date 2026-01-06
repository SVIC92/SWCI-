package com.inventario.backend_inventario.Service.Impl;

import java.util.List;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.inventario.backend_inventario.Dto.HistorialActividadDto;
import com.inventario.backend_inventario.Model.HistorialActividad;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.HistorialActividadRepository;
import com.inventario.backend_inventario.Service.HistorialActividadService;

@Service
public class HistorialActividadServiceImpl implements HistorialActividadService {
    @Autowired
    private HistorialActividadRepository historialActividadRepository;
    @Autowired
    private HttpServletRequest request;

    @Override
    public void registrarActividad(Usuario usuario, String tipoAccion, String descripcion , String modulo, String entidadAfectada, Long idEntidad, String detallesCambios) {
        HistorialActividad actividad = new HistorialActividad();
        actividad.setUsuario(usuario);
        actividad.setTipoAccion(tipoAccion); 
        actividad.setDescripcion(descripcion);
        actividad.setModulo(modulo);
        actividad.setEntidadAfectada(entidadAfectada);
        actividad.setIdEntidad(idEntidad);
        actividad.setDetallesCambios(detallesCambios);
        try {
            if (request != null) {
                String xForwardedForHeader = request.getHeader("X-Forwarded-For");
                if (xForwardedForHeader != null && !xForwardedForHeader.isEmpty()) {
                    actividad.setIpDireccion(xForwardedForHeader.split(",")[0]);
                } else {
                    actividad.setIpDireccion(request.getRemoteAddr());
                }
            }
        } catch (Exception e) {
            actividad.setIpDireccion("SISTEMA");
        }
        historialActividadRepository.save(actividad);
    }
    @Override
    public List<HistorialActividadDto> getRecentActivitiesDto() {
        List<HistorialActividad> actividades = historialActividadRepository.findTop10ByOrderByFechaHoraDesc();

        return actividades.stream().map(act -> {
        Usuario usuario = act.getUsuario();
        String nombreCompleto = (usuario.getNombre_u() != null ? usuario.getNombre_u() : "") +
                              (usuario.getApellido_pat() != null ? " " + usuario.getApellido_pat() : "") +
                              (usuario.getApellido_mat() != null ? " " + usuario.getApellido_mat() : "");

        return new HistorialActividadDto(
                act.getId(),
                act.getTipoAccion(),
                act.getDescripcion(),
                act.getFechaHora(),
                nombreCompleto.trim(),
                usuario.getRol().getNombreRol().trim(),
                act.getModulo(),
                act.getEntidadAfectada(),
                act.getIdEntidad(),
                act.getIpDireccion(),
                act.getDetallesCambios()
        );
    }).collect(Collectors.toList());
    }
}
