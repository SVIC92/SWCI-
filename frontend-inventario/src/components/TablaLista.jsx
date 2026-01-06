import React from "react";
import { motion } from "framer-motion";
import { Paper, Box, Typography, Button, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LayoutDashboard from "./Layouts/LayoutDashboard";

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
                        m: { xs: 1, sm: 2, md: 3 },
                        p: { xs: 2, sm: 3 },
                        borderRadius: 2,
                        boxShadow: 3,
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
                        </Stack>
                    </Box>
                    <Box sx={{ height: 650, width: "100%" }}>
                        <DataGrid
                            rows={data}
                            columns={columns}
                            loading={isLoading}
                            getRowId={getRowId}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            pageSizeOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                            autoHeight
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