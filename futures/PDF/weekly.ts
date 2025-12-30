import { toast } from "sonner";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ExceptionRecord } from "@/app/reports/weekly/page";
import "@/utils/fonts/NotoSansSC-Regular-normal";
import { IHistoryParts } from "@/types/robot/robot";

// ========== TYPES ==========
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
    top_problem_robots: Array<{ robot_number: number; error_count: number; downtime: number }>;
}

interface JsPDFWithAutoTable extends jsPDF {
    lastAutoTable: {
        finalY: number;
    };
}

// ========== CONSTANTS ==========
const PDF_MARGINS = {
    left: 14,
    right: 14,
    top: 20,
} as const;

const SPACING = {
    section: 10,
    subsection: 6,
    line: 3,
} as const;

const COLORS = {
    primary: [41, 128, 185] as [number, number, number],
    secondary: [44, 62, 80] as [number, number, number],
    accent: [59, 130, 246] as [number, number, number],
    text: {
        dark: [15, 23, 42] as [number, number, number],
        medium: [71, 85, 105] as [number, number, number],
        light: [100, 116, 139] as [number, number, number],
        lighter: [148, 163, 184] as [number, number, number],
    },
    background: {
        light: [248, 250, 252] as [number, number, number],
        medium: [241, 245, 249] as [number, number, number],
        icon: [203, 213, 225] as [number, number, number],
    },
    border: [226, 232, 240] as [number, number, number],
} as const;

const FONT_SIZES = {
    title: 18,
    subtitle: 14,
    heading: 14,
    body: 12,
    small: 10,
    tiny: 9,
    icon: 16,
} as const;

// ========== HELPER FUNCTIONS ==========

/**
 * Устанавливает шрифт и его параметры
 */
