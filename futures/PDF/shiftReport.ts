import "@/utils/fonts/NotoSansSC-Regular-normal"; // global CSS (optional)
import { IRobotException } from "@/types/Exception/Exception";
import { IChangeRecord } from "@/types/Parts/ChangeRecord";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import autoTable from "jspdf-autotable";
import {timeToString} from "@/utils/timeToString";
import {IStatusHistory} from "@/components/shared/dashboard/ShiftStats/MonthStats";

// !!! CRITICAL: uncomment AFTER you generate the jsPDF font file
// import "@/utils/fonts/jspdf/NotoSansSC-Regular.js";

interface EmployeeStat {
    employee: string;
    total_solving_time: number;
    task_count: number;
}
interface ErrorStat {
    first_column: string;
    error_count: number;
}

interface IReportData {
    exception: IRobotException[];
    changed_parts: IChangeRecord[];
    changed_status: IStatusHistory[];
    ArrayEmployee: EmployeeStat[];
    ArrayError: ErrorStat[];
    date: Date;
}

// ------------------------------------------------------------
// MODERN CONSISTENT TABLE STYLES
// ------------------------------------------------------------
const TABLE_STYLES = {
    theme: "grid" as const,

    headStyles: {
        fillColor: [58, 63, 75] as [number, number, number], // soft graphite
        textColor: 255,
        fontSize: 11,
        fontStyle: "bold" as const,
        halign: "center" as const,
        valign: "middle" as const,
        cellPadding: 3,
        lineColor: [90, 95, 110] as [number, number, number],
        lineWidth: 0.25,
        font: "NotoSansSC-Regular",
    },

    bodyStyles: {
        fillColor: [245, 246, 248] as [number, number, number], // light neutral
        textColor: [40, 40, 45] as [number, number, number],
        fontSize: 10,
        cellPadding: 3,
        lineColor: [210, 214, 220] as [number, number, number],
        lineWidth: 0.2,
        font: "NotoSansSC-Regular",
    },

    alternateRowStyles: {
        fillColor: [232, 235, 240] as [number, number, number], // soft zebra
    },

    columnStyles: {
        0: { halign: "left" as const },
    },

    margin: { left: 14, right: 14 },
};



