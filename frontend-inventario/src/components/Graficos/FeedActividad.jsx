import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHistorialActividad } from '../../api/historialActividadApi';
import './css/FeedActividad.css'; 
import { FaUserCircle, FaClock, FaTag } from 'react-icons/fa';
const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

const FeedActividad = () => {
    const { 
        data: actividadesData, 
        isLoading,
        isError, 
        error 
    } = useQuery({
        queryKey: ['historialActividad'],
        queryFn: getHistorialActividad,
        staleTime: 1000 * 60 * 5, 
    });
    const actividades = actividadesData || [];

    const formatRelativeTime = (fecha) => {
        if (!fecha) return '';

        const now = new Date();
        const fechaUTC = fecha.endsWith('Z') ? fecha : fecha + 'Z';
        const activityDate = new Date(fechaUTC);
        const diffInSeconds = Math.floor((now - activityDate) / 1000);
        if (diffInSeconds < 0) return 'hace unos instantes';
        if (diffInSeconds < 60) return `hace ${diffInSeconds} seg`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `hace ${diffInHours} h`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `hace ${diffInDays} d`;
    };

    if (isLoading) {
        return <div className="feed-container">Cargando actividades...</div>;
    }

    if (isError) {
        return <div className="feed-container">Error: {error.message}</div>;
    }

    return (
        <div className="feed-container">
            <h3>Actividad Reciente</h3>
            <ul className="feed-list">
                {actividades.length > 0 ? (
                    actividades.map(act => (
                        <li key={act.id} className="feed-item">
                            <div className="feed-item-header">
                                <span className="feed-user">
                                    <FaUserCircle /> {act.nombreUsuario || 'Usuario'}
                                </span>
                                <span className="feed-time">
                                    <FaClock /> {formatRelativeTime(act.fechaHora)}
                                </span>
                            </div>
                            <p className="feed-description">{act.descripcion}</p>
                            <div className="feed-item-footer">
                                <span className={`feed-action-type feed-action-${act.tipoAccion?.toLowerCase()}`}>
                                    <FaTag /> {capitalize(act.tipoAccion)}
                                </span>
                            </div>
                        </li>
                    ))
                ) : (
                    <p>No hay actividad reciente.</p>
                )}
            </ul>
        </div>
    );
};

export default FeedActividad;