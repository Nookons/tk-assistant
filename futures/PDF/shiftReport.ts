import {toast} from "sonner";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import autoTable from "jspdf-autotable";
import {IEmployeeReport} from "@/types/shift/Report";
import {Timestamp} from "next/dist/server/lib/cache-handlers/types";
import {IRobot} from "@/types/robot/robot";


export const generateShiftReport = async ({report_data, date, shift_type}: {report_data: IEmployeeReport[], date: Date | undefined, shift_type: string}) => {
    if (!report_data || report_data.length === 0) {
        toast.error("No report data available to generate PDF");
        return;
    }

    let robots_created_today: IRobot[] = []

    try {
        const res = await fetch(`/api/robots/get-robots-list-by-date?date=${dayjs(date).format("YYYY-MM-DD")}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            }
        })

        if (!res.ok) return toast.error("Error fetching robots list");
        const response = await res.json();
        robots_created_today = response;

    } catch (error) {
        console.error('Error generating PDF:', error);
    }

    const doc = new jsPDF();

    let yPosition = 40;

    doc.setFontSize(18);
    doc.text('SHEIN SHIFT REPORT', 14, 20);

    doc.setFontSize(10);
    doc.text(`${shift_type.toUpperCase()} SHIFT - ${dayjs(date).format('DD/MM/YYYY')}`, 14, 28);
    doc.setFontSize(8);

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

    yPosition += 8;

    // Robot exceptions summary
    doc.setFontSize(14);
    doc.text("Robots exceptions was handled", 14, yPosition);
    doc.setFontSize(10);

    yPosition += 8;
    doc.text(`Total RT KUBOT: ${totalStats.rt_kubot_exc}`, 14, yPosition);
    doc.text(`Total RT KUBOT MINI: ${totalStats.rt_kubot_mini_exc}`, 53, yPosition);
    doc.text(`Total RT KUBOT E2: ${totalStats.rt_kubot_e2_exc}`, 100, yPosition);
    yPosition += 12;

    // Abnormal summary
    doc.setFontSize(14);
    doc.text("Abnormal was handled", 14, yPosition);
    doc.setFontSize(10);
    yPosition += 8;
    doc.text(`Total Abnormal Locations: ${totalStats.abnormal_location}`, 14, yPosition);
    doc.text(`Total Abnormal Cases: ${totalStats.abnormal_case}`, 65, yPosition);
    yPosition += 15;

    // Employee Details section
    doc.setFontSize(14);
    doc.text('Employee Details', 14, yPosition);
    yPosition += 8;

    // First table: Employee details
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
        theme: 'striped',
        styles: {fontSize: 10},
        headStyles: {fillColor: [41, 128, 185], textColor: 255},
    });

    // Update yPosition after first table
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Robots section header
    doc.setFontSize(14);
    doc.text('Robots sent to Repair', 14, yPosition);
    yPosition += 8;

    // Second table: Robots created today
    autoTable(doc, {
        startY: yPosition,
        head: [['Robot Number', 'Robot Type', 'Sent Time', 'Problem Type', 'Sent By']],
        body: robots_created_today.map(item => [
            item.robot_number,
            item.robot_type,
            dayjs(item.created_at as Timestamp).format('HH:mm'),
            item.type_problem,
            item.add_by,
        ]),
        theme: 'striped',
        styles: {fontSize: 10},
        headStyles: {fillColor: [41, 128, 185], textColor: 255},
    });

    const logoImg = new Image();
    logoImg.onload = function () {
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.addImage(logoImg, 'PNG', pageWidth - 20, 10, 10, 10);

        const fileName = `SHEIN_Report_${shift_type.toUpperCase()}_${dayjs(date).format('YYYY-MM-DD_HH-mm')}.pdf`;
        doc.save(fileName);
    };

    logoImg.src = shift_type === "day" ? '/ico/sun.png' : '/ico/moon.png';
}