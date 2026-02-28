import "@/utils/fonts/NotoSansSC-Regular-normal";
import { IRobotException } from "@/types/Exception/Exception";
import { IChangeRecord } from "@/types/Parts/ChangeRecord";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import autoTable from "jspdf-autotable";
import { IStatusHistory } from "@/components/shared/dashboard/ShiftStats/MonthStats";

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

// ── Palette — Amazon internal report style ────────────────────────────────────
// Refs: Amazon Business Review docs, 6-pager style, FC ops reports

type RGB = [number, number, number];

const C = {
    black:      [0,   0,   0  ] as RGB,
    ink:        [15,  17,  17 ] as RGB,   // near-black text
    headerBg:   [35,  47,  62 ] as RGB,   // dark navy-charcoal (amazon internal header)
    rowHead:    [242, 242, 242] as RGB,   // light gray row header
    border:     [189, 189, 189] as RGB,   // table border
    borderDark: [120, 120, 120] as RGB,
    subhead:    [84,  84,  84 ] as RGB,
    hint:       [130, 130, 130] as RGB,
    white:      [255, 255, 255] as RGB,
    orange:     [232, 114, 0  ] as RGB,   // Amazon orange — used very sparingly
    green:      [59,  122, 87 ] as RGB,   // muted green for "online"
    red:        [185, 74,  74 ] as RGB,   // muted red for "offline"
};

const FONT = "NotoSansSC-Regular";

// ── Helpers ───────────────────────────────────────────────────────────────────

const f = (doc: jsPDF, size: number, style: "normal"|"bold" = "normal", color: RGB = C.ink) => {
    doc.setFont(FONT, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
};

const fillRect = (doc: jsPDF, fill: RGB, x: number, y: number, w: number, h: number) => {
    doc.setFillColor(...fill);
    doc.rect(x, y, w, h, "F");
};

const borderedRect = (doc: jsPDF, x: number, y: number, w: number, h: number, fill?: RGB) => {
    if (fill) { doc.setFillColor(...fill); doc.rect(x, y, w, h, "FD"); }
    else doc.rect(x, y, w, h, "S");
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.25);
    doc.rect(x, y, w, h, "S");
};

const hline = (doc: jsPDF, x1: number, y: number, x2: number, color: RGB = C.border, lw = 0.3) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(lw);
    doc.line(x1, y, x2, y);
};

// Amazon-style table config
const amzTable = (headFill: RGB = C.headerBg) => ({
    theme: "grid" as const,
    headStyles: {
        fillColor:   headFill,
        textColor:   C.white,
        fontSize:    8,
        fontStyle:   "bold" as const,
        halign:      "left" as const,
        cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
        lineColor:   headFill,
        lineWidth:   0,
        font:        FONT,
    },
    bodyStyles: {
        fillColor:   C.white,
        textColor:   C.ink,
        fontSize:    8,
        cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
        lineColor:   C.border,
        lineWidth:   0.2,
        font:        FONT,
    },
    alternateRowStyles: { fillColor: C.rowHead },
    tableLineColor:     C.borderDark,
    tableLineWidth:     0.3,
});

// ── Main ──────────────────────────────────────────────────────────────────────

