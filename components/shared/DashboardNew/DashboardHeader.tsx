import {Button} from "@/components/ui/button";
import {Bell, Menu, Search, X} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useUserStore} from "@/store/user";
import {ThemeToggle} from "@/components/shared/theme/theme-toggle";

interface HeaderProps {
    onMenuToggle: () => void;
    sidebarOpen: boolean;
}

function DashboardHeader({ onMenuToggle, sidebarOpen }: HeaderProps) {
    const user = useUserStore(state => state.currentUser);
    if (!user) return null;

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur px-4 lg:px-6">
            <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
                onClick={onMenuToggle}
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {/* Search */}
            <div className="flex-1 flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2 max-w-sm">
                <Search size={15} className="text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">Search...</span>
                <Badge variant="outline" className="ml-auto text-[10px] px-1.5 hidden sm:flex">
                    ⌘K
                </Badge>
            </div>

            <div className="flex items-center gap-2 ml-auto">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
                </Button>
                <ThemeToggle />
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">{user.user_name.toUpperCase().slice(0,2)}</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}

export default DashboardHeader;