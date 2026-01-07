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
import ReactMarkdown from 'react-markdown';
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
            text: "# Panel de Control IA \n\nHola, soy el Gerente Virtual. Estoy listo para analizar tus inventarios a pantalla completa. \n\nPrueba comandos como: \n- *Analizar reabastecimiento* \n- *Ver movimientos recientes de un producto* \n- *Ver datos de proveedor especifico* \n- *Ver valor de inventario de un producto* \n- *Ver el stock de un producto en todas las sedes* \n- *Ver resumen de una Sede* \n- *Ver detalle de un producto* \n- *Consultar transferencias pendientes* \n- *Consultar Campaña activa*",
            sender: 'bot'
        }
    ]);

    const messagesEndRef = useRef(null);
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
                text: "⚠️ **Error de conexión**: No pude comunicarme con el servidor.",
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
            text: "Chat limpio. ¿En qué puedo ayudarte ahora?",
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
                    // 3. Fondo dinámico: Paper en oscuro, blanco en claro
                    bgcolor: 'background.paper',
                    // Borde sutil en modo oscuro para separar del fondo
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : 'none'
                }}
            >
                {/* --- HEADER --- */}
                <Box sx={{
                    p: 2,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText', // Asegura contraste
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
                                En línea | Modelo Llama 3.3
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
                    // 4. Fondo del área de chat: Gris oscuro en dark mode, gris claro en light mode
                    bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f8f9fa',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}>
                    {messages.map((msg) => (
                        <Box
                            key={msg.id}
                            sx={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            }}
                        >
                            {msg.sender === 'bot' && (
                                <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30, mr: 1, mt: 1 }}>
                                    <BotIcon fontSize="small" />
                                </Avatar>
                            )}

                            <Box
                                sx={{
                                    maxWidth: '75%',
                                    p: 2,
                                    borderRadius: 3,
                                    borderTopLeftRadius: msg.sender === 'bot' ? 0 : 3,
                                    borderTopRightRadius: msg.sender === 'user' ? 0 : 3,
                                    // 5. Colores de las burbujas
                                    bgcolor: msg.sender === 'user'
                                        ? 'primary.main'
                                        : 'background.paper', // Bot usa el color del "papel" (oscuro o blanco)
                                    color: msg.sender === 'user'
                                        ? 'primary.contrastText'
                                        : 'text.primary',
                                    boxShadow: 1,
                                    // Borde extra para el bot en modo oscuro para que resalte
                                    border: (theme.palette.mode === 'dark' && msg.sender === 'bot')
                                        ? '1px solid rgba(255,255,255,0.12)'
                                        : 'none',

                                    '& p': { m: 0, lineHeight: 1.6 },
                                    '& ul, & ol': { pl: 3 },
                                    '& pre': { m: 0, p: 0, borderRadius: 2, overflow: 'hidden', mt: 1 }
                                }}
                            >
                                {msg.sender === 'user' ? (
                                    <Typography variant="body1">{msg.text}</Typography>
                                ) : (
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
                                                        // 6. Código inline adaptable
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

                    {isLoading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2" color="text.secondary">Analizando datos...</Typography>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* --- INPUT AREA --- */}
                <Divider />
                <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                        <TextField
                            fullWidth
                            placeholder="Escribe tu consulta sobre el inventario..."
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
                                    // 7. Input background adaptable
                                    bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f5f5'
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
                                width: 50,
                                height: 50,
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
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                        La IA puede cometer errores. Verifica la información importante, por el momento tiene límite de consultas.
                    </Typography>
                </Box>
            </Paper>
        </LayoutDashboard>
    );
};

export default ChatIA;