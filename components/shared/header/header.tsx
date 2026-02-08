"use client"
import * as React from "react"
import Link from "next/link"
import {
    Menu,
    X,
    FileText,
    Package,
    ChevronRight,
    LucideIcon,
    CalendarArrowDown,
    WandSparkles,
    Boxes, Warehouse
} from "lucide-react"
import {ThemeToggle} from "@/components/shared/theme/theme-toggle"
import {Button} from "@/components/ui/button"
import UserButton from "@/components/shared/header/userButton"
import {cn} from "@/lib/utils"
import {useTheme} from "next-themes";
import {useEffect} from "react";
import {Label} from "@/components/ui/label";
import Snow from "@/app/snow";


// Removed unused import: Home

interface NavigationItem {
    name: string
    href: string
    description: string
    featured?: boolean
    icon?: LucideIcon
}

interface NavigationSection {
    name: string
    items: NavigationItem[]
}

const navigation: NavigationSection[] = [
    {
        name: "Home",
        items: [
            {
                name: "Exceptions Parsing",
                href: "/exceptions-parsing",
                description: "Parse exceptions from chat to list",
                icon: WandSparkles
            },
        ]
    },
    {
        name: "Documents",
        items: [
            {
                name: "SHEIN Report",
                href: "/reports/shein",
                description: "Create shift report for SHEIN in one click",
                icon: FileText
            },
            {
                name: "Month Report",
                href: "/reports/month",
                description: "Month report for HAI",
                icon: CalendarArrowDown
            },
        ]
    },
    {
        name: "Stock",
        items: [
            {
                name: "Stock Screen",
                href: "/stock/stock-screen",
                description: "Main view on stock",
                icon: Warehouse
            },
            {
                name: "Items Template",
                href: "/stock",
                description: "Stock items template",
                icon: Package
            },
            {
                name: "Inventory",
                href: "/stock/inventory",
                description: "Page for managing inventory",
                icon: Boxes
            },
        ]
    },
]

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false)
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)

    const { theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])


    // Using useCallback for a stable toggle function
    const toggleMobileMenu = React.useCallback(() => {
        setMobileMenuOpen(prev => !prev);
    }, []);

    // Function to close menu on navigation click
    const handleNavigationClick = React.useCallback(() => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    }, []);

    if (!mounted) return null;

    return (
        <header className="sticky bg-muted-foreground/5 backdrop-blur-xl mb-2 top-0 z-50 w-full">
            <div className="flex items-center justify-between px-2 py-2">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-4" aria-label="Go to Homepage">
                    <div className="rounded-lg flex items-center">
                        <div className="rounded-lg flex gap-0 ml-2 items-center">
                            <Label className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-black'}`}>TK Service</Label>
                        </div>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-1 px-4">
                    {navigation.map((section) => (
                        <div
                            key={section.name}
                            className="relative"
                            onMouseEnter={() => setActiveDropdown(section.name)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <Button
                                variant="ghost"
                                className="gap-1 rounded-none"
                                // Add aria-expanded for accessibility
                                aria-expanded={activeDropdown === section.name}
                                aria-controls={`dropdown-${section.name}`}
                            >
                                {section.name}
                                <ChevronRight className={cn(
                                    "h-4 w-4 transition-transform",
                                    activeDropdown === section.name && "rotate-90"
                                )}/>
                            </Button>

                            {/* Dropdown */}
                            {activeDropdown === section.name && (
                                <div
                                    id={`dropdown-${section.name}`}
                                    className="absolute top-full left-0 w-80 backdrop-blur-2xl bg-muted/50 shadow-lg animate-in fade-in-0 zoom-in-95"
                                >
                                    <div className="">
                                        {section.items.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => handleNavigationClick()}
                                                className={cn(
                                                    "block backdrop-blur-2xl bg-muted/50 p-3 transition-colors hover:bg-accent",
                                                    item.featured && "bg-muted "
                                                )}
                                            >
                                                <div className="flex  items-start gap-3">
                                                    {item.icon &&
                                                        <item.icon className="h-5 w-5 mt-0.5 text-muted-foreground"/>}
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm mb-0.5">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground leading-relaxed">
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Right Side Controls */}
                <div className="flex items-end gap-2">
                    <div className="hidden sm:flex items-center gap-2">
                        <UserButton setMobileMenuOpen={setMobileMenuOpen}/>
                        <ThemeToggle/>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={toggleMobileMenu}
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5"/>
                        ) : (
                            <Menu className="h-5 w-5"/>
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden absolute w-full mb-4 animate-in slide-in-from-top-2">
                    <div className="container py-4 px-2 bg-muted/90 backdrop-blur-2xl  space-y-4">
                        <div className="flex sm:hidden items-center justify-end gap-2 pb-4 border-b">
                            <UserButton setMobileMenuOpen={setMobileMenuOpen}/>
                            <ThemeToggle/>
                        </div>

                        {navigation.map((section) => (
                            <div key={section.name} className="space-y-2">
                                <div className="text-sm font-semibold text-muted-foreground px-2">
                                    {section.name}
                                </div>
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            // Use the stable handler
                                            onClick={handleNavigationClick}
                                            className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-accent"
                                        >
                                            {item.icon && <item.icon
                                                className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0"/>}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm">
                                                    {item.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </header>
    )
}