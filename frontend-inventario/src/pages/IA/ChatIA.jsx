import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Typography,
    Paper,
    Avatar,
    CircularProgress,
    Divider,
    useTheme
} from '@mui/material';
import {
    Send as SendIcon,
    SmartToy as BotIcon,
    DeleteOutline as ClearIcon
} from '@mui/icons-material';

// Importaciones para Markdown y resaltado de sintaxis
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // IMPORTANTE: Para tablas y listas avanzadas
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import LayoutDashboard from '../../components/Layouts/LayoutDashboard';
import { chatConGerente } from '../../api/iaApi';

const ChatIA = () => {
    const theme = useTheme();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "# 🤖 Panel de Control IA\n\nHola, soy el **Gerente Virtual**. Estoy listo para analizar tus inventarios.\n\n### 🚀 Comandos disponibles:\n- 🛒 *Analizar reabastecimiento*\n- 📊 *Ver movimientos recientes (Kardex)*\n- 🚚 *Consultar transferencias pendientes*\n- 🎉 *Consultar campañas activas*\n- 🏢 *Ver resumen de una Sede*\n- 📍 *¿Dónde hay stock de [Producto]?*\n- 💰 *Valor del inventario*\n- 📋 *Ficha técnica de [Producto]*",
            sender: 'bot'
        }
    ]);

    const messagesEndRef = useRef(null);

    // Auto-scroll al recibir mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);

        const messageToSend = input;
        setInput('');
        setIsLoading(true);

        try {
            const respuestaTexto = await chatConGerente(messageToSend);
            const botResponse = {
                id: Date.now() + 1,
                text: respuestaTexto,
                sender: 'bot'
            };
            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "⚠️ **Error de conexión**: No pude conectar con el cerebro de la IA. Por favor, verifica que el servidor Backend esté encendido.",
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

    const handleClearChat = () => {
        setMessages([{
            id: Date.now(),
            text: "🧹 **Chat limpiado**.\n\n¿En qué puedo ayudarte ahora?",
            sender: 'bot'
        }]);
    };

    return (
        <LayoutDashboard>
            <Paper
                elevation={3}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '85vh',
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : 'none'
                }}
            >
                {/* --- HEADER --- */}
                <Box sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'background.paper', color: 'primary.main', width: 45, height: 45 }}>
                            <BotIcon fontSize="medium" />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" color="inherit">
                                Gerente de Inventario IA
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }} color="inherit">
                                En línea | Powered by Llama 3
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={handleClearChat} sx={{ color: 'inherit' }} title="Limpiar chat">
                        <ClearIcon />
                    </IconButton>
                </Box>

                {/* --- ÁREA DE MENSAJES --- */}
                <Box sx={{
                    flex: 1,
                    p: 3,
                    overflowY: 'auto',
                    bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f0f2f5',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    {messages.map((msg) => (
                        <Box
                            key={msg.id}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                mb: 1
                            }}
                        >
                            {msg.sender === 'bot' && (
                                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, mr: 1, mt: 1 }}>
                                    <BotIcon fontSize="small" />
                                </Avatar>
                            )}

                            <Box
                                sx={{
                                    maxWidth: '80%',
                                    p: 2,
                                    borderRadius: 3,
                                    borderTopLeftRadius: msg.sender === 'bot' ? 0 : 3,
                                    borderTopRightRadius: msg.sender === 'user' ? 0 : 3,
                                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                                    boxShadow: 1,
                                    border: (theme.palette.mode === 'dark' && msg.sender === 'bot')
                                        ? '1px solid rgba(255,255,255,0.12)'
                                        : 'none',

                                    // --- ESTILOS MARKDOWN IMPORTANTES ---
                                    '& p': { m: 0, mb: 1, lineHeight: 1.6 },
                                    '& p:last-child': { mb: 0 },
                                    // Listas: aseguran que los bullets se vean
                                    '& ul, & ol': {
                                        pl: 3,
                                        mb: 1,
                                        listStylePosition: 'outside'
                                    },
                                    '& li': { mb: 0.5 },
                                    // Tablas: bordes y estructura
                                    '& table': {
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        mt: 1,
                                        mb: 1,
                                        fontSize: '0.9rem'
                                    },
                                    '& th, & td': {
                                        border: '1px solid',
                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
                                        padding: '8px',
                                        textAlign: 'left'
                                    },
                                    '& th': {
                                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                        fontWeight: 'bold'
                                    },
                                    // Código
                                    '& pre': { m: 0, p: 0, borderRadius: 2, overflow: 'hidden', mt: 1 },
                                    '& a': { color: 'inherit', textDecoration: 'underline' }
                                }}
                            >
                                {msg.sender === 'user' ? (
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                                ) : (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]} // Plugin para tablas
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
                                                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                                                        padding: '2px 5px',
                                                        borderRadius: '4px',
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.9em'
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

                    {isLoading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2, mt: 1 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                El Gerente está escribiendo...
                            </Typography>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* --- INPUT AREA --- */}
                <Divider />
                <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                        <TextField
                            fullWidth
                            placeholder="Escribe tu consulta... (Ej: ¿Dónde hay stock de paracetamol?)"
                            variant="outlined"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isLoading}
                            multiline
                            maxRows={4}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f8f9fa'
                                }
                            }}
                        />
                        <IconButton
                            color="primary"
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                width: 48,
                                height: 48,
                                mb: 0.5,
                                '&:hover': { bgcolor: 'primary.dark' },
                                '&.Mui-disabled': {
                                    bgcolor: theme.palette.action.disabledBackground,
                                    color: theme.palette.action.disabled
                                }
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center', fontSize: '0.7rem' }}>
                        IA con acceso a inventario, sedes, proveedores y campañas. Verifica los datos importantes.
                    </Typography>
                </Box>
            </Paper>
        </LayoutDashboard>
    );
};

export default ChatIA;