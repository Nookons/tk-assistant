import "@/utils/fonts/NotoSansSC-Regular-normal";
import {IRobotException} from "@/types/Exception/Exception";
import {IChangeRecord} from "@/types/Parts/ChangeRecord";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import autoTable from "jspdf-autotable";
import {timeToString} from "@/utils/timeToString";
import {IStatusHistory} from "@/components/shared/dashboard/ShiftStats/MonthStats";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Design Tokens ─────────────────────────────────────────────────────────────

const COLOR = {
    accent:      [15,  23,  42]  as [number, number, number], // slate-900
    accentLight: [30,  41,  59]  as [number, number, number], // slate-800
    muted:       [100, 116, 139] as [number, number, number], // slate-500
    border:      [226, 232, 240] as [number, number, number], // slate-200
    bg:          [248, 250, 252] as [number, number, number], // slate-50
    bgAlt:       [241, 245, 249] as [number, number, number], // slate-100
    white:       [255, 255, 255] as [number, number, number],
    text:        [15,  23,  42]  as [number, number, number],
    green:       [22,  163, 74]  as [number, number, number], // green-600
    orange:      [234, 88,  12]  as [number, number, number], // orange-600
    blue:        [37,  99,  235] as [number, number, number], // blue-600
};

const FONT = "NotoSansSC-Regular";

