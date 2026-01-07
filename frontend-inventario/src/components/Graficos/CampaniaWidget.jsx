import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCampaniasActivas } from '../../api/campaniaApi';
import { FaGift, FaClock, FaCalendarAlt, FaBullhorn, FaArrowRight } from 'react-icons/fa';
import { useTheme } from '@mui/material/styles';
import { CircularProgress } from '@mui/material';

export default function CampaniaWidget() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const navigate = useNavigate();

    const [campania, setCampania] = useState(null);
    const [tipo, setTipo] = useState(null); // 'activa' o 'proxima'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const seleccionarCampania = async () => {
            try {
                const todas = await getCampaniasActivas();
                const hoy = new Date();

                // 1. Buscar Campaña ACTIVA (Hoy está dentro del rango)
                const activa = todas.find(c => {
                    const inicio = new Date(c.fechaInicio);
                    const fin = new Date(c.fechaFin);
                    fin.setHours(23, 59, 59); // Asegurar que incluya todo el día final
                    return hoy >= inicio && hoy <= fin;
                });

                if (activa) {
                    setCampania(activa);
                    setTipo('activa');
                } else {
                    // 2. Buscar Campaña PRÓXIMA (Inicio es futuro)
                    const futuras = todas.filter(c => new Date(c.fechaInicio) > hoy);
                    // Ordenar: la más cercana primero
                    futuras.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));

                    if (futuras.length > 0) {
                        setCampania(futuras[0]);
                        setTipo('proxima');
                    }
                }
            } catch (error) {
                console.error("Error al cargar widget campaña:", error);
            } finally {
                setLoading(false);
            }
        };

        seleccionarCampania();
    }, []);

    // --- Helpers de Tiempo ---
    const getMensajeTiempo = () => {
        if (!campania) return "";
        const hoy = new Date();

        if (tipo === 'activa') {
            const fin = new Date(campania.fechaFin);
            fin.setHours(23, 59, 59);
            const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
            return diff === 0 ? "¡Termina hoy!" : `Termina en ${diff} días`;
        } else {
            const inicio = new Date(campania.fechaInicio);
            const diff = Math.ceil((inicio - hoy) / (1000 * 60 * 60 * 24));
            return `Inicia en ${diff} días`;
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '200px' }}>
            <CircularProgress size={30} />
        </div>
    );

    if (!campania) return (
        <div style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
            textAlign: 'center',
            color: '#94a3b8',
            border: '2px dashed #cbd5e1',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <FaCalendarAlt size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p>No hay campañas programadas</p>
        </div>
    );

    // Estilos dinámicos según tipo
    const esActiva = tipo === 'activa';
    const colorBadge = esActiva ? '#10b981' : '#f59e0b'; // Verde o Ambar
    const textoBadge = esActiva ? 'En Curso' : 'Próximamente';
    const iconoBadge = esActiva ? <FaGift /> : <FaBullhorn />;

    return (
        <div
            onClick={() => navigate(`/productos/campanias/${campania.id}`)}
            style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                color: 'white',
                cursor: 'pointer',
                height: '100%',
                minHeight: '220px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                backgroundImage: `url(${campania.imagenUrl}), linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Overlay Oscuro para legibilidad */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.2) 100%)',
                zIndex: 1
            }}></div>

            {/* Contenido */}
            <div style={{ position: 'relative', zIndex: 2, padding: '20px' }}>

                {/* Badge Superior */}
                <div style={{
                    position: 'absolute', top: '20px', left: '20px',
                    display: 'flex', justifyContent: 'space-between', width: 'calc(100% - 40px)'
                }}>
                    <span style={{
                        backgroundColor: colorBadge,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        {iconoBadge} {textoBadge}
                    </span>

                    <span style={{
                        backgroundColor: '#ef4444',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                    }}>
                        -{Math.round(campania.porcentajeDescuento * 100)}%
                    </span>
                </div>

                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    {campania.nombreCampania}
                </h3>

                <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', opacity: 0.9, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {campania.descripcion}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                        <FaClock style={{ color: esActiva ? '#fbbf24' : '#fff' }} />
                        <span style={{ fontWeight: 'bold' }}>{getMensajeTiempo()}</span>
                    </div>

                    <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.8 }}>
                        Ver detalles <FaArrowRight size={10} />
                    </span>
                </div>
            </div>
        </div>
    );
}