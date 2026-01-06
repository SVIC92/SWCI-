import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../../components/styles/Login.css';
import LoadingScreen from '../../components/LoadingScreen_login';
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { mfaLoginVerify } from '../../api/authApi';
import { useGlobalStore } from '../../store/useGlobalStore';
const mfaSchema = z.object({
  mfaCode: z.string().trim().length(6, "El código debe tener 6 dígitos"),
});
const MfaVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const loginAction = useGlobalStore((state) => state.login);
    const {
      register,
      handleSubmit,
      formState: { errors: formErrors },
      setError,
    } = useForm({
      resolver: zodResolver(mfaSchema),
    });
    useEffect(() => {
        if (!email) {
            setError("mfaCode", { type: "manual", message: "Sesión inválida. Por favor, inicia sesión de nuevo." });
            setTimeout(() => navigate('/'), 2000);
        }
    }, [email, navigate, setError]);

    const navigateBasedOnRole = (rol) => {
        switch (rol) {
            case "Administrador":
                navigate("/dashboard-administrador");
                break;
            case "Jefe de Inventario":
                navigate("/dashboard-jefe-inventario");
                break;
            case "Operador de Recepción de Mercadería":
                navigate("/dashboard-operador-recepcion");
                break;
            case "Auditor de Inventarios":
                navigate("/dashboard-auditor-inventarios");
                break;
            case "Operador de Tienda":
                navigate("/dashboard-operador-tienda");
                break;
            default:
                navigate("/usuarios");
                break;
        }
    };

    const handleLoginSuccess = (data) => {
        loginAction(data.token, data.usuario);
        console.log("[Login] Éxito. Guardando en Zustand:", data.usuario);

        navigate("/loading_login");

        setTimeout(() => {
            navigateBasedOnRole(data.usuario?.rol);
        }, 2000);
    };

    const { 
      mutate, 
      isPending, 
      error: mutationError
    } = useMutation({
      mutationFn: mfaLoginVerify,
      onSuccess: (data) => {
        if (!data.success) {
          setError("mfaCode", { type: "manual", message: data.message || "Código 2FA inválido" });
        } else {
          handleLoginSuccess(data);
        }
      },
      onError: (err) => {
        const status = err?.response?.status;
        const message = err?.response?.data?.message || "Error al verificar el código";
        if (status === 401) {
          setError("mfaCode", { type: "manual", message: "Código 2FA inválido" });
        } else {
          setError("mfaCode", { type: "manual", message });
        }
      }
    });

    const onSubmit = (formData) => {
      const payload = {
        email: email,
        code: formData.mfaCode
      };
      mutate(payload);
    };

    const errorMessage = formErrors.mfaCode?.message;

    if (isPending) {
        return <LoadingScreen />;
    }

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <div className="brand-badge">SW+</div>
                    <div className="card-header-text">
                        <h2>Portal Corporativo SWIC+</h2>
                        <p>Verificación en dos pasos.</p>
                    </div>
                </div>

                <p className="card-support-text">
                    Ingresa el código temporal de 6 dígitos generado en tu app de autenticación para
                    <strong> {email || 'tu cuenta'}</strong>.
                </p>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <form className="card-form" onSubmit={handleSubmit(onSubmit)}>
                    <label className="input-label" htmlFor="mfaCode">Código de autenticación</label>
                    <input
                        className="input"
                        type="text"
                        id="mfaCode"
                        {...register("mfaCode", {
                            onChange: (e) => {
                              e.target.value = e.target.value.replace(/\D/g, '');
                            }
                          })}
                        placeholder="000000"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        disabled={isPending || !email}
                        required
                    />

                    <button type="submit" className="button" disabled={isPending || !email}>
                        {isPending ? 'Validando código…' : 'Verificar código'}
                    </button>
                </form>

                <div className="forgot-password-link">
                    <Link to="/">Volver a iniciar sesión</Link>
                </div>
            </div>
        </div>
    );
};

export default MfaVerify;