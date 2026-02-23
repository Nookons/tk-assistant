import {
    BarChart3,
    Bot,
    ChartBarStacked,
    FileText,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingCart,
    Users, Warehouse
} from "lucide-react";
import DashboardContent from "@/components/shared/DashboardNew/Pages/DashboardContent";
import StockDisplay from "@/components/shared/DashboardNew/Pages/StockDisplay";
import ReportsDisplay from "@/components/shared/DashboardNew/Pages/ReportsDisplay";
import EmployeesDisplay from "@/components/shared/DashboardNew/Pages/EmployeesDisplay";
import RobotsDisplay from "@/components/shared/DashboardNew/Pages/RobotsDisplay";
import SettingsDisplay from "@/components/shared/DashboardNew/Pages/SettingsDisplay";
import ErrorParseProvider from "@/components/shared/DashboardNew/Pages/ErrorParseProvider";
import InventoryDisplay from "@/components/shared/DashboardNew/Pages/InventoryDisplay";

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
}



export const NAV_ITEMS: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "robots", label: "Robots", icon: <Bot size={18} /> },
    { id: "employees", label: "Employees", icon: <Users size={18} /> },
    { id: "reports", label: "Reports", icon: <FileText size={18} /> },
    { id: "error_parse", label: "Parsing", icon: <ChartBarStacked  size={18} /> },
    { id: "stock", label: "Stock", icon: <Package size={18} /> },
    { id: "inventory", label: "Inventory", icon: <Warehouse   size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

export const PAGE_REGISTRY: Record<string, React.ComponentType<any>> = {
    dashboard:  DashboardContent,
    employees:  EmployeesDisplay,
    stock:      StockDisplay,
    reports:    ReportsDisplay,
    robots:    RobotsDisplay,
    settings:    SettingsDisplay,
    error_parse:    ErrorParseProvider,
    inventory:    InventoryDisplay,
};
