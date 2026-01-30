import { connection } from 'next/server'
import CellPage from "@/app/stock/cell/cellPage";

export default async function Page() {
    await connection()
    return <CellPage />
}