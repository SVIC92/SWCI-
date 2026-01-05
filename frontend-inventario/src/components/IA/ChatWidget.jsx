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
    Collapse
} from '@mui/material';
import {
    Send as SendIcon,
    Close as CloseIcon,
    Chat as ChatIcon,
    SmartToy as BotIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Estado de mensajes inicial
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "¡Hola! Soy tu asistente virtual. \n\nPuedo responder preguntas y escribir código. Ej: *'Escribe un Hello World en Java'*.",
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
        const API_URL = "https://swci-backend.onrender.com" || 'http://localhost:8080';

        try {
            const response = await fetch(`${API_URL}/api/chat-gerente`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain', // Importante: enviamos texto plano
                },
                body: messageToSend, // Enviamos el string directo
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            // 3. Leer respuesta como TEXTO (no JSON)
            const dataText = await response.text();

            const botResponse = {
                id: Date.now() + 1,
                text: dataText, // La IA devuelve texto markdown directo
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
                        border: '1px solid #e0e0e0'
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 32, height: 32 }}>
                                <BotIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Asistente IA
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={handleToggle} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Lista de Mensajes */}
                    <Box
                        sx={{
                            flex: 1,
                            p: 2,
                            overflowY: 'auto',
                            bgcolor: '#f5f5f5',
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
                                        bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                                        color: msg.sender === 'user' ? 'white' : 'text.primary',
                                        boxShadow: 1,
                                        // Estilos específicos para el renderizado de Markdown
                                        '& p': { m: 0 },
                                        '& pre': { m: 0, p: 0, borderRadius: 1, overflow: 'hidden' }
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
                                                            style={materialDark}
                                                            language={match[1]}
                                                            PreTag="div"
                                                            {...props}
                                                        >
                                                            {String(children).replace(/\n$/, '')}
                                                        </SyntaxHighlighter>
                                                    ) : (
                                                        <code className={className} {...props} style={{ backgroundColor: '#eee', padding: '2px 4px', borderRadius: '4px' }}>
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
                                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                                    <CircularProgress size={20} />
                                </Box>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Área de Input */}
                    <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #eee' }}>
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
                                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                sx={{ bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' }, width: 40, height: 40 }}
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
                sx={{ float: 'right' }}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </Fab>
        </Box>
    );
};

export default ChatWidget;