const TABLE = {
    theme: "grid" as const,
    headStyles: {
        fillColor: COLOR.accent,
        textColor: COLOR.white,
        fontSize: 9,
        fontStyle: "bold" as const,
        halign: "left"  as const,
        cellPadding: {top: 4, bottom: 4, left: 5, right: 5},
        lineWidth: 0,
        font: FONT,
    },
    bodyStyles: {
        fillColor: COLOR.white,
        textColor: COLOR.text,
        fontSize: 9,
        cellPadding: {top: 3, bottom: 3, left: 5, right: 5},
        lineColor: COLOR.border,
        lineWidth: 0.2,
        font: FONT,
    },
    alternateRowStyles: {fillColor: COLOR.bg},
    margin: {left: 14, right: 14},
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const setFont = (doc: jsPDF, size: number, style: "normal" | "bold" = "normal", color = COLOR.text) => {
    doc.setFont(FONT, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
};

const drawLine = (doc: jsPDF, x1: number, y: number, x2: number, color = COLOR.border, width = 0.3) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(width);
    doc.line(x1, y, x2, y);
};

// ── Main ──────────────────────────────────────────────────────────────────────

export const generateShiftReport = async ({
                                              exception, changed_parts, changed_status,
                                              ArrayEmployee, ArrayError, date,
                                          }: IReportData) => {

    const doc = new jsPDF({orientation: "portrait", unit: "mm", format: "a4"});
    doc.setFont(FONT, "normal");

    const PW     = doc.internal.pageSize.width;   // 210
    const PH     = doc.internal.pageSize.height;  // 297
    const ML     = 14;
    const MR     = 14;
    const CW     = PW - ML - MR;                  // content width

    // ── Stats ──
    const shiftType        = exception[0]?.shift_type ?? "—";
    const totalSolvingTime = exception.reduce((s, e) => s + (e.solving_time ?? 0), 0);

    const issueTypeCount: Record<string, number> = {};
    exception.forEach(e => {
        const t = e.issue_type ?? "Unknown";
        issueTypeCount[t] = (issueTypeCount[t] ?? 0) + 1;
    });
    const topIssues = Object.entries(issueTypeCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const partCount: Record<string, number> = {};
    changed_parts.forEach(p => {
        partCount[p.parts_numbers ?? "—"] = (partCount[p.parts_numbers ?? "—"] ?? 0) + 1;
    });
    const topParts = Object.entries(partCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const statusCount: Record<string, number> = {};
    changed_status.forEach(s => {
        const st = s.new_status ?? "Unknown";
        statusCount[st] = (statusCount[st] ?? 0) + 1;
    });
    const topStatuses = Object.entries(statusCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    let y = 0;

    // ════════════════════════════════════════════════════════
    // HERO HEADER — dark full-width band
    // ════════════════════════════════════════════════════════
    const HERO_H = 38;
    doc.setFillColor(...COLOR.accent);
    doc.rect(0, 0, PW, HERO_H, "F");

    // Vertical accent stripe
    doc.setFillColor(...COLOR.blue);
    doc.rect(0, 0, 4, HERO_H, "F");

    // Title
    setFont(doc, 18, "bold", COLOR.white);
    doc.text("GLPC SHIFT REPORT", ML + 4, 16);

    // Sub-line
    setFont(doc, 9, "normal", [148, 163, 184]);
    doc.text("Automated shift summary", ML + 4, 24);

    // Date + Shift — right side
    setFont(doc, 9, "normal", [203, 213, 225]);
    doc.text(dayjs(date).format("DD MMMM YYYY"), PW - MR, 14, {align: "right"});
    setFont(doc, 11, "bold", COLOR.white);
    doc.text(`${shiftType.toUpperCase()} SHIFT`, PW - MR, 23, {align: "right"});
    setFont(doc, 8, "normal", [148, 163, 184]);
    doc.text(`Generated ${dayjs().format("HH:mm")}`, PW - MR, 30, {align: "right"});

    y = HERO_H + 10;

    // ════════════════════════════════════════════════════════
    // KPI CARDS — 4 metrics in a row
    // ════════════════════════════════════════════════════════
    const CARDS = [
        {label: "Exceptions",      value: exception.length,      color: COLOR.orange},
        {label: "Parts Changed",   value: changed_parts.length,  color: COLOR.blue},
        {label: "Status Changes",  value: changed_status.length, color: COLOR.green},
        {label: "Avg. Solve Time", value: `${Math.round(exception.length ? totalSolvingTime / exception.length : 0)} min`, color: COLOR.muted},
    ];

    const GAP    = 4;
    const CARD_W = (CW - GAP * 3) / 4;
    const CARD_H = 22;

    CARDS.forEach((card, i) => {
        const x = ML + i * (CARD_W + GAP);

        // Card bg
        doc.setFillColor(...COLOR.bg);
        doc.setDrawColor(...COLOR.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, CARD_W, CARD_H, 2, 2, "FD");

        // Top accent line
        doc.setFillColor(...card.color);
        doc.roundedRect(x, y, CARD_W, 2.5, 1, 1, "F");

        // Value
        setFont(doc, 16, "bold", card.color);
        doc.text(String(card.value), x + CARD_W / 2, y + 13, {align: "center"});

        // Label
        setFont(doc, 7.5, "normal", COLOR.muted);
        doc.text(card.label, x + CARD_W / 2, y + 19, {align: "center"});
    });

    y += CARD_H + 12;

    // ════════════════════════════════════════════════════════
    // SECTION HELPER
    // ════════════════════════════════════════════════════════
    const section = (title: string) => {
        setFont(doc, 11, "bold", COLOR.accent);
        doc.text(title, ML, y);
        drawLine(doc, ML, y + 2, PW - MR, COLOR.border, 0.4);
        y += 8;
    };

    // ════════════════════════════════════════════════════════
    // EMPLOYEE PERFORMANCE
    // ════════════════════════════════════════════════════════
    if (ArrayEmployee.length) {
        section("Employee Performance");

        autoTable(doc, {
            ...TABLE,
            startY: y,
            head: [["Employee", "Exceptions handled", "Total solving time (min)", "Avg per task (min)"]],
            body: ArrayEmployee.map(e => [
                e.employee,
                e.task_count,
                e.total_solving_time,
                e.task_count ? Math.round(e.total_solving_time / e.task_count) : 0,
            ]),
            columnStyles: {
                0: {halign: "left",   cellWidth: "auto"},
                1: {halign: "center", cellWidth: 40},
                2: {halign: "center", cellWidth: 50},
                3: {halign: "center", cellWidth: 40},
            },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ════════════════════════════════════════════════════════
    // ERROR DISTRIBUTION
    // ════════════════════════════════════════════════════════
    if (ArrayError.length) {
        section("Error Distribution");

        autoTable(doc, {
            ...TABLE,
            startY: y,
            head: [["Error type", "Occurrences"]],
            body: ArrayError.sort((a, b) => b.error_count - a.error_count)
                .map(e => [e.first_column, e.error_count]),
            columnStyles: {
                0: {halign: "left",   cellWidth: "auto"},
                1: {halign: "center", cellWidth: 35},
            },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ════════════════════════════════════════════════════════
    // TWO-COLUMN: Issue types | Top Parts
    // ════════════════════════════════════════════════════════
    const COL_W   = (CW - 8) / 2;
    const COL_R   = ML + COL_W + 8;

    section("Analysis Overview");

    // Left header
    setFont(doc, 9, "bold", COLOR.muted);
    doc.text("TOP ISSUE TYPES", ML, y);

    // Right header
    doc.text("TOP CHANGED PARTS", COL_R, y);

    y += 4;

    let leftFinalY  = y;
    let rightFinalY = y;

    if (topIssues.length) {
        autoTable(doc, {
            ...TABLE,
            startY: y,
            head: [["Issue type", "#"]],
            body: topIssues,
            margin: {left: ML, right: PW - ML - COL_W},
            columnStyles: {
                0: {halign: "left",   cellWidth: "auto"},
                1: {halign: "center", cellWidth: 18},
            },
        });
        leftFinalY = (doc as any).lastAutoTable.finalY;
    }

    if (topParts.length) {
        autoTable(doc, {
            ...TABLE,
            startY: y,
            head: [["Part number", "#"]],
            body: topParts,
            margin: {left: COL_R, right: MR},
            columnStyles: {
                0: {halign: "left",   cellWidth: "auto"},
                1: {halign: "center", cellWidth: 18},
            },
        });
        rightFinalY = (doc as any).lastAutoTable.finalY;
    }

    y = Math.max(leftFinalY, rightFinalY) + 10;

    // ════════════════════════════════════════════════════════
    // STATUS CHANGES
    // ════════════════════════════════════════════════════════
    if (topStatuses.length) {
        section("Status Changes");

        autoTable(doc, {
            ...TABLE,
            startY: y,
            head: [["New status", "Occurrences"]],
            body: topStatuses,
            columnStyles: {
                0: {halign: "left",   cellWidth: "auto"},
                1: {halign: "center", cellWidth: 35},
            },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }

    // ════════════════════════════════════════════════════════
    // FOOTER on every page
    // ════════════════════════════════════════════════════════
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Footer bar
        doc.setFillColor(...COLOR.bg);
        doc.rect(0, PH - 12, PW, 12, "F");
        drawLine(doc, 0, PH - 12, PW, COLOR.border, 0.3);

        setFont(doc, 7.5, "normal", COLOR.muted);
        doc.text("GLPC Shift Summary — Confidential", ML, PH - 5);
        doc.text(
            `Page ${i} of ${totalPages}  ·  ${dayjs(date).format("DD.MM.YYYY")} · ${shiftType} shift`,
            PW - MR, PH - 5, {align: "right"}
        );
    }

    // ════════════════════════════════════════════════════════
    // SAVE
    // ════════════════════════════════════════════════════════
    const fileName = `GLPC_Shift_${shiftType}_${dayjs(date).format("YYYY-MM-DD")}.pdf`;
    doc.save(fileName);
};