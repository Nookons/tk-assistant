import dayjs from "dayjs";
import jsPDF from "jspdf";
import { IRobotException } from "@/types/Exception/Exception";
import { NoteItem } from "@/types/Important/Important";
import { IMonthParts } from "@/app/reports/month/page";
import autoTable from "jspdf-autotable";
import { timeToString } from "@/utils/timeToString";
import "@/utils/fonts/NotoSansSC-Regular-normal";
import { getWorkDate } from "@/futures/date/getWorkDate";

// ── Amazon Brand Colors ──────────────────────────────────────────────────────
const AMAZON = {
    dark:      [35,  47,  62]  as [number, number, number], // #232F3E
    orange:    [255, 153,  0]  as [number, number, number], // #FF9900
    lightGray: [248, 248, 248] as [number, number, number], // #F8F8F8
    midGray:   [204, 204, 204] as [number, number, number], // #CCCCCC
    textGray:  [102, 102, 102] as [number, number, number], // #666666
    weekend:   [255, 248, 235] as [number, number, number], // warm weekend tint
    white:     [255, 255, 255] as [number, number, number],
    black:     [0,   0,   0]   as [number, number, number],
};

const PAGE_MARGIN   = 14;
const HEADER_HEIGHT = 22;
const FOOTER_HEIGHT = 12;
const PAGE_BREAK_Y  = 268;

const ROBOT_TYPES = ['K50H', 'A42T', 'A42T_E2'] as const;
type RobotType = typeof ROBOT_TYPES[number];

interface IReportData {
    exception_data:     IRobotException[];
    important_data:     NoteItem[];
    changed_parts_data: IMonthParts[];
}

// ── Font helpers ─────────────────────────────────────────────────────────────

/**
 * Returns true if the string contains any CJK (Chinese / Japanese / Korean)
 * or other non-Latin characters that Helvetica cannot render.
 */
function needsCjkFont(text: string): boolean {
    return /[\u3000-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F\u{20000}-\u{2A6DF}]/u.test(text);
}

/**
 * Sets the appropriate font before rendering a piece of text.
 * Use this instead of calling setFont() directly for any user-supplied strings.
 *
 * @param style  'normal' | 'bold'  — only 'normal' is available for NotoSansSC
 */
function setTextFont(doc: jsPDF, text: string, style: 'normal' | 'bold' = 'normal') {
    if (needsCjkFont(text)) {
        // NotoSansSC covers CJK; it only has a 'normal' weight in this bundle
        doc.setFont('NotoSansSC-Regular', 'normal');
    } else {
        doc.setFont('helvetica', style);
    }
}

/**
 * splitTextToSize that automatically switches to the CJK font when needed,
 * ensuring the line-break calculation uses the correct glyph widths.
 */
function splitText(doc: jsPDF, text: string, maxWidth: number): string[] {
    setTextFont(doc, text);
    return doc.splitTextToSize(text, maxWidth);
}

// ── Low-level helpers ────────────────────────────────────────────────────────

function pageWidth(doc: jsPDF): number {
    return doc.internal.pageSize.getWidth();
}

function drawPageHeader(doc: jsPDF, title: string, subtitle: string, isWeekend = false) {
    const W = pageWidth(doc);

    doc.setFillColor(...(isWeekend ? AMAZON.weekend : AMAZON.dark));
    doc.rect(0, 0, W, HEADER_HEIGHT, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...(isWeekend ? AMAZON.dark : AMAZON.white));
    doc.text('TK Service', PAGE_MARGIN, 14);

    doc.setTextColor(...AMAZON.orange);
    doc.text('.', 38, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...AMAZON.midGray);
    doc.text(title,    W - PAGE_MARGIN, 10, { align: 'right' });
    doc.text(subtitle, W - PAGE_MARGIN, 16, { align: 'right' });

    doc.setDrawColor(...AMAZON.orange);
    doc.setLineWidth(0.8);
    doc.line(0, HEADER_HEIGHT, W, HEADER_HEIGHT);

    doc.setTextColor(...AMAZON.black);
}

