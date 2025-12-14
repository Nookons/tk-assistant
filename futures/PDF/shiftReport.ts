import {toast} from "sonner";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import autoTable from "jspdf-autotable";
import {IEmployeeReport} from "@/types/shift/Report";
import {IHistoryParts, IHistoryStatus, IRobot} from "@/types/robot/robot";
import "@/utils/fonts/NotoSansSC-Regular-normal";

export const generateShiftReport = async (
    {report_data, date, shift_type, history_status, history_parts}:
    {report_data: IEmployeeReport[], date: Date | undefined, shift_type: string, history_status: IHistoryStatus[], history_parts: IHistoryParts[]}) =>
{
    if (!report_data || report_data.length === 0) {
        toast.error("No report data available to generate PDF");
        return;
    }

    const doc = new jsPDF();
    doc.setFont('NotoSansSC-Regular', 'normal');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 🎨 Modern Light Theme Colors
    const colors = {
        lightBg: [255, 255, 255],        // #FFFFFF - White background
        cardBg: [248, 250, 252],         // #F8FAFC - Light card background
        accent: [59, 130, 246],          // #3B82F6 - Blue accent
        accentLight: [96, 165, 250],     // #60A5FA - Light blue
        text: [15, 23, 42],              // #0F172A - Dark text
        textMuted: [100, 116, 139],      // #64748B - Muted text
        success: [22, 163, 74],          // #16A34A - Green
        warning: [234, 179, 8],          // #EAB308 - Yellow
        danger: [220, 38, 38],           // #DC2626 - Red
        border: [226, 232, 240],         // #E2E8F0 - Border color
    };

    // 🌟 Header with light background
    doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Title
    doc.setFontSize(24);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text('SHEIN SHIFT REPORT', 7, 22);

    // Subtitle with modern styling
    doc.setFontSize(11);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text(`${shift_type.toUpperCase()} SHIFT`, 7, 32);

    doc.setFontSize(10);
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.text(dayjs(date).format('DD/MM/YYYY'), 7, 40);

    let yPosition = 25;

    // 📊 Statistics Summary Card
    const totalStats = report_data.reduce((acc, item) => ({
        rt_kubot_exc: Number(acc.rt_kubot_exc) + Number(item.rt_kubot_exc),
        rt_kubot_mini_exc: Number(acc.rt_kubot_mini_exc) + Number(item.rt_kubot_mini_exc),
        rt_kubot_e2_exc: Number(acc.rt_kubot_e2_exc) + Number(item.rt_kubot_e2_exc),
        abnormal_location: Number(acc.abnormal_location) + Number(item.abnormal_location),
        abnormal_case: Number(acc.abnormal_case) + Number(item.abnormal_case),
    }), {
        rt_kubot_exc: 0,
        rt_kubot_mini_exc: 0,
        rt_kubot_e2_exc: 0,
        abnormal_location: 0,
        abnormal_case: 0
    });

    yPosition += 35;

    // 👥 Employee Details Section
    doc.setFontSize(12);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

    autoTable(doc, {
        startY: yPosition,
        head: [['Employee', 'RT KUBOT', 'RT MINI', 'RT E2', 'ABN LOC', 'ABN CASE']],
        body: report_data.map(item => [
            item.employee_select,
            item.rt_kubot_exc,
            item.rt_kubot_mini_exc,
            item.rt_kubot_e2_exc,
            item.abnormal_location,
            item.abnormal_case,
        ]),
        theme: 'plain',
        styles: {
            fontSize: 9,
            font: 'NotoSansSC-Regular',
            textColor: [15, 23, 42],
            lineColor: [226, 232, 240],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [248, 250, 252],
            textColor: [59, 130, 246],
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'center',
        },
        bodyStyles: {
            fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251],
        },
        margin: { left: 10, right: 10 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;

    // 🟢 Online Status Section
    const onlineCount = history_status.filter(item => item.new_status === "在线 | Online").length;

    doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
    doc.roundedRect(10, yPosition - 5, pageWidth - 20, 8, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setTextColor(colors.success[0], colors.success[1], colors.success[2]);
    doc.text('● Online', 14, yPosition);

    doc.setFontSize(8);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text(`${onlineCount} robots`, pageWidth - 30, yPosition);

    yPosition += 6;

    autoTable(doc, {
        startY: yPosition,
        head: [['Robot', "Status Change", "Employee"]],
        body: history_status.filter(item => item.new_status === "在线 | Online").map(item => [
            item.robot_number,
            `${item.old_status} → ${item.new_status}`,
            item.user.user_name,
        ]),
        theme: 'plain',
        styles: {
            fontSize: 9,
            font: 'NotoSansSC-Regular',
            textColor: [15, 23, 42],
            lineColor: [226, 232, 240],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [248, 250, 252],
            textColor: [22, 163, 74],
            fontSize: 8,
            halign: 'center',
        },
        bodyStyles: {
            fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251],
        },
        margin: { left: 10, right: 10 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;

    // 🔴 Offline Status Section
    const offlineCount = history_status.filter(item => item.new_status === "离线 | Offline").length;

    doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
    doc.roundedRect(10, yPosition - 5, pageWidth - 20, 8, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
    doc.text('● Offline', 14, yPosition);

    doc.setFontSize(8);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text(`${offlineCount} robots`, pageWidth - 30, yPosition);

    yPosition += 6;

    autoTable(doc, {
        startY: yPosition,
        head: [['Robot', "Status Change", "Employee"]],
        body: history_status.filter(item => item.new_status === "离线 | Offline").map(item => [
            item.robot_number,
            `${item.old_status} → ${item.new_status}`,
            item.user.user_name,
        ]),
        theme: 'plain',
        styles: {
            fontSize: 9,
            font: 'NotoSansSC-Regular',
            textColor: [15, 23, 42],
            lineColor: [226, 232, 240],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [248, 250, 252],
            textColor: [220, 38, 38],
            fontSize: 8,
            halign: 'center',
        },
        bodyStyles: {
            fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251],
        },
        margin: { left: 10, right: 10 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;

    // 🔧 Parts Section
    doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
    doc.roundedRect(10, yPosition - 5, pageWidth - 20, 8, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setTextColor(colors.warning[0], colors.warning[1], colors.warning[2]);
    doc.text('🔧⊛ Parts Replacement', 14, yPosition);

    doc.setFontSize(8);
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text(`${history_parts.length} records`, pageWidth - 30, yPosition);

    yPosition += 6;

    autoTable(doc, {
        startY: yPosition,
        head: [['Robot', "Current Status", "Employee", "Parts Number(s)"]],
        body: history_parts.map(item => [
            item.robot.robot_number,
            item.robot.status,
            item.user.user_name,
            JSON.parse(item.parts_numbers).join(' • '),
        ]),
        theme: 'plain',
        styles: {
            fontSize: 9,
            font: 'NotoSansSC-Regular',
            textColor: [15, 23, 42],
            lineColor: [226, 232, 240],
            lineWidth: 0.1,
        },
        headStyles: {
            fillColor: [248, 250, 252],
            textColor: [234, 179, 8],
            fontSize: 8,
            halign: 'center',
        },
        bodyStyles: {
            fillColor: [255, 255, 255],
        },
        alternateRowStyles: {
            fillColor: [249, 250, 251],
        },
        margin: { left: 10, right: 10 },
    });

    // 🎨 Footer with light accent
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(0, pageHeight - 3, pageWidth, 3, 'F');

    // Logo with modern styling
    const logoImg = new Image();
    logoImg.onload = function () {
        // Logo background circle
        doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
        doc.circle(pageWidth - 20, 20, 8, 'F');

        doc.addImage(logoImg, 'PNG', pageWidth - 25, 15, 10, 10);

        const fileName = `SHEIN_Report_${shift_type.toUpperCase()}_${dayjs(date).format('YYYY-MM-DD_HH-mm')}.pdf`;
        doc.save(fileName);
    };

    logoImg.src = shift_type === "day" ? '/ico/sun.png' : '/ico/moon.png';
}