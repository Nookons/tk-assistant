import autoTable from "jspdf-autotable";
import {toast} from "sonner";
import {IShift} from "@/types/shift/shift";
import dayjs from "dayjs";
import jsPDF from "jspdf";

interface ILocalSumm {
    employee_name: string;
    rt_kubot_exc: number;
    rt_kubot_mini_exc: number;
    rt_kubot_e2_exc: number;
    abnormal_location: number;
    abnormal_case: number;
}

export const generateMonthReport = async ({report_data}: { report_data: IShift[] }) => {
    if (!report_data || report_data.length === 0) {
        toast.error("No report data available to generate PDF");
        return;
    }

    const doc = new jsPDF();
    let yPosition = 40;

    doc.setFontSize(18);
    doc.text('Month Report GLPC', 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated - ${dayjs().format('DD/MM/YYYY [at] HH:mm')}`, 14, 25);

    // Calculate total stats
    const totalStats = report_data.reduce((acc, item) => ({
        rt_kubot_exc: acc.rt_kubot_exc + Number(item.rt_kubot_exc || 0),
        rt_kubot_mini_exc: acc.rt_kubot_mini_exc + Number(item.rt_kubot_mini || 0),
        rt_kubot_e2_exc: acc.rt_kubot_e2_exc + Number(item.rt_kubot_e2 || 0),
        abnormal_location: acc.abnormal_location + Number(item.abnormal_locations || 0),
        abnormal_case: acc.abnormal_case + Number(item.abnormal_cases || 0),
    }), {
        rt_kubot_exc: 0,
        rt_kubot_mini_exc: 0,
        rt_kubot_e2_exc: 0,
        abnormal_location: 0,
        abnormal_case: 0
    });

    yPosition += 4;

    doc.setFontSize(14);
    doc.text("Robots exceptions handled", 14, yPosition);
    doc.setFontSize(10);

    yPosition += 8;
    doc.text(`Total RT KUBOT: ${totalStats.rt_kubot_exc}`, 14, yPosition);
    doc.text(`Total RT KUBOT MINI: ${totalStats.rt_kubot_mini_exc}`, 53, yPosition);
    doc.text(`Total RT KUBOT E2: ${totalStats.rt_kubot_e2_exc}`, 100, yPosition);

    yPosition += 12;
    doc.setFontSize(14);
    doc.text("Abnormal handled", 14, yPosition);
    doc.setFontSize(10);

    yPosition += 8;
    doc.text(`Total Abnormal Locations: ${totalStats.abnormal_location}`, 14, yPosition);
    doc.text(`Total Abnormal Cases: ${totalStats.abnormal_case}`, 65, yPosition);

    yPosition += 15;
    doc.setFontSize(14);
    doc.text('Employee Details', 14, yPosition);

    yPosition += 8;

    let handled_employees: string[] = []
    let employee_month_summ: ILocalSumm[] = []

    report_data.forEach(report => {

        if(handled_employees.includes(report.employee_name)) return

        handled_employees.push(report.employee_name)
        const employee_shift = report_data.filter(i => i.employee_name === report.employee_name)

        const employeeStats = employee_shift.reduce((acc, item) => ({
            employee_name: item.employee_name,
            rt_kubot_exc: acc.rt_kubot_exc + Number(item.rt_kubot_exc || 0),
            rt_kubot_mini_exc: acc.rt_kubot_mini_exc + Number(item.rt_kubot_mini || 0),
            rt_kubot_e2_exc: acc.rt_kubot_e2_exc + Number(item.rt_kubot_e2 || 0),
            abnormal_location: acc.abnormal_location + Number(item.abnormal_locations || 0),
            abnormal_case: acc.abnormal_case + Number(item.abnormal_cases || 0),
        }), {
            employee_name: report.employee_name,
            rt_kubot_exc: 0,
            rt_kubot_mini_exc: 0,
            rt_kubot_e2_exc: 0,
            abnormal_location: 0,
            abnormal_case: 0
        });

        employee_month_summ.push(employeeStats)
    })

    // First table: Employee summary
    autoTable(doc, {
        startY: yPosition,
        head: [['Employee', 'RT KUBOT', 'RT MINI', 'RT E2', 'ABN LOC', 'ABN CASE']],
        body: employee_month_summ.map(item => [
            item.employee_name,
            item.rt_kubot_exc,
            item.rt_kubot_mini_exc,
            item.rt_kubot_e2_exc,
            item.abnormal_location,
            item.abnormal_case,
        ]),
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    // Get the final Y position after the first table
    const finalY = (doc as any).lastAutoTable.finalY;

    // Second table: Detailed shift data (starts after first table)
    autoTable(doc, {
        startY: finalY + 15, // Add some spacing between tables
        head: [['Employee', 'Shift Date', 'Shift Type', 'RT KUBOT', 'RT MINI', 'RT E2', 'ABN LOC', 'ABN CASE']],
        body: report_data.map(item => [
            item.employee_name,
            item.shift_date ? dayjs(item.shift_date).format('DD/MM/YYYY') : '-',
            item.shift_type?.toLowerCase() === 'day' ? 'Day' : 'Night',
            item.rt_kubot_exc || 0,
            item.rt_kubot_mini || 0,
            item.rt_kubot_e2 || 0,
            item.abnormal_locations || 0,
            item.abnormal_cases || 0,
        ]),
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    doc.save(`SHEIN_Report_${dayjs().format('YYYY-MM-DD_HH-mm')}.pdf`);
};