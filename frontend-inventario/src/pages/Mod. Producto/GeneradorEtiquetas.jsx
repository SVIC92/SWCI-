import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';
import { QRCodeCanvas } from 'qrcode.react';
import { getProductos } from '../../api/productoApi';
import { useTheme } from '@mui/material/styles';
import {
    Box, Paper, Typography, TextField, MenuItem, Select,
    FormControl, InputLabel, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Checkbox,
    CircularProgress, Stack
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LayoutDashboard from '../../components/Layouts/LayoutDashboard';

const GeneradorEtiquetas = () => {
    const theme = useTheme();
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [seleccionados, setSeleccionados] = useState([]);
    const [tipoCodigo, setTipoCodigo] = useState('BARCODE');
    const [verPreview, setVerPreview] = useState(false);

    const componentRef = useRef();

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const data = await getProductos();
                setProductos(data);
            } catch (error) {
                console.error("Error cargando productos", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    const productosFiltrados = useMemo(() => {
        return productos.filter(p => {
            const term = filtro.toLowerCase();
            const nombre = p.nombre?.toLowerCase() || '';
            const sku = p.sku?.toLowerCase() || '';
            return nombre.includes(term) || sku.includes(term);
        });
    }, [productos, filtro]);

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSeleccionados(productosFiltrados.map(p => p.id_producto));
        } else {
            setSeleccionados([]);
        }
    };

    const handleSelectOne = (event, id) => {
        const selectedIndex = seleccionados.indexOf(id);
        let newSelected = [];
        if (selectedIndex === -1) newSelected = newSelected.concat(seleccionados, id);
        else if (selectedIndex === 0) newSelected = newSelected.concat(seleccionados.slice(1));
        else if (selectedIndex === seleccionados.length - 1) newSelected = newSelected.concat(seleccionados.slice(0, -1));
        else if (selectedIndex > 0) newSelected = newSelected.concat(seleccionados.slice(0, selectedIndex), seleccionados.slice(selectedIndex + 1));
        setSeleccionados(newSelected);
    };

    const isSelected = (id) => seleccionados.indexOf(id) !== -1;

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Etiquetas_Gondola',
    });

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <LayoutDashboard>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>Impresión de Etiquetas</Typography>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                        <TextField
                            label="Buscar (Nombre, SKU)"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            InputProps={{ endAdornment: <SearchIcon color="action" /> }}
                        />
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Formato</InputLabel>
                            <Select
                                value={tipoCodigo}
                                label="Formato"
                                onChange={(e) => setTipoCodigo(e.target.value)}
                            >
                                <MenuItem value="BARCODE">Barras (Estándar)</MenuItem>
                                <MenuItem value="QR">QR (Información)</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => setVerPreview(!verPreview)}
                            sx={{ minWidth: 150 }}
                        >
                            {verPreview ? "Ocultar Vista" : "Ver Diseño"}
                        </Button>

                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                            disabled={seleccionados.length === 0}
                            sx={{ minWidth: 200 }}
                        >
                            IMPRIMIR ({seleccionados.length})
                        </Button>
                    </Stack>
                </Paper>

                <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={seleccionados.length > 0 && seleccionados.length < productosFiltrados.length}
                                        checked={productosFiltrados.length > 0 && seleccionados.length === productosFiltrados.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>SKU</TableCell>
                                <TableCell>Producto</TableCell>
                                <TableCell>Marca</TableCell>
                                <TableCell align="right">Precio</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productosFiltrados.map((row) => {
                                const isItemSelected = isSelected(row.id_producto);
                                return (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        key={row.id_producto}
                                        selected={isItemSelected}
                                        onClick={(event) => handleSelectOne(event, row.id_producto)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell padding="checkbox"><Checkbox checked={isItemSelected} /></TableCell>
                                        <TableCell>{row.sku}</TableCell>
                                        <TableCell>{row.nombre}</TableCell>
                                        <TableCell>{row.marca || '-'}</TableCell>
                                        <TableCell align="right">S/ {row.precio_venta}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{
                    display: verPreview ? 'block' : 'none',
                    mt: 4,
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                    transition: 'all 0.3s ease',
                    boxShadow: theme.shadows[3]
                }}>
                    <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary', fontWeight: 'bold' }}>
                        Vista Previa del Diseño:
                    </Typography>

                    <div ref={componentRef} className="print-area">
                        <style type="text/css">
                            {`
                            @media screen {
                                .grid-container {
                                    display: grid;
                                    grid-template-columns: repeat(3, 1fr);
                                    gap: 25px;
                                    padding: 10px;
                                }
                                .supermarket-tag {
                                    box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                                    transform: scale(0.98);
                                    margin-bottom: 10px;
                                }
                            }

                            @media print {
                                @page { size: auto; margin: 5mm; }
                                body { background-color: white !important; -webkit-print-color-adjust: exact; }
                                .grid-container {
                                    display: grid;
                                    grid-template-columns: repeat(3, 1fr);
                                    gap: 10px;
                                }
                                .supermarket-tag {
                                    box-shadow: none !important;
                                    border: 2px solid #000;
                                }
                            }

                            .print-area { font-family: 'Arial', sans-serif; width: 100%; }
                            
                            .supermarket-tag {
                                border: 2px solid #000;
                                border-radius: 8px;
                                padding: 6px;
                                width: 100%;
                                height: 180px; 
                                box-sizing: border-box;
                                position: relative;
                                page-break-inside: avoid;
                                display: flex;
                                flex-direction: column;
                                justify-content: space-between;
                                background-color: white; 
                                color: black;
                                overflow: hidden; 
                            }
                            
                            .tag-header {
                                border-bottom: 1px solid #ccc;
                                padding-bottom: 2px;
                                margin-bottom: 2px;
                                height: 38px;
                                overflow: hidden;
                                flex-shrink: 0;
                                display: flex;
                                justify-content: center; /* Centra horizontalmente */
                                align-items: center;     /* Centra verticalmente */
                                text-align: center;      /* Alinea texto multilínea */
                            }
                            
                            .supermarket-tag.qr-mode .tag-header {
                                height: auto;      
                                min-height: 38px;
                                max-height: 70px; 
                                overflow: hidden;
                            }

                            .prod-name {
                                font-size: 13px;
                                font-weight: 900;
                                text-transform: uppercase;
                                line-height: 1.1;
                                color: #333;
                                width: 100%; /* Asegura que tome el ancho para centrarse */
                            }

                            .tag-body {
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                flex-grow: 1;
                                min-height: 0;
                            }
                            .tag-info {
                                font-size: 10px;
                                color: #555;
                                display: flex;
                                flex-direction: column;
                                gap: 1px;
                            }
                            .tag-price-box { text-align: right; color: black; }
                            .currency { font-size: 14px; font-weight: bold; vertical-align: top; margin-right: 1px; }
                            .price-integer { font-size: 38px; font-weight: 900; letter-spacing: -2px; line-height: 1; }
                            .price-decimal { font-size: 16px; font-weight: bold; vertical-align: top; }

                            .tag-footer {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                margin-top: 2px;
                                border-top: 1px dashed #ccc;
                                padding-top: 4px;
                                color: black;
                                flex-shrink: 0;
                            }
                            .sku-text { font-size: 9px; margin-top: 0px; letter-spacing: 2px; }
                        `}
                        </style>

                        <div className="grid-container">
                            {productos
                                .filter(p => seleccionados.includes(p.id_producto))
                                .map(p => {
                                    const precio = Number(p.precio_venta || 0).toFixed(2);
                                    const [enteros, decimales] = precio.split('.');
                                    const isQR = tipoCodigo === 'QR';

                                    return (
                                        <div
                                            key={p.id_producto}
                                            className={`supermarket-tag ${isQR ? 'qr-mode' : ''}`}
                                        >
                                            <div className="tag-header">
                                                <div className="prod-name">{p.nombre}</div>
                                            </div>

                                            <div className="tag-body">
                                                <div className="tag-info">
                                                    <span><strong>MARCA:</strong> {p.marca || 'GEN'}</span>
                                                    {!isQR && (
                                                        <span><strong>UND:</strong> {p.uni_medida || 'UN'}</span>
                                                    )}
                                                    <span><strong>CAT:</strong> {p.categoria?.nombreCat || 'Gral'}</span>
                                                </div>

                                                <div className="tag-price-box">
                                                    <span className="currency">S/</span>
                                                    <span className="price-integer">{enteros}</span>
                                                    <span className="price-decimal">.{decimales}</span>
                                                </div>
                                            </div>

                                            <div className="tag-footer">
                                                {isQR ? (
                                                    <QRCodeCanvas
                                                        value={JSON.stringify({ id: p.id_producto, sku: p.sku })}
                                                        size={48}
                                                        fgColor="#000000"
                                                    />
                                                ) : (
                                                    <Barcode
                                                        value={p.codEan || "000000"}
                                                        width={1.4}
                                                        height={40}
                                                        fontSize={0}
                                                        margin={0}
                                                        displayValue={false}
                                                        lineColor="#000000"
                                                    />
                                                )}
                                                <span className="sku-text">{p.sku}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </Box>
            </Box>
        </LayoutDashboard>
    );
};

export default GeneradorEtiquetas;