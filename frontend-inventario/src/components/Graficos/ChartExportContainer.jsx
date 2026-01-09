import React, { useRef, useState } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { exportToImage, exportToPdf } from '../../Utils/exportUtils';

const ChartExportContainer = ({ children, title = "Grafico" }) => {
    const chartRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();

    const handleOpen = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleExportPng = () => {
        exportToImage(chartRef, title);
        handleClose();
    };

    const handleExportPdf = () => {
        exportToPdf(chartRef, title);
        handleClose();
    };

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <Box sx={{ position: 'absolute', top: -10, right: -10, zIndex: 10 }}>
                <Tooltip title="Opciones de exportación">
                    <IconButton
                        onClick={handleOpen}
                        size="small"
                        sx={{
                            color: theme.palette.text.disabled,
                            '&:hover': {
                                color: theme.palette.text.primary,
                                bgcolor: theme.palette.action.hover,
                            }
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem onClick={handleExportPng}>
                        <ImageIcon sx={{ mr: 1, fontSize: 20 }} /> Guardar como PNG
                    </MenuItem>
                    <MenuItem onClick={handleExportPdf}>
                        <PictureAsPdfIcon sx={{ mr: 1, fontSize: 20 }} /> Guardar como PDF
                    </MenuItem>
                </Menu>
            </Box>

            <div
                ref={chartRef}
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent',
                }}
            >
                {children}
            </div>
        </Box>
    );
};

export default ChartExportContainer;