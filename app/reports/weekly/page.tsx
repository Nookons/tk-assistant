'use client'
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react';

interface ExcelData {
    sheetName: string;
    headers: string[];
    rows: any[][];
    totalRows: number;
    totalColumns: number;
}

interface RobotStats {
    robotName: string;
    totalSessions: number;
    totalVolume: number;
    totalProfit: number;
    totalLoss: number;
    totalCommission: number;
    netProfit: number;
    sessions: Array<{
        date: string;
        timeRange: string;
        volume: number;
        profit: number;
        loss: number;
        commission: number;
    }>;
}

interface ProcessedData {
    robotStats: RobotStats[];
    totalStats: {
        totalRobots: number;
        totalSessions: number;
        totalVolume: number;
        totalProfit: number;
        totalLoss: number;
        totalCommission: number;
        netProfit: number;
    };
}

const Page: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<ExcelData | null>(null);
    const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (selectedFile: File) => {
        // Проверка типа файла
        const validTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.oasis.opendocument.spreadsheet'
        ];

        if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|ods)$/i)) {
            alert('Пожалуйста, загрузите Excel файл (.xlsx, .xls, .ods)');
            return;
        }

        setFile(selectedFile);
        setLoading(true);

        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const workbook = XLSX.read(e.target?.result, { type: 'binary' });

                // Берем первый лист
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Конвертируем в JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                // Обрабатываем данные
                const headers = jsonData[0] as string[];
                const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

                setData({
                    sheetName: firstSheetName,
                    headers: headers,
                    rows: rows,
                    totalRows: rows.length,
                    totalColumns: headers.length
                });

                // Обрабатываем статистику
                processRobotData(rows);

                setLoading(false);
            } catch (error) {
                console.error('Ошибка обработки файла:', error);
                alert('Ошибка при обработке файла');
                setLoading(false);
            }
        };

        reader.readAsBinaryString(selectedFile);
    };

    const clearFile = () => {
        setFile(null);
        setData(null);
        setProcessedData(null);
    };

    const processRobotData = (rows: any[][]) => {
        const robotMap = new Map<string, RobotStats>();

        rows.forEach(row => {
            const robotName = row[0];
            const robotType = row[1];
            const date = row[2];
            const timeRange = row[3];
            const volume = parseFloat(row[4]) || 0;
            const profit = parseFloat(row[5]) || 0;
            const loss = parseFloat(row[6]) || 0;
            const commission = parseFloat(row[7]) || 0;

            if (!robotName) return;

            if (!robotMap.has(robotName)) {
                robotMap.set(robotName, {
                    robotName,
                    totalSessions: 0,
                    totalVolume: 0,
                    totalProfit: 0,
                    totalLoss: 0,
                    totalCommission: 0,
                    netProfit: 0,
                    sessions: []
                });
            }

            const robot = robotMap.get(robotName)!;
            robot.totalSessions++;
            robot.totalVolume += volume;
            robot.totalProfit += profit;
            robot.totalLoss += loss;
            robot.totalCommission += commission;
            robot.netProfit = robot.totalProfit - robot.totalLoss - robot.totalCommission;

            robot.sessions.push({
                date,
                timeRange,
                volume,
                profit,
                loss,
                commission
            });
        });

        const robotStats = Array.from(robotMap.values()).sort((a, b) =>
            b.netProfit - a.netProfit
        );

        const totalStats = {
            totalRobots: robotStats.length,
            totalSessions: robotStats.reduce((sum, r) => sum + r.totalSessions, 0),
            totalVolume: robotStats.reduce((sum, r) => sum + r.totalVolume, 0),
            totalProfit: robotStats.reduce((sum, r) => sum + r.totalProfit, 0),
            totalLoss: robotStats.reduce((sum, r) => sum + r.totalLoss, 0),
            totalCommission: robotStats.reduce((sum, r) => sum + r.totalCommission, 0),
            netProfit: robotStats.reduce((sum, r) => sum + r.netProfit, 0)
        };

        setProcessedData({ robotStats, totalStats });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Загрузка Excel файла</h1>
                <p className="text-gray-600 mb-8">Загрузите файл для обработки данных</p>

                {!file ? (
                    <div
                        className={`border-4 border-dashed rounded-2xl p-12 text-center transition-all ${
                            isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 bg-white hover:border-blue-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Перетащите Excel файл сюда
                        </h3>
                        <p className="text-gray-500 mb-4">или</p>
                        <label className="inline-block">
                            <input
                                type="file"
                                className="hidden"
                                accept=".xlsx,.xls,.ods"
                                onChange={handleFileInput}
                            />
                            <span className="bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition inline-block">
                                Выберите файл
                            </span>
                        </label>
                        <p className="text-sm text-gray-400 mt-4">Поддерживаемые форматы: .xlsx, .xls, .ods</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex items-center justify-between mb-6 pb-6 border-b">
                            <div className="flex items-center gap-4">
                                <FileSpreadsheet className="w-12 h-12 text-green-500" />
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">{file.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={clearFile}
                                className="text-red-500 hover:text-red-700 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                                <p className="mt-4 text-gray-600">Обработка файла...</p>
                            </div>
                        ) : data ? (
                            <div>
                                {processedData && (
                                    <>
                                        <div className="grid grid-cols-4 gap-4 mb-6">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Роботов</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {processedData.totalStats.totalRobots}
                                                </p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Чистая прибыль</p>
                                                <p className={`text-2xl font-bold ${
                                                    processedData.totalStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {processedData.totalStats.netProfit.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Общий объем</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {processedData.totalStats.totalVolume.toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="bg-orange-50 p-4 rounded-lg">
                                                <p className="text-sm text-gray-600">Сессий</p>
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {processedData.totalStats.totalSessions}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Прибыль: </span>
                                                    <span className="font-semibold text-green-600">
                                                        {processedData.totalStats.totalProfit.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Убыток: </span>
                                                    <span className="font-semibold text-red-600">
                                                        {processedData.totalStats.totalLoss.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Комиссия: </span>
                                                    <span className="font-semibold text-gray-700">
                                                        {processedData.totalStats.totalCommission.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="font-semibold text-gray-800 mb-3 text-lg">Статистика по роботам:</h4>
                                        <div className="space-y-4 mb-6">
                                            {processedData.robotStats.map((robot, index) => (
                                                <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h5 className="font-bold text-lg text-gray-800">{robot.robotName}</h5>
                                                            <p className="text-sm text-gray-500">
                                                                {robot.totalSessions} сессий
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-xl font-bold ${
                                                                robot.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                                {robot.netProfit.toFixed(2)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">чистая прибыль</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-4 gap-3 text-sm">
                                                        <div className="bg-gray-50 p-2 rounded">
                                                            <p className="text-xs text-gray-600">Объем</p>
                                                            <p className="font-semibold">{robot.totalVolume.toFixed(2)}</p>
                                                        </div>
                                                        <div className="bg-green-50 p-2 rounded">
                                                            <p className="text-xs text-gray-600">Прибыль</p>
                                                            <p className="font-semibold text-green-600">
                                                                {robot.totalProfit.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div className="bg-red-50 p-2 rounded">
                                                            <p className="text-xs text-gray-600">Убыток</p>
                                                            <p className="font-semibold text-red-600">
                                                                {robot.totalLoss.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div className="bg-gray-50 p-2 rounded">
                                                            <p className="text-xs text-gray-600">Комиссия</p>
                                                            <p className="font-semibold">{robot.totalCommission.toFixed(2)}</p>
                                                        </div>
                                                    </div>

                                                    <details className="mt-3">
                                                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                                                            Показать все сессии ({robot.sessions.length})
                                                        </summary>
                                                        <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
                                                            {robot.sessions.map((session, idx) => (
                                                                <div key={idx} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                                                                    <span className="text-gray-600">
                                                                        {session.date} {session.timeRange}
                                                                    </span>
                                                                    <span className="font-mono">
                                                                        V:{session.volume.toFixed(2)} |
                                                                        P:{session.profit.toFixed(2)} |
                                                                        L:{session.loss.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </details>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <div className="overflow-x-auto">
                                    <h4 className="font-semibold text-gray-800 mb-3">Исходные данные:</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                            <tr>
                                                {data.headers.map((header, index) => (
                                                    <th
                                                        key={index}
                                                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                                    >
                                                        {header || `Колонка ${index + 1}`}
                                                    </th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {data.rows.slice(0, 10).map((row, rowIndex) => (
                                                <tr key={rowIndex} className="hover:bg-gray-50">
                                                    {data.headers.map((_, colIndex) => (
                                                        <td
                                                            key={colIndex}
                                                            className="px-4 py-3 text-sm text-gray-700"
                                                        >
                                                            {row[colIndex] !== undefined ? String(row[colIndex]) : ''}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {data.totalRows > 10 && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Показаны первые 10 строк из {data.totalRows}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;