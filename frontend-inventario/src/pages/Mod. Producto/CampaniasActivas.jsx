import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCampaniasActivas } from '../../api/campaniaApi';
// 1. Agregamos FaArrowLeft a los imports
import { FaGift, FaClock, FaCalendarAlt, FaBullhorn, FaTasks, FaArrowLeft } from 'react-icons/fa';
import '../../components/styles/CampaniaFestivas.css';
import { useTheme } from '@mui/material/styles';
import LayoutDashboard from '../../components/Layouts/LayoutDashboard';

export default function CampaniasActivas() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const [campanias, setCampanias] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        cargarCampanias();

        const intervalId = setInterval(() => setCampanias(prev => [...prev]), 60000);
        return () => clearInterval(intervalId);
    }, []);

    const cargarCampanias = async () => {
        setLoading(true);
        try {
            const data = await getCampaniasActivas();
            setCampanias(data);
        } catch (error) {
            console.error("Error cargando campañas activas:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDiasRestantes = (fechaFin) => {
        if (!fechaFin) return 0;
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
        if (diasRestantes === 0) return { clase: 'card-finished', texto: 'Finaliza hoy', icono: <FaClock /> };
        if (diasRestantes <= 3) return { clase: 'card-urgent', texto: '¡Termina pronto!', icono: <FaBullhorn /> };
        return { clase: 'card-active', texto: 'En Curso', icono: <FaGift /> };
    };

    return (
        <LayoutDashboard>
            <div className={`campanias-wrapper ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>

                <div className="header-section">
                    <div className="header-info">
                        <h3>🎁 Campañas Activas y Próximas</h3>
                        <p>Aprovecha las promociones y eventos vigentes.</p>
                    </div>

                    {/* 2. Contenedor de botones con el botón Volver */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className="btn-nueva-campania"
                            style={{ backgroundColor: '#6c757d', border: 'none' }}
                            onClick={() => navigate(-1)} // Navegar atrás
                        >
                            <FaArrowLeft /> Volver
                        </button>

                        <button
                            className="btn-nueva-campania"
                            onClick={() => navigate('/productos/campanias-festivas')}
                        >
                            <FaTasks /> Gestión de campañas
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
                        <p>Cargando campañas...</p>
                    </div>
                ) : campanias.length === 0 ? (
                    <div className="no-data">
                        <div className="empty-state-icon"><FaGift style={{ fontSize: '3rem', color: '#ccc' }} /></div>
                        <p>No hay campañas activas en este momento.</p>
                    </div>
                ) : (
                    <div className="cards-grid">
                        {campanias.map((campania) => {
                            const dias = getDiasRestantes(campania.fechaFin);
                            const estado = getEstadoVisual(campania.fechaInicio, campania.fechaFin);

                            return (
                                <div key={campania.id} className={`campania-card ${estado.clase}`} onClick={() => navigate(`/productos/campanias/${campania.id}`)} style={{ cursor: 'pointer' }}>

                                    <div className="card-image-header" style={{
                                        backgroundImage: `url(${campania.imagenUrl}), linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                                    }}>
                                        <div className="overlay-gradient"></div>
                                        <span className="badge-descuento">-{Math.round(campania.porcentajeDescuento * 100)}%</span>
                                    </div>

                                    <div className="card-content">
                                        <div className="status-row">
                                            <span className="badge-estado">{estado.icono} {estado.texto}</span>
                                        </div>
                                        <h4>{campania.nombreCampania}</h4>
                                        <p className="descripcion">{campania.descripcion}</p>

                                        <div className="meta-data">
                                            <div className="data-row">
                                                <FaCalendarAlt />
                                                <span>
                                                    {new Date(campania.fechaInicio).toLocaleDateString()} - {new Date(campania.fechaFin).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="data-row countdown-row">
                                                <FaClock className={dias <= 3 && dias > 0 ? "icon-pulse" : ""} />
                                                <span className="value-bold">
                                                    {dias === 0 ? 'Finaliza hoy' : `Quedan ${dias} días`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </LayoutDashboard>
    );
}