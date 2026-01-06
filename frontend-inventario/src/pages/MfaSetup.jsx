import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setupMfa, verifyMfa, disableMfa } from '../api/authApi';
import { useGlobalStore } from '../store/useGlobalStore';
import { toast } from 'react-hot-toast';
import {
    Box,
    Button,
    TextField,
    Typography,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
const MfaSetup = () => {
    const queryClient = useQueryClient();
    const usuario = useGlobalStore((state) => state.user);
    const setUser = useGlobalStore((state) => state.setUser);

    const [qrCode, setQrCode] = useState(null);
    const [mfaCode, setMfaCode] = useState('');
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const { mutate: handleSetup, isPending: isSetupPending } = useMutation({
        mutationFn: setupMfa,
        onSuccess: (response) => {
            setQrCode(response.qrCodeUri);
            toast.info('Escanea el código QR con tu app de autenticación.');
        },
        onError: () => {
            toast.error('No se pudo iniciar la configuración de 2FA.');
        },
    });

    const { mutate: handleVerify, isPending: isVerifyPending } = useMutation({
        mutationFn: verifyMfa,
        onSuccess: () => {
            toast.success('¡2FA habilitado correctamente!');
            setQrCode(null);
            setMfaCode('');
            setUser({ ...usuario, mfaEnabled: true });
        },
        onError: () => {
            toast.error('Código inválido. Inténtalo de nuevo.');
        },
    });

    const { mutate: handleDisable, isPending: isDisablePending } = useMutation({
        mutationFn: disableMfa,
        onSuccess: () => {
            toast.success('El 2FA se ha deshabilitado.');
            setConfirmOpen(false);
            setUser({ ...usuario, mfaEnabled: false });
        },
        onError: () => {
            toast.error('No se pudo deshabilitar el 2FA.');
            setConfirmOpen(false);
        },
    });

    const onVerifySubmit = (e) => {
        e.preventDefault();
        if (mfaCode.length === 6) {
            handleVerify({ code: mfaCode });
        }
    };

    if (!usuario) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {usuario.mfaEnabled ? (
                <>
                    <Chip label="Activado" color="success" size="small" />
                    <Typography variant="body2" sx={{ my: 2 }}>
                        Tu cuenta está protegida con una capa adicional de seguridad.
                    </Typography>
                    <LoadingButton
                        variant="contained"
                        color="error"
                        onClick={() => setConfirmOpen(true)}
                        loading={isDisablePending}
                    >
                        Desactivar 2FA
                    </LoadingButton>
                </>
            ) : !qrCode ? (
                <>
                    <Chip label="Inactivo" size="small" />
                    <Typography variant="body2" sx={{ my: 2 }}>
                        Protege tu cuenta con una capa adicional de seguridad.
                    </Typography>
                    <LoadingButton
                        variant="contained"
                        onClick={() => handleSetup()}
                        loading={isSetupPending}
                    >
                        Activar 2FA
                    </LoadingButton>
                </>
            ) : (
                <Box
                    component="form"
                    onSubmit={onVerifySubmit}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Typography variant="body2">
                        Escanea el código QR con tu app de autenticación:
                    </Typography>
                    <Box
                        component="img"
                        src={qrCode}
                        alt="Código QR para 2FA"
                        sx={{
                            width: 200,
                            height: 200,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                        }}
                    />
                    <TextField
                        label="Código de 6 dígitos"
                        variant="outlined"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.trim())}
                        inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
                        sx={{ width: '100%', maxWidth: '250px' }}
                    />
                    <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={isVerifyPending}
                        disabled={mfaCode.length !== 6}
                        sx={{ width: '100%', maxWidth: '250px' }}
                    >
                        Verificar y Activar
                    </LoadingButton>
                </Box>
            )}
            <Dialog open={isConfirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>¿Estás seguro?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Se desactivará la protección de 2 factores de tu cuenta.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} disabled={isDisablePending}>
                        Cancelar
                    </Button>
                    <LoadingButton
                        color="error"
                        onClick={() => handleDisable()}
                        loading={isDisablePending}
                    >
                        Sí, desactivar
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MfaSetup;