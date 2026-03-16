'use client'
import React from 'react';
import { useStockPage } from "@/hooks/stock/useStockPage";
import LocationSheet from "@/components/shared/DashboardNew/DashboardComponents/Stock/LocationSheet";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import {StockToolbar} from "@/components/shared/DashboardNew/DashboardComponents/Stock/StockToolbar";
import {StockSearch} from "@/components/shared/DashboardNew/DashboardComponents/Stock/StockSearch";
import {StockGrid} from "@/components/shared/DashboardNew/DashboardComponents/Stock/StockGrid";
import {StockPagination} from "@/components/shared/DashboardNew/DashboardComponents/Stock/StockPagination";

const Page = () => {
    const {
        isLoading, isError, error,
        stockData, pickedItem, setPickedItem, handleLocationUpdate,
        pickedWarehouse, handleWarehouse, WAREHOUSES, WAREHOUSE_LABELS,
        rowsPerPage, setRowsPerPage, setPage,
        searchValue, handleSearch, clearSearch,
        filteredData, paginatedData,
        page, totalPages,
        isExporting, handleExport,
    } = useStockPage();

    if (isLoading) return <LoadingState title="Loading stock data…" />;
    if (isError && error) return <ErrorState error_title={error.message} />;

    return (
        <div className="space-y-5">
            <LocationSheet
                el={pickedItem}
                onClose={() => setPickedItem(null)}
                onUpdate={handleLocationUpdate}
                stockData={stockData}
            />

            <StockToolbar
                pickedWarehouse={pickedWarehouse}
                onWarehouse={v => { handleWarehouse(v); setPage(1); }}
                warehouses={WAREHOUSES}
                warehouseLabels={WAREHOUSE_LABELS}
                rowsPerPage={rowsPerPage}
                onRowsPerPage={v => { setRowsPerPage(v); setPage(1); }}
                isExporting={isExporting}
                filteredData={filteredData}
                onExport={handleExport}
            />

            {pickedWarehouse === 'all' &&
                <p className="text-xs text-amber-500 bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2.5">
                    ⚠ Showing all warehouses — filter by warehouse for better performance.
                </p>
            }

            <StockSearch
                searchValue={searchValue}
                onSearch={handleSearch}
                onClear={clearSearch}
                total={filteredData.length}
                shown={paginatedData.length}
            />

            <StockGrid
                data={paginatedData}
                searchValue={searchValue}
                onPickItem={setPickedItem}
            />

            <StockPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
};

export default Page;