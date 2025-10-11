import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Reusable GenerateReport component
 * 
 * Props:
 * - title: string — report title (e.g., "Supplier Performance Report")
 * - userData: object — data of the user (e.g., name, email)
 * - fields: array — [{ label: "Total Earnings", value: "₱50,000" }]
 * - sections: array — optional sections like tables [{ title, head, body }]
 * - filename: string — PDF file name
 */

export default function GenerateReport({
    title = "Performance Report",
    userData = {},
    fields = [],
    sections = [],
    filename = "Report",
}) {
    const generateReport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(16);
        doc.text(title, 14, 20);
        doc.setFontSize(12);
        if (userData.first_name || userData.last_name)
            doc.text(`User: ${userData.first_name || ""} ${userData.last_name || ""}`, 14, 30);
        if (userData.email) doc.text(`Email: ${userData.email}`, 14, 37);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 44);

        // Summary table
        if (fields.length > 0) {
            autoTable(doc, {
                startY: 50,
                head: [["Field", "Value"]],
                body: fields.map((f) => [f.label, f.value]),
            });
        }

        // Sections (tables, details, etc.)
        let nextY = doc.lastAutoTable?.finalY || 60;
        sections.forEach((section, index) => {
            const startY = index === 0 ? nextY + 10 : doc.lastAutoTable.finalY + 10;
            doc.text(section.title, 14, startY);
            autoTable(doc, {
                startY: startY + 5,
                head: [section.head],
                body: section.body,
            });
        });

        // Save the file
        doc.save(`${filename}.pdf`);
    };

    return (
        <button
            onClick={generateReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
        >
            Generate Report
        </button>
    );
}
