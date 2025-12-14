"use client"
import * as React from "react"
import Link from "next/link"
import {Menu, X, FileText, Home, Package, ChevronRight, LucideIcon, CalendarArrowDown, WandSparkles} from "lucide-react"
import { ThemeToggle } from "@/components/shared/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import UserButton from "@/components/shared/header/userButton"
import Image from "next/image"
import { cn } from "@/lib/utils"

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
                name: "Weekly Report",
                href: "/reports/weekly",
                description: "Weekly report for HAI",
                icon: CalendarArrowDown
            },
        ]
    },
    {
        name: "Inventory",
        items: [
            {
                name: "Inventory Stock",
                href: "/stock",
                description: "Manage warehouse inventory",
                icon: Package
            },
        ]
    },
]

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false)
    const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)

    return (
        <header className="sticky bg-muted-foreground/5 backdrop-blur-2xl mb-2 top-0 z-50 w-full">
            <div className="flex justify-between py-4 px-2">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="bg-white rounded-lg shadow-sm p-1.5 flex items-center">
                        <Image
                            alt="Tk Service Logo"
                            src="/img/logo_short.png"
                            width={75}
                            height={75}
                        />
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
                                className="gap-1"
                            >
                                {section.name}
                                <ChevronRight className={cn(
                                    "h-4 w-4 transition-transform",
                                    activeDropdown === section.name && "rotate-90"
                                )} />
                            </Button>

                            {/* Dropdown */}
                            {activeDropdown === section.name && (
                                <div className="absolute top-full left-0 w-80  backdrop-blur-2xl bg-muted/50 shadow-lg animate-in fade-in-0 zoom-in-95">
                                    <div className="">
                                        {section.items.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "block backdrop-blur-2xl bg-muted/50 p-3 transition-colors hover:bg-accent",
                                                    item.featured && "bg-muted "
                                                )}
                                            >
                                                <div className="flex  items-start gap-3">
                                                    {item.icon && <item.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />}
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
                        <UserButton />
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden absolute w-full mb-4 animate-in slide-in-from-top-2">
                    <div className="container py-4 px-2 bg-muted/90 backdrop-blur-2xl  space-y-4">
                        {/* Mobile User Controls - Only shown on smallest screens */}
                        <div className="flex sm:hidden items-center justify-end gap-2 pb-4 border-b">
                            <UserButton />
                            <ThemeToggle />
                        </div>

                        {/* Navigation Sections */}
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
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-accent"
                                        >
                                            {item.icon && <item.icon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />}
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