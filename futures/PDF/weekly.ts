import { toast } from "sonner";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RobotStats {
    robotId: string;
    robotType: string;
    count: number;
    work_time: number;
    charge_time: number;
    offline_time: number;
    abnormal_time: number;
    idle_time: number;
    dates: Set<string>;
}

interface RobotSummary {
    total_robots: number;
    working_hours: number;
    charge_hours: number;
    total_offline: number;
    total_abnormal: number;
    total_idle: number;
    working_hours_percentage: number;
    charge_hours_percentage: number;
    total_offline_percentage: number;
    total_abnormal_percentage: number;
    total_idle_percentage: number;
}

interface ILocalSumm {
    e2: RobotSummary;
    kubot: RobotSummary;
    mini: RobotSummary;
    total: RobotSummary;
}


function addSummaryTable(doc: jsPDF, title: string, summary: RobotSummary) {
    //const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 35;

    // Заголовок секции
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    //doc.text(title, 14, startY);

    autoTable(doc, {
        //startY: startY + 5,
        body: [
            ['Robots', summary.total_robots, '—'],
            ['Working Time', `${summary.working_hours.toLocaleString()} min`, `${summary.working_hours_percentage.toFixed(2)}%`],
            ['Charging Time', `${summary.charge_hours.toLocaleString()} min`, `${summary.charge_hours_percentage.toFixed(2)}%`],
            ['Idle Time', `${summary.total_idle.toLocaleString()} min`, `${summary.total_idle_percentage.toFixed(2)}%`],
            ['Offline Time', `${summary.total_offline.toLocaleString()} min`, `${summary.total_offline_percentage.toFixed(2)}%`],
            ['Abnormal Time', `${summary.total_abnormal.toLocaleString()} min`, `${summary.total_abnormal_percentage.toFixed(2)}%`],
        ],

        tableWidth: 'auto',
        theme: 'grid',   // ← единая тема

        headStyles: {
            fillColor: [240, 240, 240],
            textColor: 0,
            fontSize: 10,
            halign: 'center',
        },

        bodyStyles: {
            fontSize: 10,
            cellPadding: 2
        },

        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'right' },
            2: { halign: 'right' }
        },

        margin: { left: 14, right: 14 }
    });
}

export const generateWeeklyReport = async ({
                                               summaries,
                                               processedData
                                           }: {
    summaries: ILocalSumm;
    processedData: RobotStats[];
}) => {
    if (!summaries) {
        toast.error("No report data available to generate PDF");
        return;
    }

    const sorted = [...processedData].sort((a, b) => a.robotType.localeCompare(b.robotType));
    const doc = new jsPDF();

    // Заголовок документа
    doc.setFontSize(18);
    doc.text("Weekly report GLPC", 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated - ${dayjs().format("DD/MM/YYYY [at] HH:mm")}`, 14, 25);

    // Таблицы summary
    addSummaryTable(doc, "TOTAL DATA", summaries.total);
    addSummaryTable(doc, "RT KUBOT", summaries.kubot);
    addSummaryTable(doc, "RT KUBOT MINI", summaries.mini);
    addSummaryTable(doc, "RT KUBOT E2", summaries.e2);

    // Итоговая большая таблица
    //const finalStart = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 40;

    autoTable(doc, {
        //startY: finalStart,
        head: [['Number', "Type", "Work", "Charging", "Offline", "Abnormal", "Idle"]],
        body: sorted.map(item => [
            item.robotId,
            item.robotType,
            item.work_time.toLocaleString(),
            item.charge_time.toLocaleString(),
            item.offline_time.toLocaleString(),
            item.abnormal_time.toLocaleString(),
            item.idle_time.toLocaleString(),
        ]),

        tableWidth: 'auto',
        theme: 'grid',  // ← такой же, как summary

        headStyles: {
            fillColor: [240, 240, 240],
            textColor: 0,
            fontSize: 10,
            halign: 'center'
        },

        bodyStyles: {
            fontSize: 9,
            cellPadding: 3
        },

        columnStyles: {
            0: { halign: "left" },
            1: { halign: "left" },
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" },
            6: { halign: "right" },
        },

        margin: { left: 14, right: 14 }
    });

    doc.save(`SHEIN_Report_${dayjs().format("YYYY-MM-DD_HH-mm")}.pdf`);
};