// ------------------------------------------------------------
export const generateShiftReport = async ({
                                              exception,
                                              changed_parts,
                                              changed_status,
                                              ArrayEmployee,
                                              ArrayError,
                                              date,
                                          }: IReportData) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // ----- Set Chinese font (must be embedded) -----
    doc.setFont("NotoSansSC-Regular", "normal");


    // ----- Basic stats -----
    const shiftType = exception.length ? exception[0].shift_type : "—";

    const exceptionCount = exception.length;
    const totalSolvingTime = exception.reduce(
        (acc, e) => acc + (e.solving_time || 0),
        0
    );
    const avgSolvingTime = exceptionCount
        ? totalSolvingTime / exceptionCount
        : 0;

    // Group by issue type
    const issueTypeCount: Record<string, number> = {};
    exception.forEach((e) => {
        const type = e.issue_type || "Unknown";
        issueTypeCount[type] = (issueTypeCount[type] || 0) + 1;
    });
    const topIssues = Object.entries(issueTypeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Top changed parts
    const partNumberCount: Record<string, number> = {};
    changed_parts.forEach((p) => {
        const parts = p.parts_numbers || "—";
        partNumberCount[parts] = (partNumberCount[parts] || 0) + 1;
    });
    const topParts = Object.entries(partNumberCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Top status changes
    const statusNewCount: Record<string, number> = {};

    changed_status.forEach((s) => {
        const status = s.new_status || "Unknown";
        statusNewCount[status] = (statusNewCount[status] || 0) + 1;
    });

    const topStatuses = Object.entries(statusNewCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // ----- Layout constants -----
    const pageWidth = doc.internal.pageSize.width;
    const margin = TABLE_STYLES.margin.left;
    let y = 15;

    // ----- TITLE & HEADER -----
    doc.setFontSize(20);
    doc.setFont("NotoSansSC-Regular", "bold");
    doc.text("GLPC SHIFT REPORT", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("NotoSansSC-Regular", "normal");
    doc.text(`${timeToString(date.toDateString()).slice(8)}`, margin, y);
    doc.text(
        `Shift: ${shiftType.toUpperCase()}`,
        pageWidth - margin,
        y,
        { align: "right" }
    );
    y += 12;

    // ----- 3 MODERN METRIC CARDS -----
    const cardWidth = (pageWidth - 2 * margin - 10) / 3;
    const cardStartY = y;

    const drawCard = (x: number, title: string, value: string | number, sub?: string) => {
        doc.setFillColor(248, 250, 252); // very subtle background
        doc.setDrawColor(220, 227, 235);
        doc.roundedRect(x, cardStartY, cardWidth, 22, 2, 2, "FD");
        doc.setFontSize(9);
        doc.setFont("NotoSansSC-Regular", "bold");
        doc.text(title, x + 3, cardStartY + 5);
        doc.setFontSize(16);
        doc.setFont("NotoSansSC-Regular", "normal");
        doc.text(String(value), x + 3, cardStartY + 17);
        if (sub) {
            doc.setFontSize(7);
            doc.setTextColor(100);
            doc.text(sub, x + 3, cardStartY + 24);
            doc.setTextColor(0);
        }
    };

    drawCard(margin, "Exceptions", exceptionCount);
    drawCard(margin + cardWidth + 5, "Parts changed", changed_parts.length);
    drawCard(margin + 2 * (cardWidth + 5), "Status changes", changed_status.length);
    y = cardStartY + 38; // enough space after cards

    // ----- EMPLOYEE PERFORMANCE TABLE (formatted) -----
    if (ArrayEmployee.length) {
        doc.setFontSize(12);
        doc.setFont("NotoSansSC-Regular", "bold");
        doc.text("Employee Performance", margin, y);
        y += 6;

        autoTable(doc, {
            ...TABLE_STYLES,
            startY: y,
            head: [["Employee", "Exceptions", "Total solving time"]],
            body: ArrayEmployee.map((e) => [
                e.employee,
                e.task_count,
                e.total_solving_time,
            ]),
            columns: [
                { header: "Employee", dataKey: "employee" },
                { header: "Exceptions", dataKey: "count" },
                { header: "Total solving time", dataKey: "time" },
            ],
            columnStyles: {
                0: { halign: "left" },
                1: { halign: "center" },
                2: { halign: "center" },
            },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ----- ERROR TYPE TABLE -----
    if (ArrayError.length) {
        doc.setFontSize(12);
        doc.setFont("NotoSansSC-Regular", "bold");
        doc.text("Error Distribution", margin, y);
        y += 6;

        autoTable(doc, {
            ...TABLE_STYLES,
            startY: y,
            head: [["Error type", "Occurrences"]],
            body: ArrayError.map((e) => [e.first_column, e.error_count]),
            columnStyles: {
                0: { halign: "left", cellWidth: "auto" },
                1: { halign: "center", cellWidth: 30 },
            },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ----- TWO‑COLUMN LAYOUT: ISSUE TYPES & TOP PARTS -----
    const colWidth = (pageWidth - 3 * margin) / 2;
    const leftX = margin;
    const rightX = margin + colWidth + 5;

    // Left column: Exceptions by issue type
    doc.setFontSize(12);
    doc.setFont("NotoSansSC-Regular", "bold");
    doc.text("Exceptions", leftX, y);
    let leftY = y + 6;

    if (topIssues.length) {
        autoTable(doc, {
            ...TABLE_STYLES,
            startY: leftY,
            head: [["Issue type", "Count"]],
            body: topIssues,
            margin: { left: leftX, right: pageWidth - leftX - colWidth },
            columnStyles: {
                0: { halign: "left", cellWidth: "auto" },
                1: { halign: "center", cellWidth: 25 },
            },
        });
        leftY = (doc as any).lastAutoTable.finalY;
    } else {
        doc.setFont("NotoSansSC-Regular", "normal");
        doc.setFontSize(10);
        doc.text("No exceptions logged", leftX, leftY + 6);
        leftY += 10;
    }


    doc.setFontSize(12);
    doc.setFont("NotoSansSC-Regular", "bold");
    doc.text("Parts Changed", rightX, y);
    let rightY = y + 6;

    if (topParts.length) {
        autoTable(doc, {
            ...TABLE_STYLES,
            startY: rightY,
            head: [["Part number", "Count"]],
            body: topParts,
            margin: { left: rightX, right: margin },
            columnStyles: {
                0: { halign: "left", cellWidth: "auto" },
                1: { halign: "center", cellWidth: 25 },
            },
        });
        rightY = (doc as any).lastAutoTable.finalY;
    } else {
        doc.setFont("NotoSansSC-Regular", "normal");
        doc.setFontSize(10);
        doc.text("No parts changed", rightX, rightY + 6);
        rightY += 10;
    }

    y = Math.max(leftY, rightY) + 10;

    // ----- STATUS CHANGES OVERVIEW -----
    if (topStatuses.length) {
        doc.setFontSize(12);
        doc.setFont("NotoSansSC-Regular", "bold");
        doc.text("Status Changes", margin, y);
        y += 6;

        autoTable(doc, {
            ...TABLE_STYLES,
            startY: y,
            head: [["New status", "Occurrences"]],
            body: topStatuses,
            columnStyles: {
                0: { halign: "left", cellWidth: "auto" },
                1: { halign: "center", cellWidth: 30 },
            },
        });
        y = (doc as any).lastAutoTable.finalY + 5;
    } else {
        doc.setFont("NotoSansSC-Regular", "normal");
        doc.setFontSize(10);
        doc.text("No status changes recorded", margin, y + 6);
        y += 12;
    }

    // ----- FOOTER (page numbers) -----
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
            `GLPC Shift Summary – Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.height - 10,
            { align: "center" }
        );
    }

    // ----- SAVE -----
    const fileName = `GLPC_Shift_Summary_${dayjs().format("YYYY-MM-DD_HH-mm")}.pdf`;
    doc.save(fileName);
};