function drawPageFooter(doc: jsPDF, pageLabel: string) {
    const W = pageWidth(doc);
    const H = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...AMAZON.midGray);
    doc.setLineWidth(0.3);
    doc.line(PAGE_MARGIN, H - FOOTER_HEIGHT, W - PAGE_MARGIN, H - FOOTER_HEIGHT);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...AMAZON.textGray);
    doc.text('GLPC Warehouse Operations', PAGE_MARGIN, H - 6);
    doc.text(pageLabel, W - PAGE_MARGIN, H - 6, { align: 'right' });

    doc.setTextColor(...AMAZON.black);
}

/** Section title with orange left accent bar. Returns next Y position. */
function drawSectionTitle(doc: jsPDF, label: string, y: number): number {
    doc.setFillColor(...AMAZON.orange);
    doc.rect(PAGE_MARGIN, y, 2.5, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...AMAZON.dark);
    doc.text(label, PAGE_MARGIN + 5, y + 5);
    doc.setTextColor(...AMAZON.black);

    return y + 10;
}

/** "No data" placeholder block. Returns next Y position. */
function drawEmptyBlock(doc: jsPDF, label: string, y: number): number {
    const W = pageWidth(doc);

    doc.setFillColor(...AMAZON.lightGray);
    doc.setDrawColor(...AMAZON.midGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(PAGE_MARGIN, y, W - PAGE_MARGIN * 2, 12, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...AMAZON.textGray);
    doc.text(label, W / 2, y + 7.5, { align: 'center' });
    doc.setTextColor(...AMAZON.black);

    return y + 16;
}

/** Orange badge with counter. */
function drawBadge(doc: jsPDF, text: string, x: number, y: number) {
    const badgeW = doc.getTextWidth(text) + 6;

    doc.setFillColor(...AMAZON.orange);
    doc.roundedRect(x, y - 4, badgeW, 6, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...AMAZON.white);
    doc.text(text, x + 3, y);
    doc.setTextColor(...AMAZON.black);
}

// ── Cover page helpers ───────────────────────────────────────────────────────

function drawCoverStats(doc: jsPDF, data: IReportData, daysInMonth: number, yStart: number) {
    const W = pageWidth(doc);
    const stats = [
        { label: 'Total Exceptions', value: data.exception_data.length },
        { label: 'Important Notes',  value: data.important_data.length },
        { label: 'Changed Parts',    value: data.changed_parts_data.length },
        { label: 'Days in Month',    value: daysInMonth },
    ];

    const cardW = (W - PAGE_MARGIN * 2 - 9) / 4;

    stats.forEach((s, i) => {
        const x = PAGE_MARGIN + i * (cardW + 3);

        doc.setFillColor(...AMAZON.lightGray);
        doc.setDrawColor(...AMAZON.midGray);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, yStart, cardW, 28, 2, 2, 'FD');

        // orange top strip
        doc.setFillColor(...AMAZON.orange);
        doc.roundedRect(x, yStart, cardW, 3, 2, 2, 'F');
        doc.rect(x, yStart + 1.5, cardW, 1.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...AMAZON.dark);
        doc.text(String(s.value), x + cardW / 2, yStart + 17, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...AMAZON.textGray);
        doc.text(s.label, x + cardW / 2, yStart + 24, { align: 'center' });
        doc.setTextColor(...AMAZON.black);
    });
}

function drawMonthlyExceptionsSummary(
    doc: jsPDF,
    exception_data: IRobotException[],
    yStart: number,
): number {
    let y = drawSectionTitle(doc, 'Monthly Exceptions Summary', yStart);

    const byUser = exception_data.reduce((acc, item) => {
        const uid = item.employee;
        if (!acc[uid]) {
            acc[uid] = {
                user: item.employee,
                K50H: 0,
                A42T: 0,
                A42T_E2: 0,
                total: 0,
            };
        }
        const rt = item.device_type as RobotType;
        if (ROBOT_TYPES.includes(rt)) acc[uid][rt]++;
        acc[uid].total++;
        return acc;
    }, {} as Record<string, { user: string; K50H: number; A42T: number; A42T_E2: number; total: number }>);

    const body = Object.values(byUser).map(r => [r.user, r.K50H, r.A42T, r.A42T_E2, r.total]);

    if (body.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [['User', 'K50H', 'A42T', 'A42T_E2', 'Total']],
            body,
            styles: { font: 'helvetica', fontSize: 9, halign: 'center', cellPadding: 3 },
            headStyles: { fillColor: AMAZON.dark, textColor: AMAZON.white, fontStyle: 'bold', lineWidth: 0 },
            alternateRowStyles: { fillColor: AMAZON.lightGray },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold' },
                4: { textColor: AMAZON.orange, fontStyle: 'bold' }, // Total column index changed from 5 to 4
            },
            tableLineColor: AMAZON.midGray,
            tableLineWidth: 0.1,
            didParseCell: (data) => {
                if (needsCjkFont(String(data.cell.text))) {
                    data.cell.styles.font = 'NotoSansSC-Regular';
                    data.cell.styles.fontStyle = 'normal';
                }
            },
        });
        y = (doc as any).lastAutoTable.finalY + 12;
    } else {
        y = drawEmptyBlock(doc, 'No exceptions recorded for this month', y);
    }

    return y;
}

