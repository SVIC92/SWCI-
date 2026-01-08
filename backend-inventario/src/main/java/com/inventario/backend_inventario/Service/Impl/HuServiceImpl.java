package com.inventario.backend_inventario.Service.Impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;

import com.inventario.backend_inventario.Dto.DetalleHuItemDto;
import com.inventario.backend_inventario.Dto.HuDto;
import com.inventario.backend_inventario.Enum.EstadoHu;
import com.inventario.backend_inventario.Model.DetalleHu;
import com.inventario.backend_inventario.Model.Hu;
import com.inventario.backend_inventario.Model.Producto;
import com.inventario.backend_inventario.Model.Sede;
import com.inventario.backend_inventario.Model.Usuario;
import com.inventario.backend_inventario.Repository.DetalleHuRepository;
import com.inventario.backend_inventario.Repository.HuRepository;
import com.inventario.backend_inventario.Repository.ProductoRepository;
import com.inventario.backend_inventario.Repository.SedeRepository;
import com.inventario.backend_inventario.Repository.UsuarioRepository;
import com.inventario.backend_inventario.Service.HistorialActividadService;
import com.inventario.backend_inventario.Service.HuService;

import jakarta.persistence.EntityNotFoundException;

@Service
public class HuServiceImpl implements HuService {

    @Autowired
    private HuRepository huRepository;
    @Autowired
    private DetalleHuRepository detalleHuRepository;
    @Autowired
    private SedeRepository sedeRepository;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private HistorialActividadService historialActividadService;

    private String generarSiguienteCodigo() {
        int year = java.time.Year.now().getValue();
        String pattern = "HU-" + year + "-%";
        java.util.Optional<String> ultimoCodigo = huRepository.findUltimoCodigo(pattern);

        if (ultimoCodigo.isPresent()) {
            String codigo = ultimoCodigo.get();
            String[] partes = codigo.split("-");
            int correlativo = Integer.parseInt(partes[2]);
            return String.format("HU-%d-%03d", year, correlativo + 1);
        } else {
            return String.format("HU-%d-001", year);
        }
    }

