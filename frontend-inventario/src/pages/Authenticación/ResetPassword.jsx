import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';
import '../../components/styles/Login.css';
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            Swal.fire('Error', 'No se encontró un token de restablecimiento.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await resetPassword(token, password);
            if (response.status === 200) {
                await Swal.fire({
                    icon: 'success',
                    title: '¡Contraseña Actualizada!',
                    text: 'Ya puedes iniciar sesión con tu nueva clave.',
                    confirmButtonText: 'Ir al Login'
                });

                setPassword('');
                setConfirmPassword('');
                navigate('/');
            }

        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            const errorMsg = error.response?.data?.message || 'El enlace ha expirado o es inválido.';
            Swal.fire('Error', errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <div className="brand-badge">SW+</div>
                    <div className="card-header-text">
                        <h2>Portal Corporativo SWIC+</h2>
                        <p>Establece una contraseña segura.</p>
                    </div>
                </div>

                <p className="card-support-text">
                    Crea una nueva contraseña robusta para proteger tu cuenta. Asegúrate de no reutilizar claves anteriores.
                </p>

                <form className="card-form" onSubmit={handleSubmit}>
                    <label className="input-label" htmlFor="password">Nueva contraseña</label>
                    <input
                        className="input"
                        type="password"
                        id="password"
                        placeholder="Ingresa una contraseña segura"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={loading}
                        required
                    />

                    <label className="input-label" htmlFor="confirmPassword">Confirmar contraseña</label>
                    <input
                        className="input"
                        type="password"
                        id="confirmPassword"
                        placeholder="Repite la contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={loading}
                        required
                    />

                    <button type="submit" className="button" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                    </button>
                </form>

                <div className="forgot-password-link">
                    <Link to="/">Volver a iniciar sesión</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;