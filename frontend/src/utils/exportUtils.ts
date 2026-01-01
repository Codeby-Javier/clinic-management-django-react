import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel file
 */
export const exportToExcel = (data: any[], filename: string) => {
    try {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
        console.error("Export Excel/CSV Failed:", error);
        alert("Gagal melakukan export Excel. Pastikan tidak ada karakter khusus yang tidak didukung.");
    }
};

/**
 * Export data to PDF file
 */
export const exportToPDF = (
    title: string,
    columns: string[],
    data: any[][],
    filename: string
) => {
    try {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text(title, 14, 22);

        // Add date
        doc.setFontSize(11);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 30);

        // Add table
        // Handle autoTable import variation
        const autoTableFunc = (doc as any).autoTable || autoTable;

        if (autoTableFunc) {
            autoTableFunc(doc, {
                head: [columns],
                body: data,
                startY: 35,
                theme: 'grid',
                styles: { fontSize: 8 },
                headStyles: { fillColor: [14, 165, 233] }, // Sky-500
            });
            doc.save(`${filename}.pdf`);
        } else {
            console.error("AutoTable function not found");
            alert("Gagal memuat library PDF. Coba refresh halaman.");
        }
    } catch (error) {
        console.error("Export PDF Failed:", error);
        alert("Gagal melakukan export PDF.");
    }
};