    @Override
    @Transactional
    public Hu crearHu(HuDto huDto) {
        Sede almacen = sedeRepository.findById(huDto.getIdAlmacen().intValue())
                .orElseThrow(() -> new EntityNotFoundException("Almacén no encontrado"));

        Hu hu = new Hu();
        hu.setCodHu(generarSiguienteCodigo());

        hu.setAlmacen(almacen);
        hu.setTipoIndicador(huDto.getTipoIndicador());
        hu.setFechaSolicitada(huDto.getFechaSolicitada());
        hu.setFechaVencimiento(huDto.getFechaVencimiento());
        hu.setEstado(EstadoHu.EN_CONSTRUCCION);

        Hu huGuardada = huRepository.save(hu);
        if (huDto.getDetalles() != null && !huDto.getDetalles().isEmpty()) {
            agregarProductosAHu(huGuardada, huDto.getDetalles());
        }

        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                    .getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Creó el HU: '" + hu.getCodHu();

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "CREACIÓN", descripcion, "INVENTARIO", "HU", hu.getId(),
                        "HU creada con código: " + hu.getCodHu());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
        return huGuardada;
    }

    @Override
    @Transactional
    public Hu actualizarHu(Long idHu, HuDto huDto) {
        Hu hu = huRepository.findById(idHu)
                .orElseThrow(() -> new EntityNotFoundException("HU no encontrada"));

        StringBuilder cambios = new StringBuilder("Actualizó HU: ");
        if (huDto.getEstado() != null) {
            EstadoHu nuevoEstado;
            try {
                nuevoEstado = EstadoHu.valueOf(huDto.getEstado());
                if (!hu.getEstado().equals(nuevoEstado)) {
                    cambios.append("Estado de ").append(hu.getEstado()).append(" a ").append(nuevoEstado).append(". ");
                    hu.setEstado(nuevoEstado);
                }
            } catch (IllegalArgumentException e) {

            }
        }
        if (huDto.getTipoIndicador() != null)
            hu.setTipoIndicador(huDto.getTipoIndicador());
        if (huDto.getFechaSolicitada() != null)
            hu.setFechaSolicitada(huDto.getFechaSolicitada());

        if (huDto.getDetalles() != null && !huDto.getDetalles().isEmpty()) {
            agregarProductosAHu(hu, huDto.getDetalles());
            cambios.append("Se añadieron nuevos productos.");
        }

        Hu huActualizada = huRepository.save(hu);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                    .getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Actualizó el HU: '" + hu.getCodHu();

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ACTUALIZACIÓN", descripcion, "INVENTARIO", "HU",
                        hu.getId(), cambios.toString());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }

        return huActualizada;
    }

    private void agregarProductosAHu(Hu hu, List<DetalleHuItemDto> nuevosDetalles) {
        List<DetalleHu> detallesActuales = hu.getDetalle();
        if (detallesActuales == null) {
            detallesActuales = new ArrayList<>();
            hu.setDetalle(detallesActuales);
        }
        Map<Long, Integer> mapaNuevos = nuevosDetalles.stream()
                .collect(Collectors.toMap(DetalleHuItemDto::getIdProducto, DetalleHuItemDto::getCantidad));
        Iterator<DetalleHu> iterator = detallesActuales.iterator();
        while (iterator.hasNext()) {
            DetalleHu detalleExistente = iterator.next();
            Long idProdExistente = detalleExistente.getProducto().getId_producto();

            if (mapaNuevos.containsKey(idProdExistente)) {
                // A) EXISTE EN AMBOS: Actualizamos la cantidad (NO SUMAMOS, REEMPLAZAMOS)
                Integer nuevaCantidad = mapaNuevos.get(idProdExistente);
                detalleExistente.setCantidad(nuevaCantidad);

                // Quitamos del mapa para saber que este ya lo procesamos
                mapaNuevos.remove(idProdExistente);
            } else {
                detalleHuRepository.delete(detalleExistente); // Borrar de DB explícitamente si es necesario
                iterator.remove(); // Borrar de la lista en memoria
            }
        }

        // 3. INSERTAR LOS NUEVOS
        // Los que quedaron en el mapa son productos nuevos que no existían en la HU
        for (Map.Entry<Long, Integer> entry : mapaNuevos.entrySet()) {
            Long idProducto = entry.getKey();
            Integer cantidad = entry.getValue();

            Producto prod = productoRepository.findById(idProducto)
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado"));

            DetalleHu nuevoDetalle = new DetalleHu();
            nuevoDetalle.setHu(hu);
            nuevoDetalle.setProducto(prod);
            nuevoDetalle.setCantidad(cantidad); // Asignamos la cantidad directa

            detallesActuales.add(nuevoDetalle);
        }

        // Al tener CascadeType.ALL en la entidad Hu, al guardar la Hu se guardan los
        // cambios en detalles
        // Pero si quieres asegurar, puedes guardar los nuevos.
        detalleHuRepository.saveAll(detallesActuales);
    }

    @Override
    public List<Hu> listarHuDisponibles(Integer idAlmacen) {
        List<EstadoHu> estadosVisibles = Arrays.asList(
                EstadoHu.EN_CONSTRUCCION,
                EstadoHu.COMPLETO,
                EstadoHu.QUIEBRE);

        if (idAlmacen != null) {
            Sede almacen = sedeRepository.findById(idAlmacen.intValue()).orElse(null);
            if (almacen != null) {
                return huRepository.findByAlmacenAndEstadoIn(almacen, estadosVisibles);
            }
        }
        return huRepository.findByEstadoIn(estadosVisibles);
    }

    @Override
    public List<Hu> historialHu() {
        return huRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @Override
    @Transactional
    public Hu solicitarHu(Long idHu, HuDto huDto) {
        Hu hu = huRepository.findById(idHu)
                .orElseThrow(() -> new EntityNotFoundException("HU no encontrada"));

        if (hu.getEstado() == EstadoHu.COMPLETO || hu.getEstado() == EstadoHu.QUIEBRE) {
            throw new IllegalStateException(
                    "La HU no está en un estado válido para ser solicitada, espere hasta que esté COMPLETO o QUIEBRE (Estado actual: "
                            + hu.getEstado() + ")");
        }
        if (huDto.getIdSedeDestino() == null) {
            throw new IllegalArgumentException("Debe indicar la Sede de Destino.");
        }

        Sede sedeDestino = sedeRepository.findById(huDto.getIdSedeDestino())
                .orElseThrow(() -> new EntityNotFoundException("Sede destino no encontrada"));
        hu.setSedeDestino(sedeDestino);
        if (huDto.getFechaSolicitada() != null) {
            hu.setFechaSolicitada(huDto.getFechaSolicitada());
        }

        hu.setEstado(EstadoHu.SOLICITADO);

        Hu huActualizada = huRepository.save(hu);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                    .getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Solicito el HU: '" + hu.getCodHu();

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "SOLICITUD", descripcion, "INVENTARIO", "HU",
                        hu.getId(), "HU solicitada con código: " + hu.getCodHu());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }

        return huActualizada;
    }

    @Override
    public Hu obtenerPorId(Long id) {
        return huRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("HU no encontrada"));
    }

    @Override
    public List<Hu> listarPorSedeDestino(Integer idSedeDestino) {
        Sede destino = sedeRepository.findById(idSedeDestino.intValue()).orElse(null);
        return (destino == null) ? new ArrayList<>() : huRepository.findBySedeDestino(destino);
    }

    @Override
    @Transactional
    public void eliminarHu(Long id) {
        Hu hu = obtenerPorId(id);
        huRepository.delete(hu);
        try {
            String emailUsuario = ((UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                    .getUsername();
            Optional<Usuario> usuarioActual = usuarioRepository.findByEmail(emailUsuario);

            String descripcion = "Elimino el HU: '" + hu.getCodHu();

            usuarioActual.ifPresent(u -> {
                historialActividadService.registrarActividad(u, "ELIMINACIÓN", descripcion, "INVENTARIO", "HU",
                        hu.getId(), "HU eliminada con código: " + hu.getCodHu());
            });

        } catch (Exception e) {
            System.err.println("Error al registrar actividad: " + e.getMessage());
        }
    }
}