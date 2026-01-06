import { Navigate } from "react-router-dom";
import { useGlobalStore } from '../store/useGlobalStore';

function ProtectedRoute({ children, roles }) {
  const user = useGlobalStore((state) => state.user);
  if (!user) return <Navigate to="/" replace />;
  const rolRaw = user.rol;
  const rolUsuario = typeof rolRaw === "string" ? rolRaw : rolRaw || null;

  if (!rolUsuario || !roles.includes(rolUsuario)) {
    return <Navigate to="/no-autorizado" />;
  }

  return children;
}

export default ProtectedRoute;
