import {useState} from "react";
import { motion } from "framer-motion";
import {
    Paper, Box, Typography, Button, Stack,
    Menu, MenuItem, ListItemIcon, ListItemText
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LayoutDashboard from "./Layouts/LayoutDashboard";
import FileDownloadIcon from "@mui/icons-material/FileDownload"; // Icono principal
import DescriptionIcon from '@mui/icons-material/Description';   // Icono Excel
import TextSnippetIcon from '@mui/icons-material/TextSnippet';   // Icono CSV
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useGlobalStore } from "../store/useGlobalStore";
import { exportTableData } from "../Utils/exportUtils";

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
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            mb: 2,
                            gap: 2,
                            flexShrink: 0
                        }}
                    >
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                            {title}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
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
                        </Stack>
                    </Box>
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
                            sx={{ "--DataGrid-overlayHeight": "300px",}}
                            localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                        />
                    </Box>
                </Paper>
            </motion.div>
        </LayoutDashboard>
    );
};

export default TablaLista;