import React from "react";
import "../../components/styles/Login.css";
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../api/authApi";
import { useGlobalStore } from '../../store/useGlobalStore';
const loginSchema = z.object({
  email: z.string().trim().email("Debe ser un email válido"),
  pass: z.string().min(1, "La contraseña no puede estar vacía"),
});
function Login() {
  const navigate = useNavigate();
  const {
		register,
		handleSubmit,
		formState: { errors: formErrors },
	} = useForm({
		resolver: zodResolver(loginSchema),
	});
  const loginAction = useGlobalStore((state) => state.login);
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
  const { 
    mutate, 
    isPending, 
    error: mutationError
  } = useMutation({
		mutationFn: login, 
		
    onSuccess: (data) => {
      if (data.mfaRequired) {
				navigate('/verify-2fa', { state: { email: data.email } });
			} else {
				loginAction(data.token, data.usuario);
				navigate("/loading_login");

				setTimeout(() => {
					navigateBasedOnRole(data.usuario?.rol);
				}, 2000);
			}
		},
    onError: (err) => {
      console.error("Error de login:", err);
    }
	});
  const onSubmit = (data) => {
		mutate(data);
	};
  const getErrorMessage = () => {
    if (formErrors.email) return formErrors.email.message;
    if (formErrors.pass) return formErrors.pass.message;
    if (!mutationError) return null;
    const status = mutationError?.response?.status;
    if (status === 403) return "Cuenta desactivada";
    if (status === 401) return "Credenciales inválidas";
    return mutationError?.response?.data?.message || mutationError.message || "Error al conectar con el servidor";
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div className="brand-badge">SW+</div>
          <div className="card-header-text">
            <h2>Portal Corporativo SWIC+</h2>
            <p>Inicia sesión con tus credenciales corporativas.</p>
          </div>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form className="card-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="input-label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            placeholder="nombre.apellido@empresa.com"
            {...register("email")}
            required
            className="input"
            autoComplete="username"
          />
          
          <label className="input-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="********"
            {...register("pass")}
            required
            className="input"
            autoComplete="current-password"
          />

          <button type="submit" className="button" disabled={isPending}>
            {isPending ? "Validando credenciales…" : "Ingresar"}
          </button>
        </form>

        <div className="forgot-password-link">
         <Link to="/forgot-password">¿Olvidaste tu contraseña? Reestablécela aquí</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;