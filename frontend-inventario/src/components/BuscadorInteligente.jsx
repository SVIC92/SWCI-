import React, { useState, useEffect, useRef } from 'react';
import { searchProductos } from '../api/productoApi';
import { useNavigate } from 'react-router-dom';
import {
    Paper, InputBase, IconButton, List, ListItem, ListItemButton, // Importar ListItemButton
    ListItemText, ListItemAvatar, Avatar, Typography, Divider, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory2';

const BuscadorInteligente = () => {
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const navigate = useNavigate();
    const wrapperRef = useRef(null);

    useEffect(() => {
        const timerId = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const data = await searchProductos(query);
                    setResultados(data);
                    setMostrarResultados(true);
                } catch (error) {
                    console.error("Error en búsqueda inteligente:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResultados([]);
                setMostrarResultados(false);
            }
        }, 300);

        return () => clearTimeout(timerId);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMostrarResultados(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelectProducto = (id) => {
        console.log("Producto seleccionado:", id);
        setMostrarResultados(false);
        setQuery('');
        navigate(`/productos/detalle/${id}`);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Paper
                component="form"
                sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    // OPTIMIZACIÓN TEMA OSCURO:
                    bgcolor: 'background.paper', // Fondo adaptable
                    color: 'text.primary',       // Texto adaptable
                    border: '1px solid',         // Borde sutil para contraste
                    borderColor: 'divider',      // Color de borde del tema
                    boxShadow: 0                 // (Opcional) Estilo más plano y limpio
                }}
            >
                <InputBase
                    sx={{ ml: 1, flex: 1, color: 'inherit' }} // Hereda color de texto
                    placeholder="Buscar producto (ej. 'laptp')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setMostrarResultados(true)}
                />
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                    {loading ? <CircularProgress size={20} /> : <SearchIcon />}
                </IconButton>
            </Paper>

            {mostrarResultados && resultados.length > 0 && (
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        mt: 1,
                        maxHeight: '300px',
                        overflow: 'auto',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                    elevation={3}
                >
                    <List dense sx={{ p: 0 }}>
                        {resultados.map((prod) => (
                            <React.Fragment key={prod.id_producto}>
                                <ListItem disablePadding>
                                    {/* USO DE ListItemButton PARA HOVER CORRECTO EN DARK MODE */}
                                    <ListItemButton onClick={() => handleSelectProducto(prod.id_producto)}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                <InventoryIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={prod.nombre}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {prod.sku}
                                                    </Typography>
                                                    {` — ${prod.marca}`}
                                                </>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            {mostrarResultados && resultados.length === 0 && query.length >= 3 && !loading && (
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        mt: 1,
                        p: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Typography variant="body2" color="text.secondary" align="center">
                        No se encontraron sugerencias.
                    </Typography>
                </Paper>
            )}
        </div>
    );
};

export default BuscadorInteligente;