// ── Daily page sections ──────────────────────────────────────────────────────

interface DayContext {
    day:           number;
    formattedDate: string;
    dayOfWeek:     string;
    isWeekend:     boolean;
}

/** Adds a new page and redraws header/footer. Returns fresh yPos. */
function addOverflowPage(doc: jsPDF, ctx: DayContext): number {
    doc.addPage();
    drawPageHeader(doc, `Day ${ctx.day} — ${ctx.dayOfWeek} (cont.)`, ctx.formattedDate, ctx.isWeekend);
    drawPageFooter(doc, `${ctx.dayOfWeek} · ${ctx.formattedDate}`);
    return HEADER_HEIGHT + 3;
}

function drawImportantNotes(doc: jsPDF, notes: NoteItem[], yStart: number, ctx: DayContext): number {
    let y = drawSectionTitle(doc, 'Important Notes', yStart);

    if (notes.length === 0) {
        return drawEmptyBlock(doc, 'No notes for this day', y);
    }

    drawBadge(doc, `${notes.length}`, PAGE_MARGIN + 50, y - 6);

    const W = pageWidth(doc);

    for (const item of notes) {
        // splitText switches to the correct font before measuring — CJK safe
        doc.setFontSize(9);
        const lines  = splitText(doc, item.note, W - PAGE_MARGIN * 2 - 10);
        const LINE_H = 5.2; // consistent line height for fontSize 9
        const blockH = lines.length * LINE_H + 12;

        if (y + blockH > PAGE_BREAK_Y) {
            y = addOverflowPage(doc, ctx);
        }

        doc.setFillColor(...AMAZON.lightGray);
        doc.setDrawColor(...AMAZON.midGray);
        doc.setLineWidth(0.2);
        doc.roundedRect(PAGE_MARGIN, y, W - PAGE_MARGIN * 2, blockH, 1.5, 1.5, 'FD');

        doc.setFillColor(...AMAZON.orange);
        doc.rect(PAGE_MARGIN, y, 2, blockH, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...AMAZON.textGray);
        doc.text(timeToString(item.date), PAGE_MARGIN + 6, y + 5.5);

        // font already set by splitText — re-apply size and render
        doc.setFontSize(9);
        setTextFont(doc, item.note);
        doc.setTextColor(...AMAZON.dark);
        doc.text(lines, PAGE_MARGIN + 6, y + 11);
        doc.setTextColor(...AMAZON.black);

        y += blockH + 4;
    }

    return y;
}

