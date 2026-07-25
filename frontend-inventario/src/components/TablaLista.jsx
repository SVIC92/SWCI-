import {useState} from "react";
import { motion } from "framer-motion";
import {
    Paper, Box, Button,
    Menu, MenuItem, ListItemIcon, ListItemText, useTheme
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LayoutDashboard from "./Layouts/LayoutDashboard";
import PageHeader from "./PageHeader";
import FileDownloadIcon from "@mui/icons-material/FileDownload"; // Icono principal
import DescriptionIcon from '@mui/icons-material/Description';   // Icono Excel
import TextSnippetIcon from '@mui/icons-material/TextSnippet';   // Icono CSV
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useGlobalStore } from "../store/useGlobalStore";
import { exportTableData } from "../Utils/exportUtils";
import { TABLE_HEADER_BG, LOGO_NAVY, LOGO_NAVY_DARK } from "../theme/appTheme";

const TablaLista = ({
    title,
    columns,
    data,
    isLoading,
    onRefresh,
    onAdd,
    onBack,
    getRowId,
    addButtonLabel = "Ingresar Nuevo",
    children
}) => {
    const density = useGlobalStore((state) => state.density);
    const theme = useTheme();
    const isLight = theme.palette.mode === "light";
    const headerBg = TABLE_HEADER_BG[theme.palette.mode] ?? TABLE_HEADER_BG.light;
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const handleClickExport = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleExport = (format) => {
        exportTableData(data, columns, title.replace(/\s+/g, '_'), format);
        handleCloseMenu();
    };
    return (
        <LayoutDashboard>
            {children}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <Paper
                    sx={{
                        p: { xs: 3 },
                        borderRadius: 2,
                        boxShadow: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        height: { xs: 'auto', md: 'calc(100vh - 140px)' },
                        overflow: 'hidden'
                    }}
                >
                    <PageHeader
                        title={title}
                        actions={
                            <>
                                {onBack && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBackIcon />}
                                        onClick={onBack}
                                    >
                                        Volver
                                    </Button>
                                )}
                                {onRefresh && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={onRefresh}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Cargando..." : "Actualizar"}
                                    </Button>
                                )}
                                {onAdd && (
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={onAdd}
                                        sx={isLight ? {
                                            bgcolor: LOGO_NAVY,
                                            boxShadow: `0 6px 16px rgba(122, 213, 0, 0.4)`,
                                            "&:hover": {
                                                bgcolor: LOGO_NAVY_DARK,
                                                boxShadow: `0 6px 16px rgba(122, 213, 0, 0.5)`,
                                            },
                                        } : undefined}
                                    >
                                        {addButtonLabel}
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    color="success"
                                    startIcon={<FileDownloadIcon />}
                                    endIcon={<KeyboardArrowDownIcon />}
                                    onClick={handleClickExport}
                                    disabled={!data || data.length === 0}
                                >
                                    Exportar
                                </Button>

                                <Menu
                                    anchorEl={anchorEl}
                                    open={openMenu}
                                    onClose={handleCloseMenu}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                    <MenuItem onClick={() => handleExport('xlsx')}>
                                        <ListItemIcon>
                                            <DescriptionIcon fontSize="small" sx={{ color: '#1D6F42' }} />
                                        </ListItemIcon>
                                        <ListItemText>Excel (.xlsx)</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleExport('csv')}>
                                        <ListItemIcon>
                                            <TextSnippetIcon fontSize="small" sx={{ color: '#217346' }} />
                                        </ListItemIcon>
                                        <ListItemText>CSV (.csv)</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </>
                        }
                    />
                    <Box sx={{ height: "650px", width: "100%" }}>
                        <DataGrid
                            rows={data}
                            columns={columns}
                            density={density}
                            loading={isLoading}
                            getRowId={getRowId}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            pageSizeOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                            overflowY="hidden"
                            sx={{
                                "--DataGrid-overlayHeight": "300px",
                                "& .MuiDataGrid-columnHeaders": {
                                    backgroundColor: headerBg,
                                },
                                "& .MuiDataGrid-columnHeader": {
                                    backgroundColor: headerBg,
                                    color: "#ffffff",
                                },
                                "& .MuiDataGrid-columnHeaderTitle": {
                                    fontWeight: 700,
                                },
                                "& .MuiDataGrid-columnHeader .MuiSvgIcon-root": {
                                    color: "#ffffff",
                                },
                                "& .MuiDataGrid-columnSeparator": {
                                    color: "rgba(255, 255, 255, 0.4)",
                                },
                                "& .MuiDataGrid-row:hover": {
                                    backgroundColor: theme.palette.mode === "dark"
                                        ? "rgba(59, 130, 246, 0.14)"
                                        : "rgba(37, 99, 235, 0.06)",
                                },
                            }}
                            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                        />
                    </Box>
                </Paper>
            </motion.div>
        </LayoutDashboard>
    );
};

export default TablaLista;