'use client'
import React, {useEffect, useState} from 'react';
import dayjs from "dayjs";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const exceptions_data = [
    "漏装跨梁 Cross beam missed",
    "跨梁凸起 Cross beam",
    "货架码破损 Shelf code breakage",
    "货架码脱落 Shelf code falling off",
    "货架码翘边 Shelf code warping",
    "货架码脏污 Shelf code dirty",
    "缓存库位超高 Cache location is super high",
    "缓存库位超低 Cache bit ultralow",
    "划线精度偏差 Line drawing accuracy deviation",
    "地面码贴歪 Ground yard sticking crooked",
    "地面码脏污 Ground code dirty",
    "地面码破损 Ground code breakage",
    "地面码白点Ground code white dot",
    "地面码缺失 Ground code missing",
    "地脚定位偏差 Ground positioning deviation",
    "梳齿高度偏差 Deviation of comb height",
    "急停按钮损坏 Emergency stop button is damaged",
    "程序逻辑BUG Program logic bug",
    "版本更新问题 Version update issue",
    "对射光电偏移 Counter-photoelectric shift",
    "对射光电污损 Optical fouling",
    "五色灯异常 Abnormal five-color light",
    "小车光电异常 Car photoelectric anomaly",
    "播种架按钮异常 Seed rack button abnormality",
    "小车卡料 Box card master",
    "异常无法恢复 Abnormal cannot be recovered",
    "硬件损坏 Hardware damage",
    "底盘相机故障 Chassis camera malfunction",
    "货叉手指故障 Fork finger failure",
    "参数配置错误 Parameter configuration error",
    "对射光电异常 Optoelectronic anomaly",
    "货叉相机异常 Fork camera abnormal",
    "3D相机参数配置不准 3D camera parameter configuration is inaccurat",
    "背撑机构异常 Abnormality of back support mechanism",
    "钩子光电异常 Hook photoelectric anomaly",
    "把手、急停开关损坏 Handle, emergency stop switch damaged",
    "举升机构异常 Abnormal lifting mechanism",
    "驱动组件异常 Driver component exception",
    "万向轮连杆变形 Deformation of universal wheel connecting rod",
    "触边条损坏 Contact strip damage",
    "急停开关损坏 Emergency stop switch is damaged",
    "料箱检测光电异常 Material tank detection photoelectric anomaly",
    "地缝影响 Ground seam effect",
    "地面不平 Uneven ground",
    "地面异物Foreign objects on the ground",
    "网络掉线 Network disconnection",
    "物料超高 Material super high",
    "料箱多码 Tank multicode",
    "箱码损坏 Box code damage",
    "操作不规范 Irregular operation",
    "无法定义异常 Problem Cannot located",
    "料箱异物 Debris on Box",
    "账物不一致 Accounts and items are inconsistent",
    "取放箱位置错误 Wrong pick and place box position",
    "举升高度误差 Lifting height error",
    "箱子码歪或无码 The box code is skewed or missing",
    "输送线读码器故障 Conveyor line code reader malfunction",
    "安全模块故障 Security module failure",
    "路径上有障碍物 Obstacle on the path",
    "主控板通讯异常 Main control board communication anomaly",
]

const deep_exceptions_data = [
    {
        employee_title: "取放箱位置错误 Wrong pick and place box position",
        device_type: "Need Pick",
        issue_type: "设备Equipment",
        problem_phenomenon: "取放货异常Abnormal pick-up and delivery",
        problem_location: "取放箱位置错误 Wrong pick and place box position",
        issue_description: "",
        temporary_measures: "",
        solve_time: 4
    }
]

const employees_data = [
    "Oleksandr Sofyna",
    "Ivan Bulii",
    "Stepan Zapotichnyi",
    "Rostyslav Mykhavko",
    "Mykyta Kyrylov",
    "Ilkin Azimzade"
]