export const generateShiftReport = async ({
                                              exception, changed_parts, changed_status,
                                              ArrayEmployee, ArrayError, date,
                                          }: IReportData) => {

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont(FONT, "normal");

    const PW = doc.internal.pageSize.width;
    const PH = doc.internal.pageSize.height;
    const ML = 18;
    const MR = 18;
    const CW = PW - ML - MR;

    // ── Pre-compute ───────────────────────────────────────────────────────────

    const shiftType        = exception[0]?.shift_type ?? "DAY";
    const totalExceptions  = exception.length;
    const totalSolvingTime = exception.reduce((s, e) => s + (e.solving_time ?? 0), 0);
    const avgSolveTime     = totalExceptions ? Math.round(totalSolvingTime / totalExceptions) : 0;

    const sortedErrors = [...ArrayError].sort((a, b) => b.error_count - a.error_count);

    // Parts grouped
    const partsMap: Record<string, { count: number; robots: Set<string> }> = {};
    changed_parts.forEach(p => {
        const key = p.parts_numbers ?? "Unknown";
        if (!partsMap[key]) partsMap[key] = { count: 0, robots: new Set() };
        partsMap[key].count++;
    });
    const sortedParts = Object.entries(partsMap).sort((a, b) => b[1].count - a[1].count);

    // Robot status
    const wentOffline: { robot: string; time: string; from: string }[] = [];
    const wentOnline:  { robot: string; time: string; from: string }[] = [];
    changed_status.forEach(s => {
        const newStatus = (s.new_status ?? "").toLowerCase();
        const robot     = s.robot_number.toString() ?? "—";
        const time      = dayjs(s.created_at).format("HH:mm");
        const from      = s.old_status ?? "—";
        if (newStatus.includes("offline") || newStatus.includes("离线")) {
            wentOffline.push({ robot, time, from });
        } else if (newStatus.includes("online") || newStatus.includes("在线")) {
            wentOnline.push({ robot, time, from });
        }
    });

    let y = 0;

    // ═════════════════════════════════════════════════════════════════════════
    // TOP HEADER BAR
    // ═════════════════════════════════════════════════════════════════════════

    fillRect(doc, C.headerBg, 0, 0, PW, 30);

    // Amazon-style: warehouse/site name top-left
    f(doc, 14, "bold", C.white);
    doc.text("GLPC", ML, 13);

    f(doc, 7, "normal", [160, 170, 180] as RGB);
    doc.text("SHIFT OPERATIONS ·  REPORT", ML, 20);

    // Orange accent line under title
    fillRect(doc, C.orange, ML, 22, 28, 1);

    // Right: shift type + date
    f(doc, 11, "bold", C.white);
    doc.text(`${shiftType.toUpperCase()} SHIFT`, PW - MR, 14, { align: "right" });
    f(doc, 7.5, "normal", [160, 170, 180] as RGB);
    doc.text(dayjs(date).format("ddd, DD MMM YYYY"), PW - MR, 22, { align: "right" });

    y = 36;

    f(doc, 7.5, "bold", C.subhead);
    doc.text("SUMMARY METRICS", ML, y);
    y += 4;

    const METRICS = [
        { label: "Total Exceptions",   value: totalExceptions,           sub: "this shift"   },
        { label: "Avg. Solve Time",     value: `${avgSolveTime} min`,    sub: "per exception" },
        { label: "Parts Replaced",      value: changed_parts.length,     sub: "components"   },
        { label: "Status Changes",      value: changed_status.length,    sub: "robots"       },
        { label: "Robots Offline",      value: wentOffline.length,       sub: "events"       },
        { label: "Robots Online",       value: wentOnline.length,        sub: "recoveries"   },
    ];

    const MET_W = (CW - 5 * 2) / 6;
    const MET_H = 18;

    METRICS.forEach(({ label, value, sub }, i) => {
        const mx = ML + i * (MET_W + 2);

        doc.setDrawColor(...C.borderDark);
        doc.setLineWidth(0.3);
        doc.setFillColor(...C.white);
        doc.rect(mx, y, MET_W, MET_H, "FD");

        // Top orange pip for first metric (primary KPI)
        if (i === 0) {
            fillRect(doc, C.orange, mx, y, MET_W, 1.5);
        }

        f(doc, 13, "bold", C.ink);
        doc.text(String(value), mx + MET_W / 2, y + 10.5, { align: "center" });

        f(doc, 6, "normal", C.subhead);
        doc.text(label.toUpperCase(), mx + MET_W / 2, y + 14.5, { align: "center" });
    });

    y += MET_H + 8;

    // ═════════════════════════════════════════════════════════════════════════
    // SECTION HELPER — Amazon style: plain bold uppercase label + rule
    // ═════════════════════════════════════════════════════════════════════════

    const section = (title: string, sub?: string) => {
        y += 4;
        f(doc, 8.5, "bold", C.ink);
        doc.text(title.toUpperCase(), ML, y);
        if (sub) {
            f(doc, 7, "normal", C.hint);
            doc.text(sub, PW - MR, y, { align: "right" });
        }
        hline(doc, ML, y + 2, PW - MR, C.ink, 0.4);
        y += 7;
    };

    // ═════════════════════════════════════════════════════════════════════════
    // 1. EXCEPTION SUMMARY BY TYPE
    // ═════════════════════════════════════════════════════════════════════════

    if (sortedErrors.length) {
        section("Exception Summary by Type", `${totalExceptions} total`);

        autoTable(doc, {
            ...amzTable(),
            startY: y,
            head: [["#", "Error Type", "Count", "% of Total"]],
            body: sortedErrors.map((e, i) => [
                i + 1,
                e.first_column,
                e.error_count,
                `${Math.round((e.error_count / Math.max(totalExceptions, 1)) * 100)}%`,
            ]),
            columnStyles: {
                0: { halign: "center", cellWidth: 10 },
                1: { cellWidth: "auto" },
                2: { halign: "center", cellWidth: 22 },
                3: { halign: "center", cellWidth: 28 },
            },
            margin: { left: ML, right: MR },
        });

        y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. EMPLOYEE PERFORMANCE
    // ═════════════════════════════════════════════════════════════════════════

    if (ArrayEmployee.length) {
        section("Employee Performance", `${ArrayEmployee.length} technicians`);

        autoTable(doc, {
            ...amzTable(),
            startY: y,
            head: [["Employee", "Exceptions", "Total Solve (min)", "Avg per Exception (min)", "Workload"]],
            body: ArrayEmployee
                .sort((a, b) => b.task_count - a.task_count)
                .map(e => {
                    const avg = e.task_count ? Math.round(e.total_solving_time / e.task_count) : 0;
                    const pct = Math.round((e.task_count / Math.max(totalExceptions, 1)) * 100);
                    return [e.employee, e.task_count, e.total_solving_time, avg, `${pct}%`];
                }),
            columnStyles: {
                0: { cellWidth: 52 },
                1: { halign: "center", cellWidth: "auto" },
                2: { halign: "center", cellWidth: "auto" },
                3: { halign: "center", cellWidth: "auto" },
                4: { halign: "center", cellWidth: "auto" },
            },
            margin: { left: ML, right: MR },
        });

        y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 3. PARTS REPLACED
    // ═════════════════════════════════════════════════════════════════════════

    if (sortedParts.length) {
        section("Parts Replaced", `${changed_parts.length} replacements`);

        autoTable(doc, {
            ...amzTable(),
            startY: y,
            head: [["Part Number", "Qty Replaced", "Part Description"]],
            body: sortedParts.map(([part, { count, robots }]) => [
                part,
                count,
                [...robots].join(", ") || "—",
            ]),
            columnStyles: {
                0: { cellWidth: 55 },
                1: { halign: "center", cellWidth: 28 },
                2: { cellWidth: "auto", textColor: C.subhead },
            },
            margin: { left: ML, right: MR },
        });

        y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 4. ROBOT STATUS CHANGES — two tables side by side
    // ═════════════════════════════════════════════════════════════════════════

    if (wentOffline.length || wentOnline.length) {
        const COL_W = (CW - 8) / 2;
        const COL_R = ML + COL_W + 8;

        section("Robot Status Changes",
            `${wentOffline.length} offline · ${wentOnline.length} online`);

        // Sub-labels
        f(doc, 7, "bold", C.red);
        doc.text(`OFFLINE EVENTS (${wentOffline.length})`, ML, y);
        f(doc, 7, "bold", C.green);
        doc.text(`ONLINE / RECOVERED (${wentOnline.length})`, COL_R, y);
        y += 4;

        const saveY = y;
        let leftFinal  = y;
        let rightFinal = y;

        if (wentOffline.length) {
            autoTable(doc, {
                ...amzTable(C.red),
                startY: saveY,
                head: [["Robot", "Time", "Previous Status"]],
                body: wentOffline.map(r => [r.robot, r.time, r.from]),
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { halign: "center", cellWidth: 18 },
                    2: { cellWidth: "auto", textColor: C.subhead },
                },
                margin: { left: ML, right: PW - ML - COL_W },
            });
            leftFinal = (doc as any).lastAutoTable.finalY;
        } else {
            f(doc, 8, "normal", C.hint);
            doc.text("No offline events recorded.", ML, y + 5);
            leftFinal = y + 10;
        }

        if (wentOnline.length) {
            autoTable(doc, {
                ...amzTable(C.green),
                startY: saveY,
                head: [["Robot", "Time", "Previous Status"]],
                body: wentOnline.map(r => [r.robot, r.time, r.from]),
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { halign: "center", cellWidth: 18 },
                    2: { cellWidth: "auto", textColor: C.subhead },
                },
                margin: { left: COL_R, right: MR },
            });
            rightFinal = (doc as any).lastAutoTable.finalY;
        } else {
            f(doc, 8, "normal", C.hint);
            doc.text("No recovery events recorded.", COL_R, y + 5);
            rightFinal = y + 10;
        }

        y = Math.max(leftFinal, rightFinal) + 8;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 5. FULL EXCEPTION LOG
    // ═════════════════════════════════════════════════════════════════════════

    if (exception.length) {
        if (y > PH - 80) { doc.addPage(); y = 20; }

        section("Exception Log", `All ${exception.length} records`);

        autoTable(doc, {
            ...amzTable(),
            startY: y,
            head: [["Robot", "Device", "Error Type", "Recovery Action", "Solve (min)", "Start"]],
            body: exception.sort((a,b) => dayjs(a.error_start_time).valueOf() - dayjs(b.error_start_time).valueOf()).map(e => [
                e.error_robot        ?? "—",
                e.device_type        ?? "—",
                e.issue_type         ?? "—",
                e.recovery_title     ?? "—",
                e.solving_time       ?? "—",
                dayjs(e.error_start_time).format("HH:mm"),
            ]),
            bodyStyles: {
                ...amzTable().bodyStyles,
                fontSize: 7,
                cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
            },
            columnStyles: {
                0: { cellWidth: 17, halign: "center" },
                1: { cellWidth: 20 },
                2: { cellWidth: "auto" },
                3: { cellWidth: "auto" },
                4: { cellWidth: "auto" },
                5: { cellWidth: 18, halign: "center" },
                6: { cellWidth: 14, halign: "center", textColor: C.hint },
            },
            margin: { left: ML, right: MR },
        });
    }

    // ═════════════════════════════════════════════════════════════════════════
    // FOOTER
    // ═════════════════════════════════════════════════════════════════════════

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        hline(doc, ML, PH - 10, PW - MR, C.borderDark, 0.3);

        f(doc, 6.5, "normal", C.hint);
        doc.text(
            `GLPC Operations  ·  ${shiftType} Shift  ·  ${dayjs(date).format("DD MMM YYYY")}  ·  INTERNAL USE ONLY`,
            ML, PH - 5.5
        );
        doc.text(`Page ${i} of ${totalPages}`, PW - MR, PH - 5.5, { align: "right" });
    }

    doc.save(`GLPC_${shiftType}_${dayjs(date).format("YYYY-MM-DD")}.pdf`);
};