function drawExceptions(
    doc: jsPDF,
    exceptions: IRobotException[],
    yStart: number,
    ctx: DayContext,
): number {
    let y = drawSectionTitle(doc, 'Exceptions', yStart);

    if (exceptions.length === 0) {
        return drawEmptyBlock(doc, 'No exceptions recorded for this day', y);
    }

    drawBadge(doc, `${exceptions.length}`, PAGE_MARGIN + 33, y - 6);

    const byUser = exceptions.reduce((acc, item) => {
        const uid = item.employee;
        if (!acc[uid]) {
            acc[uid] = {
                user:  item.employee,
                shift: item.shift_type.toUpperCase(),
                K50H: 0, A42T: 0, A42T_E2: 0, total: 0,
            };
        }
        const rt = item.device_type as RobotType;
        if (ROBOT_TYPES.includes(rt)) acc[uid][rt]++;
        acc[uid].total++;
        return acc;
    }, {} as Record<string, { user: string; shift: string; K50H: number; A42T: number; A42T_E2: number; total: number }>);

    const body = Object.values(byUser).map(r => [r.user, r.shift, r.K50H, r.A42T, r.total]);

    // Estimate table height; if it would overflow — start on fresh page
    const estimatedH = body.length * 9 + 12;
    if (y + estimatedH > PAGE_BREAK_Y) {
        y = addOverflowPage(doc, ctx);
        y = drawSectionTitle(doc, 'Exceptions (cont.)', y);
    }

    autoTable(doc, {
        startY: y,
        head:   [['User', 'Shift', 'K50H', 'A42T', 'A42T E2', 'Total']],
        body,
        styles: { font: 'helvetica', fontSize: 9, halign: 'center', cellPadding: 2.5 },
        headStyles:         { fillColor: AMAZON.dark, textColor: AMAZON.white, fontStyle: 'bold', lineWidth: 0 },
        alternateRowStyles: { fillColor: AMAZON.lightGray },
        columnStyles: {
            0: { halign: 'left', fontStyle: 'bold' },
            6: { textColor: AMAZON.orange, fontStyle: 'bold' },
        },
        tableLineColor: AMAZON.midGray,
        tableLineWidth: 0.1,
        didParseCell: (data) => {
            if (needsCjkFont(String(data.cell.text))) {
                data.cell.styles.font      = 'NotoSansSC-Regular';
                data.cell.styles.fontStyle = 'normal';
            }
        },
    });

    return (doc as any).lastAutoTable.finalY + 10;
}

function drawChangedParts(
    doc: jsPDF,
    parts: IMonthParts[],
    yStart: number,
    ctx: DayContext,
): number {
    let y = drawSectionTitle(doc, 'Changed Parts', yStart);

    if (parts.length === 0) {
        return drawEmptyBlock(doc, 'No parts changed this day', y);
    }

    drawBadge(doc, `${parts.length} pcs`, PAGE_MARGIN + 36, y - 6);

    const W    = pageWidth(doc);
    const colW = (W - PAGE_MARGIN * 2 - 6) / 2;

    let yLeft  = y;
    let yRight = y;
    let left   = true; // which column to render into

    for (const item of parts) {
        const titleLine  = `${item.parts_numbers} — ${item.part_description}`;
        const subLine    = `Robot #${item.robot.robot_number} (${item.robot.robot_type}) · ${item.user.user_name} · ${dayjs(item.created_at).format('HH:mm')}`;

        // Use correct font before measuring so CJK characters don't get cut off
        const TITLE_SIZE = 8.5;
        const SUB_SIZE   = 7.5;
        const TITLE_LH   = 5.0; // line height for fontSize 8.5
        const SUB_LH     = 4.5; // line height for fontSize 7.5
        const INNER_W    = colW - 8;

        doc.setFontSize(TITLE_SIZE);
        const titleLines = splitText(doc, titleLine, INNER_W);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(SUB_SIZE);
        const subLines   = doc.splitTextToSize(subLine, INNER_W);

        const PADDING_TOP    = 7;  // space before title text
        const PADDING_BOTTOM = 4;  // space after sub text
        const STRIP_H        = 3;  // orange top strip
        const blockH = STRIP_H + PADDING_TOP
            + titleLines.length * TITLE_LH
            + 3                             // gap between title & sub
            + subLines.length   * SUB_LH
            + PADDING_BOTTOM;

        const yCol = left ? yLeft : yRight;

        // If the current column would overflow, restart from left on a new page
        if (yCol + blockH > PAGE_BREAK_Y) {
            const freshY = addOverflowPage(doc, ctx);
            yLeft  = freshY;
            yRight = freshY;
            left   = true;
        }

        const yDraw = left ? yLeft : yRight;
        const xDraw = left ? PAGE_MARGIN : PAGE_MARGIN + colW + 6;

        doc.setFillColor(...AMAZON.white);
        doc.setDrawColor(...AMAZON.midGray);
        doc.setLineWidth(0.2);
        doc.roundedRect(xDraw, yDraw, colW, blockH, 1.5, 1.5, 'FD');

        // orange top strip
        doc.setFillColor(...AMAZON.orange);
        doc.roundedRect(xDraw, yDraw, colW, STRIP_H, 1.5, 1.5, 'F');
        doc.rect(xDraw, yDraw + 1.5, colW, 1.5, 'F');

        // Title — CJK-aware font
        doc.setFontSize(TITLE_SIZE);
        setTextFont(doc, titleLine, 'bold');
        doc.setTextColor(...AMAZON.dark);
        doc.text(titleLines, xDraw + 4, yDraw + STRIP_H + PADDING_TOP);

        // Sub line — always latin (robot number, user name, time)
        const subY = yDraw + STRIP_H + PADDING_TOP + titleLines.length * TITLE_LH + 3;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(SUB_SIZE);
        doc.setTextColor(...AMAZON.textGray);
        doc.text(subLines, xDraw + 4, subY);
        doc.setTextColor(...AMAZON.black);

        if (left) yLeft  += blockH + 4;
        else      yRight += blockH + 4;
        left = !left;
    }

    return Math.max(yLeft, yRight) + 4;
}

