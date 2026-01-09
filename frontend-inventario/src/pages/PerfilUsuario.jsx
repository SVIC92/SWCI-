import {useRef, useState, useEffect} from "react";
import LayoutDashboard from "../components/Layouts/LayoutDashboard";
import MfaSetup from "./MfaSetup";
import { useGlobalStore } from "../store/useGlobalStore";
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Grid,
  Divider,
  Chip,
  IconButton,
  Badge,
} from "@mui/material";
import Swal from "sweetalert2";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { subirFotoPerfil } from "../api/usuarioApi";

function PerfilUsuario() {
  const usuario = useGlobalStore((state) => state.user) || {};
  const setUser = useGlobalStore((state) => state.setUser);
  const fileInputRef = useRef(null);
  const [fotoActual, setFotoActual] = useState(
    usuario.fotoUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  );
  const apellidos = [usuario.apellido_pat, usuario.apellido_mat]
    .filter(Boolean)
    .join(" ");
  const nombreMostrar = [usuario.nombre_u].filter(Boolean).shift() || "";
  const estadoBruto = usuario.estado_u;
  const estadoTexto =
    typeof estadoBruto === "boolean"
      ? estadoBruto === true
        ? "Activo"
        : "Inactivo"
      : estadoBruto || "—";
  const rolTexto = usuario.rol || "—";

  const datosPerfil = [
    { label: "ID", valor: usuario.id_u ?? usuario.id ?? "—" },
    { label: "DNI", valor: usuario.dni ?? "—" },
    { label: "Nombre", valor: nombreMostrar || "—" },
    { label: "Apellido", valor: apellidos || "—" },
    { label: "Email", valor: usuario.email ?? "—" },
    { label: "Estado", valor: estadoTexto },
    { label: "Rol", valor: rolTexto },
  ];
  useEffect(() => {
    if (usuario.fotoUrl) {
      setFotoActual(usuario.fotoUrl);
    }
  }, [usuario.fotoUrl]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "El archivo debe ser una imagen", "error");
      return;
    }

    try {
      Swal.fire({ title: "Subiendo foto...", didOpen: () => Swal.showLoading() });
      const respuesta = await subirFotoPerfil(usuario.id_u, file);
      setFotoActual(respuesta.fotoUrl);
      setUser((prevUser) => ({
        ...prevUser,
        fotoUrl: respuesta.fotoUrl
      }));
      Swal.fire("Éxito", "Tu foto de perfil ha sido actualizada", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo subir la imagen", "error");
    }
  };
  return (
    <LayoutDashboard>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Información del Perfil
        </Typography>
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  onClick={() => fileInputRef.current.click()}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 32,
                    height: 32,
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 20 }} />
                </IconButton>
              }
            >
              <Avatar
                src={fotoActual}
                alt="Foto de Perfil"
                sx={{ width: 100, height: 100, mr: 2, border: '2px solid #e0e0e0' }}
              />
            </Badge>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                {[nombreMostrar, apellidos].filter(Boolean).join(" ") ||
                  "Usuario"}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {rolTexto === "—" ? "Rol no asignado" : rolTexto}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Detalles de la Cuenta
          </Typography>
          <Grid container spacing={6} sx={{ mb: 3 }}>
            {datosPerfil.map((dato) => (
              <Grid item xs={12} sm={6} md={4} key={dato.label}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {dato.label}
                </Typography>
                {dato.label === "Estado" ? (
                  <Chip
                    label={dato.valor}
                    color={dato.valor === "Activo" ? "success" : "error"}
                    size="small"
                  />
                ) : (
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {String(dato.valor)}
                  </Typography>
                )}
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Seguridad y Autenticación
          </Typography>
          <MfaSetup />
        </Paper>
      </Container>
    </LayoutDashboard>
  );
}

export default PerfilUsuario;