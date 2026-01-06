import React, { useCallback } from "react"; 
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { useGlobalStore } from "../../store/useGlobalStore";
import { Box, useTheme } from "@mui/material";

const SIDEBAR_WIDTH = 250;
const SIDEBAR_COLLAPSED_WIDTH = 60;

export default function LayoutDashboard({ children }) {
  const { sidebarCollapsed, showFooter, setSidebarCollapsed } = useGlobalStore();
  const theme = useTheme();
  const empresa = "React+Vite-SpringBoot [SWCI+]";
  const version = "v1.0.4";
  const handleSidebarToggle = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [setSidebarCollapsed, sidebarCollapsed]);

  return (
    <div style={{ display: 'flex' }}> 
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={handleSidebarToggle}
      />
      <Box
        component="main"
        sx={{
          boxSizing: 'border-box', 
          height: '100vh',         
          display: 'flex',
          flexDirection: 'column', 

          [theme.breakpoints.down("md")]: {
            marginLeft: 0,
            width: '100%',
            padding: theme.spacing(2),
            paddingTop: theme.spacing(8),
          },
          
          [theme.breakpoints.up("md")]: {
            marginLeft: sidebarCollapsed ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`,
            width: `calc(100% - ${sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH}px)`,
            transition: theme.transitions.create(['width', 'margin-left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Box
          className="main-scroll-area"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: theme.spacing(3),
          }}
        >
          {children}
        </Box>
        {showFooter && <Footer empresa={empresa} version={version} />}
      </Box>
    </div>
  );
}