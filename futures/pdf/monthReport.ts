import dayjs from "dayjs";
import jsPDF from "jspdf";
import {IRobotException} from "@/types/Exception/Exception";
import {NoteItem} from "@/types/Important/Important";
import {IMonthParts} from "@/app/reports/month/page";
import {IUser} from "@/types/user/user";
import autoTable from "jspdf-autotable";
import {timeToString} from "@/utils/timeToString";
import "@/utils/fonts/NotoSansSC-Regular-normal";
import {getWorkDate} from "@/futures/date/getWorkDate";

interface ILocalProps {
    exception_data: IRobotException[];
    important_data: NoteItem[];
    changed_parts_data: IMonthParts[];
}

const ROBOT_TYPES = ['K50H', 'A42T', 'A42', 'E2'] as const;
type RobotType = typeof ROBOT_TYPES[number];


export const generateMonthReport = async ({report_data, date}: { report_data: ILocalProps, date: Date | null}) => {

    if (!date) throw new Error('Date is not defined');

    const doc = new jsPDF();
    doc.setFont('NotoSansSC-Regular', 'normal');
    const currentDate = dayjs(date);

    const daysInMonth = currentDate.daysInMonth();
    const monthName = currentDate.format('MMMM YYYY');

    doc.setFontSize(18);
    doc.text('Month Report GLPC', 14, 20);

    doc.setFontSize(12);
    doc.text(monthName, 14, 30);

    doc.setFontSize(10);
    doc.text(`Generated - ${dayjs().format('DD/MM/YYYY [at] HH:mm')}`, 14, 40);

    let yPosition = 45;

    const month_exceptions = report_data.exception_data;

    const monthly_user_stats = month_exceptions.reduce((acc, item) => {
        const userId = item.employee;
        const robotType = item.device_type as RobotType;

        if (!acc[userId]) {
            acc[userId] = {
                user: item.employee,
                K50H: 0,
                A42T: 0,
                A42: 0,
                E2: 0,
                total: 0,
            };
        }

        if (ROBOT_TYPES.includes(robotType)) {
            acc[userId][robotType]++;
        }

        acc[userId].total++;
        return acc;
    }, {} as Record<string, {
        user: string;
        K50H: number;
        A42T: number;
        A42: number;
        E2: number;
        total: number;
    }>);

    const exceptionsTableBody = Object.values(monthly_user_stats).map(item => ([
        item.user,
        item.K50H,
        item.A42T,
        item.A42,
        item.E2,
        item.total,
    ]));

    const importantNotes = report_data.important_data.map(note => ({
        date: timeToString(note.date),
        note: note.note,
    }));

    const month_parts = report_data.changed_parts_data;

    if (exceptionsTableBody.length > 0) {
        autoTable(doc, {
            startY: yPosition,
            head: [['User', 'K50H', 'A42T', 'A42', 'E2', 'Total']],
            body: exceptionsTableBody,
            styles: { halign: 'center', fontSize: 10, font: 'NotoSansSC-Regular' },
            headStyles: { fillColor: [30, 30, 30], textColor: 255 },
            columnStyles: { 0: { halign: 'left', cellWidth: 50 } },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
        doc.text('No exceptions recorded for this month', 14, yPosition);
        yPosition += 10;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Important Notes:', 14, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (importantNotes.length > 0) {
        importantNotes.forEach(note => {
            if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;
            }
            const lines = doc.splitTextToSize(`${note.date} - ${note.note}`, 180);
            doc.text(lines, 14, yPosition);
            yPosition += lines.length * 5 + 4;
        });
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Changed Parts Summary:', 14, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    doc.text(`This month was changed: (${month_parts.length}) pcs parts`, 14, yPosition);
    yPosition += 7;

    for (let day = 1; day <= daysInMonth; day++) {
        if (day > 1 || true) {
            doc.addPage();
        }

        const dayDate = currentDate.date(day);
        const dayOfWeek = dayDate.format('dddd');
        const formattedDate = dayDate.format('DD/MM/YYYY');

        doc.setFontSize(16);
        doc.text(`Day ${day} - ${dayOfWeek}`, 14, 20);

        doc.setFontSize(12);
        doc.text(formattedDate, 14, 30);

        let yPosition = 45;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Important Notes:', 14, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const today_records_notes = report_data.important_data.filter(item => dayjs(item.date).format('DD/MM/YYYY') === formattedDate);

        if (today_records_notes.length > 0) {
            today_records_notes.forEach(item => {
                if (yPosition > 280) {
                    doc.addPage();
                    yPosition = 20;
                }
                const lines = doc.splitTextToSize(item.note, 180);
                doc.text(lines, 14, yPosition);
                yPosition += lines.length * 5 + 4;
            });
        } else {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            const blockHeight = 14;
            const blockY = yPosition;
            doc.setFillColor(240, 240, 240);
            doc.roundedRect(14, blockY, 180, blockHeight, 3, 3, 'F');
            doc.setTextColor(128, 128, 128);
            doc.setFontSize(10);
            doc.text('No any important records for this day', 104, blockY + blockHeight / 2 + 1, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            yPosition += blockHeight + 4;
        }

        yPosition += 5;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Exceptions:', 14, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const today_records_exceptions = report_data.exception_data.filter(item => dayjs(getWorkDate(dayjs(item.error_start_time).toDate())).format('DD/MM/YYYY') === formattedDate);

        const user_day_stats = today_records_exceptions.reduce((acc, item) => {
            const userId = item.employee;
            const robotType = item.device_type as RobotType;

            if (!acc[userId]) {
                acc[userId] = {
                    user: item.employee,
                    shift: item.shift_type.toUpperCase(),
                    K50H: 0,
                    A42T: 0,
                    A42: 0,
                    E2: 0,
                    total: 0,
                };
            }

            if (ROBOT_TYPES.includes(robotType)) {
                acc[userId][robotType]++;
            }

            acc[userId].total++;
            return acc;
        }, {} as Record<string, {
            user: string;
            shift: string;
            K50H: number;
            A42T: number;
            A42: number;
            E2: number;
            total: number;
        }>);

        const tableBody = Object.values(user_day_stats).map(item => ([
            item.user,
            item.shift,
            item.K50H,
            item.A42T,
            item.A42,
            item.E2,
            item.total,
        ]));

        autoTable(doc, {
            startY: yPosition,
            head: [['User', 'Shift', 'K50H', 'A42T', 'A42', 'E2', 'Total']],
            body: tableBody,
            styles: { halign: 'center', fontSize: 10, font: 'NotoSansSC-Regular' },
            headStyles: { fillColor: [30, 30, 30], textColor: 255 },
            columnStyles: { 0: { halign: 'left' }, 1: { halign: 'center' } },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
        yPosition += 5;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Changed Parts:', 14, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const today_records_parts = report_data.changed_parts_data.filter(
            item => dayjs(item.created_at).format('DD/MM/YYYY') === formattedDate
        );

        if (today_records_parts.length > 0) {
            const colWidth = 90;
            const leftX = 14;
            const rightX = leftX + colWidth + 10;
            let yLeft = yPosition;
            let yRight = yPosition;
            let useLeft = true;

            today_records_parts.forEach(item => {
                const blockText = `
${item.parts_numbers} - ${item.part_description}
Robot (${item.robot.robot_number}) ${item.robot.robot_type} - ${item.user.user_name} ${dayjs(item.created_at).format('HH:mm')}
        `;
                const lines = doc.splitTextToSize(blockText, colWidth);
                if ((useLeft && yLeft + lines.length * 5 > 280) || (!useLeft && yRight + lines.length * 5 > 280)) {
                    doc.addPage();
                    yLeft = 20;
                    yRight = 20;
                }
                if (useLeft) {
                    doc.text(lines, leftX, yLeft);
                    yLeft += lines.length * 5 - 4;
                } else {
                    doc.text(lines, rightX, yRight);
                    yRight += lines.length * 5 - 4;
                }
                useLeft = !useLeft;
            });
            yPosition = Math.max(yLeft, yRight) + 5;
        } else {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            const blockHeight = 14;
            const blockY = yPosition;
            doc.setFillColor(240, 240, 240);
            doc.roundedRect(14, blockY, 180, blockHeight, 3, 3, 'F');
            doc.setTextColor(128, 128, 128);
            doc.setFontSize(10);
            doc.text('No any changed parts for this day', 104, blockY + blockHeight / 2 + 1, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            yPosition += blockHeight + 4;
        }

        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Day ${day} of ${daysInMonth}`, 14, 290);
        doc.setTextColor(0, 0, 0);
    }

    const fileName = `SHEIN_Report_${currentDate.format('YYYY-MM')}_${dayjs().format('YYYY-MM-DD_HH-mm')}.pdf`;
    doc.save(fileName);
};
