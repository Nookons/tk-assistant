import React, {useState} from 'react';
import {FileSpreadsheet, Upload, X} from "lucide-react";
import RobotsSummaryCard from "@/components/shared/reports/RobotsSummaryCard";
import * as XLSX from "xlsx";

interface ExcelData {
    sheetName: string;
    headers: string[];
    rows: any[][];
    totalRows: number;
    totalColumns: number;
}

const FileUpload = ({file, title, setFile}: { file: File | null, title: string, setFile: (file: File | null) => void }) => {
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
    };

    return (
        <div className="">
            {!file ? (
                <div
                    className={`border-1 border-dashed flex items-center justify-between rounded-2xl p-4 text-center transition-all ${
                        isDragging
                            ? 'border-blue-500 '
                            : 'border-gray-300  hover:border-primary'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/*<Upload className="w-16 h-16 mx-auto mb-4 "/>*/}
                    <h3 className="text-xl font-semibold">
                        {title}
                    </h3>
                    <label className="inline-block">
                        <input
                            type="file"
                            className="hidden"
                            accept=".xlsx,.xls,.ods"
                            onChange={handleFileInput}
                        />
                        <span
                            className="bg-primary/50 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-primary transition inline-block">
                                <FileSpreadsheet className="w-4 h-4"/>
                            </span>
                    </label>
                </div>
            ) : (
                <div className="rounded-2xl border-1 w-full border-primary shadow-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <FileSpreadsheet className="w-6 h-6 text-green-500"/>
                            <div>
                                <h3 className="text-base font-semibold ">{file.name}</h3>
                                <p className="text-xs text-neutral-500">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                        {loading ?
                            <div className="text-center py-2">
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-4 border-primary border-t-transparent">

                                </div>
                            </div>
                            :
                            <button
                                onClick={clearFile}
                                className="text-red-500 hover:text-red-700 transition"
                            >
                                <X className="w-6 h-6"/>
                            </button>

                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUpload;