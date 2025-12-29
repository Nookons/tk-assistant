import { toast } from "sonner";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {ExceptionRecord} from "@/app/reports/weekly/page";
import "@/utils/fonts/NotoSansSC-Regular-normal";

interface DailyExceptionStats {
    date: string;
    total_exceptions: number;
    equipment_issues: number;
    system_issues: number;
    total_downtime: number;
    affected_robots: Set<number>;
    top_employees: Map<string, number>;
    errors_by_robot: Map<number, number>;
    errors_by_type: Map<string, number>;
}

interface MonthlyStats {
    total_exceptions: number;
    total_downtime: number;
    total_robots_affected: number;
    most_common_error: string;
    busiest_day: string;
    avg_resolution_time: number;
}

function groupExceptionsByDay(exceptions: ExceptionRecord[]): Map<string, ExceptionRecord[]> {
    const groupedByDay = new Map<string, ExceptionRecord[]>();

    exceptions.forEach(exception => {
        const dayKey = dayjs(exception.exception_date).format('YYYY-MM-DD');

        if (!groupedByDay.has(dayKey)) {
            groupedByDay.set(dayKey, []);
        }
        groupedByDay.get(dayKey)!.push(exception);
    });

    return groupedByDay;
}

function calculateDailyStats(exceptions: ExceptionRecord[]): DailyExceptionStats {
    const affectedRobots = new Set<number>();
    const employeeCounts = new Map<string, number>();
    const errorsByRobot = new Map<number, number>();
    const errorsByType = new Map<string, number>();
    let equipmentIssues = 0;
    let systemIssues = 0;
    let totalDowntime = 0;

    exceptions.forEach(exception => {
        affectedRobots.add(exception.robot_number);

        // Подсчет по роботам
        const robotCount = errorsByRobot.get(exception.robot_number) || 0;
        errorsByRobot.set(exception.robot_number, robotCount + 1);

        // Подсчет по типам ошибок
        const typeCount = errorsByType.get(exception.error_1) || 0;
        errorsByType.set(exception.error_1, typeCount + 1);

        if (exception.exception_type.includes('设备') || exception.exception_type.includes('Equipment')) {
            equipmentIssues++;
        } else {
            systemIssues++;
        }

        totalDowntime += exception.gap;

        const count = employeeCounts.get(exception.employee) || 0;
        employeeCounts.set(exception.employee, count + 1);
    });

    return {
        date: exceptions[0].exception_date,
        total_exceptions: exceptions.length,
        equipment_issues: equipmentIssues,
        system_issues: systemIssues,
        total_downtime: totalDowntime,
        affected_robots: affectedRobots,
        top_employees: employeeCounts,
        errors_by_robot: errorsByRobot,
        errors_by_type: errorsByType,
    };
}

function calculateMonthlyStats(exceptions: ExceptionRecord[]): MonthlyStats {
    const errorCounts = new Map<string, number>();
    const robotsAffected = new Set<number>();
    const dailyCounts = new Map<string, number>();
    let totalDowntime = 0;

    exceptions.forEach(exception => {
        const count = errorCounts.get(exception.error_1) || 0;
        errorCounts.set(exception.error_1, count + 1);

        robotsAffected.add(exception.robot_number);
        totalDowntime += exception.gap;

        const dayKey = dayjs(exception.exception_date).format('YYYY-MM-DD');
        const dayCount = dailyCounts.get(dayKey) || 0;
        dailyCounts.set(dayKey, dayCount + 1);
    });

    let mostCommonError = '';
    let maxCount = 0;
    errorCounts.forEach((count, error) => {
        if (count > maxCount) {
            maxCount = count;
            mostCommonError = error;
        }
    });

    let busiestDay = '';
    let maxDayCount = 0;
    dailyCounts.forEach((count, day) => {
        if (count > maxDayCount) {
            maxDayCount = count;
            busiestDay = day;
        }
    });

    const avgResolutionTime = totalDowntime / exceptions.length;

    return {
        total_exceptions: exceptions.length,
        total_downtime: totalDowntime,
        total_robots_affected: robotsAffected.size,
        most_common_error: mostCommonError,
        busiest_day: busiestDay,
        avg_resolution_time: avgResolutionTime,
    };
}

