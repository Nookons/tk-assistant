
export const getUserWarehouse = (full_warehouse: string): string => {
    if (full_warehouse.includes("GLPC")) return "GLPC";
    if (full_warehouse.includes("TK CEE")) return "GLPC";
    if (full_warehouse.includes("PNT")) return "PNT";
    if (full_warehouse.includes("S P3")) return "S_P3";
    if (full_warehouse.includes("P3")) return "P3";

    return "";
};
