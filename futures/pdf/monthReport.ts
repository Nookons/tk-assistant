import dayjs from "dayjs";
import jsPDF from "jspdf";
import { IRobotException } from "@/types/Exception/Exception";
import { NoteItem } from "@/types/Important/Important";
import { IMonthParts } from "@/app/reports/month/page";
import autoTable from "jspdf-autotable";
import { timeToString } from "@/utils/timeToString";
import "@/utils/fonts/NotoSansSC-Regular-normal";
import { getWorkDate } from "@/futures/date/getWorkDate";

// ── Amazon Brand Colors ──────────────────────
const AMAZON = {
    dark:       [35,  47,  62]  as [number, number, number],  // #232F3E
    orange:     [255, 153,  0]  as [number, number, number],  // #FF9900
    lightGray:  [248, 248, 248] as [number, number, number],  // #F8F8F8
    midGray:    [204, 204, 204] as [number, number, number],  // #CCCCCC
    textGray:   [102, 102, 102] as [number, number, number],  // #666666
    white:      [255, 255, 255] as [number, number, number],
    black:      [0,   0,   0]   as [number, number, number],
};

const ROBOT_TYPES = ['K50H', 'A42T', 'A42', 'E2'] as const;
type RobotType = typeof ROBOT_TYPES[number];

interface ILocalProps {
    exception_data:     IRobotException[];
    important_data:     NoteItem[];
    changed_parts_data: IMonthParts[];
}

// ── Drawing Helpers ──────────────────────────

/** Верхний хедер страницы в стиле Amazon */
function drawPageHeader(doc: jsPDF, title: string, subtitle: string) {
    const W = doc.internal.pageSize.getWidth();

    // тёмная полоса
    doc.setFillColor(...AMAZON.dark);
    doc.rect(0, 0, W, 22, 'F');

    // логотип "amazon" белым
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...AMAZON.white);
    doc.text('TK Service', 14, 14);

    // оранжевая точка после "amazon"
    doc.setTextColor(...AMAZON.orange);
    doc.text('.', 38, 14);

    // заголовок справа
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...AMAZON.midGray);
    doc.text(title, W - 14, 10, { align: 'right' });
    doc.text(subtitle, W - 14, 16, { align: 'right' });

    // оранжевая линия под хедером
    doc.setDrawColor(...AMAZON.orange);
    doc.setLineWidth(0.8);
    doc.line(0, 22, W, 22);

    doc.setTextColor(...AMAZON.black);
}

/** Нижний футер страницы */
function drawPageFooter(doc: jsPDF, pageLabel: string) {
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...AMAZON.midGray);
    doc.setLineWidth(0.3);
    doc.line(14, H - 12, W - 14, H - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...AMAZON.textGray);
    doc.text('GLPC Warehouse Operations', 14, H - 6);
    doc.text(pageLabel, W - 14, H - 6, { align: 'right' });
    doc.setTextColor(...AMAZON.black);
}

/** Заголовок секции с оранжевой полосой слева */
function drawSectionTitle(doc: jsPDF, label: string, y: number): number {
    doc.setFillColor(...AMAZON.orange);
    doc.rect(14, y, 2.5, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...AMAZON.dark);
    doc.text(label, 19, y + 5);
    doc.setTextColor(...AMAZON.black);

    return y + 10;
}

/** Плашка "нет данных" */
function drawEmptyBlock(doc: jsPDF, label: string, y: number): number {
    const W = doc.internal.pageSize.getWidth();

    doc.setFillColor(...AMAZON.lightGray);
    doc.setDrawColor(...AMAZON.midGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, W - 28, 12, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...AMAZON.textGray);
    doc.text(label, W / 2, y + 7.5, { align: 'center' });
    doc.setTextColor(...AMAZON.black);

    return y + 16;
}

/** Бейдж со счётчиком */
function drawBadge(doc: jsPDF, text: string, x: number, y: number) {
    const W = doc.getTextWidth(text) + 6;

    doc.setFillColor(...AMAZON.orange);
    doc.roundedRect(x, y - 4, W, 6, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...AMAZON.white);
    doc.text(text, x + 3, y);
    doc.setTextColor(...AMAZON.black);
}


// ── Main ─────────────────────────────────────