// ── Main export ──────────────────────────────────────────────────────────────

export const generateMonthReport = async ({
                                              report_data,
                                              date,
                                          }: {
    report_data: IReportData;
    date: Date | null;
}): Promise<void> => {
    if (!date) throw new Error('Date is not defined');

    const doc          = new jsPDF();
    const currentDate  = dayjs(date);
    const daysInMonth  = currentDate.daysInMonth();
    const monthName    = currentDate.format('MMMM YYYY');
    const generatedAt  = dayjs().format('DD/MM/YYYY HH:mm');
    const W            = pageWidth(doc);

    doc.setFont('NotoSansSC-Regular', 'normal');

    // ── Cover page ───────────────────────────────────────────────────────────
    drawPageHeader(doc, monthName, `Generated ${generatedAt}`);

    doc.setFillColor(...AMAZON.dark);
    doc.rect(0, 60, W, 40, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...AMAZON.white);
    doc.text('Monthly Operations Report', W / 2, 78, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...AMAZON.orange);
    doc.text('GLPC Warehouse · ' + monthName, W / 2, 89, { align: 'center' });
    doc.setTextColor(...AMAZON.black);

    drawCoverStats(doc, report_data, daysInMonth, 115);

    let coverY = 160;
    coverY = drawMonthlyExceptionsSummary(doc, report_data.exception_data, coverY);

    drawPageFooter(doc, `Cover · ${monthName}`);

    // ── Daily pages ──────────────────────────────────────────────────────────
    for (let day = 1; day <= daysInMonth; day++) {
        doc.addPage();

        const dayDate       = currentDate.date(day);
        const dayOfWeek     = dayDate.format('dddd');
        const formattedDate = dayDate.format('DD/MM/YYYY');
        const isWeekend     = dayDate.day() === 0 || dayDate.day() === 6;

        const ctx: DayContext = { day, formattedDate, dayOfWeek, isWeekend };

        drawPageHeader(doc, `Day ${day} — ${dayOfWeek}`, formattedDate, isWeekend);
        drawPageFooter(doc, `${dayOfWeek} · ${formattedDate}`);

        let yPos = HEADER_HEIGHT + 3;

        const notes = report_data.important_data.filter(
            item => dayjs(item.date).format('DD/MM/YYYY') === formattedDate,
        );

        const exceptions = report_data.exception_data.filter(
            item =>
                dayjs(getWorkDate(dayjs(item.error_start_time).toDate())).format('DD/MM/YYYY') ===
                formattedDate,
        );

        const parts = report_data.changed_parts_data.filter(
            item => dayjs(item.created_at).format('DD/MM/YYYY') === formattedDate,
        );

        yPos = drawImportantNotes(doc, notes,      yPos + 4, ctx);
        yPos = drawExceptions    (doc, exceptions, yPos + 4, ctx);
        drawChangedParts   (doc, parts,      yPos + 4, ctx);
    }

    const fileName = `Amazon_Report_${currentDate.format('YYYY-MM')}_${dayjs().format('YYYY-MM-DD_HH-mm')}.pdf`;
    doc.save(fileName);
};