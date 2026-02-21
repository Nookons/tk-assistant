
export const getUserWarehouse = (full_warehouse: string): string => {
    if (full_warehouse.includes("GLPC")) return "GLPC";
    if (full_warehouse.includes("PNT")) return "PNT";
    if (full_warehouse.includes("S P3")) return "S_P3";

    return "";
};