export const generateMonthReport = async ({
                                              report_data,
                                              date,
                                          }: {
    report_data: ILocalProps;
    date: Date | null;
}) => {
    if (!date) throw new Error('Date is not defined');

    const doc          = new jsPDF();
    const currentDate  = dayjs(date);
    const daysInMonth  = currentDate.daysInMonth();
    const monthName    = currentDate.format('MMMM YYYY');
    const generatedAt  = dayjs().format('DD/MM/YYYY HH:mm');
    const W            = doc.internal.pageSize.getWidth();

    doc.setFont('NotoSansSC-Regular', 'normal');

    // ════════════════════════════════════════════
    //  COVER PAGE
    // ════════════════════════════════════════════
    drawPageHeader(doc, monthName, `Generated ${generatedAt}`);

    // большой заголовок
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

    // карточки-статистики
    const stats = [
        { label: 'Total Exceptions',  value: report_data.exception_data.length },
        { label: 'Important Notes',   value: report_data.important_data.length },
        { label: 'Changed Parts',     value: report_data.changed_parts_data.length },
        { label: 'Days in Month',     value: daysInMonth },
    ];

    const cardW = (W - 28 - 9) / 4;
    stats.forEach((s, i) => {
        const x = 14 + i * (cardW + 3);
        const y = 115;

        doc.setFillColor(...AMAZON.lightGray);
        doc.setDrawColor(...AMAZON.midGray);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, cardW, 28, 2, 2, 'FD');

        // оранжевая полоска сверху карточки
        doc.setFillColor(...AMAZON.orange);
        doc.roundedRect(x, y, cardW, 3, 2, 2, 'F');
        doc.rect(x, y + 1.5, cardW, 1.5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...AMAZON.dark);
        doc.text(String(s.value), x + cardW / 2, y + 17, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...AMAZON.textGray);
        doc.text(s.label, x + cardW / 2, y + 24, { align: 'center' });
        doc.setTextColor(...AMAZON.black);
    });

    // ── Monthly Exceptions Summary ───────────────
    let yPos = 160;
    yPos = drawSectionTitle(doc, 'Monthly Exceptions Summary', yPos);

    const monthly_user_stats = report_data.exception_data.reduce((acc, item) => {
        const userId   = item.employee;
        const robotType = item.device_type as RobotType;

        if (!acc[userId]) {
            acc[userId] = { user: item.employee, K50H: 0, A42T: 0, A42: 0, E2: 0, total: 0 };
        }
        if (ROBOT_TYPES.includes(robotType)) acc[userId][robotType]++;
        acc[userId].total++;
        return acc;
    }, {} as Record<string, { user: string; K50H: number; A42T: number; A42: number; E2: number; total: number }>);

    const exceptionsTableBody = Object.values(monthly_user_stats).map(item => [
        item.user, item.K50H, item.A42T, item.A42, item.E2, item.total,
    ]);

    if (exceptionsTableBody.length > 0) {
        autoTable(doc, {
            startY: yPos,
            head:   [['User', 'K50H', 'A42T', 'A42', 'E2', 'Total']],
            body:   exceptionsTableBody,
            styles: {
                font:    'helvetica',
                fontSize: 9,
                halign:  'center',
                cellPadding: 3,
            },
            headStyles: {
                fillColor:  AMAZON.dark,
                textColor:  AMAZON.white,
                fontStyle:  'bold',
                lineWidth:  0,
            },
            alternateRowStyles: { fillColor: AMAZON.lightGray },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
            tableLineColor: AMAZON.midGray,
            tableLineWidth: 0.1,
        });
        yPos = (doc as any).lastAutoTable.finalY + 12;
    } else {
        yPos = drawEmptyBlock(doc, 'No exceptions recorded for this month', yPos);
    }

    drawPageFooter(doc, `Cover · ${monthName}`);

    // ════════════════════════════════════════════
    //  DAILY PAGES
    // ════════════════════════════════════════════
    for (let day = 1; day <= daysInMonth; day++) {
        doc.addPage();

        const dayDate      = currentDate.date(day);
        const dayOfWeek    = dayDate.format('dddd');
        const formattedDate = dayDate.format('DD/MM/YYYY');
        const isWeekend    = dayDate.day() === 0 || dayDate.day() === 6;

        drawPageHeader(doc, `Day ${day} — ${dayOfWeek}`, formattedDate);
        drawPageFooter(doc, `${dayOfWeek} · ${formattedDate}`);

        let yPos = 25;

        // ── Important Notes ──────────────────────
        const notes = report_data.important_data.filter(
            item => dayjs(item.date).format('DD/MM/YYYY') === formattedDate
        );

        if (notes.length > 0) {
            yPos = drawSectionTitle(doc, `Important Notes`, yPos);
        }

        if (notes.length > 0) {
            yPos = drawSectionTitle(doc, 'Important Notes', yPos);
            drawBadge(doc, `${notes.length}`, 64, yPos - 6);

            notes.forEach(item => {
                if (yPos > 268) { doc.addPage(); drawPageHeader(doc, `Day ${day}`, formattedDate); drawPageFooter(doc, formattedDate); yPos = 30; }

                doc.setFillColor(...AMAZON.lightGray);
                doc.setDrawColor(...AMAZON.midGray);
                doc.setLineWidth(0.2);

                const lines      = doc.splitTextToSize(item.note, W - 36);
                const blockH     = lines.length * 5 + 8;
                doc.roundedRect(14, yPos, W - 28, blockH, 1.5, 1.5, 'FD');

                // левая оранжевая полоска
                doc.setFillColor(...AMAZON.orange);
                doc.rect(14, yPos, 2, blockH, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8);
                doc.setTextColor(...AMAZON.textGray);
                doc.text(timeToString(item.date), 20, yPos + 5);

                doc.setFont('NotoSansSC-Regular', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(...AMAZON.dark);
                doc.text(lines, 20, yPos + 11);
                doc.setTextColor(...AMAZON.black);

                yPos += blockH + 4;
            });
        }

        yPos += 4;

        // ── Exceptions ───────────────────────────
        const exceptions = report_data.exception_data.filter(
            item => dayjs(getWorkDate(dayjs(item.error_start_time).toDate())).format('DD/MM/YYYY') === formattedDate
        );

        yPos = drawSectionTitle(doc, 'Exceptions', yPos);
        if (exceptions.length > 0) {
            drawBadge(doc, `${exceptions.length}`, 47, yPos - 6);

            const user_day_stats = exceptions.reduce((acc, item) => {
                const userId   = item.employee;
                const robotType = item.device_type as RobotType;

                if (!acc[userId]) {
                    acc[userId] = { user: item.employee, shift: item.shift_type.toUpperCase(), K50H: 0, A42T: 0, A42: 0, E2: 0, total: 0 };
                }
                if (ROBOT_TYPES.includes(robotType)) acc[userId][robotType]++;
                acc[userId].total++;
                return acc;
            }, {} as Record<string, { user: string; shift: string; K50H: number; A42T: number; A42: number; E2: number; total: number }>);

            const tableBody = Object.values(user_day_stats).map(item => [
                item.user, item.shift, item.K50H, item.A42T, item.A42, item.E2, item.total,
            ]);

            autoTable(doc, {
                startY: yPos,
                head:   [['User', 'Shift', 'K50H', 'A42T', 'A42', 'E2', 'Total']],
                body:   tableBody,
                styles: {
                    font:     'helvetica',
                    fontSize:  9,
                    halign:   'center',
                    cellPadding: 2.5,
                },
                headStyles: {
                    fillColor: AMAZON.dark,
                    textColor: AMAZON.white,
                    fontStyle: 'bold',
                    lineWidth: 0,
                },
                alternateRowStyles: { fillColor: AMAZON.lightGray },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold' },
                    6: { textColor: AMAZON.orange, fontStyle: 'bold' },
                },
                tableLineColor: AMAZON.midGray,
                tableLineWidth: 0.1,
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;
        } else {
            yPos = drawEmptyBlock(doc, 'No exceptions recorded for this day', yPos);
        }

        yPos += 4;

        // ── Changed Parts ────────────────────────
        const parts = report_data.changed_parts_data.filter(
            item => dayjs(item.created_at).format('DD/MM/YYYY') === formattedDate
        );

        yPos = drawSectionTitle(doc, 'Changed Parts', yPos);
        if (parts.length > 0) {
            drawBadge(doc, `${parts.length} pcs`, 50, yPos - 6);

            const colW  = (W - 28 - 6) / 2;
            const leftX = 14;
            const rightX = 14 + colW + 6;
            let yLeft   = yPos;
            let yRight  = yPos;
            let useLeft = true;

            parts.forEach(item => {
                const x     = useLeft ? leftX : rightX;
                const yCol  = useLeft ? yLeft  : yRight;

                const titleLine = `${item.parts_numbers} — ${item.part_description}`;
                const subLine   = `Robot #${item.robot.robot_number} (${item.robot.robot_type}) · ${item.user.user_name} · ${dayjs(item.created_at).format('HH:mm')}`;

                const titleLines = doc.splitTextToSize(titleLine, colW - 8);
                const blockH     = titleLines.length * 5 + 14;

                if (yCol + blockH > 268) {
                    doc.addPage();
                    drawPageHeader(doc, `Day ${day}`, formattedDate);
                    drawPageFooter(doc, formattedDate);
                    yLeft = 30; yRight = 30;
                }

                const yDraw = useLeft ? yLeft : yRight;

                doc.setFillColor(...AMAZON.white);
                doc.setDrawColor(...AMAZON.midGray);
                doc.setLineWidth(0.2);
                doc.roundedRect(x, yDraw, colW, blockH, 1.5, 1.5, 'FD');

                // оранжевая верхняя полоска
                doc.setFillColor(...AMAZON.orange);
                doc.roundedRect(x, yDraw, colW, 2.5, 1.5, 1.5, 'F');
                doc.rect(x, yDraw + 1.5, colW, 1, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(8.5);
                doc.setTextColor(...AMAZON.dark);
                doc.text(titleLines, x + 4, yDraw + 9);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(...AMAZON.textGray);
                doc.text(subLine, x + 4, yDraw + blockH - 4);
                doc.setTextColor(...AMAZON.black);

                if (useLeft) yLeft  += blockH + 4;
                else         yRight += blockH + 4;
                useLeft = !useLeft;
            });

            yPos = Math.max(yLeft, yRight) + 4;
        } else {
            drawEmptyBlock(doc, 'No parts changed this day', yPos);
        }
    }

    const fileName = `Amazon_Report_${currentDate.format('YYYY-MM')}_${dayjs().format('YYYY-MM-DD_HH-mm')}.pdf`;
    doc.save(fileName);
};