import {useEffect, useMemo, useState} from "react";

export function useStockPagination<T>(data: T[]) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    useEffect(() => { setPage(1); }, [data]);

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const paginatedData = useMemo(
        () => data.slice((page - 1) * rowsPerPage, page * rowsPerPage),
        [data, page, rowsPerPage]
    );

    return { page, setPage, rowsPerPage, setRowsPerPage, totalPages, paginatedData };
}