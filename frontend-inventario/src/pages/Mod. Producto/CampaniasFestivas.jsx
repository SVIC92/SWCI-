import React, { useEffect, useState, useRef } from 'react';
import { getCampaniasActivas, guardarCampania, asignarProductosACampania/*, eliminarCampania */ } from '../../../api/campaniaApi';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Swal from 'sweetalert2';
import { FaGift, FaClock, FaCalendarAlt, FaBullhorn, FaPlus, FaEdit, FaTrash, FaImage } from 'react-icons/fa';
import './CampaniasFestivas.css';

export default function CampaniasFestivas() {
    const [campanias, setCampanias] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [todosLosProductos, setTodosLosProductos] = useState([]);
    const [busquedaProd, setBusquedaProd] = useState("");
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    // Estado para el formulario
    const [form, setForm] = useState({
        id: null,
        nombreCampania: '',
        descripcion: '',
        fechaInicio: '',
        fechaFin: '',
        porcentajeDescuento: 0.10,
        imagenUrl: ''
    });
    const cargarProductosInventario = async () => {
        try {
            const data = await getProductos();
            setTodosLosProductos(data);
        } catch (e) { console.error("Error cargando productos", e); }
    };

    const stompClientRef = useRef(null);

    useEffect(() => {
        cargarCampanias();
        cargarProductosInventario();
        conectarWebSocket();
        const intervalId = setInterval(() => setCampanias(prev => [...prev]), 60000);
        return () => {
            if (stompClientRef.current) stompClientRef.current.disconnect();
            clearInterval(intervalId);
        };
    }, []);

    // --- WebSocket y Carga de Datos (Igual que antes) ---
    const conectarWebSocket = () => {
        const socket = new SockJS("https://swci-backend.onrender.com/ws");
        const stompClient = Stomp.over(socket);
        stompClient.debug = () => { };
        stompClient.connect({}, () => {
            stompClientRef.current = stompClient;
            stompClient.subscribe('/topic/alertas', (mensaje) => {
                if (mensaje.body) {
                    Swal.fire({
                        title: '¡Atención Inventario!',
                        text: mensaje.body,
                        icon: 'warning',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 6000,
                        timerProgressBar: true
                    });
                    cargarCampanias();
                }
            });
        });
    };

    const cargarCampanias = async () => {
        try {
            const data = await getCampaniasActivas();
            setCampanias(data);
        } catch (error) {
            console.error("Error cargando campañas:", error);
        }
    };

    const abrirModal = (campania = null) => {
        if (campania) {
            setForm(campania);
            const idsPrevios = campania.productosAplicables
                ? campania.productosAplicables.map(p => p.id_producto) // CORREGIDO
                : [];
            setProductosSeleccionados(idsPrevios);
        } else {
            setForm({ id: null, nombreCampania: '', descripcion: '', fechaInicio: '', fechaFin: '', porcentajeDescuento: 0.10, imagenUrl: '' });
            setProductosSeleccionados([]);
        }
        setModalOpen(true);
    };
    const toggleProducto = (id) => {
        setProductosSeleccionados(prev => {
            if (prev.includes(id)) {
                return prev.filter(pId => pId !== id); // Quitar
            } else {
                return [...prev, id]; // Agregar
            }
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const campaniaGuardada = await guardarCampania(form);
            const idFinal = campaniaGuardada.id || form.id;

            if (idFinal) {
                await asignarProductosACampania(idFinal, productosSeleccionados);
            }

            Swal.fire('Éxito', 'Campaña y productos guardados', 'success');
            setModalOpen(false);
            cargarCampanias();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
        } finally {
            setLoading(false);
        }
    };

    /*const handleEliminar = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await eliminarCampania(id);
                Swal.fire('Eliminado', 'La campaña ha sido eliminada.', 'success');
                cargarCampanias();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar la campaña', 'error');
            }
        }
    };*/

    // --- Helpers Visuales ---
    const getDiasRestantes = (fechaFin) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59);
        const diffTime = fin - hoy;
        return diffTime < 0 ? 0 : Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getEstadoVisual = (fechaInicio, fechaFin) => {
        const hoy = new Date();
        const inicio = new Date(fechaInicio);
        const diasRestantes = getDiasRestantes(fechaFin);

        if (hoy < inicio) return { clase: 'card-future', texto: 'Próximamente', icono: <FaCalendarAlt /> };
        if (diasRestantes <= 3) return { clase: 'card-urgent', texto: '¡Termina pronto!', icono: <FaBullhorn /> };
        return { clase: 'card-active', texto: 'En Curso', icono: <FaGift /> };
    };

    return (
        <div className="campanias-wrapper">
            <div className="header-section">
                <div className="header-info">
                    <h3>🎉 Campañas Comerciales & Festividades</h3>
                    <p>Gestión y monitoreo de eventos promocionales.</p>
                </div>
                <button className="btn-nueva-campania" onClick={() => abrirModal()}>
                    <FaPlus /> Nueva Campaña
                </button>
            </div>

            {campanias.length === 0 ? (
                <div className="no-data"><p>No hay campañas registradas.</p></div>
            ) : (
                <div className="cards-grid">
                    {campanias.map((campania) => {
                        const dias = getDiasRestantes(campania.fechaFin);
                        const estado = getEstadoVisual(campania.fechaInicio, campania.fechaFin);

                        return (
                            <div key={campania.id} className={`campania-card ${estado.clase}`}>
                                {/* --- AQUI ESTA LA IMAGEN --- */}
                                <div className="card-image-header" style={{
                                    backgroundImage: `url(${campania.imagenUrl}), linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                                }}>
                                    <div className="overlay-gradient"></div>
                                    <span className="badge-descuento">-{Math.round(campania.porcentajeDescuento * 100)}%</span>
                                    <div className="card-actions-top">
                                        <button onClick={() => abrirModal(campania)} className="btn-icon"><FaEdit /></button>
                                        {/*<button onClick={() => handleEliminar(campania.id)} className="btn-icon btn-delete"><FaTrash /></button>*/}
                                    </div>
                                </div>

                                <div className="card-content">
                                    <div className="status-row">
                                        <span className="badge-estado">{estado.icono} {estado.texto}</span>
                                    </div>
                                    <h4>{campania.nombreCampania}</h4>
                                    <p className="descripcion">{campania.descripcion}</p>

                                    <div className="meta-data">
                                        <div className="data-row">
                                            <FaCalendarAlt /> <span>{new Date(campania.fechaInicio).toLocaleDateString()} - {new Date(campania.fechaFin).toLocaleDateString()}</span>
                                        </div>
                                        <div className="data-row countdown-row">
                                            <FaClock className={dias <= 3 ? "icon-pulse" : ""} />
                                            <span className="value-bold">{dias === 0 ? 'Finaliza hoy' : `Quedan ${dias} días`}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{form.id ? 'Editar Campaña' : 'Nueva Campaña'}</h2>
                            <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre de la Campaña</label>
                                <input type="text" name="nombre" value={form.nombreCampania} onChange={handleChange} required placeholder="Ej: Navidad 2025" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha Inicio</label>
                                    <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Fecha Fin</label>
                                    <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Descuento (0.1 = 10%)</label>
                                    <input type="number" step="0.01" min="0" max="1" name="porcentajeDescuento" value={form.porcentajeDescuento} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>URL de Imagen</label>
                                    <div className="input-with-icon">
                                        <FaImage />
                                        <input type="text" name="imagenUrl" value={form.imagenUrl} onChange={handleChange} placeholder="https://..." />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="3"></textarea>
                            </div>

                            <div className="form-group full-width">
                                <label>Seleccionar Productos para Descuento</label>
                                <div className="search-box-mini">
                                    <FaSearch />
                                    <input
                                        type="text"
                                        placeholder="Buscar producto..."
                                        value={busquedaProd}
                                        onChange={(e) => setBusquedaProd(e.target.value)}
                                    />
                                </div>
                                <div className="product-selector-container">
                                    {todosLosProductos
                                        .filter(p => p.nombre.toLowerCase().includes(busquedaProd.toLowerCase()))
                                        .map(prod => {
                                            const isSelected = productosSeleccionados.includes(prod.id_producto);
                                            return (
                                                <div
                                                    key={prod.id_producto} /* CORREGIDO: id -> id_producto */
                                                    className={`product-item ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => toggleProducto(prod.id_producto)} /* CORREGIDO */
                                                >
                                                    <div className="check-icon">
                                                        {isSelected ? <FaCheckSquare /> : <FaSquare />}
                                                    </div>
                                                    <div className="prod-info">
                                                        <span className="prod-name">{prod.nombre}</span>
                                                        <span className="prod-marca">Marca: {prod.marca}</span>
                                                    </div>
                                                    <div className="prod-price">
                                                        {/* CORREGIDO: precio -> precio_venta */}
                                                        S/ {prod.precio_venta}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                                <p className="selection-count">{productosSeleccionados.length} productos seleccionados</p>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Campaña'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}