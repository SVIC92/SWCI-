import "./App.css";
import "./components/styles/SweetAlert.css";
import React, { useEffect } from "react";
import { useGlobalStore } from "./store/useGlobalStore";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import AppRoutes from "./routes";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

function App() {
  const theme = useGlobalStore((state) => state.theme);
  const fontSize = useGlobalStore((state) => state.fontSize);
  const density = useGlobalStore((state) => state.density);

  const token = useGlobalStore((state) => state.token);
  const setUsuariosConectados = useGlobalStore(
    (state) => state.setUsuariosConectados
  );

  useEffect(() => {
    let stompClient = null;

    if (token) {
      const backendUrl = "https://swci-backend.onrender.com" || "http://localhost:8080";
      const socket = new SockJS(`${backendUrl}/ws`);
      stompClient = Stomp.over(socket);
      stompClient.debug = null;

      stompClient.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          stompClient.subscribe("/topic/users", (message) => {
            if (message.body) {
              const lista = JSON.parse(message.body);
              setUsuariosConectados(lista);
            }
          });
        },
        (error) => {
          console.error("🔴 Error de conexión WebSocket:", error);
        }
      );
    }

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect();
      }
    };
  }, [token, setUsuariosConectados]);

  useEffect(() => {
    const body = document.body;
    const themeClasses = ["light-theme", "dark-theme"];
    const fontSizeClasses = [
      "font-size-small",
      "font-size-medium",
      "font-size-large",
    ];
    const densityClasses = ["density-comfortable", "density-compact"];

    body.classList.remove(
      ...themeClasses,
      ...fontSizeClasses,
      ...densityClasses
    );
    body.classList.add(`${theme}-theme`);
    body.classList.add(`font-size-${fontSize}`);
    body.classList.add(`density-${density}`);
  }, [theme, fontSize, density]);

  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
        },
      }),
    [theme]
  );

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Router>
        <Routes>{AppRoutes}</Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