function setFont(
    doc: jsPDF,
    size: number = FONT_SIZES.body,
    color: [number, number, number] = [0, 0, 0]
): void {
    doc.setFont('NotoSansSC-Regular', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
}

/**
 * Группирует исключения по дням
 */
function groupExceptionsByDay(exceptions: ExceptionRecord[]): Map<string, ExceptionRecord[]> {
    return exceptions.reduce((acc, exception) => {
        const dayKey = dayjs(exception.exception_date).format('YYYY-MM-DD');
        if (!acc.has(dayKey)) {
            acc.set(dayKey, []);
        }
        acc.get(dayKey)!.push(exception);
        return acc;
    }, new Map<string, ExceptionRecord[]>());
}

/**
 * Вычисляет статистику по дню
 */
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

        const robotCount = errorsByRobot.get(exception.robot_number) || 0;
        errorsByRobot.set(exception.robot_number, robotCount + 1);

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

/**
 * Вычисляет месячную статистику
 */
function calculateMonthlyStats(exceptions: ExceptionRecord[]): MonthlyStats {
    const errorCounts = new Map<string, number>();
    const robotsAffected = new Set<number>();
    const dailyCounts = new Map<string, number>();
    const robotErrorCounts = new Map<number, { count: number; downtime: number }>();
    let totalDowntime = 0;

    exceptions.forEach(exception => {
        const count = errorCounts.get(exception.error_1) || 0;
        errorCounts.set(exception.error_1, count + 1);

        robotsAffected.add(exception.robot_number);
        totalDowntime += exception.gap;

        // Подсчет ошибок по роботам
        const robotStats = robotErrorCounts.get(exception.robot_number) || { count: 0, downtime: 0 };
        robotStats.count += 1;
        robotStats.downtime += exception.gap;
        robotErrorCounts.set(exception.robot_number, robotStats);

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

    // Топ 15 роботов с наибольшим количеством ошибок
    const topProblemRobots = Array.from(robotErrorCounts.entries())
        .map(([robot_number, stats]) => ({
            robot_number,
            error_count: stats.count,
            downtime: stats.downtime,
        }))
        .sort((a, b) => b.error_count - a.error_count)
        .slice(0, 15);

    const avgResolutionTime = totalDowntime / exceptions.length;

    return {
        total_exceptions: exceptions.length,
        total_downtime: totalDowntime,
        total_robots_affected: robotsAffected.size,
        most_common_error: mostCommonError,
        busiest_day: busiestDay,
        avg_resolution_time: avgResolutionTime,
        top_problem_robots: topProblemRobots,
    };
}

/**
 * Находит минимальную и максимальную дату
 */
function getDateRange(exceptions: ExceptionRecord[]): { minDate: dayjs.Dayjs; maxDate: dayjs.Dayjs } {
    const dates = exceptions.map(e => dayjs(e.exception_date));
    let minDate = dates[0];
    let maxDate = dates[0];

    dates.forEach(date => {
        if (date.isBefore(minDate)) minDate = date;
        if (date.isAfter(maxDate)) maxDate = date;
    });

    return { minDate, maxDate };
}

/**
 * Рисует красивую плашку "нет данных"
 */
function addEmptyStateBox(
    doc: JsPDFWithAutoTable,
    y: number,
    message: string,
    subtitle?: string
): number {
    const pageWidth = doc.internal.pageSize.getWidth();
    const boxHeight = 25;

    // Фон
    doc.setFillColor(...COLORS.background.medium);
    doc.roundedRect(PDF_MARGINS.left, y, pageWidth - 28, boxHeight, 3, 3, 'F');

    // Левая граница
    doc.setFillColor(...COLORS.text.lighter);
    doc.roundedRect(PDF_MARGINS.left, y, 4, boxHeight, 2, 2, 'F');

    doc.setFontSize(FONT_SIZES.icon);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text.light);

    // Сообщение
    setFont(doc, 13, COLORS.text.medium);
    doc.text(message, 25, y + boxHeight / 2 - 3, { baseline: 'middle' });

    if (subtitle) {
        setFont(doc, FONT_SIZES.small, COLORS.text.lighter);
        doc.text(subtitle, 25, y + boxHeight / 2 + 3, { baseline: 'middle' });
    }

    return y + boxHeight + SPACING.section;
}

/**
 * Добавляет заголовок отчета
 */
function addReportHeader(
    doc: JsPDFWithAutoTable,
    minDate: dayjs.Dayjs,
    maxDate: dayjs.Dayjs
): void {
    setFont(doc, FONT_SIZES.title);
    doc.text("Monthly Exception Report - GLPC", PDF_MARGINS.left, PDF_MARGINS.top);

    setFont(doc, FONT_SIZES.body);
    doc.text(
        `Period: ${minDate.format('DD.MM.YYYY')} - ${maxDate.format('DD.MM.YYYY')}`,
        PDF_MARGINS.left,
        28
    );
}

/**
 * Добавляет общую статистику
 */
function addMonthlyStatsTable(doc: JsPDFWithAutoTable, stats: MonthlyStats): void {
    autoTable(doc, {
        startY: 35,
        head: [['Metric', 'Value']],
        body: [
            ['Total Exceptions', stats.total_exceptions.toString()],
            ['Total Downtime', `${stats.total_downtime.toLocaleString()} min (${(stats.total_downtime / 60).toFixed(1)} hrs)`],
            ['Avg Resolution Time', `${stats.avg_resolution_time.toFixed(1)} min`],
            ['Robots Affected', stats.total_robots_affected.toString()],
            ['Most Common Error', stats.most_common_error],
            ['Busiest Day', dayjs(stats.busiest_day).format('DD.MM.YYYY')],
        ],
        theme: 'grid',
        styles: {
            font: 'NotoSansSC-Regular',
        },
        headStyles: {
            fillColor: COLORS.primary,
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
        margin: { left: PDF_MARGINS.left, right: PDF_MARGINS.right }
    });
}

/**
 * Добавляет таблицу с топ-15 проблемных роботов за месяц
 */
function addMonthlyTopRobotsTable(doc: JsPDFWithAutoTable, stats: MonthlyStats): void {
    if (stats.top_problem_robots.length === 0) {
        return;
    }

    let startY = doc.lastAutoTable.finalY + 15;

    setFont(doc, FONT_SIZES.heading, COLORS.text.dark);
    doc.text('Top 15 Problem Robots (Monthly)', PDF_MARGINS.left, startY);
    startY += 8;
    doc.text('Please direct your attention to the following robots in the coming month.', PDF_MARGINS.left, startY);

    autoTable(doc, {
        startY: startY + SPACING.subsection,
        head: [['#', 'Robot', 'Errors', 'Downtime', 'Avg Time/Error']],
        body: stats.top_problem_robots.map((robot, index) => [
            (index + 1).toString(),
            `Robot #${robot.robot_number}`,
            robot.error_count.toString(),
            `${robot.downtime.toFixed(2)} min`,
            `${(robot.downtime / robot.error_count).toFixed(1)} min`,
        ]),
        theme: 'grid',
        styles: {
            font: 'NotoSansSC-Regular',
        },
        headStyles: {
            fillColor: COLORS.primary,
            textColor: 255,
            fontSize: 11,
            fontStyle: 'normal',
        },
        bodyStyles: {
            fontSize: 10,
        },
        columnStyles: {
            0: { fontStyle: 'normal', cellWidth: 10 },
            1: { halign: 'left' }
        },
        margin: { left: PDF_MARGINS.left, right: PDF_MARGINS.right }
    });
}

/**
 * Добавляет краткую статистику дня
 */
function addDailySummaryTable(
    doc: JsPDFWithAutoTable,
    stats: DailyExceptionStats,
    startY: number
): void {
    const topEmployees = Array.from(stats.top_employees.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `${name} (${count})`)
        .join(', ');

    autoTable(doc, {
        startY: startY,
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
            fillColor: COLORS.background.light,
            textColor: COLORS.secondary,
            fontSize: 10,
            fontStyle: 'normal',
        },
        columnStyles: {
            0: { cellWidth: 40, fontStyle: 'normal' },
            1: { cellWidth: 'auto' },
        },
        margin: { left: PDF_MARGINS.left, right: PDF_MARGINS.right }
    });
}

/**
 * Добавляет таблицу запчастей
 */
function addPartsTable(
    doc: JsPDFWithAutoTable,
    parts: IHistoryParts[],
    startY: number
): number {
    if (parts.length === 0) {
        return addEmptyStateBox(
            doc,
            startY,
            'No parts assigned to this day',
            'Add parts to see them in the report'
        );
    }

    autoTable(doc, {
        startY: startY,
        tableWidth: 'auto',
        head: [['Robot', 'Parts', 'Employee']],
        body: parts.map(part => [
            `Robot #${part.robot.robot_number}`,
            JSON.parse(part.parts_numbers).join(', '),
            part.user.user_name,
        ]),
        theme: 'plain',
        styles: {
            font: 'NotoSansSC-Regular',
            fontSize: 10,
            textColor: COLORS.text.dark,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: COLORS.background.light,
            textColor: COLORS.accent,
            fontSize: 10,
        },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'left' },
        },
        margin: { left: PDF_MARGINS.left, right: PDF_MARGINS.right },
    });

    return doc.lastAutoTable.finalY + 20;
}