export const generateWeeklyReport = async ({exceptions_data}: { exceptions_data: ExceptionRecord[] }) => {
    if (!exceptions_data || exceptions_data.length === 0) {
        toast.error("No report data available to generate PDF");
        return;
    }

    const doc = new jsPDF();
    doc.setFont('NotoSansSC-Regular', 'normal');

    const dates = exceptions_data.map(e => dayjs(e.exception_date));
    let minDate = dates[0];
    let maxDate = dates[0];

    dates.forEach(date => {
        if (date.isBefore(minDate)) minDate = date;
        if (date.isAfter(maxDate)) maxDate = date;
    });

    const monthName = minDate.format('MMMM YYYY');

    // ========== ЗАГОЛОВОК ==========
    doc.setFontSize(18);
    doc.setFont('NotoSansSC-Regular', 'normal');
    doc.text("Monthly Exception Report - GLPC", 14, 20);

    doc.setFontSize(12);
    doc.setFont('NotoSansSC-Regular', 'normal');
    doc.text(`Period: ${minDate.format('DD.MM.YYYY')} - ${maxDate.format('DD.MM.YYYY')}`, 14, 28);

    // ========== ОБЩАЯ СТАТИСТИКА ==========
    const monthlyStats = calculateMonthlyStats(exceptions_data);

    autoTable(doc, {
        startY: 35,
        head: [['Metric', 'Value']],
        body: [
            ['Total Exceptions', monthlyStats.total_exceptions.toString()],
            ['Total Downtime', `${monthlyStats.total_downtime.toLocaleString()} min (${(monthlyStats.total_downtime / 60).toFixed(1)} hrs)`],
            ['Avg Resolution Time', `${monthlyStats.avg_resolution_time.toFixed(1)} min`],
            ['Robots Affected', monthlyStats.total_robots_affected.toString()],
            ['Most Common Error', monthlyStats.most_common_error],
            ['Busiest Day', dayjs(monthlyStats.busiest_day).format('DD.MM.YYYY')],
        ],
        theme: 'grid',
        styles: {
            font: 'NotoSansSC-Regular',
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontSize: 11,
            fontStyle: 'normal',
        },
        bodyStyles: {
            fontSize: 10,
        },
        columnStyles: {
            0: { fontStyle: 'normal', cellWidth: 60 },
            1: { halign: 'left' }
        },
        margin: { left: 14, right: 14 }
    });

    // ========== ЕЖЕДНЕВНАЯ СТАТИСТИКА - УЛУЧШЕННАЯ ==========
    const groupedByDay = groupExceptionsByDay(exceptions_data);
    const sortedDays = Array.from(groupedByDay.keys()).sort();

    let currentY = 15;

    doc.setFontSize(14);
    doc.setFont('NotoSansSC-Regular', 'normal');

    sortedDays.forEach((day, index) => {
        const dayExceptions = groupedByDay.get(day)!;
        const stats = calculateDailyStats(dayExceptions);

        doc.addPage();
        currentY = 15;
        // День заголовок
        doc.setFontSize(14);
        doc.setFont('NotoSansSC-Regular', 'normal');
        doc.setTextColor(41, 128, 185);
        doc.text(dayjs(day).format('dddd, DD MMMM YYYY'), 14, currentY);
        currentY += 8;

        // Краткая статистика дня
        doc.setFontSize(14);
        doc.setFont('NotoSansSC-Regular', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`${stats.total_exceptions} exceptions • ${stats.affected_robots.size} robots • ${stats.total_downtime} min downtime`, 14, currentY);
        currentY += 8;

        // Топ сотрудники
        const topEmployees = Array.from(stats.top_employees.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => `${name} (${count})`)
            .join(', ');

        autoTable(doc, {
            startY: currentY,
            head: [['Summary', 'Value']],
            body: [
                ['Equipment Issues', `${stats.equipment_issues} (${((stats.equipment_issues / stats.total_exceptions) * 100).toFixed(0)}%)`],
                ['System Issues', `${stats.system_issues} (${((stats.system_issues / stats.total_exceptions) * 100).toFixed(0)}%)`],
                ['Most Active', topEmployees],
                ['Avg Resolution', `${(stats.total_downtime / stats.total_exceptions).toFixed(1)} min`],
            ],
            theme: 'plain',
            styles: {
                font: 'NotoSansSC-Regular',
                fontSize: 10,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [248, 250, 252],
                textColor: [52, 73, 94],
                fontSize: 10,
                fontStyle: 'normal',
            },
            columnStyles: {
                0: { cellWidth: 40, fontStyle: 'normal' },
                1: { cellWidth: 'auto' },
            },
            margin: { left: 14, right: 14 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 10;

        // Топ 5 роботов с проблемами
        const topRobots = Array.from(stats.errors_by_robot.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (topRobots.length > 0) {
            doc.setFontSize(14);
            doc.setFont('NotoSansSC-Regular', 'normal');
            doc.setTextColor(15, 23, 42);
            doc.text('Top Problem Robots:', 14, currentY);
            currentY += 6;

            autoTable(doc, {
                startY: currentY,
                tableWidth: 'auto',
                head: [['Robot', 'Exceptions']],
                body: topRobots.map(([robot, count]) => [
                    `Robot #${robot}`,
                    count.toString(),
                ]),
                theme: 'plain',
                styles: {
                    font: 'NotoSansSC-Regular',
                    fontSize: 10,
                    textColor: [15, 23, 42],
                    cellPadding: 2,
                },
                headStyles: {
                    fillColor: [248, 250, 252],
                    textColor: [59, 130, 246],
                    fontSize: 10,
                },
                columnStyles: {
                    0: { halign: 'left' },
                    1: { halign: 'left' },
                },
                margin: { left: 14, right: 14 },
            });

            currentY = (doc as any).lastAutoTable.finalY + 3;
        }

        currentY = (doc as any).lastAutoTable.finalY + 10;


        // Топ 3 типа ошибок
        const topErrors = Array.from(stats.errors_by_type.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (topErrors.length > 0) {
            doc.setFontSize(14);
            doc.setFont('NotoSansSC-Regular', 'normal');
            doc.text('Top Errors:', 14, currentY);
            currentY += 6;

            autoTable(doc, {
                startY: currentY,
                head: [['Error Type', 'Count']],
                body: topErrors.map(([error, count]) => [
                    error.substring(0, 40) + (error.length > 40 ? '...' : ''),
                    count.toString(),
                ]),
                theme: 'plain',
                styles: {
                    font: 'NotoSansSC-Regular',
                    fontSize: 10,
                },
                headStyles: {
                    fillColor: [248, 250, 252],
                    fontSize: 7,
                    fontStyle: 'normal',
                },
                columnStyles: {
                    0: { halign: 'left', cellWidth: 110 },
                    1: { halign: 'left', cellWidth: 20 },
                },
                margin: { left: 14, right: 14 },
            });

            currentY = (doc as any).lastAutoTable.finalY + 10;
        }

        // Разделитель между днями
        if (index < sortedDays.length - 1) {
            doc.setDrawColor(226, 232, 240);
            doc.line(14, currentY, 196, currentY);
            currentY += 10;
        }
    });

    // ========== ДЕТАЛЬНЫЙ СПИСОК ИСКЛЮЧЕНИЙ ==========
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('NotoSansSC-Regular', 'normal');
    doc.text("Detailed Exception List", 14, 20);

    autoTable(doc, {
        startY: 25,
        head: [['Date', 'Robot', 'Type', 'Error', 'Time', 'Gap', 'Employee']],
        body: exceptions_data.map(exception => [
            dayjs(exception.exception_date).format('DD.MM'),
            `${exception.robot_type}-${exception.robot_number}`,
            exception.exception_type.includes('Equipment') ? 'Equip' : 'System',
            exception.error_1.substring(0, 30) + (exception.error_1.length > 30 ? '...' : ''),
            dayjs(exception.start_time).format('HH:mm'),
            `${exception.gap}m`,
            exception.employee,
        ]),
        theme: 'grid',
        styles: {
            font: 'NotoSansSC-Regular',
        },
        headStyles: {
            fillColor: [44, 62, 80],
            textColor: 255,
            fontSize: 9,
            fontStyle: 'normal',
        },
        bodyStyles: {
            fontSize: 10,
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 20 },
            1: { halign: 'center', cellWidth: 25 },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'left', cellWidth: 55 },
            4: { halign: 'center', cellWidth: 18 },
            5: { halign: 'center', cellWidth: 15 },
            6: { halign: 'left', cellWidth: 'auto' },
        },
        margin: { left: 14, right: 14 }
    });

    doc.save(`GLPC_Monthly_Report_${monthName}_${dayjs().format("YYYY-MM-DD")}.pdf`);
    toast.success("PDF report generated successfully!");
};