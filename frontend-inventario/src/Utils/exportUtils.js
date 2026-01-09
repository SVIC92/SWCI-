import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportTableData = (
  data,
  columns,
  fileName = "reporte",
  format = "xlsx"
) => {
  const dataToExport = data.map((row) => {
    const rowData = {};
    columns.forEach((col) => {
      if (col.field !== "acciones" && col.field !== "id") {
        const header = col.headerName || col.field;
        let value = row[col.field];
        if (col.valueGetter) {
          value = col.valueGetter({ row });
        }
        rowData[header] = value;
      }
    });
    return rowData;
  });
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

  const dateStr = new Date().toISOString().slice(0, 10);
  const finalName = `${fileName}_${dateStr}`;

  if (format === "csv") {
    // Generar string CSV
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    // Agregar BOM para que Excel lea bien acentos y ñ (\uFEFF)
    const dataBlob = new Blob(["\uFEFF" + csvOutput], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(dataBlob, `${finalName}.csv`);
  } else {
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(dataBlob, `${finalName}.xlsx`);
  }
};

export const exportToImage = async (elementRef, fileName = "grafico") => {
  if (!elementRef.current) return;

  const canvas = await html2canvas(elementRef.current, { scale: 2 });
  canvas.toBlob((blob) => {
    saveAs(blob, `${fileName}.png`);
  });
};

export const exportToPdf = async (elementRef, fileName = "reporte") => {
  if (!elementRef.current) return;

  const canvas = await html2canvas(elementRef.current, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${fileName}.pdf`);
};
