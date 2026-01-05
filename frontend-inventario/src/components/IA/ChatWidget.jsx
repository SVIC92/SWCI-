import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Typography,
    Paper,
    Fab,
    Avatar,
    CircularProgress,
    Collapse,
    useTheme // 1. Importamos el hook del tema
} from '@mui/material';
import {
    Send as SendIcon,
    Close as CloseIcon,
    Chat as ChatIcon,
    SmartToy as BotIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// Usamos un estilo que se vea bien en ambos modos
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatWidget = () => {
    const theme = useTheme(); // 2. Accedemos a las variables del tema (colores)
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estado de mensajes inicial
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "¡Hola! Soy tu asistente de inventarios virtual. \n\nPuedo responder preguntas sobre inventarios y escribir código. Ej: *'Escribe un Hello World en Java'*.",
            sender: 'bot'
        }
    ]);

    // Referencia para el auto-scroll
    const messagesEndRef = useRef(null);

    // Efecto para bajar el scroll cuando hay mensajes nuevos
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isLoading]);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);

        const messageToSend = input; // Guardamos el texto
        setInput('');
        setIsLoading(true);

        // Ajuste de URL para local o producción
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const API_URL = isLocal ? "http://localhost:8080" : "https://swci-backend.onrender.com";

        try {
            const response = await fetch(`${API_URL}/api/chat-gerente`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: messageToSend,
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const dataText = await response.text();

            const botResponse = {
                id: Date.now() + 1,
                text: dataText,
                sender: 'bot'
            };

            setMessages((prev) => [...prev, botResponse]);

        } catch (error) {
            console.error("Error enviando mensaje:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "⚠️ Error de conexión. Verifica que el servidor en Render esté activo (puede tardar unos segundos en despertar).",
                sender: 'bot'
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
            {/* Ventana del Chat con animación Collapse */}
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Paper
                    elevation={6}
                    sx={{
                        width: 350,
                        height: 500,
                        mb: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderRadius: 3,
                        // 3. Bordes y Fondos adaptables
                        border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e0e0e0',
                        bgcolor: 'background.paper'
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: 'background.paper', color: 'primary.main', width: 32, height: 32 }}>
                                <BotIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="bold" color="inherit">
                                Asistente IA
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={handleToggle} sx={{ color: 'inherit' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Lista de Mensajes */}
                    <Box
                        sx={{
                            flex: 1,
                            p: 2,
                            overflowY: 'auto',
                            // 4. Fondo grisáceo en claro, oscuro en dark mode
                            bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f5f5',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2
                        }}
                    >
                        {messages.map((msg) => (
                            <Box
                                key={msg.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                }}
                            >
                                <Box
                                    sx={{
                                        maxWidth: '85%',
                                        p: 1.5,
                                        borderRadius: 2,
                                        // 5. Colores de burbujas dinámicos
                                        bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                                        color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                                        boxShadow: 1,
                                        // Borde sutil para el bot en modo oscuro
                                        border: (theme.palette.mode === 'dark' && msg.sender === 'bot')
                                            ? '1px solid rgba(255,255,255,0.12)'
                                            : 'none',

                                        // Estilos específicos para el renderizado de Markdown
                                        '& p': { m: 0 },
                                        '& pre': { m: 0, p: 0, borderRadius: 1, overflow: 'hidden', mt: 1 }
                                    }}
                                >
                                    {msg.sender === 'user' ? (
                                        <Typography variant="body2">{msg.text}</Typography>
                                    ) : (
                                        // Renderizador de Markdown para el Bot
                                        <ReactMarkdown
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <SyntaxHighlighter
                                                            style={vscDarkPlus}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={className} {...props} style={{
                                                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                                            padding: '2px 4px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    )}
                                </Box>
                            </Box>
                        ))}

                        {/* Indicador de "Escribiendo..." */}
                        {isLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                                    <CircularProgress size={20} />
                                </Box>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Área de Input */}
                    <Box sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderTop: `1px solid ${theme.palette.divider}`
                    }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Escribe tu consulta..."
                                variant="outlined"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={isLoading}
                                multiline
                                maxRows={3}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        // Fondo del input adaptable
                                        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'white'
                                    }
                                }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                sx={{
                                    bgcolor: 'primary.light',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.main' },
                                    width: 40,
                                    height: 40,
                                    // Deshabilitado visualmente correcto en dark mode
                                    '&.Mui-disabled': {
                                        bgcolor: theme.palette.action.disabledBackground,
                                        color: theme.palette.action.disabled
                                    }
                                }}
                            >
                                <SendIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>
                </Paper>
            </Collapse>

            {/* Botón Flotante para abrir/cerrar */}
            <Fab
                color="primary"
                aria-label="chat"
                onClick={handleToggle}
                sx={{ float: 'right', mb: 10 }}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </Fab>
        </Box>
    );
};

export default ChatWidget;