/**
 * Добавляет топ роботов с проблемами
 */
function addTopRobotsTable(
    doc: JsPDFWithAutoTable,
    stats: DailyExceptionStats,
    startY: number
): number {
    const topRobots = Array.from(stats.errors_by_robot.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topRobots.length === 0) {
        return startY;
    }

    setFont(doc, FONT_SIZES.heading, COLORS.text.dark);
    doc.text('Top Problem Robots:', PDF_MARGINS.left, startY);

    autoTable(doc, {
        startY: startY + SPACING.subsection,
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
        },
        headStyles: {
            fillColor: COLORS.background.light,
            fontSize: FONT_SIZES.tiny,
            fontStyle: 'normal',
        },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'left' },
        },
        margin: { left: PDF_MARGINS.left, right: PDF_MARGINS.right },
    });

    return doc.lastAutoTable.finalY + SPACING.section;
}

/**
 * Добавляет топ типов ошибок
 */
function addTopErrorsTable(
    doc: JsPDFWithAutoTable,
    stats: DailyExceptionStats,
    startY: number
): number {
    const topErrors = Array.from(stats.errors_by_type.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topErrors.length === 0) {
        return startY;
    }

    setFont(doc, FONT_SIZES.heading, COLORS.text.dark);
    doc.text('Top Errors:', PDF_MARGINS.left, startY);

    autoTable(doc, {
        startY: startY + SPACING.subsection,
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
            fillColor: COLORS.background.light,
            fontSize: FONT_SIZES.tiny,
            fontStyle: 'normal',
        },
        columnStyles: {
            0: { halign: 'left' },
            1: { halign: 'left' },
        },
        margin: { left: PDF_MARGINS.left, right: PDF_MARGINS.right },
    });

    return doc.lastAutoTable.finalY + SPACING.section;
}

/**
 * Добавляет детальный список исключений
 */
function addDetailedExceptionList(
    doc: JsPDFWithAutoTable,
    exceptions: ExceptionRecord[]
): void {
    doc.addPage();
    setFont(doc, FONT_SIZES.heading);
    doc.text("Detailed Exception List", PDF_MARGINS.left, 20);

    autoTable(doc, {
        startY: 25,
        head: [['Date', 'Robot', 'Type', 'Error', 'Time', 'Gap', 'Employee']],
        body: exceptions.map(exception => [
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
            fillColor: COLORS.secondary,
            textColor: 255,
            fontSize: FONT_SIZES.tiny,
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
        margin: { left: PDF_MARGINS.left, right: PDF_MARGINS.right }
    });
}

/**
 * Обрабатывает день (добавляет страницу с дневной статистикой)
 */
function processDailyPage(
    doc: JsPDFWithAutoTable,
    day: string,
    dayExceptions: ExceptionRecord[],
    parts_history: IHistoryParts[],
    isLastDay: boolean
): void {
    const stats = calculateDailyStats(dayExceptions);

    doc.addPage();
    let currentY = 15;

    // Заголовок дня
    setFont(doc, FONT_SIZES.heading, COLORS.primary);
    doc.text(dayjs(day).format('dddd, DD MMMM YYYY'), PDF_MARGINS.left, currentY);
    currentY += 8;

    // Краткая статистика
    setFont(doc, FONT_SIZES.heading, COLORS.text.light);
    doc.text(
        `${stats.total_exceptions} exceptions • ${stats.affected_robots.size} robots • ${stats.total_downtime.toFixed(2)} min downtime`,
        PDF_MARGINS.left,
        currentY
    );
    currentY += 8;

    // Таблица с кратким обзором
    addDailySummaryTable(doc, stats, currentY);
    currentY = doc.lastAutoTable.finalY + SPACING.section;

    // Запчасти
    const parts = parts_history.filter(part =>
        dayjs(part.created_at).format('YYYY-MM-DD') === day
    );

    currentY = addTopRobotsTable(doc, stats, currentY);
    currentY = addTopErrorsTable(doc, stats, currentY);
    currentY = addPartsTable(doc, parts, currentY);

    addEmptyStateBox(
        doc,
        currentY,
        'No any notes',
        'No one has added any notes to this day. The day proceeded smoothly, with no unexpected issues.'
    );

    // Разделитель между днями
    if (!isLastDay) {
        doc.setDrawColor(...COLORS.border);
        doc.line(PDF_MARGINS.left, currentY, 196, currentY);
    }
}

// ========== MAIN FUNCTION ==========

/**
 * Генерирует месячный PDF отчет
 */
export const generateMonthlyReport = async ({
                                                exceptions_data,
                                                parts_history
                                            }: {
    exceptions_data: ExceptionRecord[];
    parts_history: IHistoryParts[];
}): Promise<void> => {
    try {
        if (!exceptions_data || exceptions_data.length === 0) {
            toast.error("No report data available to generate PDF");
            return;
        }

        const doc = new jsPDF() as JsPDFWithAutoTable;
        doc.setFont('NotoSansSC-Regular', 'normal');

        const { minDate, maxDate } = getDateRange(exceptions_data);
        const monthName = minDate.format('MMMM YYYY');

        // Заголовок отчета
        addReportHeader(doc, minDate, maxDate);

        // Общая статистика
        const monthlyStats = calculateMonthlyStats(exceptions_data);
        addMonthlyStatsTable(doc, monthlyStats);

        // Топ 15 проблемных роботов за месяц
        addMonthlyTopRobotsTable(doc, monthlyStats);

        // Ежедневная статистика
        const groupedByDay = groupExceptionsByDay(exceptions_data);
        const sortedDays = Array.from(groupedByDay.keys()).sort();

        sortedDays.forEach((day, index) => {
            const dayExceptions = groupedByDay.get(day)!;
            const isLastDay = index === sortedDays.length - 1;
            processDailyPage(doc, day, dayExceptions, parts_history, isLastDay);
        });

        /*// Детальный список исключений
        addDetailedExceptionList(doc, exceptions_data);*/

        // Сохранение
        const filename = `GLPC_Monthly_Report_${monthName}_${dayjs().format("YYYY-MM-DD")}.pdf`;
        doc.save(filename);
        toast.success("PDF report generated successfully!");

    } catch (error) {
        console.error("PDF generation failed:", error);
        toast.error("Failed to generate PDF report. Please try again.");
    }
};

// Экспорт под старым именем для обратной совместимости
export const generateWeeklyReport = generateMonthlyReport;