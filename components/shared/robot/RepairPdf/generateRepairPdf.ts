import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { StockService } from '@/services/stockService'
import { IStockItemTemplate, IStockLocationSlot } from '@/types/stock/StockItem'
import { IRobot } from '@/types/robot/robot'
import {IUser} from "@/types/user/user";

interface PickedPart { part: IStockItemTemplate; qty: number }

interface RepairPdfOptions {
    robot: IRobot
    parts: PickedPart[]
    technician?: IUser
    notes: string[]
    warehouse: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const str = (val: unknown): string => {
    if (val === null || val === undefined) return '—'
    return String(val)
}

const C = {
    black:   [26,  26,  26]  as [number, number, number],
    white:   [255, 255, 255] as [number, number, number],
    gray50:  [249, 249, 249] as [number, number, number],
    gray100: [245, 245, 245] as [number, number, number],
    gray200: [229, 229, 229] as [number, number, number],
    gray400: [163, 163, 163] as [number, number, number],
    gray600: [113, 113, 113] as [number, number, number],
    red:     [192, 0,   0]   as [number, number, number],
    accent:  [99,  102, 241] as [number, number, number],
}

function sectionHeading(doc: jsPDF, text: string, y: number): void {
    doc.setFont('NotoSansSC-Regular', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...C.gray400)
    doc.text(text.toUpperCase(), 14, y)
    doc.setDrawColor(...C.gray200)
    doc.setLineWidth(0.3)
    doc.line(14, y + 1.5, doc.internal.pageSize.getWidth() - 14, y + 1.5)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function generateRepairPdf({
                                            robot, parts, technician, notes, warehouse,
                                        }: RepairPdfOptions): Promise<void> {
    const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const now   = new Date()
    const dateStr = now.toLocaleDateString('en-GB')
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    const withLocations = await Promise.all(
        parts.map(async ({ part, qty }) => {
            const locations = await StockService.getStockItemLocations(part, warehouse)
            return { part, qty, locations }
        })
    )

    // ── Header ────────────────────────────────────────────────────────────────

    doc.setFillColor(...C.black)
    doc.rect(0, 0, pageW, 24, 'F')

    doc.setFillColor(...C.accent)
    doc.rect(0, 24, pageW, 1.5, 'F')

    doc.setFont('NotoSansSC-Regular', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...C.white)
    doc.text('Robot Repair Guide', 14, 15)

    doc.setFontSize(7.5)
    doc.setFont('NotoSansSC-Regular', 'normal')
    doc.setTextColor(...C.gray400)
    doc.text('TK ASSIST · REPAIR DOCUMENT', 14, 8)

    doc.setFontSize(8)
    doc.setTextColor(...C.gray600)
    doc.text(`${dateStr} · ${timeStr}`, pageW - 14, 15, { align: 'right' })

    // ── Info cards ────────────────────────────────────────────────────────────

    const cardTop = 32
    const cardH   = 42
    const col1    = 14
    const col2    = pageW / 2 + 3
    const colW    = pageW / 2 - 17

    // Robot card background
    doc.setFillColor(...C.gray100)
    doc.roundedRect(col1, cardTop, colW, cardH, 2, 2, 'F')
    doc.setFillColor(...C.gray200)
    doc.roundedRect(col1, cardTop, colW, 8, 2, 2, 'F')
    doc.rect(col1, cardTop + 4, colW, 4, 'F')

    doc.setFont('NotoSansSC-Regular', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...C.gray600)
    doc.text('ROBOT', col1 + 4, cardTop + 5.5)

    doc.setFont('NotoSansSC-Regular', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...C.black)
    doc.text(str(robot.robot_number), col1 + 4, cardTop + 18)

    doc.setFont('NotoSansSC-Regular', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...C.gray600)
    doc.text(`${str(robot.robot_type)} · ${str(warehouse)}`, col1 + 4, cardTop + 24)

    doc.setDrawColor(...C.gray200)
    doc.setLineWidth(0.3)
    doc.line(col1 + 4, cardTop + 27, col1 + colW - 4, cardTop + 27)

    doc.setFontSize(8)
    doc.setTextColor(...C.gray400)
    doc.text('Issue type', col1 + 4, cardTop + 33)
    doc.setTextColor(...C.black)
    doc.text(str(robot.type_problem), col1 + 26, cardTop + 33)

    doc.setTextColor(...C.gray400)
    doc.text('Note', col1 + 4, cardTop + 39)
    doc.setTextColor(...C.black)
    const noteLines = doc.splitTextToSize(str(robot.problem_note), colW - 30)
    doc.text(noteLines, col1 + 26, cardTop + 39)

    // Technician card background
    doc.setFillColor(...C.gray100)
    doc.roundedRect(col2, cardTop, colW, cardH, 2, 2, 'F')
    doc.setFillColor(...C.gray200)
    doc.roundedRect(col2, cardTop, colW, 8, 2, 2, 'F')
    doc.rect(col2, cardTop + 4, colW, 4, 'F')

    doc.setFont('NotoSansSC-Regular', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...C.gray600)
    doc.text('TECHNICIAN', col2 + 4, cardTop + 5.5)

    if (technician) {
        doc.setFillColor(...C.accent)
        doc.circle(col2 + 10, cardTop + 18, 5, 'F')
        doc.setFont('NotoSansSC-Regular', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...C.white)
        doc.text(str(technician.user_name).slice(0, 2).toUpperCase(), col2 + 10, cardTop + 19.5, { align: 'center' })

        doc.setFont('NotoSansSC-Regular', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(...C.black)
        doc.text(str(technician.user_name), col2 + 18, cardTop + 16)

        doc.setFont('NotoSansSC-Regular', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...C.gray600)
        doc.text(str(technician.position_title), col2 + 18, cardTop + 21)

        doc.setDrawColor(...C.gray200)
        doc.setLineWidth(0.3)
        doc.line(col2 + 4, cardTop + 27, col2 + colW - 4, cardTop + 27)

        doc.setFontSize(8)
        doc.setTextColor(...C.gray400)
        doc.text('Phone', col2 + 4, cardTop + 33)
        doc.setTextColor(...C.black)
        doc.text(str(technician.phone), col2 + 22, cardTop + 33)

        doc.setTextColor(...C.gray400)
        doc.text('Email', col2 + 4, cardTop + 39)
        doc.setTextColor(...C.black)
        doc.text(str(technician.email), col2 + 22, cardTop + 39)
    } else {
        doc.setFont('NotoSansSC-Regular', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(...C.gray400)
        doc.text('Not assigned', col2 + 4, cardTop + 20)
    }

    // ── Parts table ───────────────────────────────────────────────────────────

    const afterCards = cardTop + cardH + 10
    sectionHeading(doc, 'Parts for Replacement', afterCards)

    autoTable(doc, {
        startY: afterCards + 5,

        head: [['#', 'Material No.', 'Description', 'Qty', 'Location']],

        body: withLocations.map(({ part, qty, locations }, i) => {
            const locationStr = locations.length
                ? locations
                    .map((l: IStockLocationSlot) => `${str(l.location)} (×${str(l.quantity)})`)
                    .join('\n')
                : '— not found'

            return [
                i + 1,
                str(part.material_number),
                str(part.description_eng),
                qty,
                locationStr
            ]
        }),

        styles: {
            font: 'NotoSansSC-Regular',
            fontSize: 8.5,
            cellPadding: 3,
            overflow: 'linebreak',
            textColor: C.black,
            valign: 'top'
        },

        theme: 'grid', // делает ровную таблицу

        headStyles: {
            fillColor: C.black,
            textColor: C.gray400,
            fontStyle: 'normal',
            fontSize: 7.5,
            halign: 'center',
            valign: 'middle'
        },

        alternateRowStyles: {
            fillColor: C.gray50
        },

        columnStyles: {
            0: { cellWidth: 10, halign: 'center', textColor: C.gray400 },
            1: { cellWidth: 38 },
            2: { cellWidth: 65 },
            3: { cellWidth: 15, halign: 'center', fontStyle: 'bold' },
            4: { cellWidth: 55 }
        },

        didParseCell(data) {
            if (data.column.index === 4 && data.cell.raw === '— not found') {
                data.cell.styles.textColor = C.red
                data.cell.styles.fontStyle = 'bold'
            }
        }
    })

    // ── Notes ─────────────────────────────────────────────────────────────────

    if (notes.length) {
        let y = (doc as any).lastAutoTable.finalY + 10
        sectionHeading(doc, 'Notes', y)
        y += 7

        doc.setFont('NotoSansSC-Regular', 'normal')
        doc.setFontSize(8.5)

        notes.forEach((note, i) => {
            doc.setTextColor(...C.gray400)
            doc.text(String(i + 1).padStart(2, '0'), 14, y)

            doc.setTextColor(...C.black)
            const lines = doc.splitTextToSize(str(note), 170)
            doc.text(lines, 22, y)

            doc.setDrawColor(...C.gray200)
            doc.setLineWidth(0.2)
            doc.line(14, y + lines.length * 4.5, pageW - 14, y + lines.length * 4.5)

            y += lines.length * 4.5 + 4
        })
    }

    // ── Footer ────────────────────────────────────────────────────────────────

    doc.setFillColor(...C.gray100)
    doc.rect(0, pageH - 10, pageW, 10, 'F')
    doc.setFont('NotoSansSC-Regular', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...C.gray400)
    doc.text(`${str(robot.robot_type)} · ${str(robot.robot_number)} · ${dateStr}`, 14, pageH - 4)
    doc.text('TK Assist · Page 1', pageW - 14, pageH - 4, { align: 'right' })

    doc.save(`repair_${str(robot.robot_number)}_${now.getTime()}.pdf`)
}