const Page = () => {
    const [value, setValue] = useState<string>("")
    const [parsedExceptions, setParsedExceptions] = useState<any[]>([])
    const [parseError, setParseError] = useState<string>("")

    const parseExceptions = () => {
        try {
            setParseError("")
            const lines = value.trim().split("\n").filter(line => line.trim())

            let currentEmployee = "";
            const parsedData: any[] = [];

            lines.forEach((line, index) => {
                const trimmedLine = line.trim();

                // Проверяем, является ли строка именем сотрудника
                const foundEmployee = employees_data.find(emp => trimmedLine.includes(emp));
                if (foundEmployee) {
                    currentEmployee = foundEmployee;
                    return;
                }

                // Ищем совпадения с ошибками
                for (const exception of exceptions_data) {
                    if (trimmedLine.includes(exception)) {
                        // Разбираем строку
                        const parts = trimmedLine.split(".");

                        if (parts.length < 3) {
                            console.warn(`Строка ${index + 1} имеет неверный формат:`, trimmedLine);
                            continue;
                        }

                        const errorType = parts[0]?.trim() || "";
                        const robotNumber = parts[1]?.trim() || "";
                        const startTime = parts[2]?.trim() || "";
                        const extraInfo = parts[3]?.trim() || "";

                        // Валидация времени
                        if (!startTime.match(/^\d{1,2}:\d{2}$/)) {
                            console.warn(`Неверный формат времени в строке ${index + 1}:`, startTime);
                            continue;
                        }

                        // Находим детальную информацию об ошибке
                        const errorDetails = deep_exceptions_data.find(
                            deep => deep.employee_title === exception
                        );

                        // Рассчитываем время
                        const startDateTime = dayjs(`${dayjs().format("YYYY-MM-DD")} ${startTime}`);
                        const solveTime = errorDetails?.solve_time || 2;
                        const endDateTime = startDateTime.add(solveTime, "minute");
                        const timeDiff = endDateTime.diff(startDateTime, "minute");

                        const exceptionObj = {
                            date: dayjs().format('DD/MM/YYYY'),
                            device_type: errorDetails?.device_type || "Не указано",
                            robot_number: robotNumber || "N/A",
                            issue_type: errorDetails?.issue_type || "Не указано",
                            problem_phenomenon: errorDetails?.problem_phenomenon || exception,
                            problem_location: errorDetails?.problem_location || exception,
                            issue_description: errorDetails?.issue_description || extraInfo,
                            temporary_measures: errorDetails?.temporary_measures || "",
                            start_time: startDateTime.format("HH:mm"),
                            end_time: endDateTime.format("HH:mm"),
                            time_gap: timeDiff,
                            employee: currentEmployee || "Не назначен",
                            raw_line: trimmedLine
                        };

                        parsedData.push(exceptionObj);
                        break;
                    }
                }
            });

            setParsedExceptions(parsedData);

            if (parsedData.length === 0) {
                setParseError("Не найдено ни одной записи об ошибках. Проверьте формат ввода.");
            }
        } catch (error) {
            setParseError(`Ошибка парсинга: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            console.error("Ошибка при парсинге:", error);
        }
    }

    const clearData = () => {
        setValue("");
        setParsedExceptions([]);
        setParseError("");
    }



    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Exception Parser</h1>
                <p className="text-gray-600 mb-1">
                    <strong>Формат:</strong> Название ошибки.Номер робота.Время начала.Доп. информация
                </p>
                <p className="text-sm text-gray-500">
                    Пример: 取放箱位置错误 Wrong pick and place box position.R123.14:30.Описание проблемы
                </p>
            </div>

            <textarea
                className="w-full min-h-[200px] p-3 border border-gray-300 rounded-lg font-mono text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Вставьте данные об ошибках..."
            />

            <div className="flex gap-3 mb-6">
                <button
                    onClick={parseExceptions}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Парсить
                </button>
                <button
                    onClick={clearData}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                    Очистить
                </button>
            </div>

            {parseError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {parseError}
                </div>
            )}

            {parsedExceptions.length > 0 && (
                <div className="border rounded-lg">
                    <Table>
                        <TableCaption>Найдено записей: {parsedExceptions.length}</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>日期/Date</TableHead>
                                <TableHead>设备类型 Device Type</TableHead>
                                <TableHead>质量问题 Quality issues</TableHead>
                                <TableHead>设备编号 Device No</TableHead>
                                <TableHead>问题原因 Issue Type</TableHead>
                                <TableHead>问题现象 Problem phenomenon</TableHead>
                                <TableHead>问题定位 Problem location</TableHead>
                                <TableHead>问题描述 Issue Description</TableHead>
                                <TableHead>临时措施 Temporary measures</TableHead>
                                <TableHead>问题状态 Status</TableHead>
                                <TableHead>发现人 Discoverer</TableHead>
                                <TableHead>发生时间 Start time</TableHead>
                                <TableHead>发生时间 End time</TableHead>
                                <TableHead>异常时间 Abnormal time(Min)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parsedExceptions.map((exception, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{exception.date}</TableCell>
                                    <TableCell>{exception.device_type}</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className="font-mono">{exception.robot_number}</TableCell>
                                    <TableCell>{exception.issue_type}</TableCell>
                                    <TableCell>{exception.problem_phenomenon}</TableCell>
                                    <TableCell>{exception.problem_location}</TableCell>
                                    <TableCell>{exception.issue_description}</TableCell>
                                    <TableCell>{exception.temporary_measures}</TableCell>
                                    <TableCell>已处理Processed</TableCell>
                                    <TableCell>{exception.employee}</TableCell>
                                    <TableCell className="font-mono">{exception.start_time}</TableCell>
                                    <TableCell className="font-mono">{exception.end_time}</TableCell>
                                    <TableCell>{exception.time_gap}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default Page;