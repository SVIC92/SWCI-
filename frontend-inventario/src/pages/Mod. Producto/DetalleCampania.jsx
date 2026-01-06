import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerCampaniaPorId } from '../../api/campaniaApi';
import LayoutDashboard from '../../components/Layouts/LayoutDashboard';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaTag, FaPercent } from 'react-icons/fa';
import { useTheme } from '@mui/material/styles';
import '../../components/styles/CampaniaFestivas.css';

export default function DetalleCampania() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const [campania, setCampania] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                const data = await obtenerCampaniaPorId(id);
                setCampania(data);
            } catch (error) {
                console.error("Error al cargar detalle", error);
            } finally {
                setLoading(false);
            }
        };
        cargarDetalle();
    }, [id]);

    // Helpers visuales
    const getDiasRestantes = (fechaFin) => {
        if (!fechaFin) return 0;
        const hoy = new Date();
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59);
        const diffTime = fin - hoy;
        return diffTime < 0 ? 0 : Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const calcularDescuento = (precio) => {
        const descuento = campania?.porcentajeDescuento || 0;
        return (precio - (precio * descuento)).toFixed(2);
    };

    if (loading) return <LayoutDashboard><div className="loading-container"><p>Cargando detalles...</p></div></LayoutDashboard>;
    if (!campania) return <LayoutDashboard><div className="no-data"><p>Campaña no encontrada</p></div></LayoutDashboard>;

    const dias = getDiasRestantes(campania.fechaFin);
    const productos = campania.productosAplicables || [];

    return (
        <LayoutDashboard>
            <div className={`campanias-wrapper ${isDarkMode ? 'theme-dark' : 'theme-light'}`} style={{ paddingBottom: '50px' }}>

                {/* --- HEADER CON IMAGEN GRANDE --- */}
                <div className="detalle-header" style={{
                    position: 'relative',
                    height: '350px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: '30px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    backgroundImage: `url(${campania.imagenUrl}), linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                    <div className="overlay-gradient" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}></div>

                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            position: 'absolute', top: '20px', left: '20px',
                            padding: '10px 20px', borderRadius: '30px', border: 'none',
                            cursor: 'pointer', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                            color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', zIndex: 10
                        }}
                    >
                        <FaArrowLeft /> Volver
                    </button>

                    <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        <span style={{ backgroundColor: '#ff4757', padding: '6px 14px', borderRadius: '20px', fontSize: '1rem', fontWeight: 'bold', marginBottom: '15px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <FaPercent /> Descuento Global: {Math.round(campania.porcentajeDescuento * 100)}%
                        </span>
                        <h1 style={{ fontSize: '3rem', margin: '10px 0', fontWeight: '800' }}>{campania.nombreCampania}</h1>
                        <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '800px', lineHeight: '1.5' }}>{campania.descripcion}</p>

                        <div style={{ display: 'flex', gap: '25px', marginTop: '20px', fontSize: '1rem', fontWeight: '500' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaCalendarAlt /> {new Date(campania.fechaInicio).toLocaleDateString()} - {new Date(campania.fechaFin).toLocaleDateString()}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: dias <= 3 ? '#ff6b81' : '#fff' }}><FaClock /> {dias === 0 ? 'Finaliza hoy' : `Quedan ${dias} días`}</span>
                        </div>
                    </div>
                </div>

                {/* --- LISTA DE PRODUCTOS --- */}
                <div className="detalle-body">
                    <h2 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem', color: isDarkMode ? '#fff' : '#333' }}>
                        <FaTag style={{ color: '#667eea' }} /> Productos en Oferta
                        <span style={{ fontSize: '1rem', backgroundColor: isDarkMode ? '#333' : '#e0e0e0', padding: '2px 10px', borderRadius: '12px', color: isDarkMode ? '#ccc' : '#666' }}>{productos.length}</span>
                    </h2>

                    {productos.length === 0 ? (
                        <div className="no-data"><p>Esta campaña aún no tiene productos asignados.</p></div>
                    ) : (
                        <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                            {productos.map(prod => (
                                <div key={prod.id_producto} className="campania-card" style={{ height: 'auto', minHeight: 'auto', borderLeft: '4px solid #667eea' }}>
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888' }}>{prod.marca}</span>
                                            {/* Badge de Ahorro */}
                                            <span style={{ fontSize: '0.8rem', backgroundColor: '#d1fae5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                                                -{Math.round(campania.porcentajeDescuento * 100)}% OFF
                                            </span>
                                        </div>

                                        <h4 style={{ margin: '5px 0', fontSize: '1.1rem', flexGrow: 1 }}>{prod.nombre}</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>Stock: {prod.stock}</p>

                                        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: isDarkMode ? '1px solid #444' : '1px solid #eee' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                    S/ {prod.precio_venta}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e11d48' }}>
                                                        S/ {calcularDescuento(prod.precio_venta)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </LayoutDashboard